import express from "express";
import {
  getPackingSuggestions,
  getPackingOptimizationSuggestions,
} from "../controllers/aiController";

const router = express.Router();

/**
 * @route   POST /api/ai/packing-suggestions
 * @desc    Get AI-powered packing suggestions based on trip details
 * @access  Public
 */
router.post("/packing-suggestions", getPackingSuggestions);

/**
 * @route   POST /api/ai/packing-optimization
 * @desc    Get AI-powered packing optimization suggestions
 * @access  Public
 */
router.post("/packing-optimization", getPackingOptimizationSuggestions);

export default router;
