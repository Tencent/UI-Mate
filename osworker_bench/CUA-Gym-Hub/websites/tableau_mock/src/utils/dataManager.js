const BASE_KEY = 'tableau_mock_state'
const BASE_INITIAL_KEY = 'tableau_mock_initial_state'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) sessionStorage.setItem('tableau_sid', sid)
  return sessionStorage.getItem('tableau_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state'
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.has_custom_state && data.stored_state) return data.stored_state
  } catch (e) {
    console.error('fetchCustomState error:', e)
  }
  return null
}

export const createInitialData = () => {
  const PALETTE = ['#4E79A7','#F28E2B','#E15759','#76B7B2','#59A14F','#EDC948','#B07AA1','#FF9DA7','#9C755F','#BAB0AC']

  return {
    currentUser: {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'Creator',
      avatar: null,
      siteRole: 'Site Administrator Creator',
      lastLogin: '2026-04-10T09:15:00Z'
    },
    site: {
      name: 'Company Analytics',
      url: 'company-analytics',
      userCount: 47,
      groupCount: 8,
      storageUsed: '12.4 GB',
      storageLimit: '100 GB'
    },
    projects: [
      { id: 'proj-1', name: 'Sales', description: 'Sales team analytics and dashboards', owner: 'Sarah Chen', parentId: null, createdAt: '2025-06-15', workbookCount: 3, datasourceCount: 2, permissions: 'Publisher' },
      { id: 'proj-2', name: 'Marketing', description: 'Marketing campaign performance', owner: 'James Wilson', parentId: null, createdAt: '2025-08-20', workbookCount: 2, datasourceCount: 1, permissions: 'Publisher' },
      { id: 'proj-3', name: 'Finance', description: 'Financial reporting and forecasting', owner: 'Maria Garcia', parentId: null, createdAt: '2025-03-10', workbookCount: 2, datasourceCount: 1, permissions: 'Viewer' },
      { id: 'proj-4', name: 'Operations', description: 'Supply chain and logistics', owner: 'Sarah Chen', parentId: null, createdAt: '2025-11-01', workbookCount: 1, datasourceCount: 1, permissions: 'Publisher' },
      { id: 'proj-5', name: 'Executive', description: 'C-suite dashboards', owner: 'Sarah Chen', parentId: null, createdAt: '2025-01-05', workbookCount: 1, datasourceCount: 0, permissions: 'Viewer' },
      { id: 'proj-6', name: 'Default', description: 'The default project', owner: 'Admin', parentId: null, createdAt: '2024-01-01', workbookCount: 0, datasourceCount: 0, permissions: 'Publisher' },
    ],
    workbooks: [
      {
        id: 'wb-1',
        name: 'Sales Performance Dashboard',
        project: 'Sales',
        projectId: 'proj-1',
        owner: 'Sarah Chen',
        createdAt: '2025-12-01T10:00:00Z',
        updatedAt: '2026-04-09T14:30:00Z',
        viewCount: 1247,
        favoriteCount: 23,
        isFavorite: true,
        tags: ['sales', 'quarterly', 'kpi'],
        description: 'Comprehensive sales analysis with regional breakdowns and trend analysis',
        thumbnail: 'bar',
        sheets: [
          {
            id: 'sheet-1-1',
            name: 'Sales by Category',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Furniture', Sales: 741999, Profit: 18451, Quantity: 8028 },
                { name: 'Office Supplies', Sales: 719047, Profit: 122491, Quantity: 22906 },
                { name: 'Technology', Sales: 836154, Profit: 145455, Quantity: 6939 }
              ],
              xKey: 'name',
              bars: [{ key: 'Sales', color: '#4E79A7' }],
              xLabel: 'Category',
              yLabel: 'Sales ($)'
            },
            filters: [
              { id: 'f1', field: 'Region', type: 'categorical', values: ['East', 'West', 'Central', 'South'], selected: ['East', 'West', 'Central', 'South'] }
            ]
          },
          {
            id: 'sheet-1-2',
            name: 'Regional Performance',
            type: 'bar',
            chartConfig: {
              type: 'stackedBar',
              data: [
                { name: 'Central', Furniture: 163797, 'Office Supplies': 167026, Technology: 170416 },
                { name: 'East', Furniture: 208291, 'Office Supplies': 205516, Technology: 264973 },
                { name: 'South', Furniture: 117299, 'Office Supplies': 125651, Technology: 148772 },
                { name: 'West', Furniture: 252612, 'Office Supplies': 220854, Technology: 251993 }
              ],
              xKey: 'name',
              bars: [
                { key: 'Furniture', color: '#4E79A7', stackId: 'a' },
                { key: 'Office Supplies', color: '#F28E2B', stackId: 'a' },
                { key: 'Technology', color: '#E15759', stackId: 'a' }
              ],
              xLabel: 'Region',
              yLabel: 'Sales ($)'
            },
            filters: []
          },
          {
            id: 'sheet-1-3',
            name: 'Monthly Trend',
            type: 'line',
            chartConfig: {
              type: 'line',
              data: [
                { name: 'Jan', Sales: 94925, Profit: 12842 },
                { name: 'Feb', Sales: 82540, Profit: 10156 },
                { name: 'Mar', Sales: 105742, Profit: 15887 },
                { name: 'Apr', Sales: 87123, Profit: 11234 },
                { name: 'May', Sales: 98456, Profit: 13567 },
                { name: 'Jun', Sales: 112890, Profit: 17234 },
                { name: 'Jul', Sales: 95678, Profit: 12456 },
                { name: 'Aug', Sales: 108234, Profit: 16789 },
                { name: 'Sep', Sales: 125678, Profit: 19234 },
                { name: 'Oct', Sales: 132456, Profit: 21567 },
                { name: 'Nov', Sales: 145890, Profit: 24890 },
                { name: 'Dec', Sales: 107588, Profit: 18341 }
              ],
              xKey: 'name',
              lines: [
                { key: 'Sales', color: '#4E79A7', strokeWidth: 2 },
                { key: 'Profit', color: '#59A14F', strokeWidth: 2 }
              ],
              xLabel: 'Month',
              yLabel: 'Amount ($)'
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-2',
        name: 'Customer Segmentation Analysis',
        project: 'Sales',
        projectId: 'proj-1',
        owner: 'Sarah Chen',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-04-08T11:00:00Z',
        viewCount: 834,
        favoriteCount: 15,
        isFavorite: true,
        tags: ['customers', 'segmentation'],
        description: 'Customer behavior analysis with segment profiling and lifetime value',
        thumbnail: 'scatter',
        sheets: [
          {
            id: 'sheet-2-1',
            name: 'Sales vs Profit by Segment',
            type: 'scatter',
            chartConfig: {
              type: 'scatter',
              datasets: [
                { name: 'Consumer', color: '#4E79A7', data: [
                  { x: 261.96, y: 41.91, label: 'Bookcases' },
                  { x: 731.94, y: 219.58, label: 'Chairs' },
                  { x: 957.58, y: -383.03, label: 'Tables' },
                  { x: 48.86, y: 14.17, label: 'Furnishings' },
                  { x: 907.15, y: 90.71, label: 'Phones' },
                  { x: 114.90, y: 34.47, label: 'Appliances' }
                ]},
                { name: 'Corporate', color: '#F28E2B', data: [
                  { x: 14.62, y: 6.87, label: 'Labels' },
                  { x: 22.37, y: 2.52, label: 'Storage' },
                  { x: 7.28, y: 1.97, label: 'Art' },
                  { x: 55.00, y: 15.40, label: 'Paper' },
                  { x: 59.99, y: 14.99, label: 'Accessories' }
                ]},
                { name: 'Home Office', color: '#E15759', data: [
                  { x: 18.50, y: 5.78, label: 'Binders' },
                  { x: 1706.18, y: 85.31, label: 'Conference Tables' },
                  { x: 2799.98, y: 839.99, label: 'Machines' },
                  { x: 68.81, y: -123.86, label: 'Supplies' }
                ]}
              ],
              xLabel: 'Sales ($)',
              yLabel: 'Profit ($)'
            },
            filters: []
          },
          {
            id: 'sheet-2-2',
            name: 'Segment Distribution',
            type: 'pie',
            chartConfig: {
              type: 'pie',
              data: [
                { name: 'Consumer', value: 1161401, color: '#4E79A7' },
                { name: 'Corporate', value: 706146, color: '#F28E2B' },
                { name: 'Home Office', value: 429653, color: '#E15759' }
              ]
            },
            filters: []
          },
          {
            id: 'sheet-2-3',
            name: 'Customer Lifetime Trend',
            type: 'area',
            chartConfig: {
              type: 'area',
              data: [
                { name: 'Q1 2024', Consumer: 245000, Corporate: 156000, 'Home Office': 89000 },
                { name: 'Q2 2024', Consumer: 267000, Corporate: 167000, 'Home Office': 95000 },
                { name: 'Q3 2024', Consumer: 289000, Corporate: 178000, 'Home Office': 101000 },
                { name: 'Q4 2024', Consumer: 312000, Corporate: 189000, 'Home Office': 108000 },
                { name: 'Q1 2025', Consumer: 298000, Corporate: 195000, 'Home Office': 112000 },
                { name: 'Q2 2025', Consumer: 324000, Corporate: 201000, 'Home Office': 118000 },
                { name: 'Q3 2025', Consumer: 341000, Corporate: 212000, 'Home Office': 125000 },
                { name: 'Q4 2025', Consumer: 367000, Corporate: 224000, 'Home Office': 132000 }
              ],
              xKey: 'name',
              areas: [
                { key: 'Consumer', color: '#4E79A7' },
                { key: 'Corporate', color: '#F28E2B' },
                { key: 'Home Office', color: '#E15759' }
              ],
              xLabel: 'Quarter',
              yLabel: 'Revenue ($)'
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-3',
        name: 'Marketing Campaign Tracker',
        project: 'Marketing',
        projectId: 'proj-2',
        owner: 'James Wilson',
        createdAt: '2026-02-10T14:00:00Z',
        updatedAt: '2026-04-07T16:45:00Z',
        viewCount: 562,
        favoriteCount: 8,
        isFavorite: false,
        tags: ['marketing', 'campaigns', 'roi'],
        description: 'Track marketing campaign performance across channels',
        thumbnail: 'line',
        sheets: [
          {
            id: 'sheet-3-1',
            name: 'Campaign ROI',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Email', Spend: 45000, Revenue: 189000, ROI: 320 },
                { name: 'Social Media', Spend: 78000, Revenue: 234000, ROI: 200 },
                { name: 'Search', Spend: 125000, Revenue: 456000, ROI: 265 },
                { name: 'Display', Spend: 56000, Revenue: 112000, ROI: 100 },
                { name: 'Content', Spend: 34000, Revenue: 98000, ROI: 188 }
              ],
              xKey: 'name',
              bars: [
                { key: 'Spend', color: '#E15759' },
                { key: 'Revenue', color: '#59A14F' }
              ],
              xLabel: 'Channel',
              yLabel: 'Amount ($)'
            },
            filters: []
          },
          {
            id: 'sheet-3-2',
            name: 'Conversion Funnel',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Impressions', value: 2450000 },
                { name: 'Clicks', value: 245000 },
                { name: 'Leads', value: 24500 },
                { name: 'MQL', value: 7350 },
                { name: 'SQL', value: 2205 },
                { name: 'Customers', value: 661 }
              ],
              xKey: 'name',
              bars: [{ key: 'value', color: '#4E79A7' }],
              xLabel: 'Stage',
              yLabel: 'Count'
            },
            filters: []
          },
          {
            id: 'sheet-3-3',
            name: 'Monthly Leads',
            type: 'line',
            chartConfig: {
              type: 'line',
              data: [
                { name: 'Jan', Email: 1200, Social: 890, Search: 2100 },
                { name: 'Feb', Email: 1350, Social: 920, Search: 2300 },
                { name: 'Mar', Email: 1500, Social: 1100, Search: 2500 },
                { name: 'Apr', Email: 1420, Social: 1050, Search: 2400 },
                { name: 'May', Email: 1600, Social: 1200, Search: 2700 },
                { name: 'Jun', Email: 1750, Social: 1350, Search: 2900 }
              ],
              xKey: 'name',
              lines: [
                { key: 'Email', color: '#4E79A7', strokeWidth: 2 },
                { key: 'Social', color: '#F28E2B', strokeWidth: 2 },
                { key: 'Search', color: '#E15759', strokeWidth: 2 }
              ],
              xLabel: 'Month',
              yLabel: 'Leads'
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-4',
        name: 'Financial Overview Q1 2026',
        project: 'Finance',
        projectId: 'proj-3',
        owner: 'Maria Garcia',
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-04-05T09:30:00Z',
        viewCount: 1089,
        favoriteCount: 31,
        isFavorite: true,
        tags: ['finance', 'quarterly', 'budget'],
        description: 'Quarterly financial performance with budget vs actual analysis',
        thumbnail: 'line',
        sheets: [
          {
            id: 'sheet-4-1',
            name: 'Revenue vs Budget',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Jan', Actual: 2340000, Budget: 2200000 },
                { name: 'Feb', Actual: 2150000, Budget: 2300000 },
                { name: 'Mar', Actual: 2780000, Budget: 2500000 }
              ],
              xKey: 'name',
              bars: [
                { key: 'Actual', color: '#4E79A7' },
                { key: 'Budget', color: '#BAB0AC' }
              ],
              xLabel: 'Month',
              yLabel: 'Revenue ($)'
            },
            filters: []
          },
          {
            id: 'sheet-4-2',
            name: 'Expense Breakdown',
            type: 'pie',
            chartConfig: {
              type: 'pie',
              data: [
                { name: 'Personnel', value: 4200000, color: '#4E79A7' },
                { name: 'Marketing', value: 1200000, color: '#F28E2B' },
                { name: 'Operations', value: 890000, color: '#E15759' },
                { name: 'R&D', value: 1560000, color: '#76B7B2' },
                { name: 'Admin', value: 450000, color: '#59A14F' },
                { name: 'Other', value: 320000, color: '#EDC948' }
              ]
            },
            filters: []
          },
          {
            id: 'sheet-4-3',
            name: 'Profit Margin Trend',
            type: 'line',
            chartConfig: {
              type: 'line',
              data: [
                { name: 'Q1 2025', Gross: 42.3, Net: 18.7 },
                { name: 'Q2 2025', Gross: 44.1, Net: 19.2 },
                { name: 'Q3 2025', Gross: 43.5, Net: 18.9 },
                { name: 'Q4 2025', Gross: 45.8, Net: 20.4 },
                { name: 'Q1 2026', Gross: 46.2, Net: 21.1 }
              ],
              xKey: 'name',
              lines: [
                { key: 'Gross', color: '#4E79A7', strokeWidth: 2, name: 'Gross Margin %' },
                { key: 'Net', color: '#59A14F', strokeWidth: 2, name: 'Net Margin %' }
              ],
              xLabel: 'Quarter',
              yLabel: 'Margin (%)'
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-5',
        name: 'Supply Chain Analytics',
        project: 'Operations',
        projectId: 'proj-4',
        owner: 'Sarah Chen',
        createdAt: '2026-01-20T11:00:00Z',
        updatedAt: '2026-04-06T15:00:00Z',
        viewCount: 423,
        favoriteCount: 7,
        isFavorite: false,
        tags: ['operations', 'supply-chain', 'logistics'],
        description: 'End-to-end supply chain visibility and performance metrics',
        thumbnail: 'bar',
        sheets: [
          {
            id: 'sheet-5-1',
            name: 'Shipping Performance',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Standard Class', 'On Time': 4587, Late: 342, 'Avg Days': 5.2 },
                { name: 'Second Class', 'On Time': 1890, Late: 156, 'Avg Days': 4.1 },
                { name: 'First Class', 'On Time': 1478, Late: 65, 'Avg Days': 2.8 },
                { name: 'Same Day', 'On Time': 543, Late: 12, 'Avg Days': 0.5 }
              ],
              xKey: 'name',
              bars: [
                { key: 'On Time', color: '#59A14F' },
                { key: 'Late', color: '#E15759' }
              ],
              xLabel: 'Ship Mode',
              yLabel: 'Orders'
            },
            filters: []
          },
          {
            id: 'sheet-5-2',
            name: 'Inventory Treemap',
            type: 'treemap',
            chartConfig: {
              type: 'treemap',
              data: [
                { name: 'Phones', size: 330007, category: 'Technology', color: '#4E79A7' },
                { name: 'Chairs', size: 328449, category: 'Furniture', color: '#F28E2B' },
                { name: 'Storage', size: 223844, category: 'Office Supplies', color: '#E15759' },
                { name: 'Tables', size: 206966, category: 'Furniture', color: '#76B7B2' },
                { name: 'Binders', size: 203413, category: 'Office Supplies', color: '#59A14F' },
                { name: 'Machines', size: 189239, category: 'Technology', color: '#EDC948' },
                { name: 'Accessories', size: 167380, category: 'Technology', color: '#B07AA1' },
                { name: 'Copiers', size: 149528, category: 'Technology', color: '#FF9DA7' },
                { name: 'Bookcases', size: 114880, category: 'Furniture', color: '#9C755F' },
                { name: 'Appliances', size: 107532, category: 'Office Supplies', color: '#BAB0AC' }
              ]
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-6',
        name: 'Executive Summary Dashboard',
        project: 'Executive',
        projectId: 'proj-5',
        owner: 'Sarah Chen',
        createdAt: '2025-09-01T08:00:00Z',
        updatedAt: '2026-04-10T08:00:00Z',
        viewCount: 2156,
        favoriteCount: 42,
        isFavorite: true,
        tags: ['executive', 'kpi', 'summary'],
        description: 'High-level KPI dashboard for executive review',
        thumbnail: 'line',
        sheets: [
          {
            id: 'sheet-6-1',
            name: 'KPI Overview',
            type: 'bar',
            chartConfig: {
              type: 'bar',
              data: [
                { name: 'Revenue', Current: 7270000, Target: 7000000 },
                { name: 'Profit', Current: 930000, Target: 850000 },
                { name: 'Customers', Current: 793, Target: 750 },
                { name: 'Orders', Current: 5009, Target: 4800 }
              ],
              xKey: 'name',
              bars: [
                { key: 'Current', color: '#4E79A7' },
                { key: 'Target', color: '#BAB0AC' }
              ],
              xLabel: 'Metric',
              yLabel: 'Value'
            },
            filters: []
          },
          {
            id: 'sheet-6-2',
            name: 'YoY Growth',
            type: 'line',
            chartConfig: {
              type: 'line',
              data: [
                { name: '2021', Revenue: 4800000, Profit: 520000 },
                { name: '2022', Revenue: 5200000, Profit: 610000 },
                { name: 'Aug', Revenue: 5900000, Profit: 710000 },
                { name: '2024', Revenue: 6500000, Profit: 810000 },
                { name: '2025', Revenue: 7270000, Profit: 930000 }
              ],
              xKey: 'name',
              lines: [
                { key: 'Revenue', color: '#4E79A7', strokeWidth: 2 },
                { key: 'Profit', color: '#59A14F', strokeWidth: 2 }
              ],
              xLabel: 'Year',
              yLabel: 'Amount ($)'
            },
            filters: []
          }
        ]
      },
      {
        id: 'wb-7',
        name: 'Website Analytics',
        project: 'Marketing',
        projectId: 'proj-2',
        owner: 'James Wilson',
        createdAt: '2026-03-15T10:00:00Z',
        updatedAt: '2026-04-09T12:00:00Z',
        viewCount: 378,
        favoriteCount: 5,
        isFavorite: false,
        tags: ['web', 'analytics', 'traffic'],
        description: 'Website traffic and user engagement metrics',
        thumbnail: 'area',
        sheets: [
          {
            id: 'sheet-7-1',
            name: 'Traffic Sources',
            type: 'pie',
            chartConfig: {
              type: 'pie',
              data: [
                { name: 'Organic Search', value: 45200, color: '#4E79A7' },
                { name: 'Direct', value: 23100, color: '#F28E2B' },
                { name: 'Social', value: 18700, color: '#E15759' },
                { name: 'Referral', value: 12400, color: '#76B7B2' },
                { name: 'Email', value: 8900, color: '#59A14F' },
                { name: 'Paid Search', value: 6700, color: '#EDC948' }
              ]
            },
            filters: []
          },
          {
            id: 'sheet-7-2',
            name: 'Daily Sessions',
            type: 'area',
            chartConfig: {
              type: 'area',
              data: [
                { name: 'Mon', Sessions: 4520, 'Page Views': 12400 },
                { name: 'Tue', Sessions: 4890, 'Page Views': 13200 },
                { name: 'Wed', Sessions: 5120, 'Page Views': 14100 },
                { name: 'Thu', Sessions: 4950, 'Page Views': 13800 },
                { name: 'Fri', Sessions: 4230, 'Page Views': 11900 },
                { name: 'Sat', Sessions: 2100, 'Page Views': 5800 },
                { name: 'Sun', Sessions: 1890, 'Page Views': 5200 }
              ],
              xKey: 'name',
              areas: [
                { key: 'Page Views', color: '#4E79A7' },
                { key: 'Sessions', color: '#F28E2B' }
              ],
              xLabel: 'Day',
              yLabel: 'Count'
            },
            filters: []
          }
        ]
      }
    ],
    dataSources: [
      {
        id: 'ds-1',
        name: 'Sample - Superstore',
        type: 'Live',
        connectionType: 'Microsoft Excel',
        owner: 'Sarah Chen',
        project: 'Sales',
        projectId: 'proj-1',
        updatedAt: '2026-04-09T14:30:00Z',
        isCertified: true,
        certifiedBy: 'Data Team',
        description: 'Sample superstore dataset with orders, returns, and people data',
        fieldCount: 21,
        rowCount: 9994,
        tags: ['sample', 'superstore'],
        usedByWorkbooks: ['wb-1', 'wb-2'],
        fields: [
          { name: 'Row ID', type: 'Number', role: 'Dimension' },
          { name: 'Order ID', type: 'String', role: 'Dimension' },
          { name: 'Order Date', type: 'Date', role: 'Dimension' },
          { name: 'Ship Date', type: 'Date', role: 'Dimension' },
          { name: 'Ship Mode', type: 'String', role: 'Dimension' },
          { name: 'Customer ID', type: 'String', role: 'Dimension' },
          { name: 'Customer Name', type: 'String', role: 'Dimension' },
          { name: 'Segment', type: 'String', role: 'Dimension' },
          { name: 'Country/Region', type: 'String', role: 'Dimension' },
          { name: 'City', type: 'String', role: 'Dimension' },
          { name: 'State', type: 'String', role: 'Dimension' },
          { name: 'Postal Code', type: 'String', role: 'Dimension' },
          { name: 'Region', type: 'String', role: 'Dimension' },
          { name: 'Product ID', type: 'String', role: 'Dimension' },
          { name: 'Category', type: 'String', role: 'Dimension' },
          { name: 'Sub-Category', type: 'String', role: 'Dimension' },
          { name: 'Product Name', type: 'String', role: 'Dimension' },
          { name: 'Sales', type: 'Number', role: 'Measure' },
          { name: 'Quantity', type: 'Number', role: 'Measure' },
          { name: 'Discount', type: 'Number', role: 'Measure' },
          { name: 'Profit', type: 'Number', role: 'Measure' }
        ],
        sampleData: [
          { 'Row ID': 1, 'Order ID': 'CA-2022-152156', 'Order Date': '2022-11-08', 'Ship Mode': 'Second Class', 'Customer Name': 'Claire Gute', Segment: 'Consumer', Region: 'South', Category: 'Furniture', 'Sub-Category': 'Bookcases', Sales: 261.96, Quantity: 2, Discount: 0, Profit: 41.91 },
          { 'Row ID': 2, 'Order ID': 'CA-2022-152156', 'Order Date': '2022-11-08', 'Ship Mode': 'Second Class', 'Customer Name': 'Claire Gute', Segment: 'Consumer', Region: 'South', Category: 'Furniture', 'Sub-Category': 'Chairs', Sales: 731.94, Quantity: 3, Discount: 0, Profit: 219.58 },
          { 'Row ID': 3, 'Order ID': 'CA-2022-138688', 'Order Date': '2022-06-12', 'Ship Mode': 'Second Class', 'Customer Name': 'Darrin Van Huff', Segment: 'Corporate', Region: 'West', Category: 'Office Supplies', 'Sub-Category': 'Labels', Sales: 14.62, Quantity: 2, Discount: 0, Profit: 6.87 },
          { 'Row ID': 4, 'Order ID': 'US-2021-108966', 'Order Date': '2021-10-11', 'Ship Mode': 'Standard Class', 'Customer Name': "Sean O'Donnell", Segment: 'Consumer', Region: 'South', Category: 'Furniture', 'Sub-Category': 'Tables', Sales: 957.58, Quantity: 5, Discount: 0.45, Profit: -383.03 },
          { 'Row ID': 5, 'Order ID': 'US-2021-108966', 'Order Date': '2021-10-11', 'Ship Mode': 'Standard Class', 'Customer Name': "Sean O'Donnell", Segment: 'Consumer', Region: 'South', Category: 'Office Supplies', 'Sub-Category': 'Storage', Sales: 22.37, Quantity: 2, Discount: 0.2, Profit: 2.52 }
        ]
      },
      {
        id: 'ds-2',
        name: 'Marketing Campaigns',
        type: 'Extract',
        connectionType: 'PostgreSQL',
        owner: 'James Wilson',
        project: 'Marketing',
        projectId: 'proj-2',
        updatedAt: '2026-04-07T16:45:00Z',
        isCertified: false,
        certifiedBy: null,
        description: 'Marketing campaign data from the campaign management system',
        fieldCount: 15,
        rowCount: 45623,
        tags: ['marketing', 'campaigns'],
        usedByWorkbooks: ['wb-3'],
        fields: [
          { name: 'Campaign ID', type: 'String', role: 'Dimension' },
          { name: 'Campaign Name', type: 'String', role: 'Dimension' },
          { name: 'Channel', type: 'String', role: 'Dimension' },
          { name: 'Start Date', type: 'Date', role: 'Dimension' },
          { name: 'Impressions', type: 'Number', role: 'Measure' },
          { name: 'Clicks', type: 'Number', role: 'Measure' },
          { name: 'Conversions', type: 'Number', role: 'Measure' },
          { name: 'Spend', type: 'Number', role: 'Measure' },
          { name: 'Revenue', type: 'Number', role: 'Measure' }
        ],
        sampleData: []
      },
      {
        id: 'ds-3',
        name: 'Financial Data',
        type: 'Live',
        connectionType: 'Snowflake',
        owner: 'Maria Garcia',
        project: 'Finance',
        projectId: 'proj-3',
        updatedAt: '2026-04-05T09:30:00Z',
        isCertified: true,
        certifiedBy: 'Finance Team',
        description: 'Consolidated financial data from ERP system',
        fieldCount: 28,
        rowCount: 125890,
        tags: ['finance', 'erp'],
        usedByWorkbooks: ['wb-4'],
        fields: [],
        sampleData: []
      }
    ],
    users: [
      { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', siteRole: 'Site Administrator Creator', lastLogin: '2026-04-10T09:15:00Z', group: 'Administrators' },
      { id: 'user-2', name: 'James Wilson', email: 'james.wilson@company.com', siteRole: 'Creator', lastLogin: '2026-04-09T16:30:00Z', group: 'Marketing' },
      { id: 'user-3', name: 'Maria Garcia', email: 'maria.garcia@company.com', siteRole: 'Creator', lastLogin: '2026-04-08T14:20:00Z', group: 'Finance' },
      { id: 'user-4', name: 'Robert Kim', email: 'robert.kim@company.com', siteRole: 'Explorer', lastLogin: '2026-04-10T08:45:00Z', group: 'Sales' },
      { id: 'user-5', name: 'Lisa Johnson', email: 'lisa.johnson@company.com', siteRole: 'Viewer', lastLogin: '2026-04-07T11:00:00Z', group: 'Executive' },
      { id: 'user-6', name: 'David Park', email: 'david.park@company.com', siteRole: 'Explorer', lastLogin: '2026-04-09T10:15:00Z', group: 'Operations' },
      { id: 'user-7', name: 'Emily Thompson', email: 'emily.thompson@company.com', siteRole: 'Viewer', lastLogin: '2026-04-06T09:30:00Z', group: 'Marketing' },
      { id: 'user-8', name: 'Michael Brown', email: 'michael.brown@company.com', siteRole: 'Creator', lastLogin: '2026-04-10T07:00:00Z', group: 'Data Team' }
    ],
    groups: [
      { id: 'grp-1', name: 'Administrators', userCount: 2, minimumSiteRole: 'Site Administrator Creator' },
      { id: 'grp-2', name: 'All Users', userCount: 8, minimumSiteRole: 'Viewer' },
      { id: 'grp-3', name: 'Sales', userCount: 3, minimumSiteRole: 'Explorer' },
      { id: 'grp-4', name: 'Marketing', userCount: 2, minimumSiteRole: 'Explorer' },
      { id: 'grp-5', name: 'Finance', userCount: 2, minimumSiteRole: 'Viewer' },
      { id: 'grp-6', name: 'Data Team', userCount: 3, minimumSiteRole: 'Creator' },
      { id: 'grp-7', name: 'Executive', userCount: 2, minimumSiteRole: 'Viewer' },
      { id: 'grp-8', name: 'Operations', userCount: 2, minimumSiteRole: 'Explorer' }
    ],
    schedules: [
      { id: 'sched-1', name: 'Daily Morning Refresh', type: 'Extract', frequency: 'Daily at 6:00 AM', nextRun: '2026-04-11T06:00:00Z', priority: 50, state: 'Active' },
      { id: 'sched-2', name: 'Weekly Full Refresh', type: 'Extract', frequency: 'Every Monday at 2:00 AM', nextRun: '2026-04-13T02:00:00Z', priority: 30, state: 'Active' },
      { id: 'sched-3', name: 'Daily Email Subscription', type: 'Subscription', frequency: 'Daily at 8:00 AM', nextRun: '2026-04-11T08:00:00Z', priority: 50, state: 'Active' },
      { id: 'sched-4', name: 'End of Month Report', type: 'Subscription', frequency: 'Last day of month at 5:00 PM', nextRun: '2026-04-30T17:00:00Z', priority: 70, state: 'Active' }
    ],
    tasks: [
      { id: 'task-1', name: 'Refresh Sample - Superstore', schedule: 'Daily Morning Refresh', type: 'Extract Refresh', lastRun: '2026-04-10T06:00:00Z', status: 'Success', duration: '2m 34s' },
      { id: 'task-2', name: 'Refresh Marketing Campaigns', schedule: 'Daily Morning Refresh', type: 'Extract Refresh', lastRun: '2026-04-10T06:02:00Z', status: 'Success', duration: '5m 12s' },
      { id: 'task-3', name: 'Email Sales Dashboard', schedule: 'Daily Email Subscription', type: 'Subscription', lastRun: '2026-04-10T08:00:00Z', status: 'Success', duration: '0m 45s' },
      { id: 'task-4', name: 'Refresh Financial Data', schedule: 'Weekly Full Refresh', type: 'Extract Refresh', lastRun: '2026-04-07T02:00:00Z', status: 'Failed', duration: '12m 8s' }
    ],
    favorites: ['wb-1', 'wb-2', 'wb-4', 'wb-6'],
    recents: ['wb-1', 'wb-6', 'wb-4', 'wb-3', 'wb-2', 'wb-5'],
    sharedWithMe: ['wb-3', 'wb-4'],
    uiState: {
      currentPage: 'home',
      selectedWorkbook: null,
      selectedSheet: null,
      exploreView: 'grid',
      exploreSort: 'name',
      exploreFilter: 'all',
      exploreSearch: '',
      sidebarCollapsed: false,
      adminTab: 'users',
      dashboardFilters: {}
    }
  }
}

export const initializeData = (sid = null, customState = null) => {
  const key = storageKey(sid)
  const initKey = initialKey(sid)
  const defaults = createInitialData()

  if (customState && customState.current_state) {
    const merged = customState.current_state
    localStorage.setItem(key, JSON.stringify(merged))
    const initial = customState.initial_state || merged
    localStorage.setItem(initKey, JSON.stringify(initial))
    // Write initial json to server
    if (sid) {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state: initial })
      }).catch(() => {})
    }
    return merged
  }

  if (customState && Object.keys(customState).length > 0) {
    localStorage.setItem(key, JSON.stringify(customState))
    localStorage.setItem(initKey, JSON.stringify(customState))
    if (sid) {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state: customState })
      }).catch(() => {})
    }
    return customState
  }

  const saved = localStorage.getItem(key)
  if (saved) {
    try { return JSON.parse(saved) } catch { /* fall through */ }
  }

  localStorage.setItem(key, JSON.stringify(defaults))
  localStorage.setItem(initKey, JSON.stringify(defaults))
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: defaults })
    }).catch(() => {})
  }
  return defaults
}

export const saveState = (state, sid = null) => {
  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(state))
  const sessionId = sid || new URLSearchParams(window.location.search).get('sid')
  if (sessionId) {
    fetch(`/post?sid=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {})
  }
}

export const getInitialState = (sid = null) => {
  const initKey = initialKey(sid)
  const saved = localStorage.getItem(initKey)
  if (saved) {
    try { return JSON.parse(saved) } catch { return null }
  }
  return null
}
