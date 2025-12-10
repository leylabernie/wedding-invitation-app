// Simplified Design model for development without MongoDB
class Design {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.userId = data.userId;
    this.eventId = data.eventId;
    this.name = data.name;
    this.template = data.template || 'classic';
    this.colorPalette = data.colorPalette || [];
    this.typography = {
      primary: data.typography?.primary || {},
      secondary: data.typography?.secondary || {},
      accent: data.typography?.accent || {}
    };
    this.layout = {
      style: data.layout?.style || 'traditional',
      sections: data.layout?.sections || []
    };
    this.customElements = {
      logo: data.customElements?.logo || {},
      graphics: data.customElements?.graphics || [],
      animations: data.customElements?.animations || []
    };
    this.assets = {
      images: data.assets?.images || [],
      icons: data.assets?.icons || []
    };
    this.exportSettings = {
      formats: data.exportSettings?.formats || ['PDF'],
      resolution: data.exportSettings?.resolution || 'high',
      dpi: data.exportSettings?.dpi || 300,
      bleed: data.exportSettings?.bleed || 0,
      safeArea: data.exportSettings?.safeArea || 10
    };
    this.isTemplate = data.isTemplate || false;
    this.isPublic = data.isPublic || false;
    this.tags = data.tags || [];
    this.usage = {
      used: data.usage?.used || 0,
      favorites: data.usage?.favorites || 0,
      downloads: data.usage?.downloads || 0
    };
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(data) {
    const design = new Design(data);
    return design;
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(id) {
    // Mock implementation
    return new Design({});
  }

  async save() {
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Design;