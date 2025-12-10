// Simplified User model for development without MongoDB
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.avatar = data.avatar || '';
    this.phone = data.phone;
    this.preferences = {
      notifications: {
        email: data.preferences?.notifications?.email !== undefined ? data.preferences.notifications.email : true,
        push: data.preferences?.notifications?.push !== undefined ? data.preferences.notifications.push : true,
        rsvp: data.preferences?.notifications?.rsvp !== undefined ? data.preferences.notifications.rsvp : true
      },
      theme: data.preferences?.theme || 'auto'
    };
    this.subscription = {
      type: data.subscription?.type || 'free',
      expiresAt: data.subscription?.expiresAt,
      features: data.subscription?.features || []
    };
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Compare password method
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Remove password from JSON output
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  static async create(data) {
    const user = new User(data);
    await user.hashPassword();
    return user;
  }

  static async findOne(query) {
    // Mock implementation - in real app would query database
    if (query.email) {
      return null; // Return null for demo
    }
    return null;
  }

  static async findById(id) {
    // Mock implementation
    return new User({});
  }

  static async find() {
    // Mock implementation
    return [];
  }

  async save() {
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = User;