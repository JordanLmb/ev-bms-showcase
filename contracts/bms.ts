
import { z } from 'zod';

// LAW 3: CONTRACT-FIRST DEVELOPMENT

export const CellSchema = z.object({
    id: z.number(),
    voltage: z.number().min(0).max(5), // Volts
    temp: z.number().min(-40).max(150), // Celsius
    isBalancing: z.boolean(), // True if passive balancing is active
});

export const BMSSystemStateSchema = z.object({
    timestamp: z.number(), // Simulation time
    cells: z.array(CellSchema).length(4), // 4S Configuration
    packVoltage: z.number(), // Sum of cell voltages
    packCurrent: z.number(), // Amps: + Charging, - Discharging
    packTemp: z.number(), // Max temp of pack
    soc: z.number().min(0).max(100), // State of Charge %
    fanDuty: z.number().min(0).max(100), // Cooling fan %
    faults: z.array(z.string()), // Active fault codes
    contactorsClosed: z.boolean(), // True = Live, False = Safe
});

export type BMSSystemState = z.infer<typeof BMSSystemStateSchema>;

export const SimulationControlSchema = z.object({
    loadAmps: z.number().default(0),
    chargerAmps: z.number().default(0),
    fanDuty: z.number().min(0).max(100).default(0),
    injectFault: z.enum(['NONE', 'OVERVOLTAGE', 'OVERTEMP', 'UNDERVOLTAGE', 'SHORT_CIRCUIT']).optional(),
});

export type SimulationControl = z.infer<typeof SimulationControlSchema>;
