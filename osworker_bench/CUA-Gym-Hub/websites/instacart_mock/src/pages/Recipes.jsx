import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Recipes() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const recipe = selectedRecipe ? state.recipes.find(r => r.id === selectedRecipe) : null;

  const addRecipeToCart = (recipe) => {
    recipe.ingredients.forEach(ing => {
      if (ing.productId) {
        const already = state.cart.find(c => c.productId === ing.productId);
        if (!already) dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: ing.productId, storeId: 'store_1', quantity: 1 } });
      }
    });
  };

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Recipes</h1>

      {!selectedRecipe ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {state.recipes.map(r => (
            <div key={r.id} className="list-card" onClick={() => setSelectedRecipe(r.id)}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{r.emoji}</div>
              <div className="list-card-name">{r.title}</div>
              <div className="list-card-meta">{r.totalTime} &middot; {r.servings} servings &middot; {r.difficulty}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <button style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 16 }} onClick={() => setSelectedRecipe(null)}>&#x2190; Back to Recipes</button>
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{recipe.emoji}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{recipe.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>{recipe.description}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              <span>Prep: {recipe.prepTime}</span>
              <span>Cook: {recipe.cookTime}</span>
              <span>Servings: {recipe.servings}</span>
              <span>Difficulty: {recipe.difficulty}</span>
            </div>

            <div className="checkout-section">
              <h2 style={{ fontSize: 16 }}>Ingredients</h2>
              {recipe.ingredients.map((ing, idx) => {
                const product = ing.productId ? state.products.find(p => p.id === ing.productId) : null;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{ing.name}</span>
                      <span style={{ color: 'var(--color-text-secondary)', marginLeft: 8, fontSize: 13 }}>{ing.quantity}</span>
                    </div>
                    {product && (
                      <button className="btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}
                        onClick={() => dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: product.id, storeId: product.storeId, quantity: 1 } })}>
                        + Add ${product.price.toFixed(2)}
                      </button>
                    )}
                  </div>
                );
              })}
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => addRecipeToCart(recipe)}>Add All Available to Cart</button>
            </div>

            <div className="checkout-section" style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: 16 }}>Instructions</h2>
              <ol style={{ listStyleType: 'decimal', paddingLeft: 20, lineHeight: 1.8, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                {recipe.instructions.map((step, idx) => <li key={idx} style={{ marginBottom: 8 }}>{step}</li>)}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
