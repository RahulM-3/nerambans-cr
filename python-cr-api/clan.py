from api import api_get
from firebase import fb_get, fb_set_if_changed
from helpers import today_ist, to_epoch
from config import CLAN_INFO_PATH, CLAN_INFO_DELTA_PATH, CLAN_MEMBERS_PATH, CLAN_MEMBERS_DELTA_PATH

# ======================================================
# CLAN
# ======================================================

def update_clan_info():
    clan = api_get("/clans/{tag}")

    # Load previous delta from Firebase
    delta_file = fb_get(CLAN_INFO_DELTA_PATH) or {"_meta": {"lastReset": None}, "delta": {}}

    today = today_ist()

    # Reset only if it's a new day
    if delta_file["_meta"].get("lastReset") != today:
        delta_file = {"_meta": {"lastReset": today}, "delta": {}}

    prev = delta_file.get("delta", {})

    # Current stats
    clan_score = clan.get("clanScore", 0)
    war_trophies = clan.get("clanWarTrophies", 0)
    donations_week = clan.get("donationsPerWeek", 0)
    chest_points = clan.get("clanChestPoints", 0)

    # Calculate cumulative delta since last reset
    delta_payload = {
        "_meta": {"lastReset": today},
        "delta": {
            "clanScoreDelta": clan_score - prev.get("lastClanScore", clan_score) + prev.get("clanScoreDelta", 0),
            "clanWarTrophiesDelta": war_trophies - prev.get("lastClanWarTrophies", war_trophies) + prev.get("clanWarTrophiesDelta", 0),
            "donationsPerWeekDelta": donations_week - prev.get("lastDonationsPerWeek", donations_week) + prev.get("donationsPerWeekDelta", 0),
            "clanChestPointsDelta": chest_points - prev.get("lastClanChestPoints", chest_points) + prev.get("clanChestPointsDelta", 0),
            # snapshots for next update
            "lastClanScore": clan_score,
            "lastClanWarTrophies": war_trophies,
            "lastDonationsPerWeek": donations_week,
            "lastClanChestPoints": chest_points
        }
    }

    # Full clan snapshot
    clan_payload = {
        "tag": clan.get("tag"),
        "name": clan.get("name"),
        "type": clan.get("type"),
        "description": clan.get("description"),
        "badgeId": clan.get("badgeId"),
        "badgeUrls": clan.get("badgeUrls"),
        "members": clan.get("members"),
        "requiredTrophies": clan.get("requiredTrophies"),
        "clanScore": clan_score,
        "clanWarTrophies": war_trophies,
        "donationsPerWeek": donations_week,
        "clanChestStatus": clan.get("clanChestStatus"),
        "clanChestLevel": clan.get("clanChestLevel"),
        "clanChestMaxLevel": clan.get("clanChestMaxLevel"),
        "clanChestPoints": chest_points,
        "location": clan.get("location")
    }

    changed = []

    if fb_set_if_changed(CLAN_INFO_PATH, clan_payload):
        changed.append("clan_info")

    if fb_set_if_changed(CLAN_INFO_DELTA_PATH, delta_payload):
        changed.append("clan_info_deltas")

    return changed


# ======================================================
# CLAN MEMBERS
# ======================================================

def update_clan_members():
    members = api_get("/clans/{tag}/members")["items"]

    delta_file = fb_get(CLAN_MEMBERS_DELTA_PATH) or {"_meta": {"lastReset": None}, "deltas": []}

    today = today_ist()
    if delta_file["_meta"].get("lastReset") != today:
        delta_file = {"_meta": {"lastReset": today}, "deltas": []}

    prev_delta_map = {d["tag"]: d for d in delta_file.get("deltas", [])}

    cleaned = []
    deltas = []

    for m in members:
        tag = m["tag"]

        trophies = m.get("trophies", 0)
        donations = m.get("donations", 0)
        donations_received = m.get("donationsReceived", 0)

        prev = prev_delta_map.get(tag, {})

        # cumulative delta since last reset
        trophies_delta = trophies - prev.get("lastTrophies", trophies) + prev.get("trophiesDelta", 0)
        donations_delta = donations - prev.get("lastDonations", donations) + prev.get("donationsDelta", 0)
        donations_received_delta = donations_received - prev.get("lastDonationsReceived", donations_received) + prev.get("donationsReceivedDelta", 0)

        cleaned.append({
            "tag": tag,
            "name": m.get("name"),
            "role": m.get("role"),
            "arena": m.get("arena"),
            "lastSeenEpoch": to_epoch(m.get("lastSeen")),
            "expLevel": m.get("expLevel"),
            "trophies": trophies,
            "clanRank": m.get("clanRank"),
            "previousClanRank": m.get("previousClanRank"),
            "donations": donations,
            "donationsReceived": donations_received
        })

        deltas.append({
            "tag": tag,
            "name": m.get("name"),
            "trophiesDelta": trophies_delta,
            "donationsDelta": donations_delta,
            "donationsReceivedDelta": donations_received_delta,
            "lastTrophies": trophies,
            "lastDonations": donations,
            "lastDonationsReceived": donations_received
        })

    changed = []

    if fb_set_if_changed(CLAN_MEMBERS_PATH, cleaned):
        changed.append("clan_members")

    if fb_set_if_changed(CLAN_MEMBERS_DELTA_PATH, {"_meta": {"lastReset": today}, "deltas": deltas}):
        changed.append("clan_members_deltas")

    return changed