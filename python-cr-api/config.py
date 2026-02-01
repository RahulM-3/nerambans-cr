import os
from dotenv import load_dotenv
import pytz

load_dotenv()

# ================= CLASH ROYAL =================

CLAN_TAG = "#RG2VL88G"
API_TOKEN = os.getenv("API_TOKEN")
BASE_URL = "https://api.clashroyale.com/v1"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Accept": "application/json",
}

# ================= FIREBASE =================

FIREBASE_ROOT = os.getenv("FIREBASE_ROOT")

CLAN_INFO_PATH = "clan/info"
CLAN_INFO_DELTA_PATH = "clan/info_deltas"

CLAN_MEMBERS_PATH = "members/list"
CLAN_MEMBERS_DELTA_PATH = "members/deltas"

PLAYER_INFO_REQUEST_PATH = "players/request"
PLAYER_INFO_PATH = "players/info"

CURRENT_RIVER_PATH = "river/current"
RIVER_RACE_LOG_PATH = "river/log"

UPDATES_PATH = "updates"

# ================= GENERAL =================

REFRESH_INTERVAL = 120
RATE_LIMIT_DELAY = 1.2

UTC = pytz.utc
IST = pytz.timezone("Asia/Kolkata")