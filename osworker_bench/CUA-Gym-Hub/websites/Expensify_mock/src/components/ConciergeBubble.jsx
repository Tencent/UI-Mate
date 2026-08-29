import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Triangle, X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ConciergeBubble() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Build dynamic context messages from state
  const pendingApprovalCount = state
    ? state.inboxItems.filter(i => i.actionType === 'approve_report' && !i.read && !i.hidden).length
    : 0;

  const [chatMessages, setChatMessages] = useState(() => {
    const msgs = [
      { id: 1, sender: 'concierge', text: 'Hi ' + (state?.currentUser?.firstName || 'there') + '! How can I help you today?' },
    ];
    if (pendingApprovalCount > 0) {
      msgs.push({ id: 2, sender: 'concierge', text: `You have ${pendingApprovalCount} report${pendingApprovalCount > 1 ? 's' : ''} awaiting your approval.` });
    }
    msgs.push({ id: 3, sender: 'concierge', text: 'Tip: Use SmartScan to capture receipts instantly.' });
    return msgs;
  });

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, chatMessages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    // Simple auto-reply based on keywords
    setTimeout(() => {
      let reply = 'I understand! For detailed help, please visit help.expensify.com.';
      const lower = text.toLowerCase();
      if (lower.includes('report')) reply = 'You can create a new report from the Reports page or by clicking "New Report" in the sidebar.';
      else if (lower.includes('expense')) reply = 'You can add a new expense from the Expenses page using the "New Expense" button.';
      else if (lower.includes('receipt')) reply = 'To upload a receipt, open an expense detail and click "Upload Receipt".';
      else if (lower.includes('submit')) reply = 'To submit a report, go to the report detail page and click the "Submit" button.';
      else if (lower.includes('approve')) reply = 'Reports submitted to you appear in your Inbox for approval.';
      else if (lower.includes('export')) reply = 'You can export reports as CSV or PDF from the Reports page export menu.';
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'concierge', text: reply }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <button className="concierge-bubble" title="Chat with Concierge" onClick={() => setOpen(!open)}>
        <MessageCircle size={24} />
      </button>
      {open && (
        <div className="concierge-chat-panel">
          <div className="concierge-chat-header">
            <Triangle size={20} />
            <span>Concierge</span>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="concierge-chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.map(msg => (
              <div key={msg.id} className={'concierge-chat-msg' + (msg.sender === 'user' ? ' user' : '')}
                style={msg.sender === 'user' ? { alignSelf: 'flex-end', background: '#0185FF', color: 'white', padding: '8px 12px', borderRadius: '12px 12px 2px 12px', maxWidth: '80%', fontSize: 13 } : {}}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="concierge-chat-input" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="Message Concierge..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
            />
            <button onClick={handleSend} style={{ background: '#0185FF', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
