from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router as api_router
from app.api.websocket import websocket_endpoint

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Operational prototype for SIH 26085: Urban Flood Nowcasting System (Drainage and Rainfall Coupling) for MoES/NCMRWF",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local and web dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount WebSocket endpoint
app.add_api_websocket_route("/ws/flood-updates", websocket_endpoint)

@app.get("/")
def root():
    return {
        "message": "Urban Flood Nowcasting System API is running",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "current_flood": "/api/flood/current",
            "forecast": "/api/flood/forecast",
            "safe_routing": "/api/route/safe",
            "critical_drainage": "/api/drainage/critical",
            "validation": "/api/validation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
