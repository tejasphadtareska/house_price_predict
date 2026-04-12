import json
import logging
import math
import pickle
import time
import uuid
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field_name in ("request_id", "method", "path", "status_code", "duration_ms"):
            value = getattr(record, field_name, None)
            if value is not None:
                payload[field_name] = value
        return json.dumps(payload)


def configure_logging() -> logging.Logger:
    logger = logging.getLogger("ml-api")
    if logger.handlers:
        return logger
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


logger = configure_logging()
app = FastAPI(title="Housing Price Prediction ML API")

model_path = Path(__file__).resolve().parent / "model.pkl"
with open(model_path, "rb") as f:
    model_data = pickle.load(f)

model = model_data["model"]
feature_names = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


class HouseFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    square_footage: float = Field(..., gt=0, le=100000)
    bedrooms: int = Field(..., ge=1, le=20)
    bathrooms: float = Field(..., gt=0, le=20)
    year_built: int = Field(..., ge=1800, le=2100)
    lot_size: float = Field(..., gt=0, le=1_000_000)
    distance_to_city_center: float = Field(..., ge=0, le=500)
    school_rating: float = Field(..., ge=0, le=10)

    @field_validator(
        "square_footage",
        "bathrooms",
        "lot_size",
        "distance_to_city_center",
        "school_rating",
        mode="after",
    )
    @classmethod
    def validate_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("Must be a finite number")
        return value


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    features: HouseFeatures


class BatchPredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    predictions: list[HouseFeatures] = Field(..., min_length=1, max_length=1000)


def features_to_frame(records: list[HouseFeatures]) -> pd.DataFrame:
    rows = [record.model_dump() for record in records]
    return pd.DataFrame(rows, columns=feature_names)


def to_prediction_response(predictions: list[float]) -> list[dict[str, float]]:
    return [{"predicted_price": round(float(prediction), 2)} for prediction in predictions]


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    request.state.request_id = request_id
    started_at = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.exception(
            "request_failed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": 500,
                "duration_ms": duration_ms,
            },
        )
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    response.headers["x-request-id"] = request_id
    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "request_id": getattr(request.state, "request_id", None),
            "details": [
                {
                    "field": ".".join(str(item) for item in err["loc"] if item != "body"),
                    "message": err["msg"],
                }
                for err in exc.errors()
            ],
        },
    )


@app.post("/predict")
def predict(request: PredictionRequest):
    features_df = features_to_frame([request.features])
    prediction = model.predict(features_df)[0]
    return {"predicted_price": round(float(prediction), 2)}


@app.post("/predict/batch")
def predict_batch(request: BatchPredictionRequest):
    features_df = features_to_frame(request.predictions)
    predictions = model.predict(features_df).tolist()
    return {
        "count": len(predictions),
        "predictions": to_prediction_response(predictions),
    }


@app.get("/model-info")
def model_info():
    coefficients = model_data.get("coefficients", {})
    mse = float(model_data.get("mse", 0.0))
    r2 = float(model_data.get("r2", 0.0))
    rmse = float(model_data.get("rmse", math.sqrt(mse)))
    mae = float(model_data.get("mae", 0.0))
    return {
        "model_type": type(model).__name__,
        "feature_names": feature_names,
        "feature_count": len(feature_names),
        "coefficients": coefficients,
        "intercept": float(model_data.get("intercept", 0.0)),
        "metrics": {
            "r2_score": r2,
            "mse": mse,
            "rmse": rmse,
            "mae": mae,
        },
        "training_samples": model_data.get("training_samples"),
        "test_samples": model_data.get("test_samples"),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "feature_count": len(feature_names),
    }
