'use client';

import { useState } from 'react';

export default function RecipesPage() {
  const [locationLabel, setLocationLabel] = useState('My Kitchen');
  const [inSeason, setInSeason] = useState<string[]>(['tomatoes', 'basil', 'zucchini']);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState('');

  const addIngredient = () => {
    if (newIngredient.trim() && !inSeason.includes(newIngredient.trim())) {
      setInSeason([...inSeason, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setInSeason(inSeason.filter(i => i !== ingredient));
  };

  const generateRecipe = async () => {
    if (inSeason.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe('');

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLabel,
          inSeason,
          staples: ['salt', 'pepper', 'oil', 'garlic'],
          dietary: [],
          maxTimeMinutes: 30,
          skill: 'intermediate',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setRecipe(data.recipe || data.content || JSON.stringify(data));
      } else {
        setError(data.error || 'Failed to generate recipe');
      }
    } catch (err) {
      setError('Error generating recipe. Make sure OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-orange-700">👨‍🍳 Recipe Generator</h1>
        <p className="text-center text-gray-600 mb-8">Generate AI recipes using seasonal ingredients</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seasonal Ingredients</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Add an ingredient..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={addIngredient}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
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

        {recipe && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Recipe</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {recipe}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
