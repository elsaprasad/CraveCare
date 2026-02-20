# CraveCare Companion

A React-based web application for tracking menstrual cycles and providing personalized meal recommendations with limited kitchen appliances.

## Features

- **Cycle Tracking**: Track and monitor your menstrual cycle
- **AI-Powered Recipe Generation**: Generate personalized recipes using Google Gemini AI
- **Fallback Recipes**: Hard-coded recipes available when AI is unavailable
- **Personalized Meal Plans**: Get meal recommendations synced to your cycle
- **Limited Equipment Cooking**: Recipes designed for kitchens with minimal appliances
- **Profile Management**: Customize your profile and preferences

## Tech Stack

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cravecare-companion-main
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Gemini AI for recipe generation:
   - Create a `.env` file in the root directory
   - Add your Gemini API key: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed instructions
   - **Note:** The app works without an API key using fallback recipes

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Mobile App Scripts

- `npm run cap:sync` - Sync web app to native projects
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:add:android` - Add Android platform
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:open:android` - Open Android project in Android Studio
- `npm run cap:build` - Build and sync to native projects

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # shadcn-ui components
│   └── ...        # Feature components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and helpers
└── test/          # Test files
```

## Mobile App Support

This app is configured for both **PWA (Progressive Web App)** and **Native Mobile Apps**:

- ✅ **PWA**: Installable on phones, works offline, no app store needed
- ✅ **Native Apps**: Full iOS and Android support via Capacitor

📱 **See [APP_SETUP.md](./APP_SETUP.md) for detailed mobile app setup instructions.**

### Quick PWA Test:
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open in browser and look for "Add to Home Screen"

## Development

The project uses:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Vitest** for testing
- **Tailwind CSS** for styling
- **Vite PWA Plugin** for PWA functionality
- **Capacitor** for native mobile apps
- **Google Gemini AI** for AI-powered recipe generation (optional)

## AI Recipe Generation

The app uses Google Gemini AI to generate personalized recipes. If no API key is configured, it automatically falls back to curated hard-coded recipes.

📖 **See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for setup instructions.**

## License

Private project - All rights reserved
