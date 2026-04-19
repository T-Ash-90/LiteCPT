import { useState, useEffect } from 'react';

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
    if (coin && isEditing) {
      setFormData({
        id: coin.id,
        symbol: coin.symbol,
        amount: coin.amount
      });
      setSearchQuery(coin.name || '');
    } else {
      setFormData({
        id: '',
        symbol: '',
        amount: ''
      });
      setSearchQuery('');
    }
    setError('');
  }, [coin, isEditing, isOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError('');
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8010/api/coins/search?q=${encodeURIComponent(query)}`);
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
  };

  const handleSelectCoin = (selectedCoin) => {
    setFormData({
      ...formData,
      id: selectedCoin.id,
      symbol: selectedCoin.symbol,
    });
    setSearchQuery(selectedCoin.name);
    setSearchResults([]);
  };

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
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Holding' : 'Add New Holding'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

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
              />
              {isSearching && <div className="spinner"></div>}
              {searchResults.length > 0 && !isEditing && (
                <div className="search-results">
                  {searchResults.map((coin) => (
                    <div
                      key={coin.id}
                      className="search-result-item"
                      onClick={() => handleSelectCoin(coin)}
                    >
                      <img src={coin.image} alt={coin.name} className="coin-image" />
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
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              step="any"
              min="0"
              required
              placeholder="Enter amount"
            />
          </div>

          {error && (
            <div className="form-group" style={{marginTop: '-10px'}}>
              <p style={{color: '#c62828', fontSize: '0.9em'}}>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!formData.id || !formData.amount}>
              {isEditing ? 'Update' : 'Add'} Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoinModal;
