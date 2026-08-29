import React from 'react';
import Header from '../components/Header';

export default function ServiceCenterPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>铁路客户服务中心</h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>全国铁路客户服务热线：Y2306</div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>客服热线</h3>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--primary-blue)' }}>Y2306</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>服务时间：每日06:00-23:00</div>
              </div>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>在线客服</h3>
                <div style={{ fontSize: 14, color: '#666' }}>登录12306网站或APP，进入"在线客服"获取帮助</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>服务时间：每日06:00-23:00</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>服务内容</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {['购票咨询', '退票改签', '列车正晚点', '车票遗失', '投诉建议', '行李查询', '乘车规定', '无障碍服务', '国际列车'].map((item) => (
                <div key={item} style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '12px 16px', textAlign: 'center', fontSize: 14 }}>
                  {item}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, margin: '24px 0 12px' }}>办公地址</h3>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 2 }}>
              <div>中国铁道科学研究院集团有限公司</div>
              <div>地址：北京市海淀区大柳树路2号</div>
              <div>邮编：100081</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
