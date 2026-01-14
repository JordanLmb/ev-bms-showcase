import { describe, it, expect, beforeEach } from '@jest/globals';
import { BMSSystemStateSchema, SimulationControlSchema } from '../contracts/bms';
// @ts-ignore - Module likely doesn't exist yet (Shadow Test)
import { BMSLogic } from '@/lib/bms';

// LAW 1: VERIFY (The Shadow Test)

describe('BMS Logic (Shadow Test)', () => {
    let bms: any;

    beforeEach(() => {
        // Initialize BMS with 4 cells, standard config
        bms = new BMSLogic();
    });

    it('should initialize with a valid state matching the contract', () => {
        const state = bms.getState();
        const validation = BMSSystemStateSchema.safeParse(state);

        expect(validation.success).toBe(true);
        if (validation.success) {
            expect(validation.data.cells.length).toBe(4);
            expect(validation.data.packVoltage).toBeCloseTo(0);
            expect(validation.data.contactorsClosed).toBe(true); // Should be live initially
        }
    });

    it('should increase voltage when charging current is applied', () => {
        // Set charger to 10A
        bms.updateControl({ chargerAmps: 10, loadAmps: 0, fanDuty: 0 });

        // Tick simulation (e.g., 10 seconds)
        for (let i = 0; i < 60 * 10; i++) {
            bms.tick();
        }

        const state = bms.getState();
        expect(state.packCurrent).toBe(10);
        expect(state.soc).toBeGreaterThan(0); // SOC should rise
    });

    it('should trigger OVERVOLTAGE fault if cell exceeds 4.2V', () => {
        // Force inject a high voltage state or run simulation long enough
        // Ideally we can inject state for testing
        bms.injectState({
            cells: [{ voltage: 4.3, temp: 25, isBalancing: false, id: 0 }]
        });

        bms.tick();

        const state = bms.getState();
        expect(state.faults).toContain('OVERVOLTAGE');
        expect(state.contactorsClosed).toBe(false); // Safety cutoff
    });
});
