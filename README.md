# Housing Price Prediction - Full Stack Application

A complete fullstack application for housing price prediction with a machine learning model, Python and Java microservices, and a modern Next.js dashboard.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Next.js Frontend Portal                │
│        (Port 3000, TypeScript, Tailwind)        │
└─────────────────────────────────────────────────┘
         ↓                          ↓
┌──────────────────────┐    ┌──────────────────────┐
│  Python Backend      │    │   Java Backend       │
│ (FastAPI, Port 3001) │    │ (Spring Boot, 8080)  │
└──────────────────────┘    └──────────────────────┘
         ↓                          ↓
┌─────────────────────────────────────────────────┐
│     ML API (FastAPI, Port 8000, Internal)      │
│   Linear Regression Model for Price Prediction │
└─────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS | 16, Latest, Latest |
| **Backend 1** | FastAPI, Python | 0.135.3, 3.12+ |
| **Backend 2** | Spring Boot, Java, Maven | 3.3.4, 21, 3.9.14 |
| **ML Model** | scikit-learn, pandas | Latest |
| **Containerization** | Docker, Docker Compose | Latest |

## 📦 Prerequisites

Ensure you have the following installed:

1. **Docker & Docker Desktop** - For containerization
2. **Python 3.12+** - For the ML API and Python backend
3. **Java 21** - For the Spring Boot backend
4. **Node.js 18+** - For the Next.js portal
5. **Maven 3.9+** - For Java builds
6. **Git** - For version control

### Verify Installation

```powershell
docker --version
python --version
java -version
node --version
npm --version
mvn --version
```

## 🚀 Quick Start (Docker Compose)

### ✨ Fully Automatic (Recommended)

**Just run this one batch file (one-click setup):**

```powershell
c:\capco\setup-and-start.bat
```

The script will:
1. ✅ Verify Docker is running
2. ✅ Build Java backend locally
3. ✅ Create Docker images
4. ✅ Start all 4 services
5. ✅ Open browser to http://localhost:3000

**Done!** All services ready in ~3-5 minutes.

### Or Manual Docker Compose

```bash
# Terminal 1: Build Java locally
cd c:\capco\java-backend
mvn clean package -DskipTests

# Terminal 2: Start all services
cd c:\capco
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access the application:**
- **Portal**: http://localhost:3000
- **Python Backend API docs**: http://localhost:3001/docs
- **Java Backend Health**: http://localhost:8080/api/health
- **ML API Health**: http://localhost:8000/health

### Stop All Services

```bash
docker-compose down
```

## 💻 Manual Setup (Development)

### Step 1: ML API

```powershell
# Build the Docker image
cd c:\capco\ml-api
docker build -t housing-price-api .

# Run the container
docker run -p 8000:8000 housing-price-api

# The model will be trained on startup
# Access docs: http://localhost:8000/docs
```

### Step 2: Python Backend

```powershell
# Install dependencies
cd c:\capco\python-backend
c:\capco\.venv\Scripts\python.exe -m pip install -r requirements.txt

# Start the server
c:\capco\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload

# API docs: http://localhost:3001/docs
```

### Step 3: Java Backend

```powershell
# Navigate to the project
cd c:\capco\java-backend

# Build and run
C:\apache-maven-3.9.14\bin\mvn.cmd spring-boot:run

# Or build then run
mvn clean package
java -jar target/housing-market-1.0.0.jar
```

### Step 4: Next.js Portal

```powershell
# Install dependencies
cd c:\capco\portal
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📚 API Documentation

### Property Estimator (Python Backend)

**Endpoint:** `POST /estimate`

**Request:**
```json
{
  "features": {
    "square_footage": 1550,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1997,
    "lot_size": 6800,
    "distance_to_city_center": 4.1,
    "school_rating": 7.6
  }
}
```

**Response:**
```json
{
  "predicted_price": 310000
}
```

**Validation:**
- `square_footage`: > 0
- `bedrooms`: 1-20
- `bathrooms`: > 0, <= 20
- `year_built`: 1800-2100
- `lot_size`: > 0
- `distance_to_city_center`: >= 0
- `school_rating`: 0-10

### Market Statistics (Java Backend)

**Endpoint:** `GET /api/market-stats`

**Response:**
```json
{
  "averagePrice": 250000,
  "totalProperties": 49,
  "averageSqFt": 1800
}
```

### What-If Analysis (Java Backend)

**Endpoint:** `POST /api/what-if`

**Request:**
```json
{
  "square_footage": 2000,
  "bedrooms": 4,
  "bathrooms": 3,
  "year_built": 2010,
  "lot_size": 8000,
  "distance_to_city_center": 5,
  "school_rating": 8
}
```

**Response:**
```json
{
  "predicted_price": 385000
}
```

### Health Checks

All services expose health endpoints:

```
GET http://localhost:8000/health          (ML API)
GET http://localhost:3001/health          (Python Backend)
GET http://localhost:8080/api/health      (Java Backend)
```

## 🧪 Testing

### Manual Testing with Sample Data

Use data from `Test Data For Prediction.csv`:

```json
{
  "square_footage": 1550,
  "bedrooms": 3,
  "bathrooms": 2,
  "year_built": 1997,
  "lot_size": 6800,
  "distance_to_city_center": 4.1,
  "school_rating": 7.6
}
```

**Expected prediction:** ~$310,000

### Using curl

```bash
# Test Python Backend
curl -X POST http://localhost:3001/estimate \
  -H "Content-Type: application/json" \
  -d '{"features": {"square_footage": 1550, "bedrooms": 3, "bathrooms": 2, "year_built": 1997, "lot_size": 6800, "distance_to_city_center": 4.1, "school_rating": 7.6}}'

# Test Java Backend
curl -X POST http://localhost:8080/api/what-if \
  -H "Content-Type: application/json" \
  -d '{"square_footage": 1550, "bedrooms": 3, "bathrooms": 2, "year_built": 1997, "lot_size": 6800, "distance_to_city_center": 4.1, "school_rating": 7.6}'
```

## 📁 Project Structure

```
capco/
├── ml-api/                          # Machine Learning API
│   ├── main.py                      # FastAPI application
│   ├── train.py                     # Model training script
│   ├── model.pkl                    # Trained model
│   ├── Dockerfile                   # Container configuration
│   └── requirements.txt             # Python dependencies
│
├── python-backend/                  # Property Estimator Service
│   ├── main.py                      # FastAPI application
│   ├── Dockerfile                   # Container configuration
│   └── requirements.txt             # Python dependencies
│
├── java-backend/                    # Market Analysis Service
│   ├── src/main/java/com/example/
│   │   ├── HousingMarketApplication.java
│   │   └── MarketAnalysisController.java
│   ├── pom.xml                      # Maven configuration
│   ├── Dockerfile                   # Container configuration
│   └── target/                      # Built artifacts
│
├── portal/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── property-estimator/
│   │   │   └── market-analysis/
│   │   ├── lib/
│   │   │   ├── apiService.ts       # Centralized API logic
│   │   │   ├── config.ts           # Configuration
│   │   │   └── types.ts            # TypeScript types
│   │   └── components/
│   │       └── Alert.tsx           # Error/Success alerts
│   ├── Dockerfile                   # Container configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local                   # Environment variables
│
├── House Price Dataset.csv          # Training data
├── Test Data For Prediction.csv     # Sample prediction data
├── docker-compose.yml               # Multi-container orchestration
├── IMPROVEMENTS.md                  # Technical improvements documentation
├── start-all.bat                    # Quick start batch script
└── README.md                        # This file
```

## 🔐 Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:3001
```

### For Production

Create `.env.production.local`:

```env
NEXT_PUBLIC_JAVA_API_URL=https://your-api-domain.com
NEXT_PUBLIC_PYTHON_API_URL=https://your-api-domain.com
```

## 🐛 Troubleshooting

### Docker Compose Build Failures

If you encounter Maven build errors when running `docker-compose up -d`:

```bash
# Option 1: Use development compose (excludes Java Docker build)
docker-compose -f docker-compose-dev.yml up -d

# Then build Java locally in a separate terminal:
cd java-backend && mvn clean package -DskipTests && java -jar target/housing-market-*.jar
```

**See [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) for complete Docker troubleshooting guide.**

### Docker Not Found

```powershell
# Start Docker Desktop
```

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### ML API Training Error

```powershell
# Check dataset exists
test-path c:\capco\House Price Dataset.csv

# Rebuild Docker image
docker build -t housing-price-api .
```

### Python Virtual Environment Issues

```powershell
# Remove and recreate venv
rm -r .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 📝 Development Tips

1. **Frontend Development**: `npm run dev` with hot reload enabled
2. **Backend API Docs**: Visit `/docs` endpoints (Swagger UI for FastAPI/Spring)
3. **Docker Logs**: `docker-compose logs -f <service-name>`
4. **Rebuild Services**: `docker-compose up -d --build`
5. **Clean Build**: `docker-compose down -v && docker-compose up -d`

## 🎯 Features

✅ Machine Learning based price prediction  
✅ REST API with validation and error handling  
✅ Market statistics and what-if analysis  
✅ Type-safe frontend with TypeScript  
✅ Responsive UI with Tailwind CSS  
✅ Microservices architecture  
✅ Docker containerization  
✅ Health checks and monitoring  
✅ Request validation (Python & Java)  
✅ CORS enabled for multi-service communication  

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, refer to `IMPROVEMENTS.md` for technical architecture details.
