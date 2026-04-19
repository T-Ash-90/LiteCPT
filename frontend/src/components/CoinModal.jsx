import { useState, useEffect, useCallback } from 'react';

const CoinModal = ({
  isOpen,
  onClose,
  onSave,
  coin = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    id: '',
    symbol: '',
    amount: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (coin && isEditing) {
      setFormData({
        id: coin.id,
        symbol: coin.symbol,
        amount: coin.amount.toString()
      });
      setSearchQuery(coin.name || '');
    } else {
      setFormData({
        id: '',
        symbol: '',
        amount: ''
      });
      setSearchQuery('');
      setSearchResults([]);
    }
    setError('');
  }, [coin, isEditing, isOpen]);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setError('');

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8010/coins/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search coins. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectCoin = useCallback((selectedCoin) => {
    setFormData(prev => ({
      ...prev,
      id: selectedCoin.id,
      symbol: selectedCoin.symbol,
    }));
    setSearchQuery(selectedCoin.name);
    setSearchResults([]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id || !formData.amount) {
      setError('Please select a coin and enter an amount');
      return;
    }

    try {
      await onSave({
        id: formData.id,
        symbol: formData.symbol,
        amount: parseFloat(formData.amount)
      });
      setFormData({ id: '', symbol: '', amount: '' });
      setSearchQuery('');
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Holding' : 'Add New Holding'}</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="coin">Search Coin</label>
              <div className="search-container">
                <input
                  type="text"
                  id="coin"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={isEditing}
                  placeholder="Search by name or symbol"
                  autoFocus
                  className="form-control"
                />
                {isSearching && <div className="spinner"></div>}
                {!isEditing && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((coin) => (
                      <div
                        key={coin.id}
                        className="search-result-item"
                        onClick={() => handleSelectCoin(coin)}
                      >
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="coin-image"
                          />
                        )}
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="text"
                id="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                inputMode="decimal"
                placeholder="Enter amount"
                required
                className="form-control"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="modal-button secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.id || !formData.amount || isSearching}
                className="modal-button primary"
              >
                {isEditing ? 'Update' : 'Add'} Holding
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CoinModal;
