// contracts/feature.ts
// LAW 3: CONTRACT-FIRST DEVELOPMENT
// Define specific schemas and types for your feature here.

import { z } from 'zod';

// 1. DATA SHAPE
export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // Add specific fields
});

export type Feature = z.infer<typeof FeatureSchema>;

// 2. API RESPONSES
export const FeatureResponseSchema = z.object({
  data: FeatureSchema,
  success: z.boolean(),
});
