from pathlib import Path
import pickle

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "House Price Dataset.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
FEATURE_NAMES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


df = pd.read_csv(DATASET_PATH)
X = df[FEATURE_NAMES]
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
model_data = {
    "model": model,
    "mse": mse,
    "rmse": mse ** 0.5,
    "mae": mean_absolute_error(y_test, y_pred),
    "r2": r2_score(y_test, y_pred),
    "coefficients": dict(zip(FEATURE_NAMES, model.coef_)),
    "intercept": float(model.intercept_),
    "training_samples": int(len(X_train)),
    "test_samples": int(len(X_test)),
}

with open(MODEL_PATH, "wb") as f:
    pickle.dump(model_data, f)

print(f"Model trained and saved to {MODEL_PATH}.")
