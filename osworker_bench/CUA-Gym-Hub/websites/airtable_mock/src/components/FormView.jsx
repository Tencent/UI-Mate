import React from 'react';
import { useStore } from '../store/store';
import Cell from './Cell';

const FormView = ({ table }) => {
  const { dispatch, ACTIONS } = useStore();

  const [formData, setFormData] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: ACTIONS.ADD_RECORD, payload: { tableId: table.id, initialFields: formData } });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'form_submit', label: `Created a ${table.name} record from form view` } });
    setFormData({});
    setSuccessMessage('Record created');
    window.setTimeout(() => setSuccessMessage(''), 2500);
  };

  return (
    <div className="h-full overflow-auto bg-gray-100 flex justify-center py-12">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="h-3 bg-primary"></div>
        <div className="p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{table.name} Form</h1>
          <p className="text-gray-500 mb-8">Please fill out the information below to add a new record to the {table.name} database.</p>
          {successMessage && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {table.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="border rounded-md p-1 bg-gray-50">
                  <Cell 
                    field={field} 
                    value={formData[field.id]} 
                    onChange={(val) => setFormData({...formData, [field.id]: val})}
                    isGrid={false}
                  />
                </div>
                {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
              </div>
            ))}
            
            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="bg-gray-50 p-6 text-center text-gray-400 text-sm">
          Powered by AirTableMock
        </div>
      </div>
    </div>
  );
};

export default FormView;
