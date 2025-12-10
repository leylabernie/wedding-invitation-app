// Simplified Guest model for development without MongoDB
class Guest {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.eventId = data.eventId;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.category = data.category || 'friends';
    this.relationship = data.relationship;
    this.invitedBy = data.invitedBy;
    this.partySize = data.partySize || 1;
    this.plusOnes = data.plusOnes || { allowed: true, names: [] };
    this.rsvp = {
      status: data.rsvp?.status || 'pending',
      respondedAt: data.rsvp?.respondedAt,
      message: data.rsvp?.message,
      dietaryRestrictions: data.rsvp?.dietaryRestrictions || [],
      specialRequests: data.rsvp?.specialRequests,
      plusOneNames: data.rsvp?.plusOneNames || [],
      actualGuestCount: data.rsvp?.actualGuestCount,
      customResponses: data.rsvp?.customResponses || []
    };
    this.invitation = {
      sent: data.invitation?.sent || false,
      sentAt: data.invitation?.sentAt,
      deliveryStatus: data.invitation?.deliveryStatus || 'pending',
      deliveryAttempts: data.invitation?.deliveryAttempts || 0,
      method: data.invitation?.method || 'email',
      trackingId: data.invitation?.trackingId
    };
    this.tags = data.tags || [];
    this.notes = data.notes;
    this.customFields = data.customFields || {};
    this.metadata = {
      source: data.metadata?.source || 'manual',
      importSource: data.metadata?.importSource,
      lastContacted: data.metadata?.lastContacted,
      reminderCount: data.metadata?.reminderCount || 0,
      openedInvitation: data.metadata?.openedInvitation || false
    };
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(data) {
    const guest = new Guest(data);
    return guest;
  }

  static async findOne(query) {
    // Mock implementation
    return null;
  }

  static async findById(id) {
    // Mock implementation
    return new Guest({});
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

module.exports = Guest;