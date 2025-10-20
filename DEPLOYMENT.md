# Vercel Deployment Guide

## Environment Variables Required

Set these in your Vercel project settings:

### Required
- `GOOGLE_API_KEY` - Your Google AI API key for chat functionality

### Optional (for full functionality)
- `MONGODB_URI` - MongoDB connection string for persistence
- `MONGODB_DB` - Database name
- `CLOUDINARY_CLOUD_NAME` - For file uploads
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `PERSIST_SECRET` - Random secret for internal API security

## Build Configuration

The project is configured with:
- Node.js 20.x runtime for all API routes
- Proper webpack configuration for MongoDB/Mongoose
- Vercel-specific settings in `vercel.json`

## Common Issues & Solutions

1. **Build fails with "unexpected error"**: 
   - Ensure all environment variables are set
   - Check that MongoDB URI is valid if using persistence
   - Verify Google API key is correct

2. **Function timeout**:
   - API routes are configured for Node.js runtime
   - Consider increasing timeout in Vercel settings if needed

3. **MongoDB connection issues**:
   - Ensure MongoDB URI is accessible from Vercel
   - Check database permissions and network access
