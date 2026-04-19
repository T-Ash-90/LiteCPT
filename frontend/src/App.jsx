import { useState, useEffect } from 'react';
import './App.css';
import CoinModal from './components/CoinModal';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [currency, setCurrency] = useState('usd');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState(null);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8010/api/portfolio');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Network response was not ok');
      }
      const data = await response.json();
      setPortfolio(data.holdings || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [currency]);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleAddHolding = async (holdingData) => {
    try {
      const response = await fetch('http://localhost:8010/api/portfolio/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add holding');
      }

      setShowAddModal(false);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error adding holding:', error);
      setError(error.message);
    }
  };

  const handleEditHolding = async (holdingData) => {
    try {
      const response = await fetch('http://localhost:8010/api/portfolio/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holdingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update holding');
      }

      setEditingCoin(null);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error updating holding:', error);
      setError(error.message);
    }
  };

  const handleDeleteHolding = async (coinId) => {
    if (!window.confirm('Are you sure you want to delete this holding?')) return;

    try {
      const response = await fetch('http://localhost:8010/api/portfolio/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: coinId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete holding');
      }

      await fetchPortfolio();
    } catch (error) {
      console.error('Error deleting holding:', error);
      setError(error.message);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading your portfolio...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>LiteCPT</h1>
        <h3>Crypto Portfolio Tracker</h3>
        <div className="currency-selector">
          <button
            className={currency === 'usd' ? 'active' : ''}
            onClick={() => changeCurrency('usd')}
          >
            USD
          </button>
          <button
            className={currency === 'eur' ? 'active' : ''}
            onClick={() => changeCurrency('eur')}
          >
            EUR
          </button>
          <button
            className={currency === 'gbp' ? 'active' : ''}
            onClick={() => changeCurrency('gbp')}
          >
            GBP
          </button>
        </div>
      </header>

      <main>
        {error && (
          <div className="error-message">
            Error: {error}
            <button onClick={fetchPortfolio}>Retry</button>
          </div>
        )}

        <div className="portfolio-summary">
          <div className="summary-card">
            <h3>Portfolio Value</h3>
            <div className="summary-value">
              {currency === 'usd' && `$${portfolio.reduce((sum, h) => sum + (h.holding_total?.usd_total || 0), 0).toFixed(2)}`}
              {currency === 'eur' && `€${portfolio.reduce((sum, h) => sum + (h.holding_total?.eur_total || 0), 0).toFixed(2)}`}
              {currency === 'gbp' && `£${portfolio.reduce((sum, h) => sum + (h.holding_total?.gbp_total || 0), 0).toFixed(2)}`}
            </div>
          </div>
          <div className="summary-card">
            <h3>Total Holdings</h3>
            <div className="summary-value">{portfolio.length}</div>
          </div>
        </div>

        <div className="portfolio-actions">
          <button
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Holding
          </button>
        </div>

        <div className="portfolio-table">
          {!isLoading && portfolio.length === 0 && !error ? (
            <div className="empty-state">
              <p>No holdings yet. Add your first cryptocurrency holding!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Price per unit</th>
                  <th>Amount</th>
                  <th>Total Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((holding) => (
                  <tr key={holding.id}>
                    <td>
                      {holding.image && (
                        <img
                          src={holding.image}
                          alt={holding.name}
                          className="coin-image"
                        />
                      )}
                    </td>
                    <td>{holding.name}</td>
                    <td>{holding.symbol.toUpperCase()}</td>
                    <td>
                      {currency === 'usd' && `$${holding.price_unit?.usd_unit?.toFixed(2) || '0.00'}`}
                      {currency === 'eur' && `€${holding.price_unit?.eur_unit?.toFixed(2) || '0.00'}`}
                      {currency === 'gbp' && `£${holding.price_unit?.gbp_unit?.toFixed(2) || '0.00'}`}
                    </td>
                    <td>{holding.amount}</td>
                    <td>
                      {currency === 'usd' && `$${holding.holding_total?.usd_total?.toFixed(2) || '0.00'}`}
                      {currency === 'eur' && `€${holding.holding_total?.eur_total?.toFixed(2) || '0.00'}`}
                      {currency === 'gbp' && `£${holding.holding_total?.gbp_total?.toFixed(2) || '0.00'}`}
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => setEditingCoin(holding)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteHolding(holding.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <CoinModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddHolding}
      />

      <CoinModal
        isOpen={!!editingCoin}
        onClose={() => setEditingCoin(null)}
        onSave={handleEditHolding}
        coin={editingCoin}
        isEditing={true}
      />
    </div>
  );
}

export default App;
