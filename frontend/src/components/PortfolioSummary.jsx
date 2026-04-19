import React from 'react';

const PortfolioSummary = ({ portfolio, currency }) => {
  const getTotalPortfolioValue = () => {
    return portfolio.reduce((sum, h) => {
      if (!h.holding_total) return sum;
      if (currency === 'usd') return sum + (h.holding_total.usd_total || 0);
      if (currency === 'eur') return sum + (h.holding_total.eur_total || 0);
      if (currency === 'gbp') return sum + (h.holding_total.gbp_total || 0);
      return sum;
    }, 0);
  };

  const formatCurrency = (value) => {
    if (currency === 'usd') return `$${value.toFixed(2)}`;
    if (currency === 'eur') return `€${value.toFixed(2)}`;
    if (currency === 'gbp') return `£${value.toFixed(2)}`;
    return value.toFixed(2);
  };

  return (
    <div className="portfolio-summary">
      <div className="summary-card">
        <h3>Portfolio Value</h3>
        <div className="summary-value">
          {formatCurrency(getTotalPortfolioValue())}
        </div>
      </div>
      <div className="summary-card">
        <h3>Total Holdings</h3>
        <div className="summary-value">{portfolio.length}</div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
