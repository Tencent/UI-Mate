import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Eye, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Forums() {
  const { state } = useApp();
  const destinations = state.destinations.filter(d => state.forumThreads.some(t => t.destinationId === d.id));

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Travel Forums</h1>
      <p style={{ color: '#545454', fontSize: '14px', marginBottom: '24px' }}>Get answers from our community of travelers.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {destinations.map(dest => {
          const threads = state.forumThreads.filter(t => t.destinationId === dest.id);
          const lastThread = threads[threads.length - 1];
          return (
            <Link key={dest.id} to={`/forum/${dest.id}`} style={{
              textDecoration: 'none', color: '#1A1A1A', border: '1px solid #E0E0E0', borderRadius: '12px',
              padding: '20px', background: 'white', transition: 'box-shadow 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ height: '60px', background: dest.image, borderRadius: '8px', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{dest.name} Forum</h3>
              <div style={{ fontSize: '13px', color: '#8A8A8A', marginBottom: '8px' }}>
                {threads.length} threads
              </div>
              {lastThread && (
                <div style={{ fontSize: '12px', color: '#545454' }}>
                  Latest: {lastThread.title.slice(0, 40)}...
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ForumDetail() {
  const { state, dispatch } = useApp();
  const { destinationId: destId } = useParams();
  const dest = state.destinations.find(d => d.id === destId);
  const threads = state.forumThreads.filter(t => t.destinationId === destId);
  const [expandedThread, setExpandedThread] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!dest) return <div className="container" style={{ padding: '48px', textAlign: 'center' }}>Forum not found.</div>;

  const handleReply = (threadId) => {
    if (!replyText.trim()) return;
    dispatch({
      type: 'ADD_FORUM_REPLY',
      payload: {
        threadId,
        reply: {
          authorId: state.currentUser.id,
          text: replyText.trim()
        }
      }
    });
    setReplyText('');
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <Link to="/forums" style={{ color: '#00AA6C' }}>Forums</Link>
        <span>/</span>
        <span>{dest.name}</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>{dest.name} Travel Forum</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E0E0E0' }}>
            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '13px', fontWeight: 700, color: '#545454' }}>Topic</th>
            <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: 700, color: '#545454', width: '80px' }}>Replies</th>
            <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: 700, color: '#545454', width: '80px' }}>Views</th>
            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '13px', fontWeight: 700, color: '#545454', width: '120px' }}>Last Reply</th>
          </tr>
        </thead>
        <tbody>
          {threads.map(thread => {
            const author = state.users.find(u => u.id === thread.authorId);
            const lastReply = thread.replies[thread.replies.length - 1];
            const isExpanded = expandedThread === thread.id;
            return (
              <React.Fragment key={thread.id}>
                <tr style={{ borderBottom: '1px solid #E0E0E0', cursor: 'pointer' }}
                  onClick={() => setExpandedThread(isExpanded ? null : thread.id)}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 0' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>{thread.title}</div>
                    <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '2px' }}>by {author?.name} | {thread.createdAt}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <MessageSquare size={14} color="#8A8A8A" /> {thread.replies.length}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Eye size={14} color="#8A8A8A" /> {thread.views}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '12px', color: '#8A8A8A' }}>
                    {lastReply ? lastReply.createdAt : '-'}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px', background: '#F5F5F5' }}>
                      {thread.replies.map(reply => {
                        const replyAuthor = state.users.find(u => u.id === reply.authorId);
                        return (
                          <div key={reply.id} style={{ padding: '12px', marginBottom: '8px', background: 'white', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00AA6C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>
                                {(replyAuthor?.name || 'A').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{replyAuthor?.name || 'Anonymous'}</div>
                                <div style={{ fontSize: '11px', color: '#8A8A8A' }}>{reply.createdAt}</div>
                              </div>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{reply.text}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#8A8A8A' }}>
                              <ThumbsUp size={12} /> {reply.helpfulVotes} helpful
                            </div>
                          </div>
                        );
                      })}
                      {/* Reply form */}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          style={{ flex: 1, padding: '10px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none' }}
                        />
                        <button className="btn-primary" onClick={() => handleReply(thread.id)} style={{ alignSelf: 'flex-end', padding: '10px 20px' }}>
                          Reply
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
