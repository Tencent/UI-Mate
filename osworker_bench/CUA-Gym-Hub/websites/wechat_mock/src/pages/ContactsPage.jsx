
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { groupContactsByLetter } from '../utils/helpers';
import './ContactsPage.css';

const ContactsPage = () => {
  const navigate = useNavigate();
  const contacts = useStore(state => state.contacts) || [];
  const groups = useStore(state => state.groups) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFriends, setShowNewFriends] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showOfficialAccounts, setShowOfficialAccounts] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        const nameMatch = contact.nickname.toLowerCase().includes(query);
        const phoneMatch = contact.phone && contact.phone.toLowerCase().includes(query);
        return nameMatch || phoneMatch;
      })
    : contacts;

  const groupedContacts = groupContactsByLetter(filteredContacts);
  const letters = Object.keys(groupedContacts);

  const tags = ['朋友', '同事', '家人'];
  const tagCounts = {};
  tags.forEach(t => {
    tagCounts[t] = contacts.filter(c => c.tag === t).length;
  });

  const tagContacts = activeTag
    ? contacts.filter(c => c.tag === activeTag)
    : [];

  const scrollToLetter = (letter) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const officialAccounts = [
    { id: 'oa1', name: '微信团队', icon: '💬', desc: '微信官方公众号' },
    { id: 'oa2', name: '腾讯新闻', icon: '📰', desc: '最新资讯，第一时间' },
    { id: 'oa3', name: '人民日报', icon: '📄', desc: '权威、及时、准确' },
  ];

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1>通讯录</h1>
      </div>

      <div className="contacts-search">
        <input
          type="text"
          className="search-input"
          placeholder="搜索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="special-items">
        <div className="special-item" onClick={() => setShowNewFriends(true)}>
          <div className="special-icon" style={{ backgroundColor: '#fa9d3b' }}>👤</div>
          <span>新的朋友</span>
          <span className="special-arrow">›</span>
        </div>
        <div className="special-item" onClick={() => setShowGroups(true)}>
          <div className="special-icon" style={{ backgroundColor: '#07c160' }}>👥</div>
          <span>群聊</span>
          <span className="special-arrow">›</span>
        </div>
        <div className="special-item" onClick={() => setShowTags(true)}>
          <div className="special-icon" style={{ backgroundColor: '#576b95' }}>🏷️</div>
          <span>标签</span>
          <span className="special-arrow">›</span>
        </div>
        <div className="special-item" onClick={() => setShowOfficialAccounts(true)}>
          <div className="special-icon" style={{ backgroundColor: '#576b95' }}>📢</div>
          <span>公众号</span>
          <span className="special-arrow">›</span>
        </div>
      </div>

      <div className="contacts-list">
        {letters.map(letter => (
          <div key={letter} id={`letter-${letter}`} className="letter-group">
            <div className="letter-header">{letter}</div>
            {groupedContacts[letter].map(contact => (
              <div
                key={contact.userId}
                className="contact-item"
                onClick={() => navigate(`/user/${contact.userId}`)}
              >
                <img src={contact.avatar} alt={contact.nickname} className="avatar" />
                <div className="contact-item-info">
                  <span className="contact-name">{contact.nickname}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="contacts-count" data-testid="contacts-count">{contacts.length} 位联系人</div>
      </div>

      <div className="letter-index">
        {letters.map(letter => (
          <button
            key={letter}
            className="letter-btn"
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {showNewFriends && (
        <div className="modal-overlay" onClick={() => setShowNewFriends(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新的朋友</h3>
              <button className="close-btn" onClick={() => setShowNewFriends(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="empty-state-modal">
                <div className="empty-icon">👋</div>
                <p>暂无新的朋友请求</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGroups && (
        <div className="modal-overlay" onClick={() => setShowGroups(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>群聊</h3>
              <button className="close-btn" onClick={() => setShowGroups(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="groups-list">
                {groups.map(group => (
                  <div key={group.groupId} className="group-item" onClick={() => {
                    setShowGroups(false);
                    navigate(`/group/${group.groupId}`);
                  }}>
                    <img src={group.avatar} alt={group.name} className="group-avatar" />
                    <div className="group-info">
                      <div className="group-name">{group.name}</div>
                      <div className="group-members">{group.members.length} 人</div>
                    </div>
                    <span className="special-arrow">›</span>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="empty-state-modal">
                    <div className="empty-icon">👥</div>
                    <p>暂无群聊</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTags && !activeTag && (
        <div className="modal-overlay" onClick={() => setShowTags(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>标签</h3>
              <button className="close-btn" onClick={() => setShowTags(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tags-list">
                {tags.map(tag => (
                  <div key={tag} className="tag-item" style={{ cursor: 'pointer' }} onClick={() => setActiveTag(tag)}>
                    <span className="tag-name">{tag}</span>
                    <span className="tag-count">{tagCounts[tag]} 人</span>
                    <span className="special-arrow">›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTag && (
        <div className="modal-overlay" onClick={() => setActiveTag(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn" style={{ fontSize: '18px' }} onClick={() => setActiveTag(null)}>‹</button>
              <h3>{activeTag}</h3>
              <button className="close-btn" onClick={() => { setActiveTag(null); setShowTags(false); }}>✕</button>
            </div>
            <div className="modal-body">
              {tagContacts.length > 0 ? (
                <div className="contacts-list" style={{ overflow: 'auto' }}>
                  {tagContacts.map(contact => (
                    <div
                      key={contact.userId}
                      className="contact-item"
                      onClick={() => {
                        setActiveTag(null);
                        setShowTags(false);
                        navigate(`/user/${contact.userId}`);
                      }}
                    >
                      <img src={contact.avatar} alt={contact.nickname} className="avatar" />
                      <div className="contact-item-info">
                        <span className="contact-name">{contact.nickname}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-modal">
                  <p>该标签下暂无联系人</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showOfficialAccounts && (
        <div className="modal-overlay" onClick={() => setShowOfficialAccounts(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>公众号</h3>
              <button className="close-btn" onClick={() => setShowOfficialAccounts(false)}>✕</button>
            </div>
            <div className="modal-body">
              {officialAccounts.map(oa => (
                <div key={oa.id} className="contact-item" style={{ cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#576b95', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '12px' }}>{oa.icon}</div>
                  <div className="contact-item-info">
                    <div className="contact-name">{oa.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{oa.desc}</div>
                  </div>
                  <span className="special-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;

