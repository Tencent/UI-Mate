import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, Check, ChevronRight, X, Users, Plus, Trash2, DollarSign, Heart } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

// Plan options for enrollment flow
const planOptions = {
  Medical: [
    { name: 'Medical - PPO Basic', provider: 'BlueCross BlueShield', employeeCost: 180.00, employerCost: 580.00, details: { deductible: 2500, outOfPocketMax: 7000, copay: 35, coinsurance: 30 } },
    { name: 'Medical - PPO Plus', provider: 'BlueCross BlueShield', employeeCost: 240.00, employerCost: 680.00, details: { deductible: 1500, outOfPocketMax: 5000, copay: 25, coinsurance: 20 } },
    { name: 'Medical - HDHP', provider: 'Aetna', employeeCost: 120.00, employerCost: 500.00, details: { deductible: 3000, outOfPocketMax: 6500, copay: 0, coinsurance: 20, hsa: true } },
  ],
  Dental: [
    { name: 'Dental - Basic', provider: 'Delta Dental', employeeCost: 15.00, employerCost: 35.00, details: { deductible: 100, annualMax: 1500, preventiveCoverage: '80%' } },
    { name: 'Dental - Premium', provider: 'Delta Dental', employeeCost: 28.00, employerCost: 55.00, details: { deductible: 50, annualMax: 2000, preventiveCoverage: '100%' } },
  ],
  Vision: [
    { name: 'Vision - Basic', provider: 'VSP', employeeCost: 8.00, employerCost: 15.00, details: { examCopay: 15, frameAllowance: 150, contactAllowance: 120 } },
    { name: 'Vision', provider: 'VSP', employeeCost: 12.00, employerCost: 20.00, details: { examCopay: 10, frameAllowance: 200, contactAllowance: 150 } },
  ],
  Life: [
    { name: 'Basic Life Insurance', provider: 'MetLife', employeeCost: 0, employerCost: 25.00, details: { coverage: '1x salary', maxCoverage: '$500,000' } },
    { name: 'Supplemental Life', provider: 'MetLife', employeeCost: 18.00, employerCost: 0, details: { coverage: '2x salary', maxCoverage: '$1,000,000' } },
  ],
  FSA: [
    { name: 'Healthcare FSA', provider: 'WageWorks', employeeCost: 0, employerCost: 0, details: { annualMax: 3050, rollover: '$610', eligible: 'Medical, dental, vision expenses' } },
    { name: 'Dependent Care FSA', provider: 'WageWorks', employeeCost: 0, employerCost: 0, details: { annualMax: 5000, rollover: '$0', eligible: 'Childcare, eldercare' } },
  ],
};

function PlanDetailModal({ plan, dependents, onClose }) {
  if (!plan) return null;

  const formatDetail = (key, value) => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('match') || key.toLowerCase().includes('coverage') || key.toLowerCase().includes('coinsurance')) {
        return typeof value === 'number' && value <= 100 ? `${value}%` : value;
      }
      return formatCurrency(value);
    }
    return String(value);
  };

  const detailLabels = {
    deductible: 'Annual Deductible',
    outOfPocketMax: 'Out-of-Pocket Maximum',
    copay: 'Copay',
    coinsurance: 'Coinsurance',
    annualMax: 'Annual Maximum',
    preventiveCoverage: 'Preventive Coverage',
    examCopay: 'Exam Copay',
    frameAllowance: 'Frame Allowance',
    contactAllowance: 'Contact Allowance',
    contributionRate: 'Your Contribution Rate',
    employerMatch: 'Employer Match',
    vestingSchedule: 'Vesting Schedule',
    hsa: 'HSA Eligible',
    coverage: 'Coverage Amount',
    maxCoverage: 'Maximum Coverage',
    annualElection: 'Annual Election',
    rollover: 'Rollover',
    eligible: 'Eligible Expenses',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
            <p className="text-sm text-gray-500">{plan.provider}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Coverage Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Coverage Level</p>
              <p className="font-medium text-gray-900 mt-1">{plan.coverageLevel}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Effective Date</p>
              <p className="font-medium text-gray-900 mt-1">{plan.effectiveDate}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Your Monthly Cost</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(plan.employeeCost)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Employer Monthly Cost</p>
              <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(plan.employerCost)}</p>
            </div>
          </div>

          {/* Plan Details */}
          {plan.details && Object.keys(plan.details).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Plan Details</h3>
              <div className="space-y-2">
                {Object.entries(plan.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{detailLabels[key] || key}</span>
                    <span className="font-medium text-gray-900">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : formatDetail(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Covered Dependents */}
          {dependents && dependents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Covered Dependents</h3>
              <div className="space-y-2">
                {dependents.map(dep => (
                  <div key={dep.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-900 font-medium">{dep.name}</span>
                    <span className="text-gray-500">{dep.relationship} &bull; DOB: {dep.dateOfBirth}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChangePlanModal({ planType, currentPlan, onConfirm, onClose }) {
  const options = planOptions[planType] || [];
  const [selected, setSelected] = useState(currentPlan?.name || '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Change {planType} Plan</h2>
            <p className="text-sm text-gray-500">Select a new plan option</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(opt.name)}
              type="button"
              aria-label={`Select ${opt.name}`}
              className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selected === opt.name
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{opt.name}</h4>
                  <p className="text-sm text-gray-500">{opt.provider}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(opt.employeeCost)}</p>
                  <p className="text-xs text-gray-500">/ month</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(opt.details).slice(0, 3).map(([key, val]) => (
                  <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {key}: {typeof val === 'number' ? (val <= 100 && (key.includes('coinsurance') || key.includes('coverage')) ? `${val}%` : formatCurrency(val)) : String(val)}
                  </span>
                ))}
              </div>
              {selected === opt.name && (
                <div className="mt-2 flex items-center gap-1 text-sm text-primary font-medium">
                  <Check size={16} /> Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const selectedPlan = options.find(o => o.name === selected);
              if (selectedPlan) onConfirm(selectedPlan);
            }}
            disabled={!selected || selected === currentPlan?.name}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDependentModal({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [dob, setDob] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dob) return;
    onSubmit({ name, relationship, dateOfBirth: dob });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Add Dependent</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Enter dependent's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Domestic Partner">Domestic Partner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors">
              Add Dependent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Benefits() {
  const { state, dispatch } = useStore();
  const { benefits } = state;
  const [activeTab, setActiveTab] = useState('current');
  const [detailPlan, setDetailPlan] = useState(null);
  const [changePlanType, setChangePlanType] = useState(null);
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Summary calculations
  const summary = useMemo(() => {
    const plans = benefits.plans || [];
    const totalEmployeeMonthly = plans.reduce((sum, p) => sum + (p.employeeCost || p.cost || 0), 0);
    const totalEmployerMonthly = plans.reduce((sum, p) => sum + (p.employerCost || 0), 0);
    return {
      totalEmployeeMonthly,
      totalEmployerMonthly,
      totalEmployeeAnnual: totalEmployeeMonthly * 12,
      totalEmployerAnnual: totalEmployerMonthly * 12,
    };
  }, [benefits.plans]);

  const handleChangePlan = (newPlanData) => {
    // Find the existing plan of this type
    const existingPlan = benefits.plans.find(p => p.type === changePlanType);
    if (existingPlan) {
      dispatch({
        type: 'UPDATE_BENEFIT_PLAN',
        payload: {
          planId: existingPlan.id,
          updates: {
            name: newPlanData.name,
            provider: newPlanData.provider,
            employeeCost: newPlanData.employeeCost,
            employerCost: newPlanData.employerCost,
            cost: newPlanData.employeeCost,
            details: newPlanData.details,
          },
        },
      });
    }
    setChangePlanType(null);
    showSuccess(`${changePlanType} plan updated successfully!`);
  };

  const handleAddDependent = (depData) => {
    dispatch({ type: 'ADD_DEPENDENT', payload: depData });
    setShowAddDependent(false);
    showSuccess('Dependent added successfully!');
  };

  const handleRemoveDependent = (id) => {
    dispatch({ type: 'REMOVE_DEPENDENT', payload: id });
    setConfirmRemoveId(null);
    showSuccess('Dependent removed.');
  };

  // Enrollment categories for the enrollment tab
  const enrollmentCategories = ['Medical', 'Dental', 'Vision', 'Life', 'FSA'];

  return (
    <div className="space-y-6">
      {/* Success message */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check size={18} />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Benefits</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'current' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Current Plans
          </button>
          <button
            onClick={() => setActiveTab('enroll')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'enroll' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Enrollment
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-6">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{plan.status}</span>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Provider</p>
                    <p className="font-medium text-gray-900">{plan.provider}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Your Cost</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(plan.employeeCost || plan.cost)}</p>
                      <p className="text-xs text-gray-400">/ month</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Employer Pays</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(plan.employerCost || 0)}</p>
                      <p className="text-xs text-gray-400">/ month</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Coverage</p>
                    <p className="text-sm font-medium text-gray-700">{plan.coverageLevel}</p>
                  </div>
                  <button
                    onClick={() => setDetailPlan(plan)}
                    className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Plan Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Benefits Cost Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Monthly Employee Cost</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(summary.totalEmployeeMonthly)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Monthly Employer Contribution</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(summary.totalEmployerMonthly)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Annual Employee Cost</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(summary.totalEmployeeAnnual)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Annual Employer Contribution</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(summary.totalEmployerAnnual)}</p>
              </div>
            </div>
          </div>

          {/* Dependents Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Covered Dependents
              </h3>
              <button
                onClick={() => setShowAddDependent(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Dependent
              </button>
            </div>

            {(!benefits.dependents || benefits.dependents.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No dependents enrolled</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {benefits.dependents.map(dep => (
                  <div key={dep.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Heart size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{dep.name}</p>
                        <p className="text-sm text-gray-500">{dep.relationship} &bull; DOB: {dep.dateOfBirth}</p>
                      </div>
                    </div>
                    <div>
                      {confirmRemoveId === dep.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Remove?</span>
                          <button
                            onClick={() => handleRemoveDependent(dep.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(dep.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove dependent"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enrollment Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Benefits Enrollment</h3>
              <p className="text-sm text-gray-500 mt-1">Review and modify your benefit elections</p>
            </div>
            <div className="divide-y divide-gray-100">
              {enrollmentCategories.map(category => {
                const currentPlan = benefits.plans.find(p => p.type === category);
                return (
                  <div key={category} className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{category}</h4>
                        {currentPlan ? (
                          <p className="text-sm text-gray-500">{currentPlan.name} - {formatCurrency(currentPlan.employeeCost || currentPlan.cost)}/mo</p>
                        ) : (
                          <p className="text-sm text-gray-400">Not enrolled</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setChangePlanType(category)}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Change Plan <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium">Open Enrollment Period</p>
            <p className="mt-1 text-blue-600">Changes will take effect at the beginning of the next plan year. You may also make changes if you experience a Qualifying Life Event.</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {detailPlan && (
        <PlanDetailModal plan={detailPlan} dependents={benefits.dependents} onClose={() => setDetailPlan(null)} />
      )}
      {changePlanType && (
        <ChangePlanModal
          planType={changePlanType}
          currentPlan={benefits.plans.find(p => p.type === changePlanType)}
          onConfirm={handleChangePlan}
          onClose={() => setChangePlanType(null)}
        />
      )}
      {showAddDependent && (
        <AddDependentModal onSubmit={handleAddDependent} onClose={() => setShowAddDependent(false)} />
      )}
    </div>
  );
}
