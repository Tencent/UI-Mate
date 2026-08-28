
    import React from 'react';
    import { Link } from 'react-router-dom';
    import Markdown from 'react-markdown';
    import { useStore } from '../lib/store';

    function processTextWithLinks(text, ownerUsername, repoName, issues, pullRequests, users) {
      if (!text || typeof text !== 'string') return text;

      // Split text into parts, keeping delimiters
      const parts = [];
      let lastIndex = 0;
      // Match #N (issue/PR reference) or @username (mention)
      const regex = /(#(\d+))|(@([a-zA-Z0-9_-]+))/g;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
          parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }

        if (match[1]) {
          // #N reference
          const num = parseInt(match[2], 10);
          const issue = issues.find(i => i.number === num);
          const pr = pullRequests.find(p => p.number === num);
          if (issue) {
            parts.push({
              type: 'issueRef',
              number: num,
              path: `/${ownerUsername}/${repoName}/issues/${num}`,
              title: issue.title,
              content: match[0],
            });
          } else if (pr) {
            parts.push({
              type: 'prRef',
              number: num,
              path: `/${ownerUsername}/${repoName}/pulls/${num}`,
              title: pr.title,
              content: match[0],
            });
          } else {
            parts.push({ type: 'text', content: match[0] });
          }
        } else if (match[3]) {
          // @username mention
          const username = match[4];
          const user = users.find(u => u.username === username);
          if (user) {
            parts.push({
              type: 'mention',
              username,
              path: `/profile/${username}`,
              content: match[0],
            });
          } else {
            parts.push({ type: 'text', content: match[0] });
          }
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
      }

      return parts;
    }

    function LinkedText({ children, ownerUsername, repoName, issues, pullRequests, users }) {
      if (typeof children !== 'string') return children;

      const parts = processTextWithLinks(children, ownerUsername, repoName, issues, pullRequests, users);

      if (!Array.isArray(parts)) return children;

      return parts.map((part, i) => {
        if (part.type === 'issueRef') {
          return (
            <Link
              key={i}
              to={part.path}
              className="text-xithub-accent hover:underline"
              title={part.title}
            >
              {part.content}
            </Link>
          );
        }
        if (part.type === 'prRef') {
          return (
            <Link
              key={i}
              to={part.path}
              className="text-xithub-accent hover:underline"
              title={part.title}
            >
              {part.content}
            </Link>
          );
        }
        if (part.type === 'mention') {
          return (
            <Link
              key={i}
              to={part.path}
              className="text-xithub-accent font-semibold hover:underline"
            >
              {part.content}
            </Link>
          );
        }
        return <React.Fragment key={i}>{part.content}</React.Fragment>;
      });
    }

    export default function LinkedMarkdown({ children, repoId }) {
      const { state } = useStore();

      if (!children) return null;

      // Find repo context
      const repo = state.repos.find(r => r.id === repoId);
      const owner = repo ? state.users.find(u => u.id === repo.ownerId) : null;
      const ownerUsername = owner?.username || '';
      const repoName = repo?.name || '';

      // Get issues/PRs for this repo
      const issues = state.issues.filter(i => i.repoId === repoId);
      const pullRequests = state.pullRequests.filter(p => p.repoId === repoId);
      const users = state.users;

      return (
        <Markdown
          components={{
            // Override text rendering in paragraphs, list items, etc.
            p: ({ children: pChildren, ...props }) => (
              <p {...props}>
                {React.Children.map(pChildren, child => {
                  if (typeof child === 'string') {
                    return (
                      <LinkedText
                        ownerUsername={ownerUsername}
                        repoName={repoName}
                        issues={issues}
                        pullRequests={pullRequests}
                        users={users}
                      >
                        {child}
                      </LinkedText>
                    );
                  }
                  return child;
                })}
              </p>
            ),
            li: ({ children: liChildren, ...props }) => (
              <li {...props}>
                {React.Children.map(liChildren, child => {
                  if (typeof child === 'string') {
                    return (
                      <LinkedText
                        ownerUsername={ownerUsername}
                        repoName={repoName}
                        issues={issues}
                        pullRequests={pullRequests}
                        users={users}
                      >
                        {child}
                      </LinkedText>
                    );
                  }
                  return child;
                })}
              </li>
            ),
            td: ({ children: tdChildren, ...props }) => (
              <td {...props}>
                {React.Children.map(tdChildren, child => {
                  if (typeof child === 'string') {
                    return (
                      <LinkedText
                        ownerUsername={ownerUsername}
                        repoName={repoName}
                        issues={issues}
                        pullRequests={pullRequests}
                        users={users}
                      >
                        {child}
                      </LinkedText>
                    );
                  }
                  return child;
                })}
              </td>
            ),
          }}
        >
          {children}
        </Markdown>
      );
    }
