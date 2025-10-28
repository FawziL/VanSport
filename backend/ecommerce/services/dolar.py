# filepath: c:\Users\fawzi\OneDrive\Documentos\VanSport\backend\ecommerce\services\dolar.py
import os
import requests
from datetime import datetime
from zoneinfo import ZoneInfo

API_URL = "https://ve.dolarapi.com/v1/dolares"
APP_TZ = os.getenv("APP_TZ", "America/Caracas")
_cache = {"date": None, "value": None}

def obtener_tasa_bcv():
    """Devuelve el promedio oficial (BCV) en Bs/USD, cacheado por día en hora local."""
    tz = ZoneInfo(APP_TZ)
    hoy_local = datetime.now(tz).date()

    if _cache["date"] == hoy_local and _cache["value"] is not None:
        return _cache["value"], hoy_local

    resp = requests.get(API_URL, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    item = next((x for x in data if x.get("fuente") == "oficial"), None)
    if not item or item.get("promedio") is None:
        raise RuntimeError("No hay tasa oficial disponible")

    valor = item["promedio"]

    # Fecha local basada en fechaActualizacion de la API (UTC -> local)
    fecha_api = item.get("fechaActualizacion")
    if fecha_api:
        dt_utc = datetime.fromisoformat(fecha_api.replace("Z", "+00:00"))
        fecha_local = dt_utc.astimezone(tz).date()
    else:
        fecha_local = hoy_local

    # Cachea por la fecha local
    _cache["date"] = fecha_local
    _cache["value"] = valor
    return valor, fecha_local

# compat
get_dolar_oficial = obtener_tasa_bcv