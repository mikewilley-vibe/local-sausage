'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SUGGESTED_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'salmon', 'shrimp', 'tofu',
  'rice', 'pasta', 'bread', 'quinoa', 'couscous',
  'onions', 'garlic', 'bell peppers', 'carrots', 'broccoli', 'spinach', 'mushrooms',
  'tomatoes', 'cucumbers', 'lettuce', 'cabbage', 'potatoes', 'sweet potatoes',
  'cheese', 'milk', 'eggs', 'yogurt', 'butter',
  'olive oil', 'coconut oil', 'soy sauce', 'vinegar', 'honey',
  'lemon', 'lime', 'orange', 'ginger', 'cilantro', 'basil', 'rosemary',
  'black beans', 'chickpeas', 'lentils', 'nuts', 'seeds',
];

const DEFAULT_STAPLES = ['salt', 'pepper', 'oil', 'garlic', 'butter'];

export default function RecipesPage() {
  const [tab, setTab] = useState<'manual' | 'scan'>('scan');
  const [locationLabel, setLocationLabel] = useState('My Kitchen');
  const [inSeason, setInSeason] = useState<string[]>(['tomatoes', 'basil', 'zucchini']);
  const [staples, setStaples] = useState<string[]>(DEFAULT_STAPLES);
  const [newStaple, setNewStaple] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);

  // Load staples from localStorage on mount
  useEffect(() => {
    const savedStaples = localStorage.getItem('staples');
    if (savedStaples) {
      try {
        setStaples(JSON.parse(savedStaples));
      } catch (e) {
        setStaples(DEFAULT_STAPLES);
      }
    }
  }, []);

  // Save staples to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('staples', JSON.stringify(staples));
  }, [staples]);

  const suggestedIngredients = SUGGESTED_INGREDIENTS.filter(
    ing => !inSeason.includes(ing) && ing.toLowerCase().includes(newIngredient.toLowerCase())
  ).slice(0, 5);

  const addStaple = () => {
    if (newStaple.trim() && !staples.includes(newStaple.trim())) {
      setStaples([...staples, newStaple.trim()]);
      setNewStaple('');
    }
  };

  const removeStaple = (staple: string) => {
    setStaples(staples.filter(s => s !== staple));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !inSeason.includes(newIngredient.trim())) {
      setInSeason([...inSeason, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setInSeason(inSeason.filter(i => i !== ingredient));
  };

  const removeScanedIngredient = (ingredient: string) => {
    setScannedIngredients(scannedIngredients.filter(i => i !== ingredient));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedImages([...uploadedImages, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const scanImages = async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError('');
    setScannedIngredients([]);

    try {
      const formData = new FormData();
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/scan-ingredients', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const ingredients = data.ingredients || [];
        setScannedIngredients(ingredients);
        // Add scanned ingredients to the main ingredient list
        const newIngredients = ingredients.filter(
          (ing: string) => !inSeason.includes(ing)
        );
        setInSeason([...inSeason, ...newIngredients]);
      } else {
        setError(data.error || 'Failed to scan images');
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError(err instanceof Error ? err.message : 'Error scanning images. Make sure OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecipe = async () => {
    if (inSeason.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLabel,
          inSeason,
          staples,
          dietary: [],
          maxTimeMinutes: 30,
          skill: 'intermediate',
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.recipes) {
        setRecipes(data.recipes);
      } else {
        setError(data.error || 'Failed to generate recipes');
      }
    } catch (err) {
      setError('Error generating recipes. Make sure OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block mb-6 px-4 py-2 text-orange-600 hover:text-orange-700 font-semibold">
          ← Back to Seasonal Sous Chef
        </Link>
        <h1 className="text-4xl font-bold text-center mb-2 text-orange-700">👨‍🍳 Recipe Generator</h1>
        <p className="text-center text-gray-600 mb-8">Generate AI recipes using seasonal ingredients</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setTab('scan');
                  setError('');
                }}
                className={`pb-2 px-4 font-medium transition ${
                  tab === 'scan'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📸 Scan Photos
              </button>
              <button
                onClick={() => {
                  setTab('manual');
                  setError('');
                }}
                className={`pb-2 px-4 font-medium transition ${
                  tab === 'manual'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="Enter your location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {tab === 'manual' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    placeholder="Add an ingredient..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {suggestedIngredients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {suggestedIngredients.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            if (!inSeason.includes(suggestion)) {
                              setInSeason([...inSeason, suggestion]);
                              setNewIngredient('');
                            }
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-orange-100 text-gray-800 text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={addIngredient}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {inSeason.map((ing) => (
                  <div key={ing} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {ing}
                    <button
                      onClick={() => removeIngredient(ing)}
                      className="hover:text-orange-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase">Quick Add Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {['chicken', 'beef', 'shrimp', 'cheese', 'mushrooms', 'spinach', 'bell peppers', 'rice', 'pasta', 'eggs', 'salmon', 'beans'].map((ing) => (
                    !inSeason.includes(ing) && (
                      <button
                        key={ing}
                        onClick={() => setInSeason([...inSeason, ing])}
                        className="bg-white hover:bg-orange-50 border border-gray-300 hover:border-orange-400 text-gray-700 text-xs px-2 py-1 rounded-md transition"
                      >
                        + {ing}
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">🏪 These Are The Staples I Have</h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newStaple}
                      onChange={(e) => setNewStaple(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStaple()}
                      placeholder="Add a staple (salt, oil, etc)..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={addStaple}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staples.map((staple) => (
                    <div key={staple} className="bg-slate-200 text-slate-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      {staple}
                      <button
                        onClick={() => removeStaple(staple)}
                        className="hover:text-slate-900 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos from Fridge/Cupboard</label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 mb-3 bg-orange-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">Upload photos of your fridge, cupboard, or pantry items</p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images ({uploadedImages.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={scanImages}
                disabled={loading || uploadedImages.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition mb-4"
              >
                {loading ? 'Scanning Images...' : 'Scan Images for Ingredients'}
              </button>

              {scannedIngredients.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-3">📦 Ingredients Found: <span className="font-bold text-lg text-green-700">{scannedIngredients.length}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {scannedIngredients.map((ing) => (
                      <div key={ing} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        {ing}
                        <button
                          onClick={() => removeScanedIngredient(ing)}
                          className="hover:text-green-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">🏪 These Are The Staples I Have</h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newStaple}
                      onChange={(e) => setNewStaple(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStaple()}
                      placeholder="Add a staple (salt, oil, etc)..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={addStaple}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staples.map((staple) => (
                    <div key={staple} className="bg-slate-200 text-slate-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      {staple}
                      <button
                        onClick={() => removeStaple(staple)}
                        className="hover:text-slate-900 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Ingredients to Use:</p>
            <div className="flex flex-wrap gap-2">
              {inSeason.length > 0 ? (
                inSeason.map((ing) => (
                  <span key={ing} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {ing}
                  </span>
                ))
              ) : (
                <p className="text-blue-700 text-sm">No ingredients added yet</p>
              )}
            </div>
          </div>

          <button
            onClick={generateRecipe}
            disabled={loading || inSeason.length === 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Generating Recipe...' : 'Generate Recipe'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {recipes.length > 0 && selectedRecipeIndex === null && (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🍳 Choose a Recipe</h2>
            <div className="grid gap-4">
              {recipes.map((recipe, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRecipeIndex(idx)}
                  className="text-left bg-white rounded-lg shadow-md hover:shadow-lg p-6 border-l-4 border-orange-500 transition hover:bg-orange-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-orange-700 mb-2">{recipe.title}</h3>
                      <p className="text-gray-600 font-medium mb-3">⏱️ {recipe.timeMinutes} minutes</p>
                      <p className="text-gray-700 text-sm">📋 {recipe.ingredients?.length || 0} ingredients</p>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {recipes.length > 0 && selectedRecipeIndex !== null && recipes[selectedRecipeIndex] && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedRecipeIndex(null)}
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 mb-4"
            >
              ← Back to Recipe List
            </button>
            
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-500">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-orange-700 mb-2">{recipes[selectedRecipeIndex].title}</h3>
                <p className="text-gray-600 font-medium text-lg">⏱️ {recipes[selectedRecipeIndex].timeMinutes} minutes</p>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Ingredients</h4>
                <ul className="space-y-2 text-gray-700">
                  {recipes[selectedRecipeIndex].ingredients?.map((ing: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-orange-600 font-bold mt-1">✓</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">👨‍🍳 Steps</h4>
                <ol className="space-y-4 text-gray-700">
                  {recipes[selectedRecipeIndex].steps?.map((step: string, i: number) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-bold text-orange-600 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 rounded-full">
                        {i + 1}
                      </span>
                      <span className="pt-1 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {recipes[selectedRecipeIndex].substitutions && recipes[selectedRecipeIndex].substitutions.length > 0 && (
                <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3">🔄 Substitutions</h4>
                  <ul className="space-y-2 text-blue-900 text-sm">
                    {recipes[selectedRecipeIndex].substitutions.map((sub: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-600 flex-shrink-0">•</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipes[selectedRecipeIndex].optionalShoppingAddOns && recipes[selectedRecipeIndex].optionalShoppingAddOns.length > 0 && (
                <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3">🛒 Optional Add-ons</h4>
                  <ul className="space-y-2 text-green-900 text-sm">
                    {recipes[selectedRecipeIndex].optionalShoppingAddOns.map((addon: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-600 flex-shrink-0">•</span>
                        <span>{addon}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1 text-purple-900 text-sm">
                    <li>• Prep all ingredients before you start cooking</li>
                    <li>• Taste and adjust seasonings as you go</li>
                    <li>• Let proteins rest after cooking</li>
                    <li>• Save the pasta water for sauce!</li>
                  </ul>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-bold text-pink-900 mb-2">🍽️ Serving Suggestions</h4>
                  <ul className="space-y-1 text-pink-900 text-sm">
                    <li>• Serve hot from the pan</li>
                    <li>• Garnish with fresh herbs</li>
                    <li>• Pair with a fresh salad</li>
                    <li>• Add lemon juice before serving</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3">🌟 Other Recipe Ideas with These Ingredients</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Stir-fry', 'Soup', 'Salad', 'Pasta', 'Grain Bowl', 'Tacos', 'Sandwich', 'Curry', 'Roasted'].map((idea) => (
                    <div key={idea} className="bg-white p-2 rounded border border-amber-200 text-center text-sm text-amber-900 font-medium cursor-pointer hover:bg-amber-100 transition">
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
