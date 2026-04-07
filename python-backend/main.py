import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import requests

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PropertyFeatures(BaseModel):
    square_footage: float = Field(..., gt=0, description="Square footage must be positive")
    bedrooms: int = Field(..., ge=1, le=20, description="Bedrooms must be between 1 and 20")
    bathrooms: float = Field(..., gt=0, le=20, description="Bathrooms must be positive and <= 20")
    year_built: int = Field(..., ge=1800, le=2100, description="Year built must be between 1800 and 2100")
    lot_size: float = Field(..., gt=0, description="Lot size must be positive")
    distance_to_city_center: float = Field(..., ge=0, description="Distance must be non-negative")
    school_rating: float = Field(..., ge=0, le=10, description="School rating must be between 0 and 10")

    @field_validator('square_footage', 'lot_size', 'distance_to_city_center')
    @classmethod
    def validate_positive_numbers(cls, v):
        if v <= 0:
            raise ValueError('Must be a positive number')
        return v

class EstimateRequest(BaseModel):
    features: PropertyFeatures

ML_API_URL = os.getenv("ML_API_URL", "http://localhost:8000").rstrip("/")

@app.post("/estimate")
def estimate_property(request: EstimateRequest):
    try:
        # Call the ML API
        ml_response = requests.post(
            f"{ML_API_URL}/predict",
            json={"features": request.features.model_dump()}
        )
        ml_response.raise_for_status()
        ml_data = ml_response.json()
        
        # Validate ML API response
        if "predicted_price" not in ml_data:
            raise ValueError("ML API response missing 'predicted_price'")
        
        return {"predicted_price": ml_data["predicted_price"]}
    except requests.ConnectionError:
        raise HTTPException(status_code=503, detail="ML API is unavailable")
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ML API error: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Invalid ML API response: {str(e)}")

@app.get("/health")
def health():
    return {"status": "healthy"}
