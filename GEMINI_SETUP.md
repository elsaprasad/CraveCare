# Gemini AI Integration Setup

This app uses Google Gemini AI to generate personalized recipes based on user preferences and menstrual cycle phases.

## 🚀 Quick Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

**Note:** The free tier includes generous usage limits. For production apps, consider upgrading to a paid plan.

### 2. Configure Environment Variable

Create a `.env` file in the root directory:

```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** 
- Never commit your `.env` file to git (it's already in `.gitignore`)
- The `.env.example` file shows the format without exposing your key

### 3. Restart Development Server

After adding the API key, restart your dev server:

```bash
npm run dev
```

## 🔄 How It Works

### With API Key (AI-Generated Recipes)
- When you click "Generate AI Recipe", the app calls Gemini AI
- Gemini creates a personalized recipe based on:
  - Current menstrual cycle phase
  - Available appliances
  - User preferences (PCOS, goals, budget)
  - Nutritional needs for that phase

### Without API Key (Fallback Mode)
- If no API key is set, the app uses hard-coded fallback recipes
- You'll see a message: "Using fallback recipe..."
- The app still works perfectly, just without AI generation

## 🛠️ Troubleshooting

### "Using fallback recipe" message appears
- Check that `.env` file exists in the root directory
- Verify `VITE_GEMINI_API_KEY` is spelled correctly
- Make sure there are no spaces around the `=` sign
- Restart the dev server after creating/updating `.env`

### API errors
- Check your API key is valid
- Verify you have API quota remaining
- Check browser console for detailed error messages
- The app will automatically fall back to hard-coded recipes

### Rate Limits
- Free tier has generous limits
- If you hit limits, the app falls back to hard-coded recipes
- Consider upgrading for production use

## 📝 API Key Security

**For Development:**
- Keep `.env` file local (never commit it)
- Use different keys for dev/production

**For Production:**
- Use environment variables provided by your hosting platform
- Never expose API keys in client-side code (they're safe in `.env` files with Vite's `VITE_` prefix)
- Consider using a backend proxy for production apps

## 🔗 Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 💡 Tips

- The AI generates recipes tailored to Indian ingredients and hostel cooking
- Recipes are optimized for the specific appliance selected
- Nutritional focus matches the current menstrual cycle phase
- PCOS-friendly options are included when applicable
