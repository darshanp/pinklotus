from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.api import auth

load_dotenv()

app = FastAPI(title="Blossom Foundation Retreat Platform API")

# CORS Configuration
origins = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:3000"]').strip('[]').replace('"', '').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Blossom Foundation Retreat Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
