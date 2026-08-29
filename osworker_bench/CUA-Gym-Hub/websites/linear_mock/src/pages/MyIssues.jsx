import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import IssueList from '../components/IssueList.jsx';
import './MyIssues.css';

const TABS = ['Assigned', 'Created', 'Subscribed', 'Activity'];

export default function MyIssues() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('Assigned');
  const currentUserId = state.currentUserId;
  const issues = state.issues || [];
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  function getTabIssues() {
    switch (activeTab) {
      case 'Assigned':
        return issues.filter(i => i.assigneeId === currentUserId);
      case 'Created':
        return [...issues.filter(i => i.creatorId === currentUserId)]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'Subscribed':
        return [...issues.filter(i => i.subscriberIds?.includes(currentUserId))]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'Activity':
        return [...issues.filter(i =>
          (i.assigneeId === currentUserId || i.creatorId === currentUserId || i.subscriberIds?.includes(currentUserId)) &&
          new Date(i.updatedAt) >= sevenDaysAgo
        )].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      default:
        return [];
    }
  }

  const tabIssues = getTabIssues();
  const groupBy = activeTab === 'Assigned' ? 'status' : 'none';

  return (
    <div className="my-issues-page">
      <div className="page-header">
        <h2 className="page-title">My Issues</h2>
      </div>
      <div className="my-issues-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`my-issues-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="my-issues-tab-count">
              {tab === 'Assigned' ? issues.filter(i => i.assigneeId === currentUserId).length
                : tab === 'Created' ? issues.filter(i => i.creatorId === currentUserId).length
                : tab === 'Subscribed' ? issues.filter(i => i.subscriberIds?.includes(currentUserId)).length
                : issues.filter(i =>
                    (i.assigneeId === currentUserId || i.creatorId === currentUserId || i.subscriberIds?.includes(currentUserId)) &&
                    new Date(i.updatedAt) >= sevenDaysAgo
                  ).length}
            </span>
          </button>
        ))}
      </div>
      <div className="my-issues-content">
        <IssueList
          issues={tabIssues}
          groupBy={groupBy}
          showProject={true}
          emptyMessage={`No issues in ${activeTab}`}
        />
      </div>
    </div>
  );
}
