import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Search, MapPin, Mail, Phone, ChevronRight, ChevronDown, X, Calendar, ExternalLink, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';

function EmployeeDetailPanel({ employee, allEmployees, currentUserId, onClose, onCreateContactDraft }) {
  const navigate = useNavigate();
  const [showFullProfile, setShowFullProfile] = useState(false);
  const manager = allEmployees.find(e => e.id === employee.managerId);
  const directReports = allEmployees.filter(e => e.managerId === employee.id);
  const isCurrentUser = employee.id === currentUserId;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-xl z-40 flex flex-col border-l border-gray-200">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Employee Details</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header with cover and avatar */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 shadow-md object-cover"
          />
        </div>

        <div className="px-6 pt-14 pb-6 space-y-6">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{employee.name}</h3>
            <p className="text-primary font-medium text-sm">{employee.title}</p>
            <p className="text-gray-500 text-sm">{employee.department}</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <button
                onClick={() => onCreateContactDraft(employee)}
                className="text-primary hover:underline text-left"
              >
                {employee.email}
              </button>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-700">{employee.phone || 'No phone on file'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-700">{employee.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-700">Hired: {formatDate(employee.joinDate)}</span>
            </div>
          </div>

          {/* Manager */}
          {manager && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Reports To</h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={manager.avatar} alt={manager.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{manager.name}</p>
                  <p className="text-xs text-gray-500">{manager.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Direct Reports ({directReports.length})</h4>
              <div className="space-y-2">
                {directReports.map(report => (
                  <div key={report.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <img src={report.avatar} alt={report.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFullProfile && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Profile Summary</h4>
              <div className="grid grid-cols-1 gap-3 text-sm bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Employee ID</span>
                  <span className="font-medium text-gray-900">{employee.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Employee Type</span>
                  <span className="font-medium text-gray-900">{employee.employeeType || 'Full-Time'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">{employee.department}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Manager</span>
                  <span className="font-medium text-gray-900">{manager?.name || 'None'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            if (isCurrentUser) {
              navigate('/profile');
            } else {
              setShowFullProfile(true);
              return;
            }
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
        >
          <ExternalLink size={16} /> {isCurrentUser ? 'View My Profile' : 'Close Profile Preview'}
        </button>
      </div>
    </div>
  );
}

// Simple recursive component for Org Chart
const OrgNode = ({ employee, allEmployees, depth = 0, onSelect }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const directReports = allEmployees.filter(e => e.managerId === employee.id);
  const hasReports = directReports.length > 0;

  return (
    <div className="ml-4 md:ml-8 relative">
      {depth > 0 && (
        <div className="absolute -left-4 md:-left-8 top-8 w-4 md:w-8 h-px bg-gray-300"></div>
      )}

      <div className="flex items-start gap-2 mb-4">
        {hasReports && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-8 p-0.5 rounded-full bg-white border border-gray-300 text-gray-500 hover:text-primary z-10"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {!hasReports && <div className="w-5"></div>}

        <div
          onClick={() => onSelect(employee)}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-primary hover:shadow-md transition-all min-w-[250px] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">{employee.name}</h4>
              <p className="text-xs text-gray-500">{employee.title}</p>
              {hasReports && (
                <p className="text-xs text-primary mt-0.5">{directReports.length} direct report{directReports.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && hasReports && (
        <div className="border-l border-gray-300 ml-2.5 pl-0 pb-2">
          {directReports.map(report => (
            <OrgNode key={report.id} employee={report} allEmployees={allEmployees} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Directory() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const { employees, departments, currentUser } = state;
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return [...depts].sort();
  }, [employees]);

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !departmentFilter || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Find root for org chart (someone with no manager or manager not in list)
  const rootEmployee = employees.find(e => !e.managerId) || employees[0];

  const createContactDraft = (employee) => {
    dispatch({
      type: 'ADD_CONTACT_DRAFT',
      payload: {
        id: `contact_${Date.now()}`,
        employeeId: employee.id,
        to: employee.email,
        subject: `Follow up with ${employee.name}`,
        body: `Hi ${employee.name},\n\n`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      },
    });
    addToast(`Contact draft created for ${employee.name}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Directory</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64"
            />
          </div>

          {/* Department filter */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('org')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'org' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Org Chart
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found</p>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white text-left rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              type="button"
              aria-label={`View details for ${emp.name}`}
            >
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="px-6 pt-14 pb-6 relative">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-20 h-20 rounded-full border-4 border-white absolute -top-10 left-6 shadow-sm object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{emp.name}</h3>
                  <p className="text-primary font-medium text-sm">{emp.title}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{emp.department}</span>

                  <div className="space-y-2 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{emp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{emp.phone || '+1 (555) 123-4567'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {rootEmployee && (
            <OrgNode
              employee={rootEmployee}
              allEmployees={employees}
              onSelect={setSelectedEmployee}
            />
          )}
        </div>
      )}

      {/* Employee Detail Slide-out Panel */}
      {selectedEmployee && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSelectedEmployee(null)} />
          <EmployeeDetailPanel
            employee={selectedEmployee}
            allEmployees={employees}
            currentUserId={currentUser.id}
            onClose={() => setSelectedEmployee(null)}
            onCreateContactDraft={createContactDraft}
          />
        </>
      )}
    </div>
  );
}
