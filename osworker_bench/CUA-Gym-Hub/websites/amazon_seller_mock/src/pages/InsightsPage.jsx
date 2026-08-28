import React, { useMemo, useState } from 'react';

const PAGE_DATA = {
  'Order Reports': {
    icon: 'O',
    description: 'View and analyze order data across your Xmazon Seller account.',
    tabs: ['Summary', 'By Date', 'By Product'],
    rows: [
      { label: 'Total Orders (30 days)', value: '1,247' },
      { label: 'Units Shipped', value: '3,891' },
      { label: 'Average Order Value', value: '$42.18' },
      { label: 'Return Rate', value: '3.2%' },
      { label: 'Late Shipment Rate', value: '0.8%' },
    ],
  },
  'Advertising Reports': {
    icon: 'A',
    description: 'Advertising performance reports for sponsored campaigns.',
    tabs: ['Overview', 'By Campaign', 'By Keyword'],
    rows: [
      { label: 'Total Ad Spend (30 days)', value: '$2,340.00' },
      { label: 'Impressions', value: '184,209' },
      { label: 'Clicks', value: '5,127' },
      { label: 'Average CPC', value: '$0.46' },
      { label: 'ACoS', value: '18.4%' },
    ],
  },
  'Manage Stores': {
    icon: 'S',
    description: 'Manage your Amazon storefront and brand pages.',
    tabs: ['Storefront', 'Pages', 'Settings'],
    rows: [
      { label: 'Store Name', value: 'Evergreen Home Goods' },
      { label: 'Store Status', value: 'Published' },
      { label: 'Monthly Visitors', value: '12,480' },
      { label: 'Page Views', value: '34,210' },
      { label: 'Conversion Rate', value: '4.7%' },
    ],
  },
  'Growth Opportunities': {
    icon: 'G',
    description: 'Discover growth opportunities to expand your business on Amazon.',
    tabs: ['Recommendations', 'New Markets', 'Product Ideas'],
    rows: [
      { label: 'Category Expansion Score', value: '78/100' },
      { label: 'Suggested Categories', value: '5' },
      { label: 'Trending Keywords', value: '23' },
      { label: 'Competitor Gap Products', value: '12' },
      { label: 'Estimated Revenue Opportunity', value: '$8,400/mo' },
    ],
  },
  'Voice of the Customer': {
    icon: 'V',
    description: 'Customer feedback and sentiment analysis for your products.',
    tabs: ['Overview', 'Product Health', 'Recent Feedback'],
    rows: [
      { label: 'Customer Satisfaction', value: '4.3 / 5.0' },
      { label: 'Products Monitored', value: '24' },
      { label: 'Positive Feedback (30 days)', value: '89%' },
      { label: 'Issues Requiring Action', value: '3' },
      { label: 'Average Response Time', value: '4.2 hours' },
    ],
  },
  'B2B Central': {
    icon: 'B',
    description: 'Manage your Amazon Business sales and pricing.',
    tabs: ['Dashboard', 'Business Pricing', 'Quantity Discounts'],
    rows: [
      { label: 'B2B Revenue (30 days)', value: '$18,420' },
      { label: 'Business Customers', value: '142' },
      { label: 'Products with B2B Pricing', value: '18' },
      { label: 'Avg. B2B Order Value', value: '$129.72' },
      { label: 'Repeat Purchase Rate', value: '34%' },
    ],
  },
  'Brand Dashboard': {
    icon: 'B',
    description: 'Brand analytics and protection tools for registered brands.',
    tabs: ['Brand Health', 'Search Analytics', 'Protection'],
    rows: [
      { label: 'Brand Registry Status', value: 'Enrolled' },
      { label: 'Protected ASINs', value: '24' },
      { label: 'Brand Searches (30 days)', value: '8,210' },
      { label: 'Search-to-Purchase Rate', value: '6.1%' },
      { label: 'IP Violation Reports', value: '0' },
    ],
  },
};

export default function InsightsPage({ title }) {
  const data = PAGE_DATA[title] || PAGE_DATA['Order Reports'];
  const [activeTab, setActiveTab] = useState(data.tabs[0]);
  const rows = useMemo(() => data.rows.map((row, index) => ({
    ...row,
    trend: index % 2 === 0 ? 'Improving' : 'Stable',
  })), [data.rows]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>{title}</h1>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 4, background: '#232f3e', color: '#ff9900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>{data.icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{activeTab}</div>
          <div style={{ fontSize: 14, color: '#555' }}>{data.description}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e7e7e7', marginBottom: 16 }}>
        {data.tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#ff9900' : '#555',
              borderBottom: activeTab === tab ? '2px solid #ff9900' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">{activeTab} Metrics</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row.label}</td>
                <td style={{ fontWeight: 700 }}>{row.value}</td>
                <td><span className={row.trend === 'Improving' ? 'badge badge-success' : 'badge badge-info'}>{row.trend}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
