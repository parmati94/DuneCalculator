import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// Use different API base URL for development vs production
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : '/api';

function App() {
  const [placeables, setPlaceables] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [useDeepDesertCost, setUseDeepDesertCost] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load placeables on component mount
  useEffect(() => {
    fetchPlaceables();
  }, []);

  const fetchPlaceables = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/placeables`);
      setPlaceables(response.data);
    } catch (err) {
      setError('Failed to load placeables data. Make sure the backend server is running.');
    }
  };

  const handleQuantityChange = (placeableName, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity <= 0) {
      // Remove item if quantity is 0 or less
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[placeableName];
      setSelectedItems(newSelectedItems);
    } else {
      setSelectedItems({
        ...selectedItems,
        [placeableName]: numQuantity
      });
    }
  };

  const calculateResources = async () => {
    if (Object.keys(selectedItems).length === 0) {
      setError('Please select at least one placeable item.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const placeablesArray = Object.entries(selectedItems).map(([name, quantity]) => ({
        name,
        quantity
      }));

      const response = await axios.post(`${API_BASE_URL}/calculate`, {
        placeables: placeablesArray,
        use_deep_desert_cost: useDeepDesertCost
      });

      setResults(response.data);
    } catch (err) {
      setError('Failed to calculate resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedItems({});
    setResults(null);
    setError(null);
  };

  const formatResourceName = (resourceName) => {
    // Add some formatting to make resource names more readable
    return resourceName;
  };

  const getTotalSelectedItems = () => {
    return Object.values(selectedItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🏜️ Dune Awakening Placeable Calculator</h1>
        <p>Select placeables and quantities to calculate total resource requirements</p>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="controls">
        <h2>Select Placeables</h2>
        <p>Total items selected: {getTotalSelectedItems()}</p>
        
        <div className="placeable-grid">
          {placeables.map((placeable) => (
            <div key={placeable.name} className="placeable-item">
              <h4>{placeable.name}</h4>
              <div>
                <label>
                  Quantity:
                  <input
                    type="number"
                    min="0"
                    value={selectedItems[placeable.name] || ''}
                    onChange={(e) => handleQuantityChange(placeable.name, e.target.value)}
                    className="quantity-input"
                    placeholder="0"
                  />
                </label>
              </div>
              {Object.keys(placeable.resources).length > 0 && (
                <div className="resources-preview">
                  Resources: {Object.entries(placeable.resources)
                    .slice(0, 3)
                    .map(([resource, amount]) => `${resource} (${amount})`)
                    .join(', ')}
                  {Object.keys(placeable.resources).length > 3 && '...'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="deep-desert-checkbox">
          <label>
            <input
              type="checkbox"
              checked={useDeepDesertCost}
              onChange={(e) => setUseDeepDesertCost(e.target.checked)}
            />
            Use Deep Desert Cost (50% reduction)
          </label>
        </div>

        <div>
          <button 
            onClick={calculateResources} 
            className="calculate-button"
            disabled={loading || Object.keys(selectedItems).length === 0}
          >
            {loading ? 'Calculating...' : 'Calculate Resources'}
          </button>
          <button 
            onClick={clearSelection} 
            className="clear-button"
          >
            Clear All
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          Calculating resources...
        </div>
      )}

      {results && (
        <div className="results">
          <h3>
            Total Resource Requirements 
            {results.use_deep_desert_cost && ' (Deep Desert Cost - 50% Reduction)'}
          </h3>
          
          {Object.keys(results.total_resources).length === 0 ? (
            <div className="no-selection">
              No resources required for selected items.
            </div>
          ) : (
            <div className="resource-list">
              {Object.entries(results.total_resources)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([resource, amount]) => (
                  <div key={resource} className="resource-item">
                    <span className="resource-name">{formatResourceName(resource)}</span>
                    <span className="resource-amount">{amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}

          <h4>Items Calculated ({results.items_calculated.length}):</h4>
          <ul>
            {results.items_calculated.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
