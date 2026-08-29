import React from 'react';
import TradeForm from '../components/TradeForm';
import TransactionList from '../components/TransactionList';
import TradeConfirmation from '../components/TradeConfirmation';

function Trade() {
  const [pendingOrder, setPendingOrder] = React.useState(null);

  const handlePreview = (order) => {
    setPendingOrder(order);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trade Crypto</h2>
        {pendingOrder ? (
          <TradeConfirmation
            order={pendingOrder}
            onBack={() => setPendingOrder(null)}
            onComplete={() => setPendingOrder(null)}
          />
        ) : (
          <TradeForm onPreview={handlePreview} />
        )}
      </div>
      <TransactionList limit={5} />
    </div>
  );
}

export default Trade;
