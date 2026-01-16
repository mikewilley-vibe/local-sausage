# Seasonal Sous Chef

A local seasonal produce finder app using USDA hardiness zones and regional data.

## Local Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
cp .env.example .env.local
```

3. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_key_here
```

4. Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/local-sausage.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `seasonal-sous-chef` directory as the root
5. Add environment variables:
   - **OPENAI_API_KEY**: Your OpenAI API key
6. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

After initial deployment:
1. Go to your project Settings → Environment Variables
2. Add `OPENAI_API_KEY` for Production, Preview, and Development
3. Redeploy for changes to take effect

## Project Structure

```
seasonal-sous-chef/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── seasonal/      # Seasonal produce endpoint
│   │   ├── recipes/       # Recipe generation endpoint
│   │   ├── geo/           # Geolocation endpoint
│   │   ├── markets/       # Farmer's markets endpoint
│   │   └── local-fare/    # Local specialties endpoint
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── openai.ts         # OpenAI client
│   └── seasonality/      # Seasonality logic
├── data/                 # JSON data files
│   ├── seasonality/      # Produce data by region/zone
│   └── regional_specialties.json
├── public/               # Static files
└── package.json
```

## API Endpoints

### GET /api/seasonal
Get seasonal produce for a location.

**Parameters:**
- `lat` (number): Latitude
- `lng` (number): Longitude
- `month` (number): Month (1-12)
- `region` (string): Region name (fallback if no coords)

**Example:**
```
GET /api/seasonal?lat=40.7128&lng=-74.0060&month=6
```

### POST /api/recipes
Generate recipes from available seasonal produce.

**Body:**
```json
{
  "locationLabel": "New York, NY",
  "inSeason": ["tomatoes", "corn", "zucchini"],
  "staples": ["olive oil", "garlic"]
}
```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for recipe generation

## License

MIT
