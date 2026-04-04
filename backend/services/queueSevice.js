class AIQueueService {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.aiService = require('./aiService');
  }

  async addToQueue(text, type, count) {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, type, count, resolve, reject });
      this.processQueue();
    });
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
          request.count
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      
      // Delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.processing = false;
  }
}

module.exports = new AIQueueService();