import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, RotateCcw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';

const DEFAULT_SCRIPT = `//@version=5
indicator("My Script", overlay=true)

// Input parameters
length = input.int(14, title="Length", minval=1)
src = input.source(close, title="Source")

// Calculate simple moving average
ma = ta.sma(src, length)

// Plot the result
plot(ma, color=color.blue, linewidth=2, title="MA")
`;

export default function PineEditor() {
  const { state, updateState } = useAppContext();

  // Local state for the editor (sync to context on save/run)
  const [script, setScript] = useState(() => state.uiState.pineScript || DEFAULT_SCRIPT);
  const [output, setOutput] = useState('');
  const [outputType, setOutputType] = useState(''); // 'success' | 'error'
  const [mode, setMode] = useState(() => state.uiState.pineScriptMode || 'indicator');
  const textareaRef = useRef(null);

  // Keep local script in sync when state.uiState.pineScript changes externally
  useEffect(() => {
    if (state.uiState.pineScript && state.uiState.pineScript !== script) {
      setScript(state.uiState.pineScript);
    }
  }, [state.uiState.pineScript]);

  const persistScript = (newScript, newMode) => {
    updateState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        pineScript: newScript,
        pineScriptMode: newMode !== undefined ? newMode : prev.uiState.pineScriptMode || mode,
      },
    }));
  };

  const handleRun = () => {
    // Simulate compilation
    const hasError = script.includes('error') || script.includes('ERROR');
    if (hasError) {
      setOutput('Pine Script compilation error: Unexpected token on line 3');
      setOutputType('error');
    } else {
      setOutput('Compiled and applied successfully. Script added to chart.');
      setOutputType('success');
      // Persist to state on run
      persistScript(script);
      setTimeout(() => setOutput(''), 4000);
    }
  };

  const handleSave = () => {
    persistScript(script);
    setOutput('Script saved.');
    setOutputType('success');
    setTimeout(() => setOutput(''), 2000);
  };

  const handleReset = () => {
    setScript(DEFAULT_SCRIPT);
    setOutput('');
    persistScript(DEFAULT_SCRIPT);
  };

  const handleModeChange = (m) => {
    setMode(m);
    persistScript(script, m);
  };

  // Handle Tab key for indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newScript = script.substring(0, start) + '    ' + script.substring(end);
      setScript(newScript);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 10px', gap: 6,
        borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-panel)',
      }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 1, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
          {['indicator', 'strategy'].map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                padding: '3px 10px', fontSize: 11,
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
                borderRadius: 3,
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Ctrl+S to save</span>

        <button
          onClick={handleReset}
          className="tv-icon-btn"
          style={{ width: 28, height: 28 }}
          title="Reset to default"
        >
          <RotateCcw size={13} />
        </button>

        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 4, fontSize: 12,
            background: 'var(--bg-hover)', color: 'var(--text-primary)',
          }}
        >
          <Save size={13} />
          Save
        </button>

        <button
          onClick={handleRun}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 12px', borderRadius: 4, fontSize: 12,
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
          }}
        >
          <Play size={13} />
          Run
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <textarea
          ref={textareaRef}
          value={script}
          onChange={e => setScript(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: 1.6,
            background: '#131722',
            color: '#D1D4DC',
            border: 'none',
            borderBottom: output ? '1px solid var(--border)' : 'none',
            resize: 'none',
            outline: 'none',
            borderRadius: 0,
          }}
        />

        {/* Output console */}
        {output && (
          <div style={{
            padding: '6px 14px', flexShrink: 0, fontSize: 12, fontFamily: 'Consolas, Monaco, monospace',
            background: '#0D1117',
            color: outputType === 'error' ? 'var(--down)' : 'var(--up)',
            borderTop: '1px solid var(--border)',
          }}>
            {outputType === 'success' ? '✓' : '✗'} {output}
          </div>
        )}
      </div>
    </div>
  );
}
