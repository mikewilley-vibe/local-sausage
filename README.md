# 🍲 Seasonal Sous Chef

A smart, AI-powered web app that helps you discover seasonal produce, generate custom recipes, and find farmers markets and restaurants in your area.

## ✨ Features

### 📍 Seasonal Produce Finder
- Search produce by **GPS coordinates** or **US region**
- Get current season's fruits and vegetables
- Updated monthly seasonality data for 9 US regions
- 5-10x expanded database with 20-50+ items per region-month

### 🍳 AI Recipe Generator
- **Scan fridge/cupboard photos** with OpenAI Vision (gpt-4o)
- Get ingredient suggestions and autocomplete
- Add staples you always have on hand
- Generate 3 seasonal recipes with:
  - Ingredients and substitutions
  - Step-by-step instructions
  - Serving suggestions
  - Alternative recipe ideas
  - Pro tips

### 🌾 Local Markets Finder
- Find **farmers markets** and **produce vendors** near you
- Search by location name or GPS coordinates
- See ratings, distances, and market types
- Uses Google Places API for real results
- Falls back to sample data if no API key configured

### 🍽️ Local Restaurants
- Discover **farm-to-table** and **organic restaurants**
- Search by location or coordinates
- View ratings and cuisine types
- Uses Google Places API for real results

### 📱 Full Navigation
- Beautiful header with easy navigation
- Back-to-home buttons on all pages
- 4-column home page with all features
- Fully responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (required for recipes)
- Google Places API key (optional, for real market/restaurant results)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mikewilley-vibe/local-sausage.git
cd local-sausage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your API keys:
```dotenv
# Required for recipe generation
OPENAI_API_KEY=your-openai-key-here

# Optional for real market/restaurant results
GOOGLE_PLACES_API_KEY=your-google-places-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 API Keys

### OpenAI API (Required)
- Get your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Used for:
  - Recipe generation (gpt-3.5-turbo)
  - Image scanning (gpt-4o)

### Google Places API (Optional)
- Get your key from [Google Cloud Console](https://console.cloud.google.com/)
- Used for real market and restaurant search
- Without it, the app shows sample data
- **See [GOOGLE_PLACES_API_SETUP.md](./GOOGLE_PLACES_API_SETUP.md) for detailed setup instructions**

## 🌐 Deployment

### Vercel (Recommended)
The app is configured for Vercel deployment:

1. Push to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel project settings:
   - `OPENAI_API_KEY`
   - `GOOGLE_PLACES_API_KEY` (optional)
4. Deploy!

Your app will be live at `your-project.vercel.app`

## 📁 Project Structure

```
seasonal-sous-chef/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── recipes/            # Recipe generation endpoint
│   │   ├── scan-ingredients/   # Image scanning endpoint
│   │   ├── seasonal/           # Seasonal produce endpoint
│   │   ├── markets/            # Markets search endpoint
│   │   ├── local-fare/         # Restaurants search endpoint
│   │   └── geo/                # Geolocation endpoint
│   ├── seasonal/               # Seasonal page
│   ├── recipes/                # Recipe generator page
│   ├── markets/                # Markets finder page
│   ├── restaurants/            # Restaurants page
│   ├── page.tsx                # Home page
│   └── layout.tsx              # Root layout with header
├── components/
│   └── Header.tsx              # Navigation header
├── data/
│   └── seasonality/            # Seasonal produce database
├── public/                      # Static assets
├── .env.local                  # Environment variables (local)
└── package.json
```

## 🔑 API Endpoints

All endpoints are located in `/app/api/`:

- `GET /api/seasonal?region=Northeast&month=6` - Get seasonal produce
- `GET /api/seasonal?lat=40.7128&lng=-74.0060&month=6` - Seasonal by coordinates
- `POST /api/recipes` - Generate recipes
- `POST /api/scan-ingredients` - Scan images for ingredients
- `GET /api/markets?lat=40.7128&lng=-74.0060` - Find markets
- `GET /api/local-fare?lat=40.7128&lng=-74.0060` - Find restaurants
- `GET /api/geo?location=New+York` - Geocode location

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI API (gpt-4o, gpt-3.5-turbo)
- **Search**: Google Places API
- **Storage**: JSON data files + localStorage
- **Deployment**: Vercel

## 📊 Data

### Seasonal Produce Database
- **File**: `/data/seasonality/produce_by_region_month.json`
- **Coverage**: 9 US regions × 12 months
- **Items**: 20-50+ fruits and vegetables per region-month
- **Regions**: Northeast, MidAtlantic, Southeast, Midwest, Plains, Mountain, Southwest, West, South

### USDA Hardiness Zones
- **File**: `/data/seasonality/produce_by_zone_month.json`
- **Coverage**: 13 USDA hardiness zones

## 🎯 Usage Examples

### Search Seasonal Produce
1. Go to `/seasonal`
2. Use "By Coordinates" (enter your lat/lng or use GPS)
3. Select a month
4. See what's in season!

### Generate Recipes
1. Go to `/recipes`
2. **Option A - Scan Photos**: Take photos of your fridge, upload them, AI analyzes them
3. **Option B - Manual Entry**: Type in ingredients you have
4. Add staples you always keep
5. Click "Generate Recipe"
6. Browse suggestions or select a specific recipe

### Find Markets
1. Go to `/markets`
2. Enter a city name or use coordinates
3. See farmers markets and produce vendors
4. Click "Visit" to check out their website

### Find Restaurants
1. Go to `/restaurants`
2. Enter a location or use your GPS
3. See farm-to-table and organic restaurants
4. Get ratings and distance info

## 🐛 Troubleshooting

### "Please enable recipes" error
- Make sure `OPENAI_API_KEY` is in `.env.local`
- Restart the dev server

### No markets/restaurants showing
- This is normal if no Google Places API key is configured
- The app will show sample data
- To get real results, [set up Google Places API](./GOOGLE_PLACES_API_SETUP.md)

### Image scanning not working
- Verify `OPENAI_API_KEY` is correct
- Check that images are in JPEG/PNG format
- Try uploading smaller images

### Build errors on Vercel
- Check that all environment variables are set in Vercel project settings
- Verify the GitHub repository connection

## 🚀 Future Features

- [ ] User accounts and saved favorites
- [ ] Weekly seasonal produce alerts
- [ ] Recipe bookmarks and collections
- [ ] Dietary restriction filters
- [ ] Seasonal recipe calendar
- [ ] Community recipe sharing
- [ ] Price tracking for produce
- [ ] Multi-language support

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please open a GitHub issue or check the [setup guide](./GOOGLE_PLACES_API_SETUP.md).

---

**Happy cooking with seasonal produce! 🥕🍎🥦**
