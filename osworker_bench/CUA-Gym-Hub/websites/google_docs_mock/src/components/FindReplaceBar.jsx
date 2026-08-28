import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

function FindReplaceBar({ editor, onClose }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const findInputRef = useRef(null);
  // Positions of all matches in the plain text
  const matchPositionsRef = useRef([]);

  useEffect(() => {
    if (findInputRef.current) {
      findInputRef.current.focus();
    }
  }, []);

  // Compute all match positions in the document's plain text
  const computeMatches = useCallback(() => {
    if (!editor || !findText) {
      matchPositionsRef.current = [];
      setMatchCount(0);
      setCurrentMatch(0);
      return 0;
    }

    const text = editor.getText();
    const searchText = matchCase ? findText : findText.toLowerCase();
    const content = matchCase ? text : text.toLowerCase();

    const positions = [];
    let pos = 0;
    while ((pos = content.indexOf(searchText, pos)) !== -1) {
      positions.push(pos);
      pos += searchText.length;
    }

    matchPositionsRef.current = positions;
    return positions.length;
  }, [editor, findText, matchCase]);

  // Scroll to and visually highlight a match by navigating the ProseMirror document
  const scrollToMatch = useCallback((matchIndex) => {
    if (!editor) return;
    const positions = matchPositionsRef.current;
    if (positions.length === 0 || matchIndex < 0 || matchIndex >= positions.length) return;

    const textOffset = positions[matchIndex];
    const searchLen = findText.length;

    // Walk through ProseMirror document nodes to find the ProseMirror position
    // corresponding to the plain-text offset
    let textConsumed = 0;
    let pmFrom = null;
    let pmTo = null;

    editor.state.doc.descendants((node, pos) => {
      if (pmFrom !== null) return false; // already found
      if (node.isText) {
        const nodeText = node.text;
        const nodeStart = textConsumed;
        const nodeEnd = textConsumed + nodeText.length;

        if (textOffset >= nodeStart && textOffset < nodeEnd) {
          // Match starts in this node
          const offsetInNode = textOffset - nodeStart;
          pmFrom = pos + offsetInNode;
          // Check if the match ends in the same node
          if (textOffset + searchLen <= nodeEnd) {
            pmTo = pmFrom + searchLen;
          } else {
            // Match spans multiple text nodes — just select up to end of this node
            pmTo = pos + nodeText.length;
          }
        }

        textConsumed += nodeText.length;
      } else if (node.isBlock && textConsumed > 0) {
        // Blocks add a newline separator in getText()
        textConsumed += 1;
      }
    });

    if (pmFrom !== null && pmTo !== null) {
      try {
        editor.chain().focus().setTextSelection({ from: pmFrom, to: pmTo }).run();
        // Scroll the selection into view
        const view = editor.view;
        if (view) {
          const domNode = view.domAtPos(pmFrom);
          if (domNode && domNode.node) {
            const el = domNode.node.nodeType === 3 ? domNode.node.parentElement : domNode.node;
            if (el && el.scrollIntoView) {
              el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      } catch {
        // If ProseMirror positioning fails, fall back silently
      }
    }
  }, [editor, findText]);

  const highlightMatches = useCallback(() => {
    const count = computeMatches();
    setMatchCount(count);
    if (count > 0) {
      const next = Math.min(1, count);
      setCurrentMatch(next);
      scrollToMatch(0);
    } else {
      setCurrentMatch(0);
    }
  }, [computeMatches, scrollToMatch]);

  useEffect(() => {
    highlightMatches();
  }, [findText, matchCase]);

  const handleFindNext = useCallback(() => {
    if (!editor || !findText || matchCount === 0) return;
    const next = currentMatch >= matchCount ? 1 : currentMatch + 1;
    setCurrentMatch(next);
    scrollToMatch(next - 1);
  }, [editor, findText, matchCount, currentMatch, scrollToMatch]);

  const handleFindPrev = useCallback(() => {
    if (!editor || !findText || matchCount === 0) return;
    const prev = currentMatch <= 1 ? matchCount : currentMatch - 1;
    setCurrentMatch(prev);
    scrollToMatch(prev - 1);
  }, [editor, findText, matchCount, currentMatch, scrollToMatch]);

  const handleReplace = useCallback(() => {
    if (!editor || !findText || matchCount === 0) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    const matches = matchCase
      ? selectedText === findText
      : selectedText.toLowerCase() === findText.toLowerCase();

    if (matches) {
      editor.chain().focus().deleteSelection().insertContent(replaceText).run();
      // Recompute matches after replacement
      const newCount = computeMatches();
      const newCurrent = Math.min(currentMatch, Math.max(newCount, 0));
      setMatchCount(newCount);
      setCurrentMatch(newCount > 0 ? newCurrent || 1 : 0);
      if (newCount > 0) {
        scrollToMatch((newCurrent || 1) - 1);
      }
    } else {
      handleFindNext();
    }
  }, [editor, findText, replaceText, matchCase, matchCount, currentMatch, computeMatches, scrollToMatch, handleFindNext]);

  const handleReplaceAll = useCallback(() => {
    if (!editor || !findText) return;

    // Perform replacement using TipTap transaction on the full document tree,
    // operating on text nodes only to avoid corrupting HTML markup.
    const { state, view } = editor;
    const { tr } = state;
    const flags = matchCase ? '' : 'i';
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedFind, 'g' + flags);

    let replacements = 0;
    // Collect replacements in reverse order to preserve positions
    const ops = [];
    state.doc.descendants((node, pos) => {
      if (!node.isText) return;
      const nodeText = node.text;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(nodeText)) !== null) {
        ops.push({ from: pos + match.index, to: pos + match.index + match[0].length });
        replacements++;
      }
    });

    // Apply in reverse order so positions stay valid
    ops.reverse().forEach(({ from, to }) => {
      tr.replaceWith(from, to, replaceText ? state.schema.text(replaceText) : []);
    });

    if (replacements > 0) {
      view.dispatch(tr);
    }

    setMatchCount(0);
    setCurrentMatch(0);
    matchPositionsRef.current = [];
  }, [editor, findText, replaceText, matchCase]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handleFindPrev();
      } else {
        handleFindNext();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleFindNext, handleFindPrev, onClose]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-1.5 flex-1">
        <div className="relative flex-1 max-w-[240px]">
          <input
            ref={findInputRef}
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in document"
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
          />
          {findText && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {matchCount > 0 ? `${currentMatch}/${matchCount}` : '0 results'}
            </span>
          )}
        </div>
        <button
          onClick={handleFindPrev}
          disabled={matchCount === 0}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous (Shift+Enter)"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={handleFindNext}
          disabled={matchCount === 0}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next (Enter)"
        >
          <ChevronDown size={16} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <div className="relative flex-1 max-w-[240px]">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Replace with"
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleReplace}
          disabled={matchCount === 0}
          className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Replace"
        >
          Replace
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={matchCount === 0}
          className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Replace all"
        >
          All
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="rounded border-gray-300"
          />
          Match case
        </label>
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        title="Close (Escape)"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default FindReplaceBar;
