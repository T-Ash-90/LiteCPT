import { useState, useEffect } from 'react';
import './css/App.css';
import CoinModal from './components/CoinModal';
import CurrencySelector from './components/CurrencySelector';
import PortfolioSummary from './components/PortfolioSummary';
import PortfolioTable from './components/PortfolioTable';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [sortedPortfolio, setSortedPortfolio] = useState([]);
  const [currency, setCurrency] = useState('usd');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const sorted = [...portfolio].sort((a, b) => {
      const getTotalValue = (holding) => {
        if (!holding.holding_total) return 0;
        if (currency === 'usd') return holding.holding_total.usd_total || 0;
        if (currency === 'eur') return holding.holding_total.eur_total || 0;
        if (currency === 'gbp') return holding.holding_total.gbp_total || 0;
        return 0;
      };
      return getTotalValue(b) - getTotalValue(a);
    });
    setSortedPortfolio(sorted);
  }, [portfolio, currency]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    fetchPortfolio();
  }, []);

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

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const handleAddHolding = async (holdingData) => {
    try {
      const response = await fetch('http://localhost:8010/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coinId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete holding');
      }

      window.location.reload(true);

    } catch (error) {
      console.error('Error deleting holding:', error);
      setError(error.message);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Crypto Portfolio Tracker</h1>
        <CurrencySelector
          currency={currency}
          onChange={changeCurrency}
        />
      </header>

      <main>
        {error && (
          <div className="error-message">
            Error: {error}
            <button onClick={fetchPortfolio}>Retry</button>
          </div>
        )}

        <PortfolioSummary
          portfolio={portfolio}
          currency={currency}
        />

        <div className="portfolio-actions">
          <button
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Holding
          </button>
        </div>

        <PortfolioTable
          portfolio={sortedPortfolio}
          currency={currency}
          onEdit={setEditingCoin}
          onDelete={handleDeleteHolding}
          isEmpty={portfolio.length === 0}
          isLoading={isLoading}
          error={error}
        />
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
