from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
# This allows your local browser to connect to the server safely
socketio = SocketIO(app, cors_allowed_origins="*")

# --- CENTRAL SECURITY MODULE REGISTRY ---
# You can add or remove items from this list to change the UI rings dynamically!
SECURITY_MODULES = [
    # --- CENTRAL SECURITY MODULE REGISTRY (14 LAYERS) ---
SECURITY_MODULES = [
    {"id": "intel", "name": "Threat Intel"},
    {"id": "cloud", "name": "Cloud Scrub"},
    {"id": "cspm", "name": "CSPM Monitor"},
    {"id": "waf", "name": "Web App FW"},
    {"id": "edge", "name": "Edge NGFW"},
    {"id": "nta", "name": "Network NTA"},
    {"id": "ips", "name": "IPS Engine"},
    {"id": "soar", "name": "SOAR Matrix"},
    {"id": "sandbox", "name": "AV Sandbox"},
    {"id": "xdr", "name": "XDR Engine"},
    {"id": "dlp", "name": "DLP Gateway"},
    {"id": "deception", "name": "Decept Grid"},
    {"id": "ztna", "name": "ZTNA Access"},
    {"id": "core", "name": "Core Auth"}
]
]

@socketio.on('connect')
def handle_connect():
    print("[SERVER] A UI Client connected successfully.")
    # Immediately sync the security modules to the client upon connection
    socketio.emit('init_ui', {'modules': SECURITY_MODULES})

# --- THE UNIVERSAL ROUTER ---
# This routes button clicks, mode changes, and telemetry data between UI components
@socketio.on('omni_sync')
def handle_omni_sync(data):
    # Broadcast to all clients (excluding the sender)
    socketio.emit('omni_sync', data, include_self=False)

# =====================================================================
# ML INTEGRATION POINT:
# Your partner loads their model here. When their model detects 
# a threat, they trigger the UI update using:
#
# socketio.emit('omni_sync', {'cmd': 'setMode', 'val': 'BRUTE'})
# =====================================================================

if __name__ == '__main__':
    print("Starting Omni-Stack Core Server on port 5000...")
    socketio.run(app, host='127.0.0.1', port=5000)