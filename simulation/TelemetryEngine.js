// 1. Update the class to accept the state object
class TelemetryEngine {
    constructor(state) {
        this.state = state;
    }
    getLayer(id) {
        // Return health, defaulting to 100 if something goes wrong
        return { health: this.state.health[id] || 100 };
    }
}

// 2. Define the state object FIRST
const state = {
    // ... all your existing state properties ...
    health: { cloud: 100, waf: 100, edge: 100, nta: 100, ips: 100, sandbox: 100, dlp: 100, ztna: 100, core: 100 },
    // ... rest of your state ...
};

// 3. Instantiate the engine WITH the state
const engine = new TelemetryEngine(state);
window.engineState = state;