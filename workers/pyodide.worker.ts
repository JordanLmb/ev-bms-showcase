// workers/pyodide.worker.ts
// @ts-ignore
import { loadPyodide } from "pyodide";

const ctx: Worker = self as any;

let pyodide: any = null;
let intervalId: any = null;

async function initPyodide() {
    try {
        // @ts-ignore
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.1/full/"
        });

        // Fetch BMS simulation logic
        const bmsResponse = await fetch(`${self.location.origin}/python/bms.py`);
        const bmsCode = await bmsResponse.text();

        // Fetch professional test suite
        const testResponse = await fetch(`${self.location.origin}/python/test_bms.py`);
        const testCode = await testResponse.text();

        // Load both modules
        pyodide.runPython(bmsCode);
        pyodide.runPython(testCode);

        // Notify main thread
        ctx.postMessage({ type: 'READY' });

        // Track previous state for change detection
        let prevFaults: string[] = [];
        let prevContactors = true;

        // Start the simulation loop (60Hz)
        intervalId = setInterval(() => {
            if (pyodide) {
                try {
                    const stateJson = pyodide.runPython(`tick(16.6)`);
                    const state = JSON.parse(stateJson);

                    // Detect new faults and log them
                    const newFaults = state.faults.filter((f: string) => !prevFaults.includes(f));
                    for (const fault of newFaults) {
                        let message = '';
                        switch (fault) {
                            case 'OVERVOLTAGE':
                                message = `⚡ FAULT: Cell voltage ${Math.max(...state.cells.map((c: any) => c.voltage)).toFixed(2)}V exceeds 4.25V limit`;
                                break;
                            case 'UNDERVOLTAGE':
                                message = `⚡ FAULT: Cell voltage ${Math.min(...state.cells.map((c: any) => c.voltage)).toFixed(2)}V below 2.5V limit`;
                                break;
                            case 'OVERTEMP':
                                message = `⚡ FAULT: Temperature ${Math.max(...state.cells.map((c: any) => c.temp)).toFixed(1)}°C exceeds 60°C limit`;
                                break;
                        }
                        if (message) {
                            ctx.postMessage({ type: 'LOG', payload: { message, level: 'error' } });
                        }
                    }

                    // Log HV disconnect
                    if (prevContactors && !state.contactorsClosed && state.faults.length > 0) {
                        ctx.postMessage({
                            type: 'LOG',
                            payload: {
                                message: '🔌 SAFETY SHUTDOWN: HV Contactors OPENED',
                                level: 'warn'
                            }
                        });
                    }

                    // Update previous state
                    prevFaults = [...state.faults];
                    prevContactors = state.contactorsClosed;

                    ctx.postMessage({ type: 'TICK', payload: state });
                } catch (e) {
                    console.error("Pyodide Tick Error:", e);
                }
            }
        }, 100); // 10Hz (was 16ms/60Hz - reduced for performance)

    } catch (error) {
        console.error("Failed to load Pyodide:", error);
        ctx.postMessage({ type: 'LOG', payload: { message: `Failed to load Pyodide: ${error}`, level: 'error' } });
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
        } else if (type === 'RUN_TESTS') {
            // Run the professional test suite
            const reportJson = pyodide.runPython(`
import json
json.dumps(run_tests())
            `);
            const report = JSON.parse(reportJson);

            // Send summary first
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: `═══════════════════════════════════════════`,
                    level: 'info'
                }
            });
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: `  BMS HIL TEST SUITE - ${report.summary.total} tests`,
                    level: 'info'
                }
            });
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: `═══════════════════════════════════════════`,
                    level: 'info'
                }
            });

            // Send each test result
            for (const test of report.tests) {
                const icon = test.result === 'PASS' ? '✅' : '❌';
                ctx.postMessage({
                    type: 'TEST_RESULT',
                    payload: {
                        name: `${test.id}: ${test.name}`,
                        passed: test.result === 'PASS',
                        message: test.message
                    }
                });
            }

            // Send summary
            const allPassed = report.summary.failed === 0;
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: `───────────────────────────────────────────`,
                    level: 'info'
                }
            });
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: `Results: ${report.summary.passed} passed, ${report.summary.failed} failed (${report.summary.pass_rate})`,
                    level: allPassed ? 'success' : 'error'
                }
            });
            ctx.postMessage({
                type: 'LOG',
                payload: {
                    message: allPassed
                        ? '🎉 All safety systems verified!'
                        : '⚠️ Safety check failures detected!',
                    level: allPassed ? 'success' : 'error'
                }
            });
        }
    } catch (err) {
        console.error("Worker Error:", err);
        ctx.postMessage({ type: 'LOG', payload: { message: `Worker Error: ${err}`, level: 'error' } });
    }
};

export { };
