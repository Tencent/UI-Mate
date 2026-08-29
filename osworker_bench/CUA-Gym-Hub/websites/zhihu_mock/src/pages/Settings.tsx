
import React, { useState } from 'react';
import { useStore } from '../store/useStore';

const Settings: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const updateUserProfile = useStore(state => state.updateUserProfile);

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy' | 'notification'>('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Profile editing state
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [description, setDescription] = useState(currentUser.description);
  const [location, setLocation] = useState(currentUser.location);
  const [industry, setIndustry] = useState(currentUser.industry);

  // Account settings state
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [showFollowings, setShowFollowings] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);

  const showToastBriefly = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      showToastBriefly('昵称不能为空');
      return;
    }
    updateUserProfile({
      nickname: nickname.trim(),
      headline: headline.trim(),
      description: description.trim(),
      location: location.trim(),
      industry: industry.trim(),
    });
    showToastBriefly('个人资料已保存');
  };

  const renderProfile = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>个人资料</h2>

      <div style={styles.avatarRow}>
        <img src={currentUser.avatar} alt="" style={styles.avatar} />
        <div style={styles.avatarInfo}>
          <div style={styles.avatarLabel}>头像</div>
          <div style={styles.avatarHint}>头像由 DiceBear 自动生成</div>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>昵称 <span style={styles.required}>*</span></label>
        <input
          style={styles.input}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="请输入昵称"
          maxLength={30}
        />
        <div style={styles.hint}>{nickname.length}/30</div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>一句话介绍</label>
        <input
          style={styles.input}
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          placeholder="例：产品经理 / 科技爱好者"
          maxLength={60}
        />
        <div style={styles.hint}>{headline.length}/60</div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>个人简介</label>
        <textarea
          style={{ ...styles.input, minHeight: '100px', resize: 'vertical' as const }}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="介绍一下自己..."
          maxLength={500}
        />
        <div style={styles.hint}>{description.length}/500</div>
      </div>

      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>所在地</label>
          <input
            style={styles.input}
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="例：北京"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>所在行业</label>
          <select
            style={styles.select}
            value={industry}
            onChange={e => setIndustry(e.target.value)}
          >
            {['互联网', '金融', '教育', '医疗', '法律', '设计', '科技', '媒体', '自媒体', '制造业', '其他'].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.saveBtn}
          onClick={handleSaveProfile}
        >
          保存修改
        </button>
        <button
          style={styles.cancelBtn}
          onClick={() => {
            setNickname(currentUser.nickname);
            setHeadline(currentUser.headline);
            setDescription(currentUser.description);
            setLocation(currentUser.location);
            setIndustry(currentUser.industry);
          }}
        >
          取消
        </button>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>账号安全</h2>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>手机号</div>
          <div style={styles.settingValue}>138****8888（已绑定）</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('此功能暂不可用')}>修改</button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>邮箱</div>
          <div style={styles.settingValue}>zhangxiaofan@example.com（已验证）</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('此功能暂不可用')}>修改</button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>登录密码</div>
          <div style={styles.settingValue}>已设置</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('此功能暂不可用')}>修改</button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>两步验证</div>
          <div style={styles.settingValue}>未开启</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('此功能暂不可用')}>开启</button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>隐私设置</h2>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>公开关注列表</div>
          <div style={styles.settingDesc}>其他用户可以看到你关注了哪些人</div>
        </div>
        <button
          style={{ ...styles.toggle, ...(showFollowings ? styles.toggleOn : styles.toggleOff) }}
          onClick={() => { setShowFollowings(!showFollowings); showToastBriefly('设置已保存'); }}
        >
          <span style={{ ...styles.toggleThumb, ...(showFollowings ? styles.toggleThumbOn : {}) }} />
        </button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>公开粉丝列表</div>
          <div style={styles.settingDesc}>其他用户可以看到你的粉丝</div>
        </div>
        <button
          style={{ ...styles.toggle, ...(showFollowers ? styles.toggleOn : styles.toggleOff) }}
          onClick={() => { setShowFollowers(!showFollowers); showToastBriefly('设置已保存'); }}
        >
          <span style={{ ...styles.toggleThumb, ...(showFollowers ? styles.toggleThumbOn : {}) }} />
        </button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>匿名回答</div>
          <div style={styles.settingDesc}>默认以匿名方式回答问题</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('设置已保存')}>关闭</button>
      </div>
    </div>
  );

  const renderNotification = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>通知设置</h2>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>邮件通知</div>
          <div style={styles.settingDesc}>通过邮件接收消息通知</div>
        </div>
        <button
          style={{ ...styles.toggle, ...(emailNotif ? styles.toggleOn : styles.toggleOff) }}
          onClick={() => { setEmailNotif(!emailNotif); showToastBriefly('设置已保存'); }}
        >
          <span style={{ ...styles.toggleThumb, ...(emailNotif ? styles.toggleThumbOn : {}) }} />
        </button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>推送通知</div>
          <div style={styles.settingDesc}>通过应用推送接收消息通知</div>
        </div>
        <button
          style={{ ...styles.toggle, ...(pushNotif ? styles.toggleOn : styles.toggleOff) }}
          onClick={() => { setPushNotif(!pushNotif); showToastBriefly('设置已保存'); }}
        >
          <span style={{ ...styles.toggleThumb, ...(pushNotif ? styles.toggleThumbOn : {}) }} />
        </button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>赞同通知</div>
          <div style={styles.settingDesc}>有人赞同你的回答时通知你</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('设置已保存')}>已开启</button>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingName}>评论通知</div>
          <div style={styles.settingDesc}>有人评论你的内容时通知你</div>
        </div>
        <button style={styles.settingBtn} onClick={() => showToastBriefly('设置已保存')}>已开启</button>
      </div>
    </div>
  );

  const tabs: { key: 'profile' | 'account' | 'privacy' | 'notification'; label: string }[] = [
    { key: 'profile', label: '个人资料' },
    { key: 'account', label: '账号安全' },
    { key: 'privacy', label: '隐私设置' },
    { key: 'notification', label: '通知设置' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              style={{ ...styles.navItem, ...(activeTab === tab.key ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={styles.content}>
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'account' && renderAccount()}
          {activeTab === 'privacy' && renderPrivacy()}
          {activeTab === 'notification' && renderNotification()}
        </div>
      </div>

      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
    paddingTop: '20px',
    paddingBottom: '40px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '24px',
  },
  nav: {
    background: 'var(--card-bg)',
    borderRadius: '4px',
    padding: '8px 0',
    alignSelf: 'start',
    border: '1px solid var(--border-color)',
  },
  navItem: {
    display: 'block',
    width: '100%',
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    fontSize: '14px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    color: 'var(--primary-color)',
    fontWeight: '500',
    background: 'var(--tag-bg)',
    borderLeft: '3px solid var(--primary-color)',
  },
  content: {
    background: 'var(--card-bg)',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  section: {
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  avatarHint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  field: {
    marginBottom: '20px',
    flex: 1,
  },
  fieldRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  required: {
    color: 'var(--danger-color)',
    marginLeft: '2px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    outline: 'none',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    textAlign: 'right' as const,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  saveBtn: {
    padding: '10px 24px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  settingInfo: {
    flex: 1,
    marginRight: '16px',
  },
  settingName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  settingValue: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  settingDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  settingBtn: {
    padding: '6px 16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  toggle: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  toggleOn: {
    background: 'var(--primary-color)',
  },
  toggleOff: {
    background: '#ccc',
  },
  toggleThumb: {
    position: 'absolute' as const,
    top: '3px',
    left: '3px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'white',
    transition: 'left 0.2s',
  },
  toggleThumbOn: {
    left: '23px',
  },
};

export default Settings;
