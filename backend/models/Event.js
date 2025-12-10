// Simplified Event model for development without MongoDB
class Event {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.userId = data.userId;
    this.title = data.title;
    this.type = data.type || 'wedding';
    this.status = data.status || 'draft';
    this.eventDate = data.eventDate;
    this.eventTime = data.eventTime;
    this.timezone = data.timezone || 'UTC';
    this.venue = {
      name: data.venue?.name || '',
      address: {
        street: data.venue?.address?.street,
        city: data.venue?.address?.city,
        state: data.venue?.address?.state,
        country: data.venue?.address?.country,
        zipCode: data.venue?.address?.zipCode
      },
      coordinates: {
        lat: data.venue?.coordinates?.lat,
        lng: data.venue?.coordinates?.lng
      }
    };
    this.details = {
      description: data.details?.description,
      dressCode: data.details?.dressCode,
      ageRestriction: data.details?.ageRestriction,
      parkingInfo: data.details?.parkingInfo,
      accommodations: data.details?.accommodations
    };
    this.design = {
      template: data.design?.template || 'classic',
      colorPalette: data.design?.colorPalette || [],
      fonts: {
        primary: data.design?.fonts?.primary,
        secondary: data.design?.fonts?.secondary
      },
      customizations: data.design?.customizations || {}
    };
    this.settings = {
      rsvpRequired: data.settings?.rsvpRequired !== undefined ? data.settings.rsvpRequired : true,
      rsvpDeadline: data.settings?.rsvpDeadline,
      maxGuests: data.settings?.maxGuests,
      allowPlusOnes: data.settings?.allowPlusOnes !== undefined ? data.settings.allowPlusOnes : true,
      requireFoodAllergies: data.settings?.requireFoodAllergies || false,
      enablePhotoSharing: data.settings?.enablePhotoSharing || false,
      customQuestions: data.settings?.customQuestions || []
    };
    this.sharing = {
      isPublic: data.sharing?.isPublic || false,
      shareableLink: data.sharing?.shareableLink || '',
      qrCode: data.sharing?.qrCode,
      socialSettings: {
        facebook: data.sharing?.socialSettings?.facebook || false,
        instagram: data.sharing?.socialSettings?.instagram || false,
        twitter: data.sharing?.socialSettings?.twitter || false,
        whatsapp: data.sharing?.socialSettings?.whatsapp || false
      }
    };
    this.analytics = {
      views: data.analytics?.views || 0,
      shares: data.analytics?.shares || 0,
      rsvpViews: data.analytics?.rsvpViews || 0,
      totalResponses: data.analytics?.totalResponses || 0,
      confirmedCount: data.analytics?.confirmedCount || 0,
      declinedCount: data.analytics?.declinedCount || 0
    };
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Generate shareable link before saving
  generateShareableLink() {
    if (!this.sharing.shareableLink) {
      this.sharing.shareableLink = `${process.env.BASE_URL || 'http://localhost:3000'}/event/${this._id}`;
    }
  }

  static async create(data) {
    const event = new Event(data);
    event.generateShareableLink();
    return event;
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(id) {
    // Mock implementation
    return new Event({});
  }

  static async findByIdAndUpdate(id, data) {
    // Mock implementation
    const event = new Event(data);
    event._id = id;
    return event;
  }

  async save() {
    this.generateShareableLink();
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Event;