// Centralized message store with 50,000 message limit
class MessageStore {
  constructor(maxMessages = 50000) {
    this.messages = [];
    this.maxMessages = maxMessages;
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      id: Date.now() + Math.random(), // Unique ID
      timestamp: message.timestamp || new Date().toISOString()
    });

    // Remove oldest messages if limit exceeded
    if (this.messages.length > this.maxMessages) {
      const deleteCount = this.messages.length - this.maxMessages;
      this.messages.splice(0, deleteCount);
    }
  }

  getMessages(limit = 100) {
    // Return only the last 'limit' messages to avoid sending too much data
    return this.messages.slice(-limit);
  }

  getAllMessages() {
    return this.messages;
  }

  getMessageCount() {
    return this.messages.length;
  }

  clear() {
    this.messages = [];
  }
}

export default MessageStore;