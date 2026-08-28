import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

export default function PropertiesSettings() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();

  const currentDescription =
    state.properties?.contacts?.lifecycle_stage?.description ?? '';

  const [description, setDescription] = useState(currentDescription);

  useEffect(() => {
    setDescription(currentDescription);
  }, [currentDescription]);

  const propertyMeta = state.properties?.contacts?.lifecycle_stage || {};

  const handleSave = () => {
    const existingProperties = state.properties || {};
    const existingContacts = existingProperties.contacts || {};
    const existingStage = existingContacts.lifecycle_stage || {};

    dispatch({
      type: 'UPDATE_PROPERTIES',
      payload: {
        ...existingProperties,
        contacts: {
          ...existingContacts,
          lifecycle_stage: {
            ...existingStage,
            description,
          },
        },
      },
    });
    addToast('Property description saved.', 'success');
  };

  const handleReset = () => {
    setDescription(currentDescription);
  };

  const isDirty = description !== currentDescription;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-xubspot-text">Properties Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage contact properties and their help text.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-xubspot-text">Contact Properties</h2>
          <p className="text-sm text-gray-500">Properties available on the Contact object.</p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xubspot-text">Property</th>
                <th className="text-left px-4 py-3 font-semibold text-xubspot-text">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-xubspot-text">API Name</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-xubspot-text">
                  {propertyMeta.label || 'Lifecycle Stage'}
                </td>
                <td className="px-4 py-3 text-gray-600">{propertyMeta.type || 'enumeration'}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                  {propertyMeta.apiName || 'lifecycle_stage'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-xubspot-text mb-1">
          {propertyMeta.label || 'Lifecycle Stage'} — Description
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Edit the help text / description shown for this property.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-xubspot-text mb-2">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot outline-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter the property description / help text"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 bg-xubspot text-white text-sm font-medium rounded hover:bg-xubspot-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2 bg-white text-xubspot-text text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
