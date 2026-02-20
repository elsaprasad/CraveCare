# Troubleshooting Gemini API Integration

## ✅ Step-by-Step Setup

### 1. Create `.env` file in the ROOT directory

The `.env` file must be in the same folder as `package.json`:

```
cravecare-companion-main/
├── .env              ← HERE (same level as package.json)
├── package.json
├── vite.config.ts
└── src/
```

### 2. Add your API key

Open `.env` and add (no quotes, no spaces around =):

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:**
- ❌ NO quotes: `VITE_GEMINI_API_KEY="key"` 
- ❌ NO spaces: `VITE_GEMINI_API_KEY = key`
- ✅ Correct: `VITE_GEMINI_API_KEY=key`

### 3. Restart Dev Server

**CRITICAL:** After creating/updating `.env`, you MUST restart:

1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`

Vite only reads `.env` files when it starts!

### 4. Check Browser Console

Open browser DevTools (F12) → Console tab

You should see:
```
🔑 Gemini API Key check: { hasKey: true, ... }
```

If you see `hasKey: false`, the API key isn't being read.

## 🔍 Common Issues

### Issue: "Using fallback recipe" always appears

**Check 1: File Location**
```bash
# Make sure .env is in root directory
cd cravecare-companion-main
ls .env  # Should show the file
```

**Check 2: File Format**
- Open `.env` in a text editor
- Make sure it's exactly: `VITE_GEMINI_API_KEY=your_key`
- No extra spaces or quotes
- No blank lines before it

**Check 3: Restart Required**
- Stop dev server completely
- Start fresh: `npm run dev`
- Hard refresh browser (Ctrl+Shift+R)

**Check 4: Browser Console**
- Open DevTools (F12)
- Check Console for the debug message
- Look for any errors

### Issue: API Key not found

1. Verify `.env` file exists in root
2. Check file name is exactly `.env` (not `.env.txt` or `.env.local`)
3. Make sure variable name is `VITE_GEMINI_API_KEY` (starts with `VITE_`)
4. Restart dev server

### Issue: API errors

If you see API errors in console:

1. **Invalid API Key**: Get a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Rate Limit**: Free tier has limits, wait a bit
3. **Network Error**: Check internet connection
4. **CORS Error**: Shouldn't happen, but check browser console

## 🧪 Test It Works

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Generate AI Recipe" button
4. Look for console messages:
   - ✅ `🔑 Gemini API Key check: { hasKey: true }` = API key found
   - ❌ `hasKey: false` = API key not found
   - ✅ Recipe appears = Working!
   - ❌ "Using fallback recipe" = API key issue or API error

## 📝 Quick Checklist

- [ ] `.env` file exists in root directory (same as `package.json`)
- [ ] `.env` contains: `VITE_GEMINI_API_KEY=your_key` (no quotes, no spaces)
- [ ] Dev server was restarted after creating `.env`
- [ ] Browser console shows `hasKey: true`
- [ ] No errors in browser console

## 🆘 Still Not Working?

1. **Check file location:**
   ```bash
   cd cravecare-companion-main
   cat .env  # Should show your API key
   ```

2. **Verify API key is valid:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Make sure key is active
   - Try creating a new key

3. **Check Vite is reading it:**
   - Add this temporarily to `src/main.tsx`:
   ```typescript
   console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);
   ```
   - Should show your key (or undefined if not found)

4. **Clear cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## 📞 Need More Help?

Check the browser console for specific error messages and share them for debugging.
