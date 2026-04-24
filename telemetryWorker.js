// telemetryWorker.js
// Connect to your WebSocket backend
const socket = new WebSocket('wss://your-backend-api.com/soc-stream');

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        // data format expected: { "layer": "waf", "health": 85, "status": "warning" }
        self.postMessage(data);
    } catch (e) {
        console.error("Data stream error:", e);
    }
};

socket.onclose = () => self.postMessage({ type: 'STATUS', message: 'disconnected' });