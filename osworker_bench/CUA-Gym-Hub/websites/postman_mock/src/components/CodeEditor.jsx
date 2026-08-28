import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';

export const CodeEditor = ({ code, onChange, language = "json", readOnly = false }) => {
  const getGrammar = () => {
    if (languages[language]) return languages[language];
    if (language === 'xml' || language === 'html') return languages.markup || languages.html;
    if (language === 'graphql') return languages.javascript; // fallback
    return languages.clike;
  };

  return (
    <div className="bg-white font-mono text-sm h-full overflow-auto">
      <Editor
        value={code || ''}
        onValueChange={readOnly ? () => {} : onChange}
        highlight={code => {
          try {
            return highlight(code, getGrammar(), language);
          } catch {
            return code;
          }
        }}
        padding={12}
        readOnly={readOnly}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          minHeight: '100%',
        }}
        className="min-h-full"
        textareaClassName="focus:outline-none"
      />
    </div>
  );
};
