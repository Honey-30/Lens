# Vercel Deployment Guide

## Pre-Deployment Checklist ✅

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Gemini API Key
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key
- Copy the key for later use

### 3. Test Local Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel 🚀

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Add Environment Variable**
```bash
vercel env add VITE_API_KEY
```
Paste your Gemini API key when prompted.

5. **Redeploy with Environment Variables**
```bash
vercel --prod
```

### Option 2: Vercel Dashboard

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add: `VITE_API_KEY` = `your_gemini_api_key_here`
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_KEY` | Your Google Gemini API Key | ✅ Yes |

## Build Configuration

The project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher

## Troubleshooting

### Build Fails
- Ensure all dependencies are listed in `package.json`
- Check that Node version is 18.x or higher
- Verify TypeScript has no errors: `npm run build`

### API Key Not Working
- Ensure environment variable is named `VITE_API_KEY` (Vite requires `VITE_` prefix)
- Redeploy after adding environment variables
- Check Vercel deployment logs for errors

### Import Map Issues
The project uses ES modules via CDN in `index.html`. This is intentional and should work in production.

### CSS Not Loading
The `index.css` file is a placeholder. All styles are inline in `index.html`.

## Post-Deployment

1. **Test the deployment**
   - Upload a test image
   - Verify AI responses
   - Check execution mode

2. **Monitor Usage**
   - Check [Google AI Studio](https://aistudio.google.com/) for API usage
   - Monitor Vercel analytics

3. **Custom Domain** (Optional)
   - Go to Vercel project settings
   - Add your custom domain
   - Update DNS records as instructed

## Important Notes

⚠️ **Security**: Never commit `.env` files to Git. Use `.env.example` as a template.

⚠️ **API Quota**: Monitor your Gemini API usage to avoid exceeding quotas.

⚠️ **Browser Support**: Modern browsers required (ES2020+ support needed).

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test locally with `npm run build && npm run preview`
