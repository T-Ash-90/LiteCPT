import React from 'react';

const CurrencySelector = ({ currency, onChange }) => {
  const currencies = [
    { code: 'usd', label: 'USD' },
    { code: 'eur', label: 'EUR' },
    { code: 'gbp', label: 'GBP' }
  ];

  return (
    <div className="currency-selector">
      {currencies.map((curr) => (
        <button
          key={curr.code}
          className={currency === curr.code ? 'active' : ''}
          onClick={() => onChange(curr.code)}
        >
          {curr.label}
        </button>
      ))}
    </div>
  );
};

export default CurrencySelector;
