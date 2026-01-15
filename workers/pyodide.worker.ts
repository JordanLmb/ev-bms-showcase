// workers/pyodide.worker.ts
// @ts-ignore
import { loadPyodide } from "pyodide";

const ctx: Worker = self as any;

let pyodide: any = null;
let intervalId: any = null;

async function initPyodide() {
    try {
        // Load Pyodide using the npm package loader, but fetch assets from CDN
        // This avoids 'importScripts' issues and 'file not found' for local assets
        // @ts-ignore
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.1/full/"
        });

        // Fetch our custom Python logic using absolute URL (Workers need this)
        const response = await fetch(`${self.location.origin}/python/bms.py`);
        const pythonCode = await response.text();

        // Load the code into Pyodide filesystem/memory
        pyodide.runPython(pythonCode);

        // Notify main thread attached
        ctx.postMessage({ type: 'READY' });

        // Start the simulation loop (60Hz)
        intervalId = setInterval(() => {
            if (pyodide) {
                try {
                    const stateJson = pyodide.runPython(`tick(16.6)`);
                    const state = JSON.parse(stateJson);
                    ctx.postMessage({ type: 'TICK', payload: state });
                } catch (e) {
                    console.error("Pyodide Tick Error:", e);
                }
            }
        }, 16); // ~60 FPS

    } catch (error) {
        console.error("Failed to load Pyodide:", error);
    }
}

initPyodide();

ctx.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (!pyodide) return;

    try {
        if (type === 'UPDATE_CONTROL') {
            const controlJson = JSON.stringify(payload);
            const updateControl = pyodide.globals.get('update_control');
            updateControl(controlJson);
        }
    } catch (err) {
        console.error("Worker Error:", err);
    }
};

export { };
