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

interface BMSStore {
    state: BMSSystemState;
    worker: Worker | null;
    isReady: boolean;

    // Actions
    initWorker: () => void;
    updateControl: (control: Partial<SimulationControl>) => void;
    tick: (newState: BMSSystemState) => void;
}

export const useBMS = create<BMSStore>((set, get) => ({
    state: INITIAL_STATE,
    worker: null,
    isReady: false,

    initWorker: () => {
        if (get().worker) return;

        // Initialize Web Worker
        const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url));

        worker.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'TICK') {
                // Validate payload safely
                const parsed = BMSSystemStateSchema.safeParse(payload);
                if (parsed.success) {
                    set({ state: parsed.data });
                }
            } else if (type === 'READY') {
                set({ isReady: true });
            }
        };

        set({ worker });
    },

    updateControl: (control) => {
        const { worker } = get();
        if (worker) {
            worker.postMessage({ type: 'UPDATE_CONTROL', payload: control });
        }
    },

    tick: (newState) => set({ state: newState })
}));
