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
