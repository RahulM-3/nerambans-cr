import requests
import urllib.parse
from time import sleep
from config import BASE_URL, CLAN_TAG, HEADERS, RATE_LIMIT_DELAY

def api_get(endpoint):
    tag = urllib.parse.quote(CLAN_TAG)
    sleep(RATE_LIMIT_DELAY)
    r = requests.get(f"{BASE_URL}{endpoint.format(tag=tag)}", headers=HEADERS, timeout=20)
    if r.status_code != 200:
        raise Exception(r.text)
    return r.json()