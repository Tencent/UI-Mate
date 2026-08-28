import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const SERVICES = [
  {
    category: '进站服务',
    icon: '🚉',
    items: [
      { name: '自助取票', desc: '凭身份证在自助取票机上快速取票', icon: '🎫', action: 'orders' },
      { name: '人工售票', desc: '车站窗口提供购票、改签、退票等服务', icon: '🪟', action: 'orders' },
      { name: '安检进站', desc: '请提前30分钟到达车站通过安检', icon: '🔍', action: 'info' },
      { name: '实名验证', desc: '持有效身份证件在闸机处验票进站', icon: '🪪', action: 'passengers' },
    ],
  },
  {
    category: '站内服务',
    icon: '🏛️',
    items: [
      { name: '候车室', desc: '提供普通候车室和VIP商务候车室', icon: '💺', action: 'info' },
      { name: '无障碍设施', desc: '配备轮椅坡道、无障碍卫生间、盲道等设施', icon: '♿', action: 'info' },
      { name: '母婴室', desc: '大型车站设有母婴候车专区', icon: '👶', action: 'info' },
      { name: '行李寄存', desc: '车站提供行李临时寄存服务', icon: '🧳', action: 'info' },
      { name: '充电服务', desc: '候车区域提供免费充电设施', icon: '🔋', action: 'info' },
    ],
  },
  {
    category: '列车服务',
    icon: '🚄',
    items: [
      { name: '餐车服务', desc: '高铁/动车组设有餐车，提供餐食和饮品', icon: '🍱', action: 'food-order' },
      { name: '列车WiFi', desc: '部分高铁列车提供免费WiFi服务', icon: '📶', action: 'info' },
      { name: '座位调整', desc: '列车运行中可向乘务员申请座位调换', icon: '💺', action: 'info' },
      { name: '应急服务', desc: '车上配备急救药品和医疗设备', icon: '🚑', action: 'info' },
    ],
  },
  {
    category: '出站服务',
    icon: '🚪',
    items: [
      { name: '出站引导', desc: '车站出口设有地铁、公交、出租车指引标识', icon: '🗺️', action: 'info' },
      { name: '接驳服务', desc: '部分车站提供机场大巴、城市公交接驳', icon: '🚌', action: 'info' },
      { name: '遗失物品', desc: '出站后发现遗失物品可联系12306客服', icon: '📦', action: 'service-center' },
    ],
  },
];

export default function StationServicesPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (item) => {
    setActiveItem(item.name);
    setTimeout(() => setActiveItem(null), 300);

    if (item.action === 'orders') {
      navigate('/orders');
    } else if (item.action === 'passengers') {
      navigate('/passengers');
    } else if (item.action === 'food-order') {
      navigate('/food-order');
    } else if (item.action === 'service-center') {
      navigate('/service-center');
    } else {
      showToast(`${item.name}：${item.desc}`, 'info');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>站车服务</h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>了解车站与列车上的各项便民服务，点击可查看详情</div>
          </div>

          <div style={{ padding: '16px 24px' }}>
            {SERVICES.map((section) => (
              <div key={section.category} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, color: 'var(--primary-blue)', borderBottom: '2px solid var(--primary-blue)', paddingBottom: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{section.icon}</span>
                  {section.category}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => handleItemClick(item)}
                      style={{
                        border: '1px solid #e8e8e8',
                        borderRadius: 6,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: activeItem === item.name ? 'var(--light-blue-bg)' : 'white',
                        boxShadow: activeItem === item.name ? '0 2px 8px rgba(43,108,176,0.15)' : 'none',
                        transform: activeItem === item.name ? 'translateY(-1px)' : 'none',
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-blue)';
                        e.currentTarget.style.background = 'var(--light-blue-bg)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(43,108,176,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e8e8e8';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ fontWeight: 'bold', fontSize: 14, color: 'var(--primary-blue)' }}>{item.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
