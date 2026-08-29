import React, { useState } from 'react';
import { Search, CreditCard, Shield, HelpCircle, FileText, AlertTriangle, User, CheckCircle } from 'lucide-react';

const faqCategories = [
  { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Sending, receiving, and managing payments', faqs: [
    { q: 'How do I send money?', a: 'Go to the Send & Request page, enter the recipient\'s email or phone number, enter the amount, and click Send. The money will be deducted from your XayPal balance or linked payment method.' },
    { q: 'How long does it take to receive money?', a: 'Money sent via XayPal is usually available instantly in the recipient\'s XayPal balance. Bank transfers may take 1-3 business days.' },
    { q: 'Can I cancel a payment?', a: 'You can cancel a pending payment before it is claimed by the recipient. Go to Activity, find the payment, and click Cancel.' },
  ]},
  { id: 'wallet', label: 'Wallet', icon: CreditCard, description: 'Cards, banks, and your XayPal balance', faqs: [
    { q: 'How do I add a bank account?', a: 'Go to Wallet, click "Link a card or bank", select Bank Account, and enter your routing and account numbers.' },
    { q: 'How do I transfer money to my bank?', a: 'From the Dashboard or Wallet page, click "Transfer Money". Select your bank account and the amount you want to transfer.' },
    { q: 'Why is my card not verified?', a: 'New cards require verification. XayPal will charge a small amount to your card, which you can confirm in the Wallet section.' },
  ]},
  { id: 'account', label: 'Account', icon: User, description: 'Profile, settings, and account management', faqs: [
    { q: 'How do I change my email address?', a: 'Go to Settings > Account, find the Email section, and click Update to change your primary email address.' },
    { q: 'How do I close my XayPal account?', a: 'Contact XayPal support to close your account. Ensure all pending transactions are complete and your balance is zero before requesting closure.' },
    { q: 'How do I upgrade to a Business account?', a: 'Go to Settings > Account and click "Upgrade to Business". Follow the prompts to provide your business information.' },
  ]},
  { id: 'security', label: 'Security', icon: Shield, description: 'Protecting your account and data', faqs: [
    { q: 'How do I enable 2-step verification?', a: 'Go to Settings > Security and toggle on 2-Step Verification. You can use an authenticator app or receive codes via SMS.' },
    { q: 'I received a suspicious email claiming to be from XayPal', a: 'Do not click any links. Forward the email to spoof@paypal.com. XayPal will never ask for your password via email.' },
    { q: 'Someone accessed my account without permission', a: 'Change your password immediately, then go to the Resolution Center to report unauthorized activity.' },
  ]},
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle, description: 'Resolving issues with transactions', faqs: [
    { q: 'How do I open a dispute?', a: 'Go to the Resolution Center and click "Report a Problem". Select the transaction and describe the issue. XayPal will review your case.' },
    { q: 'How long does a dispute resolution take?', a: 'Most disputes are resolved within 30 days. Complex cases may take up to 75 days.' },
    { q: 'What happens if I lose a dispute?', a: 'If the dispute is resolved in the seller\'s favor, the funds will be released to them. You can appeal the decision within 10 days.' },
  ]},
  { id: 'invoices', label: 'Invoices', icon: FileText, description: 'Creating and managing invoices', faqs: [
    { q: 'How do I create an invoice?', a: 'Go to the Invoices page and click "Create Invoice". Fill in the recipient details, line items, and due date, then click Send.' },
    { q: 'Can I customize my invoices?', a: 'Yes, you can add your business logo, custom payment terms, notes, and tax information to each invoice.' },
    { q: 'How do I track invoice payments?', a: 'The Invoices page shows the status of each invoice (Draft, Sent, Paid, Overdue). You\'ll also receive a notification when an invoice is paid.' },
  ]},
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  const handleMessageUs = () => {
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 3000);
  };

  // Search across all FAQ content
  const searchResults = searchQuery
    ? faqCategories.flatMap(cat =>
        cat.faqs
          .filter(faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(faq => ({ ...faq, categoryId: cat.id, categoryLabel: cat.label }))
      )
    : [];

  const filteredCategories = searchQuery
    ? faqCategories.filter(cat =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.faqs.some(
          faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : faqCategories;

  const category = faqCategories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {messageSent && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-green-600">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Message sent! Our team will respond within 24 hours.
        </div>
      )}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-pp-text mb-4">How can we help?</h1>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pp-text-secondary" />
          <input
            type="text"
            placeholder="Search Help"
            className="w-full pl-12 pr-4 py-3.5 border border-pp-border rounded-full text-base focus:ring-2 focus:ring-pp-btn-primary focus:border-transparent outline-none shadow-pp-card"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
          />
        </div>
      </div>

      {/* Search Results Mode */}
      {searchQuery && searchResults.length > 0 && !selectedCategory && (
        <div className="pp-card overflow-hidden">
          <div className="p-4 border-b border-pp-border bg-gray-50">
            <p className="text-sm font-medium text-pp-text-secondary">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
          </div>
          <div className="divide-y divide-pp-border">
            {searchResults.map((faq, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === `search_${idx}` ? null : `search_${idx}`)}
                  className="w-full text-left px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors gap-4"
                >
                  <div>
                    <span className="text-xs text-pp-btn-primary font-medium mb-1 block">{faq.categoryLabel}</span>
                    <span className="font-medium text-pp-text">{faq.q}</span>
                  </div>
                  <span className={`text-pp-text-secondary transition-transform flex-shrink-0 mt-1 ${expandedFaq === `search_${idx}` ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
                {expandedFaq === `search_${idx}` && (
                  <div className="px-6 pb-4 text-sm text-pp-text-secondary leading-relaxed bg-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !selectedCategory && (
        <div className="text-center py-8 text-pp-text-secondary">
          <p>No results found for &quot;{searchQuery}&quot;. Try a different search term or browse the categories below.</p>
        </div>
      )}

      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setExpandedFaq(null); }}
              className="pp-card p-6 text-left hover:shadow-pp-hover transition-shadow group"
            >
              <cat.icon className="h-8 w-8 text-pp-btn-primary mb-3" />
              <h3 className="font-semibold text-pp-text text-lg mb-1 group-hover:text-pp-btn-primary transition-colors">{cat.label}</h3>
              <p className="text-sm text-pp-text-secondary">{cat.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => { setSelectedCategory(null); setExpandedFaq(null); }}
            className="text-sm text-pp-link hover:underline font-medium mb-4 inline-block"
          >
            Back to categories
          </button>
          <div className="pp-card overflow-hidden">
            <div className="p-6 border-b border-pp-border flex items-center gap-3">
              {category && <category.icon className="h-6 w-6 text-pp-btn-primary" />}
              <h2 className="text-xl font-bold text-pp-text">{category?.label}</h2>
            </div>
            <div className="divide-y divide-pp-border">
              {category?.faqs.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-pp-text pr-4">{faq.q}</span>
                    <span className={`text-pp-text-secondary transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4 text-sm text-pp-text-secondary leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact section */}
      <div className="pp-card p-8 text-center">
        <HelpCircle className="h-10 w-10 text-pp-btn-primary mx-auto mb-3" />
        <h3 className="text-lg font-bold text-pp-text mb-2">Still need help?</h3>
        <p className="text-sm text-pp-text-secondary mb-4">Contact our support team for assistance.</p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-pp-text-secondary">1-888-221-1161</span>
          <button
            onClick={handleMessageUs}
            className="pp-btn-primary text-sm"
          >
            Message Us
          </button>
        </div>
      </div>
    </div>
  );
}
