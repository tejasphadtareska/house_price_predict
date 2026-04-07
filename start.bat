@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo   Capco Housing App - Docker Startup
echo ==========================================
echo.

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop does not seem to be running.
  echo Please start Docker Desktop, wait for it to finish starting,
  echo then run this file again.
  echo.
  pause
  exit /b 1
)

echo Docker is running.
echo.
echo Starting all services with Docker Compose...
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo Docker Compose failed to start the project.
  echo Check the logs with: docker compose logs -f
  echo.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo   Services Started
echo ==========================================
echo Portal:              http://localhost:3000
echo Python Backend:      http://localhost:3001/docs
echo Java Backend Health: http://localhost:8080/api/health
echo ML API Docs:         http://localhost:8000/docs
echo.
echo To stop everything later, run:
echo docker compose down
echo.
pause
