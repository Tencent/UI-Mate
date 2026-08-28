import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Phone, Mail, MapPin, Camera, Save, Briefcase, Calendar, Shield, DollarSign, Clock, ChevronDown, Heart, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../lib/utils';

function SummaryTab({ currentUser, isEditing, formData, setFormData, onEditEmergencyContacts }) {
  const emergencyContacts = currentUser.emergencyContacts || [];
  const defaultContact = emergencyContacts[0] || null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            ) : (
              <p className="text-gray-900 font-medium">{currentUser.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Preferred Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.preferredName || formData.name?.split(' ')[0] || ''}
                onChange={e => setFormData({ ...formData, preferredName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            ) : (
              <p className="text-gray-900 font-medium">{currentUser.preferredName || currentUser.name?.split(' ')[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Employee ID</label>
            <p className="text-gray-900 font-medium">{currentUser.id}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date of Birth</label>
            <p className="text-gray-900 font-medium">{currentUser.dateOfBirth || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">Work Email</label>
              <p className="text-gray-900 font-medium">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <p className="text-gray-900 font-medium">{currentUser.phone || 'Not set'}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium">{currentUser.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Emergency Contacts</h3>
          <button
            onClick={onEditEmergencyContacts}
            className="flex items-center gap-1 text-primary hover:text-primary-hover text-sm font-medium"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
        {emergencyContacts.length > 0 ? (
          <div className="space-y-3">
            {emergencyContacts.map((contact, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-semibold text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.relationship}</p>
                <p className="text-sm text-gray-600 mt-2">{contact.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <p className="text-gray-500 text-sm">No emergency contacts on file.</p>
            <button onClick={onEditEmergencyContacts} className="mt-2 text-primary text-sm font-medium hover:underline">
              + Add emergency contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function JobTab({ currentUser, employees }) {
  const manager = employees.find(e => e.id === currentUser.managerId);
  const joinDate = new Date(currentUser.joinDate);
  const now = new Date();
  const years = Math.floor((now - joinDate) / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor(((now - joinDate) % (365.25 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Job Title</label>
            <p className="text-gray-900 font-medium">{currentUser.title}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Department</label>
            <p className="text-gray-900 font-medium">{currentUser.department}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Manager</label>
            {manager ? (
              <div className="flex items-center gap-2 mt-1">
                <img src={manager.avatar} alt={manager.name} className="w-8 h-8 rounded-full" />
                <span className="text-primary font-medium text-sm">{manager.name}</span>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">None (Top-level)</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Position ID</label>
            <p className="text-gray-900 font-medium">P-{currentUser.id.slice(-4)}-001</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Employee Type</label>
            <p className="text-gray-900 font-medium">{currentUser.employeeType || 'Full-Time'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Hire Date</label>
            <p className="text-gray-900 font-medium">{formatDate(currentUser.joinDate)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Length of Service</label>
            <p className="text-gray-900 font-medium">{years} year{years !== 1 ? 's' : ''} {months} month{months !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Compensation Grade</label>
            <p className="text-gray-900 font-medium">{currentUser.compensationGrade || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Work Schedule</label>
            <p className="text-gray-900 font-medium">{currentUser.workSchedule || 'Mon-Fri 9:00-17:00'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Location</label>
            <p className="text-gray-900 font-medium">{currentUser.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompensationTab({ currentUser }) {
  const baseSalary = currentUser.annualSalary || 145000;
  const bonus = baseSalary * 0.15;
  const benefitsValue = 12450;
  const equityValue = currentUser.equityValue || 25000;
  const total = baseSalary + bonus + benefitsValue + equityValue;

  const compensationHistory = [
    { year: '2024', baseSalary: 145000, bonus: 21750, effectiveDate: 'Jan 1, 2024', reason: 'Annual Merit Increase' },
    { year: '2023', baseSalary: 135000, bonus: 20250, effectiveDate: 'Jan 1, 2023', reason: 'Promotion to Engineering Manager' },
    { year: '2022', baseSalary: 120000, bonus: 12000, effectiveDate: 'Mar 15, 2022', reason: 'Annual Merit Increase' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Compensation Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Base Salary</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(baseSalary)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Target Bonus (15%)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(bonus)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-purple-600 uppercase tracking-wider font-semibold">Equity/Stock</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(equityValue)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-xs text-orange-600 uppercase tracking-wider font-semibold">Benefits Value</p>
            <p className="text-2xl font-bold text-orange-700 mt-1">{formatCurrency(benefitsValue)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Compensation Grade</label>
            <p className="text-gray-900 font-medium">{currentUser.compensationGrade || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Pay Frequency</label>
            <p className="text-gray-900 font-medium">{currentUser.payFrequency || 'Semi-Monthly'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Hourly Rate (Equiv)</label>
            <p className="text-gray-900 font-medium">{formatCurrency(baseSalary / 2080)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Effective Date</label>
            <p className="text-gray-900 font-medium">{currentUser.compensationEffectiveDate || 'Jan 1, 2024'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Total Compensation Breakdown</h3>
        {/* Stacked horizontal bar */}
        <div className="mb-6">
          <div className="flex rounded-full overflow-hidden h-8">
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(baseSalary / total) * 100}%` }}
              title={`Base: ${formatCurrency(baseSalary)}`}
            >
              {Math.round((baseSalary / total) * 100)}%
            </div>
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(bonus / total) * 100}%` }}
              title={`Bonus: ${formatCurrency(bonus)}`}
            >
              {Math.round((bonus / total) * 100)}%
            </div>
            <div
              className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(equityValue / total) * 100}%` }}
              title={`Equity: ${formatCurrency(equityValue)}`}
            >
              {Math.round((equityValue / total) * 100)}%
            </div>
            <div
              className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(benefitsValue / total) * 100}%` }}
              title={`Benefits: ${formatCurrency(benefitsValue)}`}
            >
              {Math.round((benefitsValue / total) * 100)}%
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-600">Base ({formatCurrency(baseSalary)})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600">Bonus ({formatCurrency(bonus)})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-gray-600">Equity ({formatCurrency(equityValue)})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-600">Benefits ({formatCurrency(benefitsValue)})</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold">
          <span>Total Compensation</span>
          <span className="text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Compensation History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-medium">
                <th className="text-left p-3">Year</th>
                <th className="text-left p-3">Effective Date</th>
                <th className="text-left p-3">Base Salary</th>
                <th className="text-left p-3">Target Bonus</th>
                <th className="text-left p-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compensationHistory.map(row => (
                <tr key={row.year} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{row.year}</td>
                  <td className="p-3 text-gray-600">{row.effectiveDate}</td>
                  <td className="p-3 text-gray-900 font-medium">{formatCurrency(row.baseSalary)}</td>
                  <td className="p-3 text-gray-900 font-medium">{formatCurrency(row.bonus)}</td>
                  <td className="p-3 text-gray-600">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BenefitsTab({ benefits }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Current Benefits Summary</h3>
        <div className="space-y-3">
          {(benefits.plans || []).map(plan => (
            <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-500">{plan.provider} - {plan.coverageLevel}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{plan.status}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">{formatCurrency(plan.employeeCost || plan.cost)}/mo</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {benefits.dependents && benefits.dependents.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Covered Dependents</h3>
          <div className="space-y-2">
            {benefits.dependents.map(dep => (
              <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{dep.name}</p>
                  <p className="text-xs text-gray-500">{dep.relationship} - DOB: {dep.dateOfBirth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PayTab({ payroll }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800">Recent Paystubs</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {payroll.slice(0, 3).map(stub => (
          <div key={stub.paystubId} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{stub.period}</p>
              <p className="text-sm text-gray-500">Pay Date: {formatDate(stub.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Net Pay</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stub.netPay)}</p>
              <p className="text-xs text-gray-400">Gross: {formatCurrency(stub.grossPay)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeOffTab({ timeOffBalance, timeOffRequests }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
          <Calendar size={24} className="text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase font-semibold">Vacation</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{timeOffBalance.vacation} hrs</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
          <Heart size={24} className="text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase font-semibold">Sick</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{timeOffBalance.sick} hrs</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
          <Clock size={24} className="text-orange-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 uppercase font-semibold">Personal</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{timeOffBalance.personal} hrs</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Recent Requests</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {timeOffRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No recent requests</div>
          ) : (
            timeOffRequests.slice(0, 5).map(req => (
              <div key={req.requestId} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{req.type}</p>
                  <p className="text-xs text-gray-500">{formatDate(req.startDate)} - {formatDate(req.endDate)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  req.status === 'Denied' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {req.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const profileTabs = [
  { id: 'summary', label: 'Summary', icon: User },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'compensation', label: 'Compensation', icon: DollarSign },
  { id: 'benefits', label: 'Benefits', icon: Shield },
  { id: 'pay', label: 'Pay', icon: DollarSign },
  { id: 'timeoff', label: 'Time Off', icon: Calendar },
];

function EmergencyContactsModal({ currentUser, dispatch, onClose }) {
  const initial = (currentUser.emergencyContacts || []).length > 0
    ? currentUser.emergencyContacts
    : [{ name: '', relationship: '', phone: '' }];
  const [contacts, setContacts] = useState(initial);

  const handleChange = (i, field, value) => {
    setContacts(contacts.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleAdd = () => {
    setContacts([...contacts, { name: '', relationship: '', phone: '' }]);
  };

  const handleRemove = (i) => {
    setContacts(contacts.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    const valid = contacts.filter(c => c.name.trim());
    dispatch({ type: 'UPDATE_PROFILE', payload: { emergencyContacts: valid } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Emergency Contacts</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase">Contact {i + 1}</span>
                {contacts.length > 1 && (
                  <button onClick={() => handleRemove(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={c.name}
                  onChange={e => handleChange(i, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                <select
                  value={c.relationship}
                  onChange={e => handleChange(i, 'relationship', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select...</option>
                  <option>Spouse</option>
                  <option>Partner</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Child</option>
                  <option>Friend</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={c.phone}
                  onChange={e => handleChange(i, 'phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          ))}
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium"
          >
            <Plus size={14} /> Add Another Contact
          </button>
        </div>
        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md flex items-center gap-2"
          >
            <Save size={14} /> Save Contacts
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { state, dispatch } = useStore();
  const { currentUser, employees, benefits, payroll, timeOffBalance, timeOffRequests } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...currentUser });
  const [activeTab, setActiveTab] = useState('summary');
  const [showActions, setShowActions] = useState(false);
  const photoInputRef = useRef(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: formData });
    setIsEditing(false);
  };

  return (
    <div className="flex gap-0 -m-6">
      {/* Left sidebar - dark blue panel */}
      <div className="w-[280px] bg-gradient-to-b from-blue-800 to-blue-900 min-h-[calc(100vh-56px)] p-6 flex flex-col items-center shrink-0">
        <div className="relative mb-4 mt-4">
          <img
            src={formData.avatar || currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg object-cover"
          />
          <button
            onClick={() => photoInputRef.current && photoInputRef.current.click()}
            className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary"
            title="Change photo"
          >
            <Camera size={14} />
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const newAvatar = ev.target.result;
                setFormData(prev => ({ ...prev, avatar: newAvatar }));
                dispatch({ type: 'UPDATE_PROFILE', payload: { avatar: newAvatar } });
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
        <h2 className="text-white font-bold text-lg text-center">{currentUser.name}</h2>
        <p className="text-blue-200 text-sm text-center mt-1">{currentUser.title}</p>
        <p className="text-blue-300 text-xs text-center">{currentUser.department}</p>

        {/* Actions dropdown */}
        <div className="relative w-full mt-5">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full py-2 px-4 border border-white/30 text-white rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            Actions <ChevronDown size={14} />
          </button>
          {showActions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => { setIsEditing(true); setShowActions(false); }}
                className="w-full p-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { setShowActions(false); photoInputRef.current && photoInputRef.current.click(); }}
                className="w-full p-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Change Photo
              </button>
              <button
                onClick={() => { setShowActions(false); setActiveTab('summary'); setShowEmergencyModal(true); }}
                className="w-full p-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Update Emergency Contacts
              </button>
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <nav className="w-full mt-8 space-y-1">
          {profileTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Edit mode banner */}
        {isEditing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <span className="text-sm text-blue-700 font-medium">Editing Profile</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); setFormData({ ...currentUser }); }}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover flex items-center gap-2"
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            currentUser={currentUser}
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            onEditEmergencyContacts={() => setShowEmergencyModal(true)}
          />
        )}
        {activeTab === 'job' && (
          <JobTab currentUser={currentUser} employees={employees} />
        )}
        {activeTab === 'compensation' && (
          <CompensationTab currentUser={currentUser} />
        )}
        {activeTab === 'benefits' && (
          <BenefitsTab benefits={benefits} />
        )}
        {activeTab === 'pay' && (
          <PayTab payroll={payroll} />
        )}
        {activeTab === 'timeoff' && (
          <TimeOffTab timeOffBalance={timeOffBalance} timeOffRequests={timeOffRequests} />
        )}
      </div>

      {/* Emergency Contacts Modal */}
      {showEmergencyModal && (
        <EmergencyContactsModal
          currentUser={currentUser}
          dispatch={dispatch}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
}
