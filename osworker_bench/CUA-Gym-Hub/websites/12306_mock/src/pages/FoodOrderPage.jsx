import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const FOOD_CATEGORIES = ['热门套餐', '地方特产', '饮品小食', '素食专区'];

const FOOD_ITEMS = [
  { id: 'f1', name: '高铁盒饭（红烧牛肉）', category: '热门套餐', price: 45, desc: '精选牛肉搭配时令蔬菜，米饭充足', station: '北京南站' },
  { id: 'f2', name: '高铁盒饭（宫保鸡丁）', category: '热门套餐', price: 40, desc: '经典川菜风味，鸡丁滑嫩多汁', station: '北京南站' },
  { id: 'f3', name: '高铁盒饭（鱼香肉丝）', category: '热门套餐', price: 40, desc: '四川经典口味，咸甜适中', station: '上海虹桥站' },
  { id: 'f4', name: '德州扒鸡', category: '地方特产', price: 68, desc: '山东经典特产，传承百年工艺', station: '济南西站' },
  { id: 'f5', name: '武汉热干面', category: '地方特产', price: 25, desc: '地道武汉口味，芝麻酱香浓郁', station: '武汉站' },
  { id: 'f6', name: '长沙臭豆腐', category: '地方特产', price: 20, desc: '正宗长沙小吃，外酥里嫩', station: '长沙南站' },
  { id: 'f7', name: '矿泉水', category: '饮品小食', price: 5, desc: '550ml瓶装纯净水', station: '全线供应' },
  { id: 'f8', name: '热咖啡', category: '饮品小食', price: 15, desc: '现磨美式/拿铁可选', station: '全线供应' },
  { id: 'f9', name: '坚果零食包', category: '饮品小食', price: 18, desc: '混合坚果+果干，健康美味', station: '全线供应' },
  { id: 'f10', name: '素食便当', category: '素食专区', price: 35, desc: '时令蔬菜搭配，清淡健康', station: '全线供应' },
  { id: 'f11', name: '素三鲜水饺', category: '素食专区', price: 28, desc: '芹菜香菇鸡蛋馅，皮薄馅大', station: '全线供应' },
];

export default function FoodOrderPage() {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('热门套餐');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const filteredItems = FOOD_ITEMS.filter((f) => f.category === activeCategory);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`已添加 ${item.name}`, 'success');
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      return newQty <= 0 ? null : { ...c, qty: newQty };
    }).filter(Boolean));
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      showToast('请先添加餐品', 'warning');
      return;
    }
    updateState((prev) => ({
      ...prev,
      notifications: [
        {
          id: `notif_food_${Date.now()}`,
          type: 'food_order',
          title: '订餐成功',
          content: `您已成功订购${totalItems}份餐品，合计¥${totalPrice}，将在列车上为您送达。`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedOrderId: null,
        },
        ...prev.notifications,
      ],
    }));
    setCart([]);
    setShowCart(false);
    showToast(`订餐成功！共${totalItems}件商品，合计¥${totalPrice}`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>高铁餐饮·特产</h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>在线预订，列车送达</div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', padding: '0 16px' }}>
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'none', border: 'none', padding: '14px 20px', fontSize: 14, cursor: 'pointer',
                  color: activeCategory === cat ? 'var(--primary-blue)' : '#666',
                  borderBottom: activeCategory === cat ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  fontWeight: activeCategory === cat ? 'bold' : 'normal',
                  marginBottom: -1,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food items */}
          <div style={{ padding: '16px' }}>
            {filteredItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 15 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{item.desc}</div>
                  <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>供应站点：{item.station}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 16 }}>¥{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
                  >
                    添加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart bar */}
        {cart.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
            <div>
              <span style={{ fontSize: 14 }}>已选 <strong>{totalItems}</strong> 件</span>
              <span style={{ marginLeft: 16, color: '#f5222d', fontWeight: 'bold', fontSize: 18 }}>¥{totalPrice}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCart(true)} style={{ background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>查看购物车</button>
              <button onClick={handleSubmitOrder} style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '8px 24px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>提交订单</button>
            </div>
          </div>
        )}
      </div>

      {/* Cart modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCart(false)}>
          <div style={{ background: 'white', borderRadius: 8, width: 400, maxHeight: '70vh', overflow: 'auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>购物车</h3>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#f5222d' }}>¥{item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, border: '1px solid #d9d9d9', background: 'white', borderRadius: 4, cursor: 'pointer' }}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, border: '1px solid #d9d9d9', background: 'white', borderRadius: 4, cursor: 'pointer' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#f5222d', cursor: 'pointer', fontSize: 13 }}>删除</button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
              <span style={{ fontWeight: 'bold', fontSize: 16 }}>合计：<span style={{ color: '#f5222d' }}>¥{totalPrice}</span></span>
              <button onClick={handleSubmitOrder} style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '8px 24px', borderRadius: 4, cursor: 'pointer' }}>提交订单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
