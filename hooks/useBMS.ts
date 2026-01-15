import { create } from 'zustand';
import { BMSSystemState, BMSSystemStateSchema, SimulationControl } from '../contracts/bms';

// Mock Initial State
const INITIAL_STATE: BMSSystemState = {
    timestamp: 0,
    cells: [
        { id: 0, voltage: 3.7, temp: 25, isBalancing: false },
        { id: 1, voltage: 3.72, temp: 25.1, isBalancing: false },
        { id: 2, voltage: 3.69, temp: 24.9, isBalancing: false },
        { id: 3, voltage: 3.71, temp: 25.0, isBalancing: false },
    ],
    packVoltage: 14.82,
    packCurrent: 0,
    packTemp: 25.1,
    soc: 50,
    fanDuty: 0,
    faults: [],
    contactorsClosed: true
};

interface HistoryPoint {
    time: number;
    voltage: number;
    temp: number;
}

interface LogEntry {
    timestamp: number;
    message: string;
    level: 'info' | 'warn' | 'error' | 'success';
}

interface BMSStore {
    state: BMSSystemState;
    worker: Worker | null;
    isReady: boolean;
    isTestRunning: boolean;
    history: HistoryPoint[];
    logs: LogEntry[];
    simulationTime: number;

    // Actions
    initWorker: () => void;
    updateControl: (control: Partial<SimulationControl>) => void;
    addLog: (message: string, level?: LogEntry['level']) => void;
    runTests: () => void;
}

const MAX_HISTORY = 60; // Keep 60 data points (~1 minute at 1Hz sampling)

export const useBMS = create<BMSStore>((set, get) => ({
    state: INITIAL_STATE,
    worker: null,
    isReady: false,
    isTestRunning: false,
    history: [],
    logs: [],
    simulationTime: 0,

    initWorker: () => {
        if (get().worker) return;

        get().addLog('Initializing Pyodide Runtime...', 'info');

        // Initialize Web Worker
        const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url));

        worker.onmessage = (event) => {
            const { type, payload } = event.data;

            if (type === 'TICK') {
                const parsed = BMSSystemStateSchema.safeParse(payload);
                if (parsed.success) {
                    const newState = parsed.data;
                    const currentTime = get().simulationTime;

                    // Add to history (sample every ~1 second, not every tick)
                    const history = get().history;
                    const lastHistoryTime = history.length > 0 ? history[history.length - 1].time : -1;

                    if (currentTime - lastHistoryTime >= 1) {
                        const newPoint: HistoryPoint = {
                            time: Math.floor(currentTime),
                            voltage: newState.packVoltage,
                            temp: newState.packTemp
                        };
                        const updatedHistory = [...history, newPoint].slice(-MAX_HISTORY);
                        set({ history: updatedHistory });
                    }

                    set({
                        state: newState,
                        simulationTime: currentTime + 0.033 // ~30fps, matches worker
                    });
                }
            } else if (type === 'READY') {
                set({ isReady: true });
                get().addLog('Pyodide loaded. BMS simulation active.', 'success');
                get().addLog('Running sanity checks...', 'info');
                // Auto-run tests after ready
                setTimeout(() => get().runTests(), 500);
            } else if (type === 'LOG') {
                get().addLog(payload.message, payload.level || 'info');
            } else if (type === 'TEST_RESULT') {
                const { name, passed, message } = payload;
                get().addLog(
                    `${passed ? '✅' : '❌'} ${name}: ${message}`,
                    passed ? 'success' : 'error'
                );
            } else if (type === 'TEST_COMPLETE') {
                // Release lock immediately when worker finishes
                set({ isTestRunning: false });
            }
        };

        set({ worker });
    },

    updateControl: (control) => {
        const { worker, addLog, runTests } = get();
        if (worker) {
            worker.postMessage({ type: 'UPDATE_CONTROL', payload: control });

            // Log control changes
            if (control.injectFault && control.injectFault !== 'NONE') {
                addLog(`⚠️ Fault Injected: ${control.injectFault}`, 'warn');
                // Auto-run tests after fault injection (PRD requirement)
                setTimeout(() => runTests(), 500);
            } else if (control.injectFault === 'NONE') {
                addLog('🔄 System Reset', 'info');
            }
            if (control.loadAmps !== undefined) {
                addLog(`Load Current: ${control.loadAmps}A`, 'info');
            }
        }
    },

    addLog: (message, level = 'info') => {
        const entry: LogEntry = {
            timestamp: Date.now(),
            message,
            level
        };
        set((state) => ({
            logs: [...state.logs, entry].slice(-50) // Keep last 50 logs
        }));
    },

    runTests: () => {
        const { worker, addLog, isTestRunning } = get();
        // Debounce: don't run if tests already running
        if (!worker || isTestRunning) return;

        set({ isTestRunning: true });
        addLog('Running BMS test suite...', 'info');
        worker.postMessage({ type: 'RUN_TESTS' });

        // Safety fallback: Reset flag after 10s if logic freezes
        setTimeout(() => {
            if (get().isTestRunning) {
                set({ isTestRunning: false });
            }
        }, 10000);
    }
}));
