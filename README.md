# Housing Price Prediction - Full Stack Application

This project is a small microservices-based housing price prediction system with:

- `portal` - Next.js frontend on port `3000`
- `python-backend` - FastAPI integration service on port `3001`
- `java-backend` - Spring Boot market analysis service on port `8080`
- `ml-api` - FastAPI ML prediction service on port `8000`

## Architecture

Frontend -> Python Backend -> ML API  
Frontend -> Java Backend -> ML API

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind, Recharts
- Python backend: FastAPI
- Java backend: Spring Boot
- ML service: FastAPI, scikit-learn, pandas
- Containers: Docker Compose

## Prerequisites

Install:

- Docker Desktop
- Git

Optional for local non-Docker runs:

- Python 3.12+
- Java 21
- Maven 3.9+
- Node.js 20+

## Run With Docker

From the repo root:

```powershell
cd C:\capco
docker compose up --build
```

Detached mode:

```powershell
cd C:\capco
docker compose up -d --build
```

Stop everything:

```powershell
cd C:\capco
docker compose down
```

Rebuild from scratch:

```powershell
cd C:\capco
docker compose down -v
docker compose up --build
```

Windows one-click option:

```powershell
C:\capco\start.bat
```

## Service URLs

- Frontend: `http://localhost:3000`
- Python backend docs: `http://localhost:3001/docs`
- Python backend health: `http://localhost:3001/health`
- Java backend health: `http://localhost:8080/api/health`
- Java market stats: `http://localhost:8080/api/market-stats`
- ML API docs: `http://localhost:8000/docs`
- ML API health: `http://localhost:8000/health`
- ML model info: `http://localhost:8000/model-info`

## Useful Docker Commands

Build and start all services:

```powershell
docker compose up --build
```

See logs:

```powershell
docker compose logs -f
```

See one service only:

```powershell
docker compose logs -f portal
docker compose logs -f python-backend
docker compose logs -f java-backend
docker compose logs -f ml-api
```

Stop:

```powershell
docker compose down
```

## API Summary

### Python Backend

- `POST /estimate`
- `GET /health`

### Java Backend

- `GET /api/market-stats`
- `GET /api/market-stats/export.csv`
- `GET /api/market-stats/export.pdf`
- `POST /api/what-if`
- `GET /api/health`

### ML API

- `POST /predict`
- `POST /predict/batch`
- `GET /model-info`
- `GET /health`

## Project Structure

```text
capco/
|-- docker-compose.yml
|-- start.bat
|-- README.md
|-- House Price Dataset.csv
|-- Test Data For Prediction.csv
|-- ml-api/
|-- python-backend/
|-- java-backend/
`-- portal/
```

## Troubleshooting

If Docker is not running:

```powershell
docker info
```

If a port is busy:

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8080
netstat -ano | findstr :8000
```

If Java container build fails:

```powershell
docker compose build --no-cache java-backend
docker compose up --build
```

If you want to remove containers, networks, and volumes:

```powershell
docker compose down -v
```
