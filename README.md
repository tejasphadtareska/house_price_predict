# Housing Price Prediction API

This repository contains a FastAPI-based regression model for housing price prediction, trained on the provided `House Price Dataset.csv`.

## Contents
- `ml-api/train.py` - trains the regression model and saves `model.pkl`
- `ml-api/main.py` - FastAPI service with `/predict`, `/predict/batch`, `/model-info`, and `/health`
- `ml-api/Dockerfile` - container image definition for the API
- `ml-api/requirements.txt` - Python dependencies

## Run locally
1. `cd ml-api`
2. `venv\Scripts\python.exe -m pip install -r requirements.txt`
3. `venv\Scripts\python.exe train.py`
4. `venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`

Open `http://127.0.0.1:8000/docs` to test endpoints.

## Docker
Build the image locally once Docker is available:

```bash
cd ml-api
docker build -t housing-price-api .
```

Run the container:

```bash
docker run -p 8000:8000 housing-price-api
```

## GitHub push
1. Initialize git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Initial housing price API project"`
4. Add remote: `git remote add origin <your-github-repo-url>`
5. Push: `git push -u origin main`
