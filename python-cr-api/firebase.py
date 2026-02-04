import requests
from time import time
from helpers import json_hash
from config import FIREBASE_ROOT, UPDATES_PATH

def fb_get(path):
    try:
        r = requests.get(f"{FIREBASE_ROOT}/{path}.json", timeout=20)
        if r.status_code != 200:
            return None
    except Exception as e:
            print("Firebase error:", e)
    return r.json()

def fb_put(path, data):
    r = requests.put(
        f"{FIREBASE_ROOT}/{path}.json",
        json=data,
        timeout=20
    )
    if r.status_code not in (200, 204):
        raise Exception(r.text)

def fb_patch(path, data):
    r = requests.patch(
        f"{FIREBASE_ROOT}/{path}.json",
        json=data,
        timeout=20
    )
    if r.status_code not in (200, 204):
        raise Exception(r.text)

def fb_set_if_changed(path, new_data):
    old = fb_get(path)

    if old is not None:
        if json_hash(old) == json_hash(new_data):
            return False

    fb_put(path, new_data)
    return True

def write_updates(files):
    fb_put(UPDATES_PATH, {
        "updatedFiles": files,
        "timestamp": int(time() * 1000)
    })