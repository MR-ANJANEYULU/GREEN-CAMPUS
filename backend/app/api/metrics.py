from fastapi import APIRouter

router = APIRouter()

@router.get("/metrics")
def get_metrics():
    # mock data; replace with DB/logic later
    return {
        "energy_kwh": 128.4,
        "water_kl": 32.1,
        "footfall": 2341,
        "co2_saved": 418,
    }
