
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 7) return `${days}天前`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatChatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) return timeStr;
  if (isYesterday) return `昨天 ${timeStr}`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日 ${timeStr}`;
};

export const shouldShowTime = (currentMsg, previousMsg) => {
  if (!previousMsg) return true;
  
  const current = new Date(currentMsg.timestamp);
  const previous = new Date(previousMsg.timestamp);
  const diff = current - previous;
  
  return diff > 300000;
};

export const groupContactsByLetter = (contacts) => {
  const grouped = {};
  
  contacts.forEach(contact => {
    const firstChar = contact.nickname.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(contact);
  });

  return Object.keys(grouped)
    .sort()
    .reduce((acc, key) => {
      acc[key] = grouped[key].sort((a, b) => 
        a.nickname.localeCompare(b.nickname, 'zh-CN')
      );
      return acc;
    }, {});
};
