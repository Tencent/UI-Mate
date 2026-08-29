import React, { useState } from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Mortgage() {
  const { state } = useStore();
  const [homePrice, setHomePrice] = useState(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [hoaFee, setHoaFee] = useState(0);

  const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
  const loanAmount = homePrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyPrincipalInterest = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    : loanAmount / numberOfPayments;
  const monthlyTax = homePrice * 0.012 / 12;
  const monthlyInsurance = homePrice * 0.005 / 12;
  const monthlyHoa = hoaFee || 0;
  const totalMonthly = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + monthlyHoa;

  const mortgageRates = state.mortgageRates || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <DollarSign className="text-brand-500" size={32} />
        Xillow Home Loans
      </h1>

      {/* Current Mortgage Rates */}
      {mortgageRates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="text-green-600" size={20} />
            Current Mortgage Rates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {mortgageRates.map(rate => (
              <button
                key={rate.type}
                onClick={() => {
                  setInterestRate(rate.rate);
                  if (rate.type.includes('15')) setLoanTerm(15);
                  else if (rate.type.includes('20')) setLoanTerm(20);
                  else setLoanTerm(30);
                }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-brand-500 hover:shadow-md transition text-left cursor-pointer"
              >
                <div className="text-xs text-gray-500 font-medium mb-1">{rate.type}</div>
                <div className="text-2xl font-bold text-gray-900">{rate.rate}%</div>
                <div className="text-xs text-gray-400 mt-1">APR: {rate.apr}%</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Click a rate to use it in the calculator below. Rates as of {mortgageRates[0]?.lastUpdated}</p>
        </div>
      )}

      {/* Calculator */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-xl font-bold mb-6">Mortgage Calculator</h2>
        <div className="text-center mb-10">
          <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Estimated Monthly Payment</div>
          <div className="text-5xl font-bold text-brand-600">${Math.round(totalMonthly).toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block font-bold text-gray-700 mb-2">Home Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Down Payment ({downPaymentPercent}%)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={downPaymentAmount}
                readOnly
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg"
              />
            </div>
            <input
              type="range" min="0" max="50" step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full mt-3 accent-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Interest Rate (%)</label>
            <input
              type="number" step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Loan Term</label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg bg-white"
            >
              <option value={30}>30 Years</option>
              <option value={20}>20 Years</option>
              <option value={15}>15 Years</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">HOA Fees (monthly)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={hoaFee}
                onChange={(e) => setHoaFee(Number(e.target.value))}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                <span>Principal & Interest</span>
              </div>
              <span className="font-bold">${Math.round(monthlyPrincipalInterest).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Property Taxes</span>
              </div>
              <span className="font-bold">${Math.round(monthlyTax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Home Insurance</span>
              </div>
              <span className="font-bold">${Math.round(monthlyInsurance).toLocaleString()}</span>
            </div>
            {monthlyHoa > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>HOA Fees</span>
                </div>
                <span className="font-bold">${Math.round(monthlyHoa).toLocaleString()}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Monthly</span>
              <span className="text-brand-600">${Math.round(totalMonthly).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-400">
          <p>Calculation assumes 1.2% annual property tax rate and 0.5% annual homeowner's insurance rate. Actual rates may vary. This calculator is for informational purposes only.</p>
        </div>
      </div>
    </div>
  );
}
