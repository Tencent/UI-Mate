import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { CodeEditor } from './CodeEditor';
import { Send, Copy, Check, WrapText } from 'lucide-react';
import clsx from 'clsx';

// Renders a JSON value as a readable, indented tree
const JsonTreeView = ({ data, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const indent = depth * 12;

  if (data === null) return <span className="text-gray-400">null</span>;
  if (typeof data === 'boolean') return <span className="text-blue-500">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-amber-600">{data}</span>;
  if (typeof data === 'string') return <span className="text-green-700">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-600">[]</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 text-[10px] mr-0.5">
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="text-gray-600">Array({data.length})</span>
        {!collapsed && (
          <div style={{ marginLeft: indent + 12 }}>
            {data.slice(0, 50).map((item, idx) => (
              <div key={idx} className="py-0.5">
                <span className="text-gray-400">{idx}: </span>
                <JsonTreeView data={item} depth={depth + 1} />
              </div>
            ))}
            {data.length > 50 && <div className="text-gray-400 text-[10px]">... {data.length - 50} more items</div>}
          </div>
        )}
      </span>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-gray-600">{'{}'}</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 text-[10px] mr-0.5">
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="text-gray-600 text-[10px]">{'{...}'}</span>
        {!collapsed && (
          <div style={{ marginLeft: indent + 12 }}>
            {keys.map(k => (
              <div key={k} className="py-0.5 flex gap-1.5">
                <span className="text-purple-600 font-medium text-xs">{k}:</span>
                <span><JsonTreeView data={data[k]} depth={depth + 1} /></span>
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span className="text-gray-600">{String(data)}</span>;
};

export const ResponsePanel = () => {
  const { state } = useStore();
  const { response } = state;
  const [activeTab, setActiveTab] = useState('body');
  const [bodyView, setBodyView] = useState('pretty'); // pretty | raw | preview
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <Send size={40} className="mb-3 text-gray-300" />
        <p className="text-sm">Enter a URL and click Send to get a response</p>
        <p className="text-xs mt-1 text-gray-300">Or press Ctrl+Enter</p>
      </div>
    );
  }

  const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
  const isError = response.statusCode >= 400;

  const bodyText = typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, bodyView === 'pretty' ? 2 : 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const cookies = response.cookies || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Status Bar */}
      <div className="px-3 py-2 border-b border-sidebar-border flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">Status:</span>
          <span className={clsx("font-bold", isSuccess ? "text-green-600" : isError ? "text-red-600" : "text-yellow-600")}>
            {response.statusCode} {response.statusText}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Time:</span>
          <span className="font-mono text-gray-700">{response.time}ms</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Size:</span>
          <span className="font-mono text-gray-700">{response.size} B</span>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="flex border-b border-sidebar-border px-3">
        {['Body', 'Cookies', 'Headers', 'Test Results'].map(tab => {
          const key = tab.toLowerCase().replace(' ', '');
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(key)}
              className={clsx(
                "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === key
                  ? "border-primary text-gray-800"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
              {tab === 'Cookies' && cookies.length > 0 && (
                <span className="ml-1 text-[10px] text-gray-400">({cookies.length})</span>
              )}
              {tab === 'Headers' && response.headers && (
                <span className="ml-1 text-[10px] text-gray-400">({Object.keys(response.headers).length})</span>
              )}
              {tab === 'Test Results' && response.testResults && response.testResults.length > 0 && (
                <span className={clsx("ml-1 text-[10px]",
                  response.testResults.every(t => t.passed) ? "text-green-600" : "text-red-600"
                )}>
                  ({response.testResults.filter(t => t.passed).length}/{response.testResults.length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'body' && (
          <div className="absolute inset-0 flex flex-col">
            {/* Body toolbar */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 flex-shrink-0">
              <div className="flex bg-gray-100 rounded overflow-hidden text-[10px]">
                {['Pretty', 'Raw', 'Preview'].map(v => (
                  <button
                    key={v}
                    onClick={() => setBodyView(v.toLowerCase())}
                    className={clsx(
                      "px-2.5 py-1 font-medium transition-colors",
                      bodyView === v.toLowerCase()
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className={clsx("p-1 rounded", wordWrap ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-600")}
                  title="Word wrap"
                >
                  <WrapText size={12} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  title="Copy response"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {bodyView === 'pretty' && (
                <CodeEditor
                  code={typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
                  onChange={() => {}}
                  language="json"
                  readOnly={true}
                />
              )}
              {bodyView === 'raw' && (
                <pre className={clsx(
                  "p-3 text-xs font-mono text-gray-700 h-full overflow-auto",
                  wordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                )}>
                  {typeof response.body === 'string' ? response.body : JSON.stringify(response.body)}
                </pre>
              )}
              {bodyView === 'preview' && (
                <div className="h-full overflow-auto">
                  {typeof response.body === 'string' && response.body.trim().startsWith('<') ? (
                    <iframe
                      srcDoc={response.body}
                      className="w-full h-full border-0"
                      title="Response preview"
                      sandbox=""
                    />
                  ) : (
                    <div className="p-3 text-xs font-mono leading-relaxed">
                      <JsonTreeView data={response.body} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="p-3 overflow-y-auto h-full">
            {cookies.length === 0 ? (
              <div className="text-gray-400 text-xs italic">No cookies in this response</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-1.5 font-semibold text-gray-600">Name</th>
                    <th className="py-1.5 font-semibold text-gray-600">Value</th>
                    <th className="py-1.5 font-semibold text-gray-600">Domain</th>
                    <th className="py-1.5 font-semibold text-gray-600">Path</th>
                    <th className="py-1.5 font-semibold text-gray-600">HttpOnly</th>
                    <th className="py-1.5 font-semibold text-gray-600">Secure</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((cookie, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-1.5 font-mono text-gray-700">{cookie.name}</td>
                      <td className="py-1.5 font-mono text-gray-500 break-all">{cookie.value}</td>
                      <td className="py-1.5 text-gray-500">{cookie.domain || '-'}</td>
                      <td className="py-1.5 text-gray-500">{cookie.path || '/'}</td>
                      <td className="py-1.5">{cookie.httpOnly ? 'Yes' : 'No'}</td>
                      <td className="py-1.5">{cookie.secure ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-3 overflow-y-auto h-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 font-semibold text-gray-600 w-1/3">Key</th>
                  <th className="py-1.5 font-semibold text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-1.5 font-mono text-gray-700">{key}</td>
                    <td className="py-1.5 font-mono text-gray-500 break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'testresults' && (
          <div className="p-3 overflow-y-auto h-full">
            {(!response.testResults || response.testResults.length === 0) ? (
              <div className="text-gray-400 text-xs italic">No tests executed</div>
            ) : (
              <div className="space-y-1.5">
                {response.testResults.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border border-gray-100 rounded">
                    <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded",
                      test.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {test.passed ? "PASS" : "FAIL"}
                    </span>
                    <span className="text-xs text-gray-700">{test.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
