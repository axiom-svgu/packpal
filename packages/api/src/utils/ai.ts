import { GoogleGenerativeAI } from "@google/generative-ai";
import constants from "./constants";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(constants.GEMINI_API_KEY);

// Model configuration
const modelConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Generate packing suggestions based on trip details
 * @param eventType - Type of event (camping, business trip, beach vacation, etc.)
 * @param weatherForecast - Weather at destination
 * @param duration - Duration of stay (in days)
 * @param people - Number of people
 * @param specialRequirements - Special requirements (dietary restrictions, medical needs, etc.)
 * @returns {Promise<Object>} - Object containing suggested items categorized by type
 */
export async function generatePackingSuggestions(
  eventType: string,
  weatherForecast: string,
  duration: number,
  people: number,
  specialRequirements?: string
): Promise<any> {
  try {
    // Create the prompt
    const prompt = `
    Generate a comprehensive packing list for a ${eventType} based on the following details:
    - Weather: ${weatherForecast}
    - Duration: ${duration} days
    - Number of people: ${people}
    ${
      specialRequirements
        ? `- Special requirements: ${specialRequirements}`
        : ""
    }
    
    Please organize the items into these categories:
    - Clothing
    - Toiletries
    - Electronics
    - Documents
    - Food and Drinks
    - Medications
    - Equipment
    - Miscellaneous
    
    For each item, include:
    - Name
    - Quantity (per person where applicable)
    - Priority (High, Medium, Low)
    
    Format the response as a structured JSON object with categories as keys and arrays of items as values.
    `;

    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: modelConfig,
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating packing suggestions:", error);
    throw new Error("Failed to generate packing suggestions");
  }
}

/**
 * Generate packing optimization suggestions
 * @param items - List of items already packed
 * @param constraints - Constraints like weight limits, space limits, etc.
 * @returns {Promise<Object>} - Object containing optimization suggestions
 */
export async function generatePackingOptimizationSuggestions(
  items: string[],
  constraints: string
): Promise<any> {
  try {
    // Create the prompt
    const prompt = `
    Review this packing list and provide optimization suggestions based on the following constraints:
    ${constraints}
    
    Current items:
    ${items.join("\n")}
    
    Please provide:
    1. Items that could be removed or consolidated
    2. Alternative items that are lighter/smaller
    3. Packing strategies to save space
    4. Weight distribution recommendations
    
    Format the response as JSON.
    `;

    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: modelConfig,
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating packing optimization suggestions:", error);
    throw new Error("Failed to generate packing optimization suggestions");
  }
}
