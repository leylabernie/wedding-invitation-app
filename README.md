# Wedding Invitation App - Full Stack Application

A beautiful, modern wedding invitation application built with Node.js backend and vanilla JavaScript frontend.

## 🎯 Features

### Core Functionality
- **User Authentication**: Login, register, and secure session management
- **Event Management**: Create and manage wedding events and invitations
- **Guest Management**: Comprehensive guest list with RSVP tracking
- **Design System**: Beautiful templates and color customization
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Toggle between light and dark themes

### Technical Features
- **RESTful API**: Complete backend API with 48 endpoints
- **Real-time Updates**: Live RSVP tracking and notifications
- **Security**: JWT authentication, input validation, rate limiting
- **File Handling**: Upload and manage invitation assets
- **Export Options**: Multiple format export capabilities

## 🚀 Quick Start

### Access the Application

**Frontend (User Interface):**
https://3000-a59fe3b6-6af2-4b6d-8590-cb49fb6e55b8.sandbox-service.public.prod.myninja.ai

**Backend API:**
https://5001-a59fe3b6-6af2-4b6d-8590-cb49fb6e55b8.sandbox-service.public.prod.myninja.ai

### Demo Login
- **Email**: demo@example.com
- **Password**: password123

Or create a new account with any email and password (minimum 6 characters).

## 📱 Application Screens

### 1. Login/Register Screen
- Clean authentication interface
- Email and password validation
- Option to create new account

### 2. Main Dashboard
- Overview of all events
- Quick event creation
- Event statistics and RSVP tracking

### 3. Guest Management
- Complete guest list with RSVP status
- Guest categorization (Family, Friends, etc.)
- Real-time statistics (Total, Confirmed, Pending)
- Search and filter functionality

### 4. Design Studio
- Color palette selection
- Template customization
- Design element management
- Preview and export options

### 5. Settings
- Account management
- Theme toggle (Dark/Light mode)
- Preferences and notifications

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup and modern standards
- **CSS3**: Tailwind CSS for responsive design
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Material Icons**: Beautiful icon library
- **Google Fonts**: Cormorant Garamond for elegant typography

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database (with in-memory fallback for development)
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Rate Limiting**: API protection

## 📁 Project Structure

```
wedding-invitation-app/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Event.js             # Event model
│   │   ├── Guest.js             # Guest model
│   │   ├── Design.js            # Design model
│   │   ├── Notification.js      # Notification model
│   │   └── Export.js            # Export model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── events.js            # Event management routes
│   │   ├── guests.js            # Guest management routes
│   │   ├── designs.js           # Design system routes
│   │   ├── rsvp.js              # RSVP handling routes
│   │   ├── share.js             # Social sharing routes
│   │   ├── export.js            # Export functionality routes
│   │   └── notifications.js     # Notification routes
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   ├── package.json             # Dependencies and scripts
│   ├── server.js                # Main server file
│   ├── .env                     # Environment variables
│   └── setup.sh                 # Automated setup script
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── app.js                   # JavaScript application logic
│   └── style.css                # Custom styles (if needed)
├── user_input_files/            # Original design files
└── README.md                    # This documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get user events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get specific event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Guests
- `GET /api/guests/event/:eventId` - Get event guests
- `POST /api/guests/event/:eventId` - Add guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Remove guest

### RSVP
- `POST /api/rsvp/submit` - Submit RSVP response
- `GET /api/rsvp/event/:eventId` - Get RSVP statistics

### Design
- `GET /api/designs/templates` - Get design templates
- `POST /api/designs` - Create custom design
- `PUT /api/designs/:id` - Update design

### Export
- `POST /api/export/generate` - Generate export files
- `GET /api/export/:id/download` - Download export

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read

## 🎨 Design System

### Color Palette
- **Primary**: #374151 (Dark Gray)
- **Background Light**: #F7F8FA
- **Background Dark**: #1F2937
- **Success**: Green variations for confirmations
- **Warning**: Yellow variations for pending items
- **Error**: Red variations for declined items

### Typography
- **Display Font**: Cormorant Garamond (Serif)
- **Body Font**: System sans-serif
- **Icon Font**: Material Icons

### Component Library
- Cards with glassmorphism effect
- Rounded corners (1rem default)
- Backdrop blur for modern aesthetics
- Smooth transitions and hover states

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configured for frontend domain
- **Security Headers**: Helmet middleware for additional security

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tablet and desktop adaptations
- **Touch Friendly**: Large tap targets and touch gestures
- **Performance**: Optimized images and lazy loading

## 🚀 Deployment

### Development Setup
1. Clone the repository
2. Run `cd backend && npm install` for backend dependencies
3. Configure environment variables in `.env`
4. Start backend: `npm run dev`
5. Start frontend: `cd frontend && python -m http.server 3000`

### Production Deployment
- Backend ready for Vercel, Heroku, or any Node.js hosting
- Frontend can be deployed to any static hosting service
- Environment variables for production configuration

## 🎯 Future Enhancements

### Planned Features
- Real-time collaborative editing
- Advanced analytics dashboard
- Multi-language support
- Payment integration for premium features
- Email automation system
- Advanced template editor
- Mobile app development

### Scalability
- Microservices architecture migration
- CDN integration for file delivery
- Database sharding for large datasets
- Caching layer implementation
- Load balancing for high traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 📞 Support

For questions or support, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for beautiful weddings and memorable celebrations**