import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const PASS_TYPES = [
  { id: 'pt1', name: '京津城际计次票', route: '北京南 ⇄ 天津', trainTypes: 'C字头列车', count: 20, price: 1000, unitPrice: 50, seatClass: '二等座', validity: '90天' },
  { id: 'pt2', name: '京津城际定期票', route: '北京南 ⇄ 天津', trainTypes: 'C字头列车', count: '不限次', price: 1800, unitPrice: null, seatClass: '二等座', validity: '30天' },
  { id: 'pt3', name: '沪杭高铁计次票', route: '上海虹桥 ⇄ 杭州东', trainTypes: 'G字头列车', count: 20, price: 1360, unitPrice: 68, seatClass: '二等座', validity: '90天' },
  { id: 'pt4', name: '沪杭高铁定期票', route: '上海虹桥 ⇄ 杭州东', trainTypes: 'G字头列车', count: '不限次', price: 2400, unitPrice: null, seatClass: '二等座', validity: '30天' },
  { id: 'pt5', name: '广深城际计次票', route: '广州南 ⇄ 深圳北', trainTypes: 'G/C字头列车', count: 20, price: 1400, unitPrice: 70, seatClass: '二等座', validity: '90天' },
  { id: 'pt6', name: '成渝高铁计次票', route: '成都东 ⇄ 重庆西', trainTypes: 'G字头列车', count: 20, price: 1800, unitPrice: 90, seatClass: '二等座', validity: '90天' },
];

export default function PassTicketsPage() {
  const { state, updateState, showToast } = useApp();
  const [selectedPass, setSelectedPass] = useState(null);

  const handlePurchase = (pass) => {
    updateState((prev) => ({
      ...prev,
      notifications: [
        {
          id: `notif_pass_${Date.now()}`,
          type: 'pass_purchase',
          title: '计次/定期票购买成功',
          content: `您已成功购买"${pass.name}"，有效期${pass.validity}，请在有效期内使用。`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedOrderId: null,
        },
        ...prev.notifications,
      ],
    }));
    setSelectedPass(null);
    showToast(`已购买"${pass.name}"`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>计次·定期票</h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>适合频繁出行的旅客，一次购买多次使用</div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {PASS_TYPES.map((pass) => (
                <div
                  key={pass.id}
                  style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, cursor: 'pointer', transition: 'border-color 0.2s', ':hover': { borderColor: 'var(--primary-blue)' } }}
                  onClick={() => setSelectedPass(pass)}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--primary-blue)' }}>{pass.name}</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                    <div>线路：{pass.route}</div>
                    <div>车型：{pass.trainTypes}</div>
                    <div>次数：{typeof pass.count === 'number' ? `${pass.count}次` : pass.count}</div>
                    <div>席别：{pass.seatClass}</div>
                    <div>有效期：{pass.validity}</div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 20 }}>¥{pass.price}</span>
                    {pass.unitPrice && <span style={{ fontSize: 12, color: '#999' }}>约¥{pass.unitPrice}/次</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 8, marginTop: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>使用说明</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666', lineHeight: 2 }}>
            <li>计次票在有效期内可使用指定次数，定期票在有效期内不限次数</li>
            <li>仅限本人使用，需持有效身份证件验票进站</li>
            <li>不支持跨线路使用，仅限指定区间</li>
            <li>过期未使用的次数不予退款</li>
            <li>购买后可在"我的订单"中查看使用详情</li>
          </ul>
        </div>
      </div>

      {/* Purchase confirmation modal */}
      {selectedPass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedPass(null)}>
          <div style={{ background: 'white', borderRadius: 8, width: 420, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>确认购买</h3>
            <div style={{ fontSize: 14, lineHeight: 2, color: '#333' }}>
              <div><strong>产品：</strong>{selectedPass.name}</div>
              <div><strong>线路：</strong>{selectedPass.route}</div>
              <div><strong>次数：</strong>{typeof selectedPass.count === 'number' ? `${selectedPass.count}次` : selectedPass.count}</div>
              <div><strong>有效期：</strong>{selectedPass.validity}</div>
              <div><strong>购买人：</strong>{state.user.name}</div>
              <div style={{ marginTop: 8 }}><strong>金额：</strong><span style={{ color: '#f5222d', fontSize: 20, fontWeight: 'bold' }}>¥{selectedPass.price}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPass(null)} style={{ padding: '8px 20px', border: '1px solid #d9d9d9', background: 'white', borderRadius: 4, cursor: 'pointer' }}>取消</button>
              <button onClick={() => handlePurchase(selectedPass)} style={{ padding: '8px 24px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>确认购买</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
