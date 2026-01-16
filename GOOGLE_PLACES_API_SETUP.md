# Google Places API Setup Guide

This guide will help you set up the Google Places API to enable real-time search for farmers markets and restaurants in the Seasonal Sous Chef app.

## Why Google Places API?

The app uses Google Places API to search for:
- **Markets Page**: Farmers markets, produce markets, organic markets, farm stands
- **Restaurants Page**: Farm-to-table restaurants, organic restaurants, seasonal menu restaurants

Without the API key, the app will display sample/demo data. With the API key, you'll get real results.

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name: `seasonal-sous-chef` (or your preferred name)
5. Click **Create**
6. Wait for the project to be created, then select it

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for `Places API`
   - Click on it
   - Click **Enable**
3. Search for `Maps JavaScript API`
   - Click on it
   - Click **Enable**
4. Search for `Geocoding API`
   - Click on it
   - Click **Enable**

### Step 3: Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. A dialog will appear with your API key
4. Copy the API key

### Step 4: Restrict Your API Key (Recommended)

For security, restrict your API key:

1. In **Credentials**, click on your newly created API key
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your domain(s):
   - `localhost:3000` (for local development)
   - `yourvercel-deployment.vercel.app` (for production)
4. Under **API restrictions**, select **Restrict key**
5. Select these APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
6. Click **Save**

### Step 5: Add to Your Environment

1. Open `.env.local` in your project
2. Uncomment the `GOOGLE_PLACES_API_KEY` line
3. Replace `your-google-places-api-key-here` with your actual API key
4. Save the file

```dotenv
GOOGLE_PLACES_API_KEY=AIzaSyD... (your actual key)
```

### Step 6: Restart Your App

1. Restart the development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:3000/markets` or `/restaurants`
3. Search for a location - you should now see real results!

## Testing the Setup

### Test Markets Page
1. Go to `/markets`
2. Click "Use My Location" or enter coordinates
3. You should see real farmers markets with:
   - Accurate distances
   - Ratings
   - Types (farmers market, grocery, etc.)

### Test Restaurants Page
1. Go to `/restaurants`
2. Click "Use My Location" or enter coordinates
3. You should see real restaurants with:
   - Names and addresses
   - Cuisine types
   - Ratings
   - Distance from your location

## Troubleshooting

### No Results Still Showing

- **Check API key**: Verify the key is copied correctly in `.env.local`
- **Check API is enabled**: Go to Google Cloud Console > APIs & Services > Library and confirm Places API is enabled
- **Restart server**: Stop and restart `npm run dev`
- **Check browser console**: Open DevTools (F12) and check for any error messages

### "Valid lat and lng parameters required"

- This means the API received invalid coordinates
- Try using the "Use My Location" button to auto-detect your location
- If using manual entry, make sure latitude and longitude are properly formatted:
  - Example: Latitude: 40.7128, Longitude: -74.0060 (New York City)

### API Quota Exceeded

- The free tier of Google Places API has usage limits
- Visit [Google Cloud Console > Billing](https://console.cloud.google.com/billing) to check usage
- You may need to enable billing or upgrade your plan for higher quotas

## Cost Considerations

Google Places API is not free but is very affordable:
- **Places API**: ~$0.017 per request (after free monthly quota)
- **Geocoding API**: ~$0.005 per request (after free monthly quota)
- Free quota: 200 requests per day

For a small project, costs are minimal. Monitor your usage in the Google Cloud Console.

## More Information

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Cloud Pricing](https://cloud.google.com/maps-platform/pricing)
- [API Key Security Best Practices](https://cloud.google.com/docs/authentication/api-keys)

## Questions?

If you have issues setting up the API:
1. Check the [Google Cloud Status Dashboard](https://status.cloud.google.com/)
2. Verify your API key has the correct restrictions
3. Check the browser console for detailed error messages
4. Verify the coordinates you're using are valid (use Google Maps to test)
