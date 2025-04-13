import { z } from "zod";

// Schema for AI packing suggestion request
export const aiPackingSuggestionsSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  weatherForecast: z.string().min(1, "Weather forecast is required"),
  duration: z.number().int().positive("Duration must be a positive number"),
  people: z
    .number()
    .int()
    .positive("Number of people must be a positive number"),
  specialRequirements: z.string().optional(),
});

// Schema for AI packing optimization request
export const aiPackingOptimizationSchema = z.object({
  items: z.array(z.string()).min(1, "At least one item is required"),
  constraints: z.string().min(1, "Constraints are required"),
});

// Types for TypeScript
export type AiPackingSuggestionsRequest = z.infer<
  typeof aiPackingSuggestionsSchema
>;
export type AiPackingOptimizationRequest = z.infer<
  typeof aiPackingOptimizationSchema
>;
