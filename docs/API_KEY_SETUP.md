# API Key Setup Guide

## How to Get Your Google Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select a Google Cloud project (or create new one)
   - Copy the generated API key (starts with `AIza...`)

3. **Add to CulinaryLens**
   - Open CulinaryLens
   - Click the Settings icon (⚙️) in the header
   - Scroll to "API Configuration" section
   - Paste your API key in the input field
   - Click "Update Protocol" to save

## Features

### Runtime Configuration
- ✅ **No environment variables needed** - Configure API key directly in the app
- ✅ **Instant updates** - Changes apply immediately without redeploying
- ✅ **Persistent storage** - API key saved in browser localStorage
- ✅ **Priority override** - Runtime key takes precedence over environment variable

### Security
- ✅ **Local storage only** - API key never leaves your browser
- ✅ **Masked in logs** - API key hidden in debug logs for security
- ✅ **Show/hide toggle** - Eye icon to reveal/hide your API key
- ✅ **Direct to Google** - API calls go directly to Google's servers

### User Experience
- ✅ **Visual feedback** - Clear instructions and help text
- ✅ **Reset option** - Clear API key with "Reset Defaults" button
- ✅ **Error messages** - Helpful feedback if API key is invalid
- ✅ **One-time setup** - Configure once, works forever

## How It Works

### Priority Order
```
1. API key from Settings (runtime) 
   ↓
2. VITE_API_KEY environment variable
   ↓
3. Error message prompting to configure
```

### Where It's Used
The API key is automatically used across all features:
- 🔍 **Ingredient Analysis** - Image recognition and classification
- 🍳 **Recipe Generation** - Neural synthesis of cooking protocols
- 🎯 **Execution Mode** - Voice instructions and technique verification
- 💬 **Sous Chef Chat** - Real-time cooking assistance
- 📊 **Freshness Assessment** - AI-powered quality analysis

## Troubleshooting

### "API_KEY_NULL" Error
**Problem**: No API key configured  
**Solution**: Add your API key in Settings → API Configuration

### "Quota Exceeded" Error
**Problem**: You've hit Google's free tier limits  
**Solution**: 
- Wait for quota to reset (usually next day)
- Upgrade to paid tier in Google Cloud Console
- App will automatically use offline mode as fallback

### API Key Not Saving
**Problem**: Changes not persisting after refresh  
**Solution**:
- Check browser's localStorage is enabled
- Ensure you clicked "Update Protocol" button
- Try different browser if issue persists

### Invalid API Key
**Problem**: API calls failing with authentication error  
**Solution**:
- Verify key starts with `AIza`
- Check for extra spaces or characters
- Generate new key at Google AI Studio
- Ensure API key has Gemini API enabled

## Free Tier Limits

Google Gemini API Free Tier:
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

For CulinaryLens usage:
- ~3-5 API calls per recipe generation
- ~2-3 API calls per ingredient analysis
- Should handle 300-500 recipes per day

## Privacy & Security

### What's Stored Locally
```json
{
  "apiKey": "AIza...",
  "dietary": "Vegan",
  "allergies": ["Nuts", "Dairy"],
  "cuisinePreference": "Japanese",
  "instamartSync": true,
  "highFidelityVisuals": true
}
```

### What's Never Stored
- ❌ Your ingredient images
- ❌ Recipe history
- ❌ Personal information
- ❌ Usage analytics

### Data Flow
```
Your Browser (API Key stored)
     ↓
Google Gemini API (Direct HTTPS)
     ↓
Response back to Your Browser
```

**No intermediary servers. No data collection. Just you and Google's AI.**

## Advanced Usage

### Multiple API Keys
If you want to use different API keys for different projects:
1. Use browser profiles (Chrome/Edge)
2. Each profile maintains separate localStorage
3. Configure different API key in each profile

### Environment Variable Fallback
For developers who prefer .env files:
```bash
# .env file
VITE_API_KEY=your_api_key_here
```
Runtime key in Settings will override this.

### Testing Offline Mode
To test offline fallback:
1. Enter invalid API key in Settings
2. App will detect failures and switch to offline mode
3. Generates recipes using local algorithms

## Updates & Maintenance

### Changing Your API Key
1. Go to Settings
2. Click eye icon to reveal current key
3. Enter new key
4. Click "Update Protocol"
5. Changes apply immediately

### Resetting to Defaults
1. Go to Settings
2. Scroll to bottom
3. Click "Reset Defaults"
4. Clears API key and all preferences
5. You'll need to re-enter API key

## Support

### Get Help
- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **GitHub Issues**: https://github.com/Honey-30/Lens/issues

### Check API Status
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for `[Gemini Handshake]` messages
4. Green = connected, Red = error

---

**Remember**: Your API key is like a password. Keep it private and don't share screenshots containing it!
