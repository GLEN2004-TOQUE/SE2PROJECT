class AIQueueService {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.aiService = require('./aiService');
  }

  async addToQueue(text, type, count, difficulty = "medium") {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, type, count, difficulty, resolve, reject });
      this.processQueue();
    });
  }

  getRequestIntervalMs() {
    const rpms = (this.aiService.models || [])
      .map((model) => Number.isFinite(Number(model.rpm)) ? Number(model.rpm) : 1)
      .filter((rpm) => rpm > 0);
    const effectiveRpm = rpms.length > 0 ? Math.min(...rpms) : 1;
    return Math.max(1000, Math.ceil(60000 / effectiveRpm));
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      
      try {
        const result = await this.aiService.generateQuestions(
          request.text, 
          request.type, 
          request.count,
          request.difficulty
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      
      const delayMs = this.getRequestIntervalMs();
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    this.processing = false;
  }
}

module.exports = new AIQueueService();