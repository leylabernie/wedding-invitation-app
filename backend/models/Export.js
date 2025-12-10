// Simplified Export model for development without MongoDB
class Export {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.userId = data.userId;
    this.eventId = data.eventId;
    this.type = data.type || 'pdf';
    this.status = data.status || 'pending';
    this.fileUrl = data.fileUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(data) {
    const exportJob = new Export(data);
    return exportJob;
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(id) {
    // Mock implementation
    return new Export({});
  }

  async save() {
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Export;