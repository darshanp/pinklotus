from fastapi import FastAPI

app = FastAPI(title="Blossom Foundation Retreat Platform API")


@app.get("/")
async def root():
    return {"message": "Welcome to the Blossom Foundation Retreat Platform API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
