import React from 'react';
import { useStore } from '../../context/StoreContext';
import { format } from 'date-fns';
import { Reply, ReplyAll, Forward, Download } from 'lucide-react';

export default function ReadingPane({ emailId, onCompose }) {
  const { state } = useStore();
  const email = state.emails.find(e => e.id === emailId);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 text-neutral-500">
        <img src="https://picsum.photos/300/200?blur=2" alt="Select item" className="mb-4 opacity-50 rounded" />
        <p>Select an item to read</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">{email.subject}</h1>
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg">
              {email.from.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {email.from.name} <span className="text-neutral-500 font-normal">{'<'}{email.from.email}{'>'}</span>
              </div>
              <div className="text-xs text-neutral-500">{format(new Date(email.timestamp), 'PPpp')}</div>
              <div className="text-xs text-neutral-500 mt-0.5">To: You</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCompose({
                to: email.from.email,
                subject: `Re: ${email.subject}`,
                body: `\n\nOn ${format(new Date(email.timestamp), 'PPpp')}, ${email.from.name} wrote:\n${email.body}`,
              })}
              className="p-2 hover:bg-neutral-100 rounded text-neutral-600"
              title="Reply"
            >
              <Reply className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCompose({
                to: [email.from.email, ...email.to.map(item => item.email)].filter(Boolean).join('; '),
                subject: `Re: ${email.subject}`,
                body: `\n\nOn ${format(new Date(email.timestamp), 'PPpp')}, ${email.from.name} wrote:\n${email.body}`,
              })}
              className="p-2 hover:bg-neutral-100 rounded text-neutral-600"
              title="Reply all"
            >
              <ReplyAll className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCompose({
                to: '',
                subject: `Fw: ${email.subject}`,
                body: `\n\nForwarded message:\nFrom: ${email.from.name} <${email.from.email}>\n\n${email.body}`,
              })}
              className="p-2 hover:bg-neutral-100 rounded text-neutral-600"
              title="Forward"
            >
              <Forward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {email.categories.length > 0 && (
          <div className="flex gap-2 mb-4">
            {email.categories.map(catId => {
              const cat = state.categories.find(c => c.id === catId);
              if (!cat) return null;
              return (
                <span key={catId} className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>
                  {cat.name}
                </span>
              );
            })}
          </div>
        )}

        <div className="prose max-w-none text-sm text-neutral-800 whitespace-pre-wrap mb-8">
          {email.body}
        </div>

        {email.attachments.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-semibold mb-2">{email.attachments.length} Attachments</h3>
            <div className="flex flex-wrap gap-4">
              {email.attachments.map((att, idx) => (
                <a key={idx} href={att.url} download={att.name} className="border border-neutral-200 rounded p-2 flex items-center gap-3 hover:bg-neutral-50 cursor-pointer w-64 no-underline text-inherit">
                  <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-600 text-xs font-bold">PDF</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium truncate">{att.name}</div>
                    <div className="text-xs text-neutral-500">245 KB</div>
                  </div>
                  <Download className="w-4 h-4 text-neutral-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
