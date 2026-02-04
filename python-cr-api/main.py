import os
import threading
from time import time, sleep
from datetime import datetime

from config import REFRESH_INTERVAL, IST
from clan import update_clan_info, update_clan_members
from river import update_current_river_race, update_river_race_log
from players import player_request_worker
from firebase import write_updates

if __name__ == "__main__":

    threading.Thread(
        target=player_request_worker,
        daemon=True
    ).start()

    cycle = 1
    now = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

    while True:
        start = time()
        updated_files = []

        os.system("cls" if os.name == "nt" else "clear")

        print("=" * 50)
        print(f" Clash Royale Firebase Sync - {now}")
        print(f" Cycle #{cycle}")
        print("=" * 50)

        print("\n[1/4] Clan info...")
        updated_files += update_clan_info()

        print("[2/4] Members...")
        updated_files += update_clan_members()

        print("[3/4] Current river race...")
        updated_files += update_current_river_race()

        print("[4/4] River race log...")
        updated_files += update_river_race_log()

        write_updates(updated_files)

        print("\n----------------------------------------")

        if updated_files:
            print(" Updated Firebase paths:")
            for f in updated_files:
                print("  •", f)
        else:
            print(" No data changes detected.")

        print("----------------------------------------")

        cycle += 1

        # ===== Countdown =====
        while True:
            remaining = REFRESH_INTERVAL - (time() - start)

            if remaining <= 0:
                break

            mins, secs = divmod(remaining, 60)

            print(
                f"\r Next refresh in {int(mins):02d}:{secs:05.2f}",
                end="",
                flush=True
            )

            sleep(0.2)