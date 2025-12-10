# Wedding Invitation Backend API

A comprehensive backend API for the Wedding Invitation Package Creation App, built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Registration, authentication, profile management
- **Event Management**: Create, update, and manage wedding events
- **Guest Management**: Guest lists, RSVP tracking, categorization
- **Design System**: Color palettes, templates, customizations
- **RSVP System**: Public RSVP submission, response tracking
- **Sharing System**: Shareable links, social media integration, QR codes
- **Export System**: Generate PDFs, images, and other formats
- **Notifications**: Real-time notifications for RSVP updates
- **File Management**: Upload and manage images and assets

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local storage (configurable for cloud)
- **Image Processing**: Sharp
- **PDF Generation**: PDF-lib
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone and setup**:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Install dependencies**:
```bash
npm install
```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update profile
PUT  /api/auth/password    - Change password
POST /api/auth/logout      - Logout user
```

### Events
```
GET    /api/events              - Get user events
POST   /api/events              - Create new event
GET    /api/events/:id          - Get single event
PUT    /api/events/:id          - Update event
DELETE /api/events/:id          - Delete event
PUT    /api/events/:id/design   - Update event design
PUT    /api/events/:id/sharing  - Update sharing settings
GET    /api/events/:id/analytics - Get event analytics
```

### Guests
```
GET  /api/guests/event/:eventId              - Get event guests
POST /api/guests/event/:eventId              - Add new guest
PUT  /api/guests/:id                         - Update guest
PUT  /api/guests/:id/rsvp                    - Update RSVP status
DELETE /api/guests/:id                       - Delete guest
POST /api/guests/event/:eventId/import       - Bulk import guests
POST /api/guests/event/:eventId/invite       - Send invitations
GET  /api/guests/event/:eventId/categories   - Get guest categories
```

### Designs
```
GET  /api/designs              - Get user designs
GET  /api/designs/templates    - Get public templates
POST /api/designs              - Create new design
GET  /api/designs/:id          - Get single design
PUT  /api/designs/:id          - Update design
DELETE /api/designs/:id        - Delete design
POST /api/designs/:id/clone    - Clone design
PUT  /api/designs/:id/favorite - Toggle favorite
GET  /api/designs/:id/analytics - Get design analytics
```

### RSVP (Public/Private)
```
POST /api/rsvp/submit/:eventId/:guestId     - Submit RSVP (public)
GET  /api/rsvp/responses/:eventId           - Get RSVP responses
POST /api/rsvp/remind/:eventId/:guestId     - Send reminder
```

### Sharing
```
POST /api/share/generate-link/:eventId     - Generate shareable link
GET  /api/share/options/:eventId           - Get sharing options
PUT  /api/share/settings/:eventId          - Update sharing settings
GET  /api/share/public/:eventId            - Get public event data
POST /api/share/track-share/:eventId       - Track share event
POST /api/share/qr-code/:eventId           - Generate QR code
GET  /api/share/stats/:eventId             - Get sharing statistics
```

### Export
```
GET  /api/export              - Get user exports
POST /api/export              - Create export job
GET  /api/export/:id          - Get export status
GET  /api/export/:id/download - Download exported file
DELETE /api/export/:id        - Delete export
POST /api/export/upload-assets - Upload custom assets
```

### Notifications
```
GET  /api/notifications                    - Get user notifications
GET  /api/notifications/unread-count       - Get unread count
PUT  /api/notifications/:id/read           - Mark as read
PUT  /api/notifications/mark-all-read      - Mark all as read
DELETE /api/notifications/:id              - Delete notification
POST /api/notifications                    - Create notification
GET  /api/notifications/type/:type         - Get by type
GET  /api/notifications/settings           - Get settings
PUT  /api/notifications/settings           - Update settings
POST /api/notifications/test               - Send test notification
```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/wedding-invitation

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloud Storage (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Database Schema

### Users
- Authentication and user preferences
- Subscription management

### Events
- Event details and customization
- Design and sharing settings
- Analytics tracking

### Guests
- Guest information and categorization
- RSVP tracking and responses
- Invitation delivery status

### Designs
- Color palettes and templates
- Custom design elements
- Export settings

### Notifications
- Real-time notifications
- Multiple delivery channels
- Read status tracking

### Exports
- Export job management
- File generation and storage
- Download tracking

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation using express-validator
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers protection
- **Password Hashing**: bcryptjs for secure password storage

## File Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Event.js             # Event model
│   ├── Guest.js             # Guest model
│   ├── Design.js            # Design model
│   ├── Notification.js      # Notification model
│   └── Export.js            # Export model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── events.js            # Event management routes
│   ├── guests.js            # Guest management routes
│   ├── designs.js           # Design routes
│   ├── rsvp.js              # RSVP routes
│   ├── share.js             # Sharing routes
│   ├── export.js            # Export routes
│   └── notifications.js     # Notification routes
├── utils/
│   └── helpers.js           # Utility functions
├── uploads/                 # File upload directory
│   ├── exports/
│   ├── assets/
│   └── temp/
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── setup.sh                 # Setup script
└── README.md                # This file
```

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Adding New Features

1. **Create Model**: Add new model in `models/`
2. **Add Routes**: Create routes in `routes/`
3. **Update Server**: Register routes in `server.js`
4. **Add Tests**: Create tests for new functionality

### Error Handling

The API uses centralized error handling:
- Validation errors return 400 with detailed messages
- Authentication errors return 401/403
- Not found errors return 404
- Server errors return 500 with error details (development only)

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database URI
3. Set secure JWT secret
4. Configure file storage (AWS S3, Cloudinary, etc.)
5. Set up email service for notifications

### Process Management
Use PM2 for production deployment:
```bash
npm install -g pm2
pm2 start server.js --name wedding-api
pm2 startup
pm2 save
```

### Database Migration
For production deployments, consider using MongoDB migrations or a tool like `migrate-mongo`.

## Support

For issues and questions:
1. Check the API documentation above
2. Review the error messages in the response
3. Check the server logs for detailed errors
4. Ensure all environment variables are configured correctly

## License

MIT License - see LICENSE file for details.