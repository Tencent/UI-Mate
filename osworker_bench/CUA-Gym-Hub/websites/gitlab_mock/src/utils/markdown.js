function escapeAttr(value) {
  return String(value || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderMarkdown(text, options = {}) {
  if (!text) return '';
  const resolveLink = typeof options.resolveLink === 'function' ? options.resolveLink : href => href;
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) => `<a href="${escapeAttr(resolveLink(href))}">${label}</a>`)
    .replace(/^(?!<[h1-6ulpbp])(.*\S.*)$/gm, '<p>$1</p>');
  return html;
}
