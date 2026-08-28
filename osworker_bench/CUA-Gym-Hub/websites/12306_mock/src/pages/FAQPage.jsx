import React, { useState } from 'react';
import Header from '../components/Header';

const FAQ_DATA = [
  {
    category: '购票相关',
    questions: [
      { q: '如何购买火车票？', a: '登录12306网站或APP，选择出发地、到达地和出发日期，查询可用车次后选择座席，添加乘车人信息，提交订单并在30分钟内完成支付即可。' },
      { q: '每次最多能买几张票？', a: '每次最多可以购买5张同一车次的车票，一个身份证在同一车次只能购买一张车票。' },
      { q: '可以提前多少天购票？', a: '互联网购票可以提前15天（含当天），火车站窗口和代售点可以提前15天购买。' },
      { q: '学生票如何购买？', a: '已完成学生资质核验的旅客，在购票时勾选"学生票"即可享受学生票优惠。学生票仅限普通硬座、普通软座、二等座，享受75折优惠。' },
      { q: '儿童票如何购买？', a: '身高1.2米以下的儿童可免票乘车（需有成人陪同），1.2-1.5米的儿童需购买儿童票（半价），1.5米以上需购买全价票。' },
    ],
  },
  {
    category: '退票改签',
    questions: [
      { q: '退票手续费是多少？', a: '开车前8天以上退票免手续费；开车前48小时至8天收取票价5%手续费；24至48小时收取10%；24小时以内收取20%。' },
      { q: '改签有什么限制？', a: '改签只能改一次，且只能改签为同日或更晚日期的车次。高铁票改签需在开车前办理，普速列车需在开车前2小时办理。' },
      { q: '退票后多久到账？', a: '网上购票退票后，票款将在15个工作日内退回原支付账户。车站窗口退票当场退款。' },
    ],
  },
  {
    category: '乘车出行',
    questions: [
      { q: '需要提前多久到站？', a: '高铁/动车建议提前30-45分钟到站，普速列车建议提前60分钟到站。节假日期间建议适当提早。' },
      { q: '可以携带多少行李？', a: '成人旅客免费携带品重量不超过20千克，儿童（含免费乘车儿童）10千克。长度不超过130厘米，物品外部尺寸之和不超过160厘米。' },
      { q: '哪些物品不能携带？', a: '易燃易爆品、管制刀具、枪支弹药等危险品禁止携带。酒精类饮品限量携带，详见铁路安检规定。' },
      { q: '可以中途下车吗？', a: '持票旅客可以在中途站下车，但继续乘车须另行购票。' },
    ],
  },
  {
    category: '候补购票',
    questions: [
      { q: '什么是候补购票？', a: '当所需车次、席别无票时，可以提交候补订单并预付全额票款。当有旅客退票或系统释放余票时，系统会自动为您购票。' },
      { q: '候补购票成功率高吗？', a: '候补购票按提交时间排队，成功率取决于退票情况。热门线路和节假日期间成功率相对较低。' },
      { q: '候补未成功怎么办？', a: '候补订单截止时间前未兑现的，系统将自动退回预付票款，一般15个工作日内到账。' },
    ],
  },
];

export default function FAQPage() {
  const [expandedQ, setExpandedQ] = useState(null);
  const [activeCategory, setActiveCategory] = useState('购票相关');

  const currentFAQ = FAQ_DATA.find((c) => c.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>常见问题</h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>解答您在购票和出行中遇到的问题</div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', padding: '0 16px' }}>
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.category}
                onClick={() => { setActiveCategory(cat.category); setExpandedQ(null); }}
                style={{
                  background: 'none', border: 'none', padding: '14px 20px', fontSize: 14, cursor: 'pointer',
                  color: activeCategory === cat.category ? 'var(--primary-blue)' : '#666',
                  borderBottom: activeCategory === cat.category ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  fontWeight: activeCategory === cat.category ? 'bold' : 'normal',
                  marginBottom: -1,
                }}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div style={{ padding: '16px 24px' }}>
            {currentFAQ && currentFAQ.questions.map((item, i) => {
              const key = `${activeCategory}-${i}`;
              const isExpanded = expandedQ === key;
              return (
                <div key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <div
                    onClick={() => setExpandedQ(isExpanded ? null : key)}
                    style={{ padding: '16px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: 15 }}>{item.q}</span>
                    <span style={{ color: '#999', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 0 16px', fontSize: 14, color: '#666', lineHeight: 1.8 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
