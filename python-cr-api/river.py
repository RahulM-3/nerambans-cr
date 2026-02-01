from api import api_get
from firebase import fb_set_if_changed
from config import CURRENT_RIVER_PATH, RIVER_RACE_LOG_PATH

# ======================================================
# CURRENT RIVER RACE
# ======================================================

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
        "collectionEndTime": race.get("collectionEndTime"),
        "warEndTime": race.get("warEndTime"),
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