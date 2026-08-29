
import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, CreditCard, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useStore();
  
  // Defensive checks
  const transactions = state.transactions || [];
  const recentTransactions = transactions.slice(0, 5);
  const contacts = state.contacts || [];
  const user = state.user || { balance: 0, currency: 'USD' };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-brand to-brand-light text-white">
          <h2 className="text-sm font-medium opacity-90">Total Balance</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatCurrency(user.balance, user.currency)}</span>
            <span className="text-sm opacity-75">Available</span>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/send" className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium">
              <Send className="h-4 w-4" /> Send
            </Link>
            <Link to="/send?mode=request" className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium">
              <ArrowDownLeft className="h-4 w-4" /> Request
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Contacts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send again</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {contacts.map(contact => (
              <Link key={contact.id} to={`/send?recipient=${encodeURIComponent(contact.email)}`} className="flex flex-col items-center min-w-[80px] cursor-pointer group">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand transition-all">
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-gray-600 mt-2 text-center truncate w-full">{contact.name.split(' ')[0]}</span>
              </Link>
            ))}
            <Link to="/send" className="flex flex-col items-center min-w-[80px] cursor-pointer group">
               <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-brand transition-all">
                  <MoreHorizontal className="text-gray-400" />
               </div>
               <span className="text-xs font-medium text-gray-600 mt-2">More</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/invoices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full text-brand">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Invoice</p>
                <p className="text-xs text-gray-500">Get paid by clients</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link to="/activity" className="text-sm text-brand font-medium hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  tx.type === 'payment_sent' || tx.type === 'withdrawal' ? 'bg-gray-100' : 'bg-green-100'
                )}>
                  {tx.type === 'payment_sent' || tx.type === 'withdrawal' ? 
                    <ArrowUpRight className="h-5 w-5 text-gray-600" /> : 
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tx.recipientName || tx.senderName || tx.destination}</p>
                  <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-semibold",
                  tx.type === 'payment_sent' || tx.type === 'withdrawal' ? 'text-gray-900' : 'text-green-600'
                )}>
                  {tx.type === 'payment_sent' || tx.type === 'withdrawal' ? '-' : '+'}
                  {formatCurrency(tx.amount, tx.currency)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}
  
