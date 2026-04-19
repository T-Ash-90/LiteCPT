import React from 'react';
import HoldingRow from './HoldingRow';

const PortfolioTable = ({
  portfolio,
  currency,
  onEdit,
  onDelete,
  isEmpty,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isEmpty && !error) {
    return (
      <div className="empty-state">
        <p>No holdings yet. Add your first cryptocurrency holding!</p>
      </div>
    );
  }

  return (
    <div className="portfolio-table">
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Ticker</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Value</th>
            <th>24h Change</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
