import React from 'react';

const HoldingRow = ({ holding, currency, onEdit, onDelete }) => {
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';

    const absValue = Math.abs(value);

    if (absValue >= 1) {
      return value.toFixed(2);
    }

    if (absValue === 0) return '0.00';

    const magnitude = Math.floor(Math.log10(absValue));
    const scale = Math.pow(10, -magnitude + 1);
    const scaledValue = Math.round(value * scale) / scale;

    const decimalPlaces = Math.max(0, -magnitude + 1);
    return scaledValue.toFixed(decimalPlaces);
  };

  const getCurrencySymbol = () => {
    if (currency === 'usd') return '$';
    if (currency === 'eur') return '€';
    if (currency === 'gbp') return '£';
    return '';
  };

  const priceUnit = holding.price_unit || {};
  const holdingTotal = holding.holding_total || {};

  return (
    <tr>
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
        {getCurrencySymbol()}{formatCurrency(
          currency === 'usd' ? priceUnit.usd_unit :
          currency === 'eur' ? priceUnit.eur_unit :
          priceUnit.gbp_unit
        )}
      </td>
      <td>{holding.amount}</td>
      <td>
        {getCurrencySymbol()}{formatCurrency(
          currency === 'usd' ? holdingTotal.usd_total :
          currency === 'eur' ? holdingTotal.eur_total :
          holdingTotal.gbp_total
        )}
      </td>
      <td>
        <button
          className="edit-button"
          onClick={() => onEdit(holding)}
        >
          Edit
        </button>
        <button
          className="delete-button"
          onClick={() => onDelete(holding.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default HoldingRow;
