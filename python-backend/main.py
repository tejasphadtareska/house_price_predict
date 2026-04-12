import json
import logging
import os
import time
import uuid
from typing import Any

import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field_name in ("request_id", "method", "path", "status_code", "duration_ms", "ml_api_url"):
            value = getattr(record, field_name, None)
            if value is not None:
                payload[field_name] = value
        return json.dumps(payload)


def configure_logging() -> logging.Logger:
    logger = logging.getLogger("python-backend")
    if logger.handlers:
        return logger
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


logger = configure_logging()

app = FastAPI(title="Housing Property Estimator Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PropertyFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    square_footage: float = Field(..., gt=0, le=100000, description="Square footage must be positive")
    bedrooms: int = Field(..., ge=1, le=20, description="Bedrooms must be between 1 and 20")
    bathrooms: float = Field(..., gt=0, le=20, description="Bathrooms must be positive and <= 20")
    year_built: int = Field(..., ge=1800, le=2100, description="Year built must be between 1800 and 2100")
    lot_size: float = Field(..., gt=0, le=1_000_000, description="Lot size must be positive")
    distance_to_city_center: float = Field(..., ge=0, le=500, description="Distance must be non-negative")
    school_rating: float = Field(..., ge=0, le=10, description="School rating must be between 0 and 10")

    @field_validator(
        "square_footage",
        "bathrooms",
        "lot_size",
        "distance_to_city_center",
        "school_rating",
        mode="after",
    )
    @classmethod
    def validate_finite_number(cls, value: float) -> float:
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError("Must be a finite number")
        return value


class EstimateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    features: PropertyFeatures


ML_API_URL = os.getenv("ML_API_URL", "http://localhost:8000").rstrip("/")
ML_API_TIMEOUT = float(os.getenv("ML_API_TIMEOUT_SECONDS", "5"))
ml_api_session = requests.Session()
ml_api_session.mount(
    "http://",
    HTTPAdapter(
        max_retries=Retry(
            total=2,
            backoff_factor=0.25,
            status_forcelist=[502, 503, 504],
            allowed_methods=frozenset(["POST"]),
            raise_on_status=False,
        )
    ),
)
prediction_cache: dict[str, float] = {}


def make_cache_key(features: PropertyFeatures) -> str:
    return json.dumps(features.model_dump(), sort_keys=True)


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


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail if isinstance(exc.detail, str) else "Request failed",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.post("/estimate")
def estimate_property(request: EstimateRequest, fastapi_request: Request):
    cache_key = make_cache_key(request.features)

    try:
        ml_response = ml_api_session.post(
            f"{ML_API_URL}/predict",
            json={"features": request.features.model_dump()},
            timeout=ML_API_TIMEOUT,
        )
        ml_response.raise_for_status()
        ml_data = ml_response.json()

        predicted_price = ml_data.get("predicted_price")
        if not isinstance(predicted_price, (int, float)):
            raise ValueError("ML API response missing numeric 'predicted_price'")

        prediction_cache[cache_key] = float(predicted_price)
        logger.info(
            "ml_prediction_success",
            extra={
                "request_id": getattr(fastapi_request.state, "request_id", None),
                "ml_api_url": ML_API_URL,
            },
        )
        return {"predicted_price": float(predicted_price), "source": "ml-api"}
    except (requests.ConnectionError, requests.Timeout, requests.HTTPError, ValueError) as exc:
        cached_prediction = prediction_cache.get(cache_key)
        logger.warning(
            "ml_prediction_failed",
            extra={
                "request_id": getattr(fastapi_request.state, "request_id", None),
                "ml_api_url": ML_API_URL,
            },
        )
        if cached_prediction is not None:
            return {
                "predicted_price": cached_prediction,
                "source": "cache",
                "warning": "ML API unavailable, returned cached prediction for identical inputs",
            }

        if isinstance(exc, ValueError):
            raise HTTPException(status_code=502, detail=f"Invalid ML API response: {exc}") from exc
        if isinstance(exc, (requests.ConnectionError, requests.Timeout)):
            raise HTTPException(status_code=503, detail="ML API is unavailable") from exc
        raise HTTPException(status_code=502, detail=f"ML API error: {exc}") from exc


@app.get("/health")
def health():
    return {"status": "healthy", "ml_api_url": ML_API_URL}
