import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const TRAVEL_ROUTES = [
  { id: 't1', name: '北京故宫长城3日游', dest: '北京', price: 1280, duration: '3天2晚', desc: '故宫+长城+颐和园，高铁往返', highlights: ['故宫博物院', '八达岭长城', '颐和园', '天安门广场'] },
  { id: 't2', name: '上海迪士尼欢乐2日游', dest: '上海', price: 980, duration: '2天1晚', desc: '迪士尼乐园畅玩，高铁直达', highlights: ['上海迪士尼乐园', '外滩夜景', '城隍庙小吃'] },
  { id: 't3', name: '杭州西湖风情2日游', dest: '杭州', price: 680, duration: '2天1晚', desc: '西湖+灵隐寺+龙井茶园', highlights: ['西湖游船', '灵隐寺', '龙井村', '宋城千古情'] },
  { id: 't4', name: '成都美食文化3日游', dest: '成都', price: 1580, duration: '3天2晚', desc: '大熊猫+宽窄巷子+美食', highlights: ['大熊猫繁育基地', '宽窄巷子', '锦里', '武侯祠'] },
  { id: 't5', name: '西安古都历史3日游', dest: '西安', price: 1380, duration: '3天2晚', desc: '兵马俑+华清池+古城墙', highlights: ['秦始皇兵马俑', '华清池', '大雁塔', '回民街'] },
  { id: 't6', name: '广州深圳双城4日游', dest: '广州/深圳', price: 1880, duration: '4天3晚', desc: '广州塔+深圳湾+美食之旅', highlights: ['广州塔', '沙面', '世界之窗', '深圳湾公园'] },
];

export default function TravelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1677ff, #36cfc9)', color: 'white', padding: '24px' }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>铁路旅游</h2>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>高铁直达，精选旅游线路</div>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {TRAVEL_ROUTES.map((route) => (
                <div key={route.id} style={{ border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                  <div style={{ background: '#fafafa', padding: '16px 16px 12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{route.name}</div>
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{route.desc}</div>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      <span>目的地：{route.dest}</span>
                      <span style={{ marginLeft: 16 }}>行程：{route.duration}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {route.highlights.map((h) => (
                        <span key={h} style={{ fontSize: 12, background: '#e6f4ff', color: '#1677ff', padding: '2px 8px', borderRadius: 3 }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#999' }}>￥</span>
                        <span style={{ fontSize: 22, fontWeight: 'bold', color: '#f5222d' }}>{route.price}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>/人起</span>
                      </div>
                      <button
                        onClick={() => navigate('/')}
                        style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
