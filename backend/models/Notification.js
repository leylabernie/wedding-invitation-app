// Simplified Notification model for development without MongoDB
class Notification {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.userId = data.userId;
    this.eventId = data.eventId;
    this.type = data.type || 'info';
    this.title = data.title;
    this.message = data.message;
    this.isRead = data.isRead || false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(data) {
    const notification = new Notification(data);
    return notification;
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(id) {
    // Mock implementation
    return new Notification({});
  }

  async save() {
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Notification;