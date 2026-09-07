from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(
    title="Terravision API Engine",
    description="Remote Sensing Earth Observation Satellite Image Processing Engine & Platform Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Terravision Remote Sensing Image Processing API Engine",
        "version": "1.0.0",
        "creator": "Manas Pingle",
        "linkedin": "https://www.linkedin.com/in/manas-pingle-14666a268/"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
