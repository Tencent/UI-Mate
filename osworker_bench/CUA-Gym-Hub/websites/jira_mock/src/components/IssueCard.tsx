import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Issue, User } from '../types';
import { AlertCircle, CheckCircle2, Bookmark, ArrowUp, ArrowDown, GripVertical, KeyRound } from 'lucide-react';
import { clsx } from 'clsx';

interface IssueCardProps {
  issue: Issue;
  index: number;
  users: User[];
  onClick: (issue: Issue) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, index, users, onClick }) => {
  const assignee = users.find(u => u.id === issue.assigneeId);
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Highest': return <ArrowUp className="text-xira-red" size={16} />;
      case 'High': return <ArrowUp className="text-xira-red" size={16} />;
      case 'Medium': return <ArrowUp className="text-xira-yellow" size={16} />;
      case 'Low': return <ArrowDown className="text-xira-green" size={16} />;
      case 'Lowest': return <ArrowDown className="text-xira-blue" size={16} />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug': return <AlertCircle className="text-xira-red" size={16} />;
      case 'Story': return <Bookmark className="text-xira-green" size={16} fill="currentColor" />;
      case 'Task': return <CheckCircle2 className="text-xira-blue" size={16} />;
      case 'Epic': return <AlertCircle className="text-purple-600" size={16} />;
      case 'Access Request': return <KeyRound className="text-xira-blue" size={16} />;
      default: return null;
    }
  };

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(issue)}
          className={clsx(
            "bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 hover:bg-gray-50 transition-colors group cursor-pointer",
            snapshot.isDragging && "shadow-lg rotate-1"
          )}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-xira-subtext hover:underline">{issue.key}</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} className="text-gray-400" />
            </div>
          </div>
          
          <p className="text-xira-text text-sm mb-3 line-clamp-2">{issue.summary}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(issue.type)}
              {getPriorityIcon(issue.priority)}
            </div>
            
            <div className="flex items-center gap-2">
              {issue.storyPoints && (
                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {issue.storyPoints}
                </span>
              )}
              {assignee ? (
                <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border border-white" title={assignee.name} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">?</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
