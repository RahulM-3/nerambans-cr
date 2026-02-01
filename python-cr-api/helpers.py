import json
import hashlib
from datetime import datetime
from config import IST, UPDATES_PATH

def today_ist():
    return datetime.now(IST).date().isoformat()

def to_epoch(dt_str):
    """Convert ISO8601 string to epoch timestamp in seconds"""
    if not dt_str:
        return None
    # Remove 'Z' if present
    if dt_str.endswith("Z"):
        dt_str = dt_str[:-1] + "+00:00"
    dt = datetime.fromisoformat(dt_str)
    return int(dt.timestamp())

def json_hash(data):
    return hashlib.md5(
        json.dumps(data, sort_keys=True).encode("utf-8")
    ).hexdigest()