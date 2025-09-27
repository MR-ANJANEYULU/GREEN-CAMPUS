from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import metrics

app = FastAPI(title="Green Campus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount feature routers
app.include_router(metrics.router, prefix="")

@app.get("/")
def root():
    return {"status": "ok", "service": "green-campus"}
