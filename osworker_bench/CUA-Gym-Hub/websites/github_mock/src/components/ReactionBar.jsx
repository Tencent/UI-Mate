
    import React, { useState } from 'react';
    import { useStore } from '../lib/store';

    const REACTION_EMOJIS = {
      '+1': '👍',
      '-1': '👎',
      'heart': '❤️',
      'rocket': '🚀',
      'eyes': '👀',
    };

    export default function ReactionBar({ reactions, targetType, targetId, issueId }) {
      const { state, dispatch, actions } = useStore();
      const [showPicker, setShowPicker] = useState(false);

      const reactionEntries = Object.entries(REACTION_EMOJIS);
      const currentReactions = reactions || {};

      const handleToggleReaction = (key) => {
        const count = currentReactions[key] || 0;
        if (count > 0) {
          dispatch({
            type: actions.REMOVE_REACTION,
            payload: {
              targetType,
              targetId,
              issueId,
              reactionKey: key,
              userId: state.currentUser.id,
            }
          });
        } else {
          dispatch({
            type: actions.ADD_REACTION,
            payload: {
              targetType,
              targetId,
              issueId,
              reactionKey: key,
              userId: state.currentUser.id,
            }
          });
        }
        setShowPicker(false);
      };

      const activeReactions = reactionEntries.filter(([key]) => (currentReactions[key] || 0) > 0);

      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeReactions.map(([key, emoji]) => (
            <button
              key={key}
              onClick={() => handleToggleReaction(key)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-xithub-border bg-[#21262d] hover:bg-[#30363d] hover:border-xithub-accent text-xs transition-colors"
            >
              <span>{emoji}</span>
              <span className="text-xithub-text font-medium">{currentReactions[key]}</span>
            </button>
          ))}

          {/* Add reaction button */}
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-xithub-border bg-[#21262d] hover:bg-[#30363d] hover:border-xithub-accent text-xs text-xithub-muted hover:text-xithub-text transition-colors"
              title="Add reaction"
            >
              +
            </button>
            {showPicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 p-1.5 flex gap-1">
                {reactionEntries.map(([key, emoji]) => (
                  <button
                    key={key}
                    onClick={() => handleToggleReaction(key)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#30363d] text-base transition-colors"
                    title={key}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
