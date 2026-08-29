import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

const DEFAULT_PAYLOAD = {
  "template": "custom",
  "canvas": {
    "width": 800,
    "height": 600,
    "backgroundColor": "#f0f8ff"
  },
  "objects": [
    {
      "type": "text",
      "content": "Created via API",
      "position": { "x": 250, "y": 50 },
      "style": {
        "fontSize": 32,
        "fontFamily": "Arial",
        "fontWeight": "bold",
        "fill": "#2c3e50"
      }
    },
    {
      "type": "rect",
      "position": { "x": 100, "y": 150 },
      "size": { "width": 200, "height": 150 },
      "style": {
        "fill": "#3498db",
        "stroke": "#2980b9",
        "strokeWidth": 2
      }
    },
    {
      "type": "circle",
      "position": { "x": 400, "y": 200 },
      "radius": 60,
      "style": {
        "fill": "#e74c3c",
        "opacity": 0.8
      }
    }
  ]
};

const CreateSimulation = () => {
  const [payload, setPayload] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSimulatePost = () => {
    try {
      const data = JSON.parse(payload);
      // Simulate the server response and redirect
      console.log("Simulating POST /create with:", data);
      
      // Navigate to editor with state
      setError('');
      navigate(`/editor${location.search}`, {
        state: { 
          canvasData: data,
          fromEndpoint: true 
        } 
      });
    } catch (e) {
      setError(`Invalid JSON payload: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-secondary p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">POST /create Simulation</h1>
            <p className="text-gray-300 text-sm mt-1">Simulate an external API call to initialize the canvas</p>
          </div>
          <Link to={`/${location.search}`} className="text-white hover:text-gray-200">
            <ArrowLeft />
          </Link>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Payload (Request Body)
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full h-96 font-mono text-sm p-4 border rounded-lg bg-gray-900 text-green-400 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex justify-end">
            {error && (
              <div className="mr-auto bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSimulatePost}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Play size={20} className="mr-2" />
              Send Request & Launch Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSimulation;
