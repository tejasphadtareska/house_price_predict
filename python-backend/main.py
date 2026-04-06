from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()

class PropertyFeatures(BaseModel):
    square_footage: float
    bedrooms: int
    bathrooms: float
    year_built: int
    lot_size: float
    distance_to_city_center: float
    school_rating: float

class EstimateRequest(BaseModel):
    features: PropertyFeatures

ML_API_URL = "http://localhost:8000"

@app.post("/estimate")
def estimate_property(request: EstimateRequest):
    try:
        # Call the ML API
        ml_response = requests.post(
            f"{ML_API_URL}/predict",
            json={"features": request.features.dict()}
        )
        ml_response.raise_for_status()
        ml_data = ml_response.json()
        return {"predicted_price": ml_data["predicted_price"]}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ML API error: {str(e)}")

@app.get("/health")
def health():
    return {"status": "healthy"}