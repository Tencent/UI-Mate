import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './GroupsPage.css';

const GroupsPage = () => {
  const navigate = useNavigate();
  const contacts = useStore(state => state.contacts);
  const createGroup = useStore(state => state.createGroup);

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [validationError, setValidationError] = useState('');

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      setValidationError('请输入群名称');
      return;
    }
    if (selectedMembers.length === 0) {
      setValidationError('请选择至少一个成员');
      return;
    }
    setValidationError('');
    const groupId = createGroup(groupName.trim(), selectedMembers);
    navigate(`/group/${groupId}`);
  };

  return (
    <div className="groups-page">
      <div className="groups-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1>发起群聊</h1>
        <button
          className="create-btn"
          onClick={handleCreate}
          disabled={!groupName.trim() || selectedMembers.length === 0}
        >
          完成
        </button>
      </div>

      <div className="groups-content">
        <div className="group-name-section">
          <label className="section-label">群名称</label>
          <input
            type="text"
            className="group-name-input"
            placeholder="请输入群名称"
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); setValidationError(''); }}
            maxLength={20}
          />
          {validationError && (
            <div className="validation-error" style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', padding: '0 12px' }}>{validationError}</div>
          )}
        </div>

        <div className="members-selection">
          <div className="section-label">
            选择成员 ({selectedMembers.length} 人)
          </div>
          <div className="members-list">
            {contacts.map(contact => (
              <div
                key={contact.userId}
                className={`member-item ${selectedMembers.includes(contact.userId) ? 'selected' : ''}`}
                onClick={() => toggleMember(contact.userId)}
              >
                <img src={contact.avatar} alt={contact.nickname} className="member-avatar" />
                <div className="member-info">
                  <div className="member-name">{contact.nickname}</div>
                </div>
                <div className="member-checkbox">
                  {selectedMembers.includes(contact.userId) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
