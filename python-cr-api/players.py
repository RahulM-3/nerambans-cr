import json
import urllib.parse
from time import time, sleep
from api import api_get
from firebase import fb_get, fb_put, fb_set_if_changed
from config import PLAYER_INFO_REQUEST_PATH, PLAYER_INFO_PATH

# ======================================================
# PLAYER INFO (ON-DEMAND)
# ======================================================

def update_player_info_if_requested():
    """
    If player_info_request.json contains a tag,
    fetch player profile + battlelog, dump to player_info.json,
    then clear the request file.
    """

    req = fb_get(PLAYER_INFO_REQUEST_PATH)

    if not req:
        return []

    player_tag = req.get("tag")

    print(f"Fetching player info for {player_tag}...")

    encoded = urllib.parse.quote(player_tag)
    try:
        # --- Player profile ---
        player = api_get(f"/players/{encoded}")

        # --- Battle log ---
        battlelog = api_get(f"/players/{encoded}/battlelog")
    except:
        print(f"Failed to fetch info for {player_tag}")
        fb_put(PLAYER_INFO_REQUEST_PATH, {
            "tag": None,
            "timestamp": None
        })
        return []

    payload = {
        "requestedTag": player_tag,
        "fetchedAt": int(time() * 1000),
        "player": json.dumps(player),
        "battlelog": json.dumps(battlelog)
    }

    changed = []

    # Save to Firebase
    if fb_set_if_changed(PLAYER_INFO_PATH, payload):
        changed.append("player_info")

    # Clear request file
    fb_put(PLAYER_INFO_REQUEST_PATH, {
        "tag": None,
        "timestamp": None
    })

    print("Player info saved. Request cleared.")

    return changed

# ======================================================
# PLAYER REQUEST
# ======================================================

def player_request_worker():
    print("Player request watcher started...\n")

    while True:
        try:
            update_player_info_if_requested()
        except Exception as e:
            print("Player worker error:", e)

        # fast polling, low load
        sleep(0.5)