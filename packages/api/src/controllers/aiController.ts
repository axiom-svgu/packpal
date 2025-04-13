import { Request, Response } from "express";
import {
  generatePackingSuggestions,
  generatePackingOptimizationSuggestions,
} from "../utils/ai";
import {
  aiPackingSuggestionsSchema,
  aiPackingOptimizationSchema,
} from "../schemas/ai";

/**
 * Generate AI-powered packing suggestions
 * @param req Request with trip details
 * @param res Response with suggestions
 */
export const getPackingSuggestions = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = aiPackingSuggestionsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: validationResult.error.errors,
        success: false,
      });
    }

    const {
      eventType,
      weatherForecast,
      duration,
      people,
      specialRequirements,
    } = validationResult.data;

    // Generate suggestions
    const suggestions = await generatePackingSuggestions(
      eventType,
      weatherForecast,
      duration,
      people,
      specialRequirements
    );

    return res.status(200).json({
      message: "Packing suggestions generated successfully",
      data: suggestions,
      success: true,
    });
  } catch (error: any) {
    console.error("Error generating packing suggestions:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate packing suggestions",
      success: false,
    });
  }
};

/**
 * Generate AI-powered packing optimization suggestions
 * @param req Request with current items and constraints
 * @param res Response with optimization suggestions
 */
export const getPackingOptimizationSuggestions = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate request body
    const validationResult = aiPackingOptimizationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: validationResult.error.errors,
        success: false,
      });
    }

    const { items, constraints } = validationResult.data;

    // Generate optimization suggestions
    const suggestions = await generatePackingOptimizationSuggestions(
      items,
      constraints
    );

    return res.status(200).json({
      message: "Packing optimization suggestions generated successfully",
      data: suggestions,
      success: true,
    });
  } catch (error: any) {
    console.error("Error generating packing optimization suggestions:", error);
    return res.status(500).json({
      message:
        error.message || "Failed to generate packing optimization suggestions",
      success: false,
    });
  }
};
