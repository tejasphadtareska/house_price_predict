from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
import pickle
import pandas as pd

app = FastAPI()

model_path = Path(__file__).resolve().parent / 'model.pkl'
with open(model_path, 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
features_list = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 'distance_to_city_center', 'school_rating']

class HouseFeatures(BaseModel):
    square_footage: float
    bedrooms: int
    bathrooms: float
    year_built: int
    lot_size: float
    distance_to_city_center: float
    school_rating: float

class PredictionRequest(BaseModel):
    features: HouseFeatures

class BatchPredictionRequest(BaseModel):
    predictions: List[HouseFeatures]

@app.post("/predict")
def predict(request: PredictionRequest):
    features = [request.features.square_footage, request.features.bedrooms, request.features.bathrooms, request.features.year_built, request.features.lot_size, request.features.distance_to_city_center, request.features.school_rating]
    features_df = pd.DataFrame([features], columns=features_list)
    prediction = model.predict(features_df)[0]
    return {"predicted_price": prediction}

@app.post("/predict/batch")
def predict_batch(request: BatchPredictionRequest):
    features_list_batch = [[h.square_footage, h.bedrooms, h.bathrooms, h.year_built, h.lot_size, h.distance_to_city_center, h.school_rating] for h in request.predictions]
    features_df = pd.DataFrame(features_list_batch, columns=features_list)
    predictions = model.predict(features_df)
    return {"predictions": [{"predicted_price": p} for p in predictions]}

@app.get("/model-info")
def model_info():
    return {
        "coefficients": model_data['coefficients'],
        "intercept": model_data['intercept'],
        "r2_score": model_data['r2'],
        "mse": model_data['mse']
    }

@app.get("/health")
def health():
    return {"status": "healthy"}