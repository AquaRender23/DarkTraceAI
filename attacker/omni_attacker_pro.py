import socketio
import time
import sys
import random
import threading
import pandas as pd
from datetime import datetime

# --- CONFIGURATION ---
TARGET_SERVER = 'http://127.0.0.1:5000'
DATASET_FILE = 'cic_attack_sequence.csv'

# --- UI COLORS ---
RED = '\033[91m'
GREEN = '\033[92m'
CYAN = '\033[96m'
YELLOW = '\033[93m'
RESET = '\033[0m'
BOLD = '\033[1m'

# --- SOCKET.IO ---
sio = socketio.Client()
stats = {"fired": 0, "swarms": 0}

# Fallback arsenal if CSV is missing
FALLBACK_ARSENAL = [
    'DDoS', 'DoS Hulk', 'Heartbleed', 'Web Attack – SQL Injection', 
    'SSH-Patator', 'Infiltration', 'Bot', 'RANSOM'
]

@sio.event
def connect():
    print(f"{GREEN}[+] ROOT ACCESS ACQUIRED: Linked to {TARGET_SERVER}{RESET}")

@sio.event
def disconnect():
    print(f"{RED}[-] UPLINK SEVERED.{RESET}")

def fire_payload(vector, intensity, is_swarm=False):
    """Sends the actual Socket.IO command to the dashboard."""
    try:
        sio.emit('omni_sync', {'cmd': 'setIntensity', 'val': intensity})
        sio.emit('omni_sync', {'cmd': 'setMode', 'val': vector})
        stats["fired"] += 1
        
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        if is_swarm:
            print(f"    {RED}↳ [{timestamp}] SWARM THREAD: {vector} @ {intensity:.1f}x{RESET}")
        else:
            print(f"{CYAN}[{timestamp}] PRIMARY STRIKE: {vector.ljust(25)} | PWR: {intensity:.1f}x{RESET}")
    except Exception as e:
        pass

def swarm_worker(vector, base_intensity):
    """Spawns rapid-fire attacks in a background thread."""
    for _ in range(random.randint(3, 7)):
        fire_payload(vector, base_intensity * random.uniform(1.2, 2.0), is_swarm=True)
        time.sleep(random.uniform(0.1, 0.4))

def trigger_swarm():
    """Triggers a multi-threaded volumetric attack."""
    stats["swarms"] += 1
    swarm_vector = random.choice(['DDoS', 'DoS Hulk', 'Bot'])
    print(f"\n{RED}{BOLD}[!!!] VOLUMETRIC SWARM DETECTED: LAUNCHING MULTI-THREAD ASSAULT [!!!]{RESET}")
    
    # Spawn 3 concurrent threads to bombard the server
    for _ in range(3):
        t = threading.Thread(target=swarm_worker, args=(swarm_vector, 1.5))
        t.daemon = True
        t.start()

def execute_campaign():
    print(f"{YELLOW}[*] INITIALIZING OMNI-STACK RED TEAM ENGINE PRO...{RESET}\n")
    time.sleep(2)
    
    # Attempt to load CSV, fallback to random generation if missing
    use_csv = True
    try:
        df = pd.read_csv(DATASET_FILE)
        print(f"{GREEN}[+] Dataset loaded. Arsenal: {len(df)} vectors.{RESET}")
    except FileNotFoundError:
        print(f"{YELLOW}[!] '{DATASET_FILE}' not found. Engaging Procedural Generation Mode.{RESET}")
        use_csv = False

    try:
        while True:
            iterator = df.iterrows() if use_csv else range(999999)
            
            for item in iterator:
                if use_csv:
                    _, row = item
                    delay = max(1.0, float(row['delay_seconds']) * random.uniform(0.7, 1.3)) # Jitter
                    vector = str(row['attack_vector'])
                    intensity = float(row['intensity'])
                else:
                    delay = random.uniform(2.0, 8.0)
                    vector = random.choice(FALLBACK_ARSENAL)
                    intensity = random.uniform(0.8, 2.5)

                time.sleep(delay)

                # 20% Chance to trigger a massive multi-threaded swarm
                if vector != 'BENIGN' and random.random() < 0.20:
                    trigger_swarm()
                    time.sleep(3) # Let the swarm finish before continuing

                # Normal payload delivery
                if vector == 'BENIGN':
                    print(f"{GREEN}[>] STEALTH MODE: Simulating normal traffic.{RESET}")
                    sio.emit('omni_sync', {'cmd': 'setMode', 'val': 'NORMAL'})
                else:
                    fire_payload(vector, intensity)

    except KeyboardInterrupt:
        print(f"\n{YELLOW}{BOLD}[*] ABORT COMMAND RECEIVED. POWERING DOWN.{RESET}")
        sio.emit('omni_sync', {'cmd': 'setMode', 'val': 'NORMAL'})
        print(f"{GREEN}[+] Final Stats - Payloads: {stats['fired']} | Swarms: {stats['swarms']}{RESET}")
        sys.exit(0)

if __name__ == '__main__':
    try:
        sio.connect(TARGET_SERVER)
        execute_campaign()
    except socketio.exceptions.ConnectionError:
        print(f"{RED}{BOLD}[X] CONNECTION FAILED: Make sure the Python server (127.0.0.1:5000) is running!{RESET}")
        