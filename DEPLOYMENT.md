# 🚀 GitHub Deployment Guide

## Repository Information
**Repository**: https://github.com/leylabernie/Wedding_Invitation_Bundle
**Branch**: main

## Quick Deployment Options

### 1. Vercel (Recommended)
1. Connect your GitHub account to [Vercel](https://vercel.com)
2. Import the repository: `leylabernie/Wedding_Invitation_Bundle`
3. Configure environment variables:
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB connection string (optional)
   - `JWT_SECRET`: Your JWT secret key
4. Deploy - Vercel will automatically detect the configuration

### 2. Netlify
1. Connect your GitHub account to [Netlify](https://netlify.com)
2. Import the repository
3. Set build command: `echo "Frontend deployed"`
4. Set publish directory: `frontend`
5. Add environment variables

### 3. GitHub Pages (Frontend Only)
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root) or main / frontend
4. Save and deploy

## Manual Deployment

### Backend Deployment (Node.js)
```bash
# Clone the repository
git clone https://github.com/leylabernie/Wedding_Invitation_Bundle.git
cd Wedding_Invitation_Bundle

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start
```

### Frontend Deployment
```bash
# Serve the frontend
cd frontend
python -m http.server 3000

# Or deploy to any static hosting service
# The frontend files are in the frontend/ directory
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wedding-invitation
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-domain.com
BASE_URL=https://your-api-domain.com

# Optional: Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Cloud storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Docker Deployment

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

Build and run:
```bash
docker build -t Wedding_Invitation_Bundle .
docker run -p 5000:5000 Wedding_Invitation_Bundle
```

## Production Considerations

1. **Database**: Use MongoDB Atlas for production
2. **Security**: Update JWT_SECRET and other sensitive variables
3. **Domain**: Configure proper domain names in environment variables
4. **SSL**: Ensure HTTPS is enabled
5. **Monitoring**: Set up application monitoring and logging

## GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm install
        
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## Support

For deployment issues:
1. Check the environment variables
2. Verify the MongoDB connection
3. Check the logs for any errors
4. Ensure all dependencies are installed

---

**Repository URL**: https://github.com/leylabernie/Wedding_Invitation_Bundle
**Deploy URL**: Configure based on your hosting provider