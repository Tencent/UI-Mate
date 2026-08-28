import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';
import { Sheet } from '../utils/types';
import { parseCellId, getCellId } from '../utils/helpers';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: Sheet;
  selectionRange: string[] | null;
}

export const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, sheet, selectionRange }) => {
  if (!isOpen) return null;

  const chartData = useMemo(() => {
    if (!selectionRange || selectionRange.length < 2) {
      // Fallback mock data if no range selected
      return [
        { name: 'A', value: 400 },
        { name: 'B', value: 300 },
        { name: 'C', value: 300 },
        { name: 'D', value: 200 },
      ];
    }

    const start = parseCellId(selectionRange[0]);
    const end = parseCellId(selectionRange[selectionRange.length - 1]);
    const data = [];

    // Assume first column is labels, second is values
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const labelCol = Math.min(start.col, end.col);
    const valueCol = labelCol + 1; // Simple assumption: next column is value

    for (let r = minRow; r <= maxRow; r++) {
      const labelId = getCellId(labelCol, r);
      const valueId = getCellId(valueCol, r);
      
      const labelCell = sheet.data[labelId];
      const valueCell = sheet.data[valueId];

      if (labelCell && valueCell) {
        data.push({
          name: labelCell.computed || labelCell.value,
          value: Number(valueCell.computed || valueCell.value) || 0
        });
      }
    }
    return data;
  }, [sheet, selectionRange]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] h-[500px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Chart Editor</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {selectionRange && (
             <p className="text-xs text-gray-500 mb-4">
               Charting range: {selectionRange[0]}:{selectionRange[selectionRange.length - 1]}
             </p>
          )}

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 text-gray-600">Bar Chart</h4>
            <div className="h-[200px] w-full border rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0F9D58" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-600">Line Chart</h4>
            <div className="h-[200px] w-full border rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#1a73e8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};