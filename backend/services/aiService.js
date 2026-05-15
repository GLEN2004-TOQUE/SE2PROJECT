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
      { name: "models/gemini-2.5-flash", rpm: 5, tpm: 250000 }
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

  /** Normalize model output to { question, options[4], correct_answer } for DB / student UI. */
  normalizeQuestions(items, quizType) {
    if (!Array.isArray(items)) throw new Error("Response is not an array");
    const letters = ["A", "B", "C", "D"];
    return items.map((raw) => {
      const question = String(raw.question ?? raw.prompt ?? raw.stem ?? "").trim();
      let options = Array.isArray(raw.options)
        ? raw.options.map((o) => (o == null ? "" : String(o).trim()))
        : [];

      if (quizType === "true-false") {
        if (options.filter(Boolean).length < 2) {
          options = ["True", "False", "", ""];
        } else {
          options = [
            options[0] || "True",
            options[1] || "False",
            options[2] || "",
            options[3] || "",
          ];
        }
      }

      while (options.length < 4) options.push("");
      options = options.slice(0, 4);

      let correct = raw.correct_answer;
      if (typeof correct === "boolean") {
        correct = correct ? "A" : "B";
      } else {
        correct = correct == null ? "A" : String(correct).trim();
      }

      const lower = correct.toLowerCase();
      if (quizType === "true-false") {
        if (lower === "true" || lower === "t") correct = "A";
        else if (lower === "false" || lower === "f") correct = "B";
      }

      if (!letters.includes(correct)) {
        const idx = options.findIndex(
          (o) => o && o.toLowerCase() === lower
        );
        correct = idx >= 0 ? letters[idx] : "A";
      }

      if (!letters.includes(correct)) correct = "A";

      return {
        question,
        options,
        correct_answer: correct,
      };
    });
  }

  buildQuizPrompt(textSnippet, quizType, difficulty, count) {
    const diffLine =
      difficulty === "easy"
        ? "Difficulty EASY: direct recall from the text; distractors should be clearly weaker."
        : difficulty === "hard"
          ? "Difficulty HARD: subtle distinctions, application, or synthesis; distractors must be highly plausible."
          : "Difficulty MEDIUM: solid understanding of concepts; distractors are plausible but distinguishable.";

    const base = `Based on the following lecture text:
"""
${textSnippet}
"""

${diffLine}

Generate exactly ${count} questions. Return ONLY a valid JSON array, no markdown fences, no commentary.`;

    if (quizType === "true-false") {
      return `${base}

Quiz type: TRUE OR FALSE.
Each item must be a clear declarative statement grounded in the lecture.
JSON shape (array of objects):
[
  {
    "question": "Statement the student marks as true or false.",
    "options": ["True", "False"],
    "correct_answer": "A"
  }
]
Rules:
- correct_answer must be letter A if the statement is true, or B if false (options[0] is True, options[1] is False).
- options must be exactly ["True", "False"] for every item.
- Do not include options C or D in the JSON; the system will pad them.`;
    }

    if (quizType === "identification") {
      return `${base}

Quiz type: IDENTIFICATION.
Each question asks the student to identify a term, name, concept, or fill-in style answer using four short phrase choices (only one is fully correct).
JSON shape:
[
  {
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "A"
  }
]
Rules:
- Always exactly 4 non-empty options (concise phrases).
- correct_answer is exactly one of: A, B, C, D.`;
    }

    if (quizType === "matching") {
      return `${base}

Quiz type: MATCHING (implemented as term–definition pairing).
Each question presents a term, label, or short scenario from the lecture and asks which of four choices is the correct match (e.g. correct definition, counterpart, or classification).
JSON shape:
[
  {
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "A"
  }
]
Rules:
- Always exactly 4 non-empty options.
- correct_answer is exactly one of: A, B, C, D.
- Wrong options should be related to the topic but clearly incorrect as a pair for the prompt.`;
    }

    // multiple-choice (default / legacy)
    return `${base}

Quiz type: MULTIPLE CHOICE.
JSON shape:
[
  {
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "A"
  }
]
Rules:
- Always 4 options.
- correct_answer is A, B, C, or D.
- Make questions educational and relevant to the lecture.`;
  }

  // Main function to generate questions with auto model switching
  async generateQuestions(
    text,
    type = "multiple-choice",
    count = 5,
    difficulty = "medium"
  ) {
    let attempts = 0;
    const maxAttempts = this.models.length * 2; // Try each model twice

    const quizType =
      type === "matching" ||
      type === "identification" ||
      type === "true-false"
        ? type
        : "multiple-choice";
    const diffRaw = String(difficulty || "medium").toLowerCase();
    const diff =
      diffRaw === "easy" || diffRaw === "hard" ? diffRaw : "medium";

    console.log(
      `🎯 Generating ${count} ${quizType} questions (${diff} difficulty)...`
    );

    const textSnippet = (text || "").substring(0, 3000);

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
        
        const prompt = this.buildQuizPrompt(textSnippet, quizType, diff, count);

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
        const normalized = this.normalizeQuestions(parsed, quizType);
        const valid = normalized.filter((q) => q.question.length > 0);
        if (valid.length === 0) {
          throw new Error("No valid questions in model response");
        }

        console.log(
          `✅ Success with ${modelName} (${valid.length} questions generated)`
        );
        return valid;

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

  buildStudyRecommendationsPrompt(lectures, weakItems, maxTopics) {
    const lectureBlocks = (lectures || []).map((lecture, index) => {
      const title = lecture.title ? String(lecture.title).trim() : `Lecture ${index + 1}`;
      const text = String(lecture.extracted_text || "").trim().replace(/\s+/g, " ").slice(0, 2400);
      return `Lecture ${index + 1}: ${title}\n${text}`;
    });

    const weakDescriptions = (weakItems || []).map((item) => {
      const lectureLabel = item.lectureTitle ? ` — Lecture: ${item.lectureTitle}` : "";
      return `- ${item.quizTitle} (${item.percentage}% correct, ${item.score}/${item.total})${lectureLabel}`;
    });

    return `You are an academic coach. A student has weak quiz performance on the following items:\n${weakDescriptions.join("\n")}\n\nUsing the lecture materials below, recommend up to ${maxTopics} topics or concepts the student should review. Focus on areas where the student can improve and keep recommendations precise and actionable.\n\nReturn ONLY a valid JSON array of objects with the keys \"topic\" and \"reason\". Do not include markdown fences, commentary, or any extra text.\n\nLecture materials:\n${lectureBlocks.join("\n\n")}`;
  }

  async generateStudyRecommendations({ lectures, weakItems, maxTopics = 4 }) {
    let attempts = 0;
    const maxAttempts = this.models.length * 2;
    const prompt = this.buildStudyRecommendationsPrompt(lectures, weakItems, maxTopics);

    while (attempts < maxAttempts) {
      const modelConfig = this.getNextAvailableModel();
      if (!modelConfig) {
        const waitTime = Math.min(60000, Math.pow(2, this.consecutiveFailures) * 1000);
        console.log(`💤 All models busy. Waiting ${waitTime / 1000} seconds...`);
        await this.sleep(waitTime);
        continue;
      }

      const modelName = modelConfig.name;
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = await response.text();

        this.incrementRequestCount(modelName);
        this.consecutiveFailures = 0;

        let cleanJson = textOutput.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/```json\n?/, "").replace(/```\n?$/, "");
        }
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/```\n?/, "").replace(/```\n?$/, "");
        }

        const firstBracket = cleanJson.indexOf("[");
        const lastBracket = cleanJson.lastIndexOf("]");
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanJson = cleanJson.slice(firstBracket, lastBracket + 1);
        }

        const parsed = JSON.parse(cleanJson);
        if (!Array.isArray(parsed)) {
          throw new Error("Model response was not an array");
        }

        const valid = parsed
          .filter((item) => item && item.topic && item.reason)
          .map((item) => ({
            topic: String(item.topic).trim(),
            reason: String(item.reason).trim(),
          }));

        if (valid.length === 0) {
          throw new Error("No valid recommendation objects returned by the model");
        }

        console.log(`✅ Study recommendations generated with ${modelName}`);
        return valid;
      } catch (error) {
        console.error(`❌ ${modelName} recommendation error:`, error.message);
        if (error.message.includes("429") || error.message.includes("quota")) {
          this.incrementRequestCount(modelName);
          this.consecutiveFailures++;
          const waitMatch = error.message.match(/retry in (\d+\.?\d*)s/);
          if (waitMatch) {
            const waitTime = parseFloat(waitMatch[1]) * 1000;
            console.log(`⏳ Waiting ${waitTime / 1000} seconds as suggested...`);
            await this.sleep(waitTime);
          }
        } else if (error.message.includes("404")) {
          console.log(`⚠️ Model ${modelName} not found, skipping...`);
        } else {
          this.consecutiveFailures++;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate study recommendations after ${maxAttempts} attempts. Last error: ${error.message}`);
        }

        await this.sleep(1000);
      }
    }

    throw new Error(`Unable to generate study recommendations after ${maxAttempts} attempts`);
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