
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './GroupInfoPage.css';

const GroupInfoPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const groups = useStore(state => state.groups);
  const contacts = useStore(state => state.contacts);
  const user = useStore(state => state.user);
  const conversations = useStore(state => state.conversations);
  const updateGroup = useStore(state => state.updateGroup);
  const exitGroup = useStore(state => state.exitGroup);
  const setGroupAnnouncement = useStore(state => state.setGroupAnnouncement);
  const addGroupMember = useStore(state => state.addGroupMember);
  const pinConversation = useStore(state => state.pinConversation);
  const muteConversation = useStore(state => state.muteConversation);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAnnouncementEditor, setShowAnnouncementEditor] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [showAnnouncementFull, setShowAnnouncementFull] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const group = groups.find(g => g.groupId === groupId);
  const conversation = conversations.find(c => c.contactId === groupId);

  if (!group) {
    return <div className="group-not-found">群聊不存在</div>;
  }

  const isCreator = group.createdBy === user.userId;

  const members = group.members.map(memberId => {
    if (memberId === user.userId) return user;
    return contacts.find(c => c.userId === memberId) || { userId: memberId, nickname: '未知用户', avatar: '' };
  });

  const availableContacts = contacts.filter(c => !group.members.includes(c.userId));

  const handleUpdateName = () => {
    setNewGroupName(group.name);
    setShowRenameDialog(true);
  };

  const handleConfirmRename = () => {
    if (newGroupName.trim()) {
      updateGroup(groupId, { name: newGroupName.trim() });
    }
    setShowRenameDialog(false);
  };

  const handleExitGroup = () => {
    exitGroup(groupId);
    navigate('/messages');
  };

  const handleEditAnnouncement = () => {
    setAnnouncementText(group.announcement || '');
    setShowAnnouncementEditor(true);
  };

  const handleSaveAnnouncement = () => {
    setGroupAnnouncement(groupId, announcementText.trim());
    setShowAnnouncementEditor(false);
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    selectedMembers.forEach(userId => {
      addGroupMember(groupId, userId);
    });
    setSelectedMembers([]);
    setShowAddMember(false);
  };

  return (
    <div className="group-info-page">
      <div className="group-info-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1>聊天信息({group.members.length})</h1>
      </div>

      <div className="group-info-content">
        {/* Members Grid */}
        <div className="members-grid-section">
          <div className="members-grid">
            {members.map(member => (
              <div key={member.userId} className="member-grid-item" onClick={() => navigate(`/user/${member.userId}`)}>
                <img src={member.avatar} alt={member.nickname} className="member-grid-avatar" />
                <div className="member-grid-name">{member.nickname}</div>
              </div>
            ))}
            <div className="member-grid-item add-member" onClick={() => setShowAddMember(true)}>
              <div className="add-icon">+</div>
              <div className="member-grid-name">添加</div>
            </div>
          </div>
        </div>

        {/* Group Name & QR */}
        <div className="group-info-section">
          <div className="info-item clickable" onClick={handleUpdateName}>
            <span className="info-label">群聊名称</span>
            <div className="info-value">
              <span>{group.name}</span>
              <span className="arrow">›</span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-label">群聊二维码</span>
            <div className="info-value">
              <span className="qr-icon">📱</span>
              <span className="arrow">›</span>
            </div>
          </div>
        </div>

        {/* Group Announcement */}
        <div className="group-info-section">
          <div className="info-item announcement-item">
            <div className="announcement-header">
              <span className="info-label">群公告</span>
              {isCreator && (
                <button className="edit-announcement-btn" onClick={handleEditAnnouncement}>编辑</button>
              )}
            </div>
            {group.announcement ? (
              <div className="announcement-content" onClick={() => setShowAnnouncementFull(true)}>
                <p className={`announcement-text ${showAnnouncementFull ? '' : 'truncated'}`}>
                  {group.announcement}
                </p>
                {group.announcement.length > 50 && !showAnnouncementFull && (
                  <span className="view-all">查看全部</span>
                )}
              </div>
            ) : (
              <div className="no-announcement">
                <span className="no-announcement-text">暂无群公告</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="group-info-section">
          <div className="info-item">
            <span className="info-label">消息免打扰</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={conversation?.isMuted || false}
                onChange={() => muteConversation(groupId)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="info-item">
            <span className="info-label">置顶聊天</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={conversation?.isPinned || false}
                onChange={() => pinConversation(groupId)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="group-info-section">
          <div className="info-item clickable" onClick={() => navigate(`/search-chat/${groupId}`)}>
            <span className="info-label">查找聊天记录</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Exit */}
        <div className="group-info-section">
          <button className="exit-group-btn" onClick={() => setShowExitConfirm(true)}>
            退出群聊
          </button>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="dialog-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-text">确定退出群聊？</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowExitConfirm(false)}>取消</button>
              <button className="confirm-ok" onClick={handleExitGroup}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Editor */}
      {showAnnouncementEditor && (
        <div className="dialog-overlay" onClick={() => setShowAnnouncementEditor(false)}>
          <div className="announcement-editor" onClick={(e) => e.stopPropagation()}>
            <div className="editor-header">
              <button className="editor-cancel" onClick={() => setShowAnnouncementEditor(false)}>取消</button>
              <span className="editor-title">群公告</span>
              <button className="editor-save" onClick={handleSaveAnnouncement}>完成</button>
            </div>
            <textarea
              className="announcement-textarea"
              placeholder="请输入群公告..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="dialog-overlay" onClick={() => { setShowAddMember(false); setSelectedMembers([]); }}>
          <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-member-header">
              <button className="editor-cancel" onClick={() => { setShowAddMember(false); setSelectedMembers([]); }}>取消</button>
              <span className="editor-title">选择联系人</span>
              <button
                className="editor-save"
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0}
              >
                确定({selectedMembers.length})
              </button>
            </div>
            <div className="add-member-list">
              {availableContacts.length > 0 ? (
                availableContacts.map(contact => (
                  <div
                    key={contact.userId}
                    className={`add-member-item ${selectedMembers.includes(contact.userId) ? 'selected' : ''}`}
                    onClick={() => toggleMemberSelection(contact.userId)}
                  >
                    <div className={`member-checkbox ${selectedMembers.includes(contact.userId) ? 'checked' : ''}`}>
                      {selectedMembers.includes(contact.userId) && '✓'}
                    </div>
                    <img src={contact.avatar} alt={contact.nickname} className="member-grid-avatar" />
                    <span className="member-select-name">{contact.nickname}</span>
                  </div>
                ))
              ) : (
                <div className="no-contacts-msg">所有联系人已在群中</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Group Dialog */}
      {showRenameDialog && (
        <div className="dialog-overlay" onClick={() => setShowRenameDialog(false)}>
          <div className="announcement-editor" onClick={(e) => e.stopPropagation()}>
            <div className="editor-header">
              <button className="editor-cancel" onClick={() => setShowRenameDialog(false)}>取消</button>
              <span className="editor-title">修改群名称</span>
              <button className="editor-save" onClick={handleConfirmRename} disabled={!newGroupName.trim()}>确定</button>
            </div>
            <input
              type="text"
              className="announcement-textarea"
              style={{ height: '48px', padding: '12px' }}
              placeholder="请输入新的群名称"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoPage;
