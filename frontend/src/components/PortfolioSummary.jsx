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

  const getTotal24hChange = () => {
    return portfolio.reduce((sum, h) => {
      if (!h.holding_total || !h.price_change) return sum;
      const holdingValue = h.holding_total[`${currency}_total`] || 0;
      const change24h = h.price_change[`${currency}_24h_change`] || 0;
      return sum + (holdingValue * (change24h / 100));
    }, 0);
  };

  const formatCurrency = (value) => {
    if (currency === 'usd') return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (currency === 'eur') return `€${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (currency === 'gbp') return `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const totalValue = getTotalPortfolioValue();
  const total24hChange = getTotal24hChange();
  const percentageChange = totalValue > 0 ? (total24hChange / totalValue) * 100 : 0;

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    const aValue = a.holding_total?.[`${currency}_total`] || 0;
    const bValue = b.holding_total?.[`${currency}_total`] || 0;
    return bValue - aValue;
  });

  return (
    <div className="portfolio-summary">
      <div className="summary-card">
        <h3 className="summary-title">Portfolio Value</h3>
        <div className="summary-content">
          <div className="summary-value">
            {formatCurrency(totalValue)}
          </div>
          <div className={`portfolio-change ${percentageChange >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(total24hChange)} ({formatPercentage(percentageChange)})
          </div>
        </div>
      </div>
      <div className="summary-card">
        <h3 className="summary-title">Holdings Breakdown</h3>
        {sortedPortfolio.length > 0 ? (
          <div className="holdings-list">
            {sortedPortfolio.map((holding, index) => {
              const holdingValue = holding.holding_total?.[`${currency}_total`] || 0;
              const percentage = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;

              return (
                <div key={index} className="holding-row">
                  <div className="holding-info">
                    <img
                      src={holding.image}
                      alt={holding.name}
                      className="holding-logo"
                    />
                    <span className="holding-name">{holding.name}</span>
                  </div>
                  <div className="holding-percentage">
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="percentage-bar-container">
                    <div
                      className="percentage-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-holdings">No holdings in your portfolio</div>
        )}
      </div>
    </div>
  );
};

export default PortfolioSummary;
