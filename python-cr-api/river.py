from api import api_get
from firebase import fb_set_if_changed, fb_get
from config import CURRENT_RIVER_PATH, RIVER_RACE_LOG_PATH, IST, UTC
from datetime import datetime, timedelta, timezone

def cr_format(dt):
    return dt.astimezone(UTC).strftime("%Y%m%dT%H%M%S.000Z")

def cr_to_dt(cr_str):
    return datetime.strptime(cr_str, "%Y%m%dT%H%M%S.000Z").replace(tzinfo=UTC)

def calculate_end_time():
    now = datetime.now(IST)

    reset = now.replace(hour=15, minute=25, second=0, microsecond=0)

    if now >= reset:
        reset += timedelta(days=1)

    return cr_format(reset)

# ======================================================
# CURRENT RIVER RACE
# ======================================================

def get_period_end_time(current_period_index: int):
    """
    If periodIndex changed -> set endTime = now + 1 day
    If same periodIndex -> reuse stored endTime
    """

    data = fb_get(CURRENT_RIVER_PATH) or {}

    stored_end = data.get("endTime")
    stored_period = data.get("periodIndex")

    # Same period -> reuse existing endTime
    if stored_period == current_period_index and stored_end:
        return stored_end

    # Expired or missing -> recalc
    new_time = calculate_end_time()

    fb_set_if_changed(f"{CURRENT_RIVER_PATH}/endTime", new_time)
    return new_time


def update_current_river_race():
    race = api_get("/clans/{tag}/currentriverrace")
    race_id = f"{race['sectionIndex']}-{race['periodIndex']}"

    # Build all clans (single source of truth)
    all_clans = []
    for c in race.get("clans", []):
        all_clans.append({
            "tag": c.get("tag"),
            "name": c.get("name"),
            "badgeId": c.get("badgeId"),
            "clanScore": c.get("clanScore"),
            "fame": c.get("fame"),
            "repairPoints": c.get("repairPoints"),
            "finishTime": c.get("finishTime"),
            "periodPoints": c.get("periodPoints"),
            "participants": [
                {
                    "tag": p.get("tag"),
                    "name": p.get("name"),
                    "fame": p.get("fame"),
                    "repairPoints": p.get("repairPoints"),
                    "boatAttacks": p.get("boatAttacks"),
                    "decksUsed": p.get("decksUsed"),
                    "decksUsedToday": p.get("decksUsedToday")
                }
                for p in c.get("participants", [])
            ]
        })

    race_payload = {
        "raceId": race_id,
        "state": race.get("state"),
        "sectionIndex": race.get("sectionIndex"),
        "periodIndex": race.get("periodIndex"),
        "periodType": race.get("periodType"),
        "endTime": get_period_end_time(race.get("periodIndex")),
        "allClans": all_clans
    }

    changed = []
    if fb_set_if_changed(CURRENT_RIVER_PATH, race_payload):
        changed.append("river_race")

    return changed

# ======================================================
# RIVER RACE LOG
# ======================================================

def update_river_race_log():
    log = api_get("/clans/{tag}/riverracelog")

    fb_set_if_changed(RIVER_RACE_LOG_PATH, log)
    return ["river_race_log"]