
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import AskQuestionModal from './AskQuestionModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useStore(state => state.currentUser);
  const notifications = useStore(state => state.notifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

  // Close user menu on route change
  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (path: string): React.CSSProperties => ({
    ...styles.navLink,
    ...(isActive(path) ? { color: 'var(--primary-color)', fontWeight: '500', position: 'relative' as const } : {}),
  });

  const navLinkClass = (path: string): string => {
    return isActive(path) ? 'nav-link-active' : '';
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.left}>
            <Link to="/" style={styles.logo}>知乎</Link>
            <nav style={styles.nav}>
              <Link to="/" style={navLinkStyle('/')} className={navLinkClass('/')}>首页</Link>
              <span style={styles.navLinkDisabled}>会员</span>
              <Link to="/discover" style={navLinkStyle('/discover')} className={navLinkClass('/discover')}>发现</Link>
              <Link to="/waiting" style={navLinkStyle('/waiting')} className={navLinkClass('/waiting')}>等你来答</Link>
            </nav>
          </div>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="搜索你感兴趣的内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </form>

          <div style={styles.right}>
            <button style={styles.askButton} onClick={() => setShowAskModal(true)}>提问</button>

            <Link to="/messages" style={styles.iconButton}>
              <span style={styles.icon}>🔔</span>
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </Link>

            <div style={styles.userMenuContainer} ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={styles.avatarButton}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.nickname}
                  style={styles.avatar}
                />
              </button>

              {showUserMenu && (
                <div style={styles.userMenu}>
                  <Link to={`/user/${currentUser.userId}`} style={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                    <img src={currentUser.avatar} alt="" style={styles.menuAvatar} />
                    <div>
                      <div style={styles.menuName}>{currentUser.nickname}</div>
                      <div style={styles.menuHeadline}>{currentUser.headline}</div>
                    </div>
                  </Link>
                  <div style={styles.divider} />
                  <Link to={`/user/${currentUser.userId}`} style={styles.menuLink} onClick={() => setShowUserMenu(false)}>我的主页</Link>
                  <Link to="/collections" style={styles.menuLink} onClick={() => setShowUserMenu(false)}>我的收藏</Link>
                  <Link to="/settings" style={styles.menuLink} onClick={() => setShowUserMenu(false)}>设置</Link>
                  <div style={styles.divider} />
                  <button style={styles.menuLink} onClick={() => { setShowUserMenu(false); showToastBriefly('退出登录功能暂不可用'); }}>退出登录</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAskModal && (
        <AskQuestionModal onClose={() => setShowAskModal(false)} />
      )}

      {showToast && <div className="toast">{toastMsg}</div>}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'var(--card-bg)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(26, 26, 26, 0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--primary-color)',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '16px',
  },
  navLink: {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background 0.2s, color 0.2s',
    position: 'relative' as const,
  },
  navLinkDisabled: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    padding: '4px 8px',
    cursor: 'default',
  },
  searchForm: {
    flex: 1,
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    fontSize: '14px',
    background: 'var(--bg-secondary)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  askButton: {
    padding: '8px 20px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  iconButton: {
    position: 'relative',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  icon: {
    fontSize: '20px',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#ec5e28',
    color: 'white',
    fontSize: '11px',
    padding: '2px 5px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center',
  },
  userMenuContainer: {
    position: 'relative',
  },
  avatarButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    background: 'none',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'var(--card-bg)',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    padding: '8px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  menuAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  menuName: {
    fontWeight: '500',
    fontSize: '14px',
  },
  menuHeadline: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  menuLink: {
    display: 'block',
    padding: '10px 16px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '8px 0',
  },
};

export default Header;
