const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class AIService {
  constructor() {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY in .env");
      throw new Error("GEMINI_API_KEY is required");
    }
    
    console.log("🤖 Initializing AI Service with auto model switching...");
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List of available models from your screenshot
    this.models = [
      { name: "models/gemini-2.0-flash-lite", rpm: 30000, tpm: 30000000 },
      { name: "models/gemini-2.0-flash", rpm: 30000, tpm: 30000000 },
      { name: "models/gemini-2.5-flash", rpm: 5, tpm: 250000 },
      { name: "models/gemini-2.5-pro", rpm: 2000, tpm: 8000000 },
      { name: "models/gemini-flash-latest", rpm: 10, tpm: 1000000 }
    ];
    
    this.currentModelIndex = 0;
    this.requestCounts = new Map(); // Track requests per model per minute
    this.lastResetTime = Date.now();
    this.consecutiveFailures = 0;
  }

  // Reset counters every minute
  resetCountersIfNeeded() {
    const now = Date.now();
    if (now - this.lastResetTime >= 60000) { // 1 minute
      this.requestCounts.clear();
      this.lastResetTime = now;
      this.consecutiveFailures = 0;
      console.log("🔄 Rate limit counters reset");
    }
  }

  // Check if model is within rate limits
  isModelAvailable(modelName, modelRPM) {
    const count = this.requestCounts.get(modelName) || 0;
    const isAvailable = count < modelRPM;
    
    if (!isAvailable) {
      console.log(`⚠️ Model ${modelName} reached ${count}/${modelRPM} requests this minute`);
    }
    
    return isAvailable;
  }

  // Get next available model
  getNextAvailableModel() {
    this.resetCountersIfNeeded();
    
    // If too many consecutive failures, implement backoff
    if (this.consecutiveFailures > 3) {
      console.log(`⚠️ ${this.consecutiveFailures} consecutive failures, implementing backoff`);
      return null;
    }
    
    // Try models in order
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];
      if (this.isModelAvailable(model.name, model.rpm)) {
        this.currentModelIndex = i;
        return model;
      }
    }
    
    return null;
  }

  // Increment request count for a model
  incrementRequestCount(modelName) {
    const current = this.requestCounts.get(modelName) || 0;
    this.requestCounts.set(modelName, current + 1);
  }

  // Helper sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main function to generate questions with auto model switching
  async generateQuestions(text, type = "multiple-choice", count = 5) {
    let attempts = 0;
    const maxAttempts = this.models.length * 2; // Try each model twice

    console.log(`🎯 Generating ${count} ${type} questions...`);

    while (attempts < maxAttempts) {
      // Get next available model
      const modelConfig = this.getNextAvailableModel();
      
      if (!modelConfig) {
        const waitTime = Math.min(60000, Math.pow(2, this.consecutiveFailures) * 1000);
        console.log(`💤 All models busy. Waiting ${waitTime/1000} seconds...`);
        await this.sleep(waitTime);
        continue;
      }

      const modelName = modelConfig.name;
      console.log(`🚀 Attempt ${attempts + 1}/${maxAttempts}: Using ${modelName}`);

      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
Based on the following lecture text:
"""
${text.substring(0, 3000)}
"""

Generate ${count} ${type} questions.

Return ONLY valid JSON in this exact format:
[
  {
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "A"
  }
]

Rules:
- Always 4 options
- Use A, B, C, D for correct_answer
- No explanation, JSON only
- Make questions educational and relevant
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();
        
        // Increment success count
        this.incrementRequestCount(modelName);
        this.consecutiveFailures = 0;
        
        // Clean and parse JSON
        let cleanJson = textOutput.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/```json\n?/, '').replace(/```\n?$/, '');
        }
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/```\n?/, '').replace(/```\n?$/, '');
        }
        
        const parsed = JSON.parse(cleanJson);
        
        // Validate response
        if (!Array.isArray(parsed)) {
          throw new Error("Response is not an array");
        }
        
        console.log(`✅ Success with ${modelName} (${parsed.length} questions generated)`);
        return parsed;

      } catch (error) {
        console.error(`❌ ${modelName} failed:`, error.message);
        
        // Handle rate limit errors
        if (error.message.includes("429") || error.message.includes("quota")) {
          this.incrementRequestCount(modelName);
          this.consecutiveFailures++;
          
          // Extract wait time from error if available
          const waitMatch = error.message.match(/retry in (\d+\.?\d*)s/);
          if (waitMatch) {
            const waitTime = parseFloat(waitMatch[1]) * 1000;
            console.log(`⏳ Waiting ${waitTime/1000} seconds as suggested...`);
            await this.sleep(waitTime);
          }
        } 
        // Handle model not found errors
        else if (error.message.includes("404")) {
          console.log(`⚠️ Model ${modelName} not found, skipping...`);
        }
        // Handle other errors
        else {
          this.consecutiveFailures++;
        }
        
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed after ${maxAttempts} attempts. Last error: ${error.message}`);
        }
        
        // Small delay before next attempt
        await this.sleep(1000);
      }
    }

    throw new Error(`Unable to generate questions after ${maxAttempts} attempts`);
  }

  // Get current status of all models
  getStatus() {
    this.resetCountersIfNeeded();
    const status = {};
    
    for (const model of this.models) {
      const currentRequests = this.requestCounts.get(model.name) || 0;
      status[model.name] = {
        used: currentRequests,
        limit: model.rpm,
        available: currentRequests < model.rpm,
        remaining: Math.max(0, model.rpm - currentRequests),
        percentageUsed: Math.round((currentRequests / model.rpm) * 100)
      };
    }
    
    return {
      models: status,
      consecutiveFailures: this.consecutiveFailures,
      lastReset: new Date(this.lastResetTime).toISOString(),
      totalModels: this.models.length
    };
  }
}

module.exports = new AIService();