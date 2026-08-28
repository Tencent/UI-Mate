export const BASE_KEY = 'meta_ads_state';
export const BASE_INITIAL_KEY = 'meta_ads_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('meta_ads_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('meta_ads_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${sid}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
};

function deepMerge(target, source) {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue;
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function createInitialData() {
  return {
    user: {
      id: 'user_001',
      name: 'Sarah Chen',
      email: 'sarah.chen@acmecorp.com',
      avatarUrl: null,
      role: 'Admin'
    },
    account: {
      id: 'act_987654321',
      name: 'Acme Corp Ad Account',
      businessName: 'Acme Corporation',
      currency: 'USD',
      timezone: 'America/New_York',
      status: 'active',
      spendCap: 50000,
      amountSpent: 23456.78,
      balance: 26543.22
    },
    campaigns: [
      {
        id: 'camp_001',
        name: 'Summer Sale 2025',
        status: 'active',
        objective: 'sales',
        buyingType: 'auction',
        budgetOptimization: true,
        dailyBudget: 100.00,
        lifetimeBudget: null,
        bidStrategy: 'lowest_cost',
        specialAdCategories: [],
        createdAt: '2025-06-01T10:00:00Z',
        updatedAt: '2025-06-15T14:30:00Z',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        results: 1245,
        reach: 156000,
        impressions: 342000,
        clicks: 8900,
        ctr: 2.60,
        cpc: 0.56,
        cpm: 14.62,
        costPerResult: 4.02,
        amountSpent: 5012.50,
        frequency: 2.19,
        roas: 3.45,
        deliveryStatus: 'active'
      },
      {
        id: 'camp_002',
        name: 'Brand Awareness Q3',
        status: 'active',
        objective: 'awareness',
        buyingType: 'auction',
        budgetOptimization: true,
        dailyBudget: 50.00,
        lifetimeBudget: null,
        bidStrategy: 'lowest_cost',
        specialAdCategories: [],
        createdAt: '2025-07-01T09:00:00Z',
        updatedAt: '2025-07-10T11:00:00Z',
        startDate: '2025-07-01T00:00:00Z',
        endDate: '2025-09-30T23:59:59Z',
        results: 523,
        reach: 89000,
        impressions: 215000,
        clicks: 2100,
        ctr: 0.98,
        cpc: 1.24,
        cpm: 11.45,
        costPerResult: 6.12,
        amountSpent: 3201.36,
        frequency: 2.41,
        roas: 1.20,
        deliveryStatus: 'active'
      },
      {
        id: 'camp_003',
        name: 'Spring Collection Traffic',
        status: 'paused',
        objective: 'traffic',
        buyingType: 'auction',
        budgetOptimization: false,
        dailyBudget: null,
        lifetimeBudget: null,
        bidStrategy: 'lowest_cost',
        specialAdCategories: [],
        createdAt: '2025-03-15T08:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z',
        startDate: '2025-03-15T00:00:00Z',
        endDate: null,
        results: 3420,
        reach: 210000,
        impressions: 580000,
        clicks: 18200,
        ctr: 3.14,
        cpc: 0.42,
        cpm: 13.20,
        costPerResult: 2.24,
        amountSpent: 7660.80,
        frequency: 2.76,
        roas: 2.10,
        deliveryStatus: 'not_delivering'
      },
      {
        id: 'camp_004',
        name: 'Lead Gen Webinar - Q2',
        status: 'active',
        objective: 'leads',
        buyingType: 'auction',
        budgetOptimization: true,
        dailyBudget: null,
        lifetimeBudget: 1500.00,
        bidStrategy: 'cost_cap',
        specialAdCategories: [],
        createdAt: '2025-04-01T07:00:00Z',
        updatedAt: '2025-05-31T23:59:00Z',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-31T23:59:59Z',
        results: 287,
        reach: 45000,
        impressions: 98000,
        clicks: 1740,
        ctr: 1.78,
        cpc: 0.86,
        cpm: 15.31,
        costPerResult: 5.23,
        amountSpent: 1501.01,
        frequency: 2.18,
        roas: 0,
        deliveryStatus: 'completed'
      },
      {
        id: 'camp_005',
        name: 'Holiday Promo 2025',
        status: 'draft',
        objective: 'sales',
        buyingType: 'auction',
        budgetOptimization: true,
        dailyBudget: 200.00,
        lifetimeBudget: null,
        bidStrategy: 'lowest_cost',
        specialAdCategories: [],
        createdAt: '2025-10-01T12:00:00Z',
        updatedAt: '2025-10-01T12:00:00Z',
        startDate: '2025-11-25T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        results: 0,
        reach: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        costPerResult: 0,
        amountSpent: 0,
        frequency: 0,
        roas: 0,
        deliveryStatus: 'not_delivering'
      },
      {
        id: 'camp_006',
        name: 'App Install Push - iOS',
        status: 'active',
        objective: 'app_promotion',
        buyingType: 'auction',
        budgetOptimization: true,
        dailyBudget: 75.00,
        lifetimeBudget: null,
        bidStrategy: 'lowest_cost',
        specialAdCategories: [],
        createdAt: '2025-08-10T10:00:00Z',
        updatedAt: '2025-09-05T14:00:00Z',
        startDate: '2025-08-10T00:00:00Z',
        endDate: null,
        results: 156,
        reach: 42000,
        impressions: 89000,
        clicks: 3100,
        ctr: 3.48,
        cpc: 0.88,
        cpm: 23.71,
        costPerResult: 13.46,
        amountSpent: 2099.76,
        frequency: 2.12,
        roas: 1.80,
        deliveryStatus: 'error'
      }
    ],
    adSets: [
      // camp_001 ad sets
      {
        id: 'adset_001',
        campaignId: 'camp_001',
        name: 'US 25-44 Interest-Based',
        status: 'active',
        dailyBudget: 50.00,
        lifetimeBudget: null,
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        optimizationGoal: 'conversions',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 44, genders: ['all'],
          detailedTargeting: { interests: [{ id: 'int_001', name: 'Online shopping' }, { id: 'int_002', name: 'Fashion' }], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 623, reach: 78000, impressions: 171000, clicks: 4450, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 2506.25, frequency: 2.19,
        deliveryStatus: 'active'
      },
      {
        id: 'adset_002',
        campaignId: 'camp_001',
        name: 'US Retargeting - 30d',
        status: 'active',
        dailyBudget: 30.00,
        lifetimeBudget: null,
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        optimizationGoal: 'conversions',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 18, ageMax: 65, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: ['aud_001'], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram', 'messenger'] },
        results: 412, reach: 52000, impressions: 113800, clicks: 2956, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 1656.50, frequency: 2.19,
        deliveryStatus: 'active'
      },
      {
        id: 'adset_003',
        campaignId: 'camp_001',
        name: 'UK Broad 18-65',
        status: 'active',
        dailyBudget: 20.00,
        lifetimeBudget: null,
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        optimizationGoal: 'conversions',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United Kingdom', code: 'GB' }],
          ageMin: 18, ageMax: 65, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: ['aud_003'], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 210, reach: 26000, impressions: 57200, clicks: 1494, ctr: 2.61, cpc: 0.57, cpm: 14.65, costPerResult: 4.04, amountSpent: 849.75, frequency: 2.20,
        deliveryStatus: 'active'
      },
      // camp_002 ad sets
      {
        id: 'adset_004',
        campaignId: 'camp_002',
        name: 'US Broad Awareness 18-65',
        status: 'active',
        dailyBudget: 30.00,
        lifetimeBudget: null,
        startDate: '2025-07-01T00:00:00Z',
        endDate: '2025-09-30T23:59:59Z',
        optimizationGoal: 'reach',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 18, ageMax: 65, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram', 'audience_network'] },
        results: 312, reach: 54000, impressions: 130200, clicks: 1270, ctr: 0.98, cpc: 1.24, cpm: 11.45, costPerResult: 6.12, amountSpent: 1909.44, frequency: 2.41,
        deliveryStatus: 'active'
      },
      {
        id: 'adset_005',
        campaignId: 'camp_002',
        name: 'Lookalike - Top Customers 1%',
        status: 'active',
        dailyBudget: 20.00,
        lifetimeBudget: null,
        startDate: '2025-07-01T00:00:00Z',
        endDate: '2025-09-30T23:59:59Z',
        optimizationGoal: 'reach',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 54, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: ['aud_003'], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 211, reach: 35000, impressions: 84800, clicks: 830, ctr: 0.98, cpc: 1.24, cpm: 11.45, costPerResult: 6.12, amountSpent: 1291.92, frequency: 2.42,
        deliveryStatus: 'active'
      },
      // camp_003 ad sets
      {
        id: 'adset_006',
        campaignId: 'camp_003',
        name: 'US Women 25-44 Fashion Interest',
        status: 'paused',
        dailyBudget: 40.00,
        lifetimeBudget: null,
        startDate: '2025-03-15T00:00:00Z',
        endDate: null,
        optimizationGoal: 'landing_page_views',
        billingEvent: 'link_clicks',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 44, genders: ['female'],
          detailedTargeting: { interests: [{ id: 'int_003', name: 'Fashion' }, { id: 'int_004', name: 'Shopping' }], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 1800, reach: 110000, impressions: 305000, clicks: 9600, ctr: 3.15, cpc: 0.42, cpm: 13.25, costPerResult: 2.24, amountSpent: 4032.00, frequency: 2.77,
        deliveryStatus: 'not_delivering'
      },
      {
        id: 'adset_007',
        campaignId: 'camp_003',
        name: 'US All Traffic Retargeting',
        status: 'paused',
        dailyBudget: 20.00,
        lifetimeBudget: null,
        startDate: '2025-03-15T00:00:00Z',
        endDate: null,
        optimizationGoal: 'landing_page_views',
        billingEvent: 'link_clicks',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 18, ageMax: 65, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: ['aud_001'], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'manual', platforms: ['facebook'] },
        results: 1620, reach: 100000, impressions: 275000, clicks: 8600, ctr: 3.13, cpc: 0.42, cpm: 13.15, costPerResult: 2.24, amountSpent: 3628.80, frequency: 2.75,
        deliveryStatus: 'not_delivering'
      },
      // camp_004 ad sets
      {
        id: 'adset_008',
        campaignId: 'camp_004',
        name: 'B2B Decision Makers 30-55',
        status: 'active',
        dailyBudget: null,
        lifetimeBudget: 750.00,
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-31T23:59:59Z',
        optimizationGoal: 'lead_generation',
        billingEvent: 'impressions',
        bidAmount: 8.00,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 30, ageMax: 55, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [{ id: 'beh_001', name: 'Business decision makers' }], demographics: [{ id: 'dem_001', name: 'College graduates' }] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'manual', platforms: ['facebook', 'instagram'] },
        results: 155, reach: 24000, impressions: 52000, clicks: 924, ctr: 1.78, cpc: 0.86, cpm: 15.31, costPerResult: 5.23, amountSpent: 810.65, frequency: 2.17,
        deliveryStatus: 'completed'
      },
      {
        id: 'adset_009',
        campaignId: 'camp_004',
        name: 'Engaged Video Viewers - Webinar Topic',
        status: 'active',
        dailyBudget: null,
        lifetimeBudget: 750.00,
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-31T23:59:59Z',
        optimizationGoal: 'lead_generation',
        billingEvent: 'impressions',
        bidAmount: 6.00,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 54, genders: ['all'],
          detailedTargeting: { interests: [{ id: 'int_005', name: 'Webinars' }, { id: 'int_006', name: 'Business software' }], behaviors: [], demographics: [] },
          customAudiences: ['aud_004'], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram', 'messenger'] },
        results: 132, reach: 21000, impressions: 46000, clicks: 816, ctr: 1.77, cpc: 0.86, cpm: 15.30, costPerResult: 5.23, amountSpent: 690.36, frequency: 2.19,
        deliveryStatus: 'completed'
      },
      // camp_005 ad sets (draft)
      {
        id: 'adset_010',
        campaignId: 'camp_005',
        name: 'US Holiday Shoppers 25-55',
        status: 'draft',
        dailyBudget: 100.00,
        lifetimeBudget: null,
        startDate: '2025-11-25T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        optimizationGoal: 'conversions',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 55, genders: ['all'],
          detailedTargeting: { interests: [{ id: 'int_007', name: 'Gift shopping' }], behaviors: [{ id: 'beh_002', name: 'Engaged shoppers' }], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0, frequency: 0,
        deliveryStatus: 'not_delivering'
      },
      {
        id: 'adset_011',
        campaignId: 'camp_005',
        name: 'Email List Lookalike 1% - US',
        status: 'draft',
        dailyBudget: 100.00,
        lifetimeBudget: null,
        startDate: '2025-11-25T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        optimizationGoal: 'conversions',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 55, genders: ['all'],
          detailedTargeting: { interests: [], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: ['aud_003'], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0, frequency: 0,
        deliveryStatus: 'not_delivering'
      },
      // camp_006 ad sets
      {
        id: 'adset_012',
        campaignId: 'camp_006',
        name: 'iOS Users 18-34 US',
        status: 'active',
        dailyBudget: 40.00,
        lifetimeBudget: null,
        startDate: '2025-08-10T00:00:00Z',
        endDate: null,
        optimizationGoal: 'app_installs',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 18, ageMax: 34, genders: ['all'],
          detailedTargeting: { interests: [{ id: 'int_008', name: 'Mobile apps' }, { id: 'int_009', name: 'Gaming' }], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 90, reach: 25000, impressions: 52900, clicks: 1844, ctr: 3.49, cpc: 0.87, cpm: 23.72, costPerResult: 13.46, amountSpent: 1211.40, frequency: 2.12,
        deliveryStatus: 'error'
      },
      {
        id: 'adset_013',
        campaignId: 'camp_006',
        name: 'Tech Enthusiasts 25-45',
        status: 'active',
        dailyBudget: 35.00,
        lifetimeBudget: null,
        startDate: '2025-08-10T00:00:00Z',
        endDate: null,
        optimizationGoal: 'app_installs',
        billingEvent: 'impressions',
        bidAmount: null,
        targeting: {
          locations: [{ type: 'country', name: 'United States', code: 'US' }],
          ageMin: 25, ageMax: 45, genders: ['all'],
          detailedTargeting: { interests: [{ id: 'int_010', name: 'Technology' }, { id: 'int_011', name: 'Smartphones' }], behaviors: [], demographics: [] },
          customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
        },
        placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
        results: 66, reach: 17000, impressions: 36100, clicks: 1256, ctr: 3.48, cpc: 0.88, cpm: 23.71, costPerResult: 13.45, amountSpent: 888.36, frequency: 2.12,
        deliveryStatus: 'error'
      }
    ],
    ads: [
      // adset_001 ads
      { id: 'ad_001', adSetId: 'adset_001', campaignId: 'camp_001', name: 'Summer Sale - Image A', status: 'active', creativeId: 'cr_001', results: 312, reach: 39000, impressions: 85500, clicks: 2225, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 1253.13, frequency: 2.19, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_002', adSetId: 'adset_001', campaignId: 'camp_001', name: 'Summer Sale - Image B', status: 'active', creativeId: 'cr_002', results: 198, reach: 25000, impressions: 54750, clicks: 1425, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 803.70, frequency: 2.19, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_003', adSetId: 'adset_001', campaignId: 'camp_001', name: 'Summer Sale - Carousel', status: 'active', creativeId: 'cr_003', results: 113, reach: 14000, impressions: 30750, clicks: 800, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 449.43, frequency: 2.20, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      // adset_002 ads
      { id: 'ad_004', adSetId: 'adset_002', campaignId: 'camp_001', name: 'Retargeting - Dynamic Ad A', status: 'active', creativeId: 'cr_004', results: 215, reach: 27000, impressions: 59100, clicks: 1538, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 864.08, frequency: 2.19, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_005', adSetId: 'adset_002', campaignId: 'camp_001', name: 'Retargeting - Dynamic Ad B', status: 'active', creativeId: 'cr_005', results: 197, reach: 25000, impressions: 54700, clicks: 1418, ctr: 2.60, cpc: 0.57, cpm: 14.62, costPerResult: 4.02, amountSpent: 792.38, frequency: 2.19, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      // adset_003 ads
      { id: 'ad_006', adSetId: 'adset_003', campaignId: 'camp_001', name: 'UK Summer - Image A', status: 'active', creativeId: 'cr_006', results: 120, reach: 15000, impressions: 33000, clicks: 858, ctr: 2.60, cpc: 0.56, cpm: 14.62, costPerResult: 4.02, amountSpent: 482.40, frequency: 2.20, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_007', adSetId: 'adset_003', campaignId: 'camp_001', name: 'UK Summer - Video A', status: 'active', creativeId: 'cr_007', results: 90, reach: 11000, impressions: 24200, clicks: 636, ctr: 2.63, cpc: 0.57, cpm: 14.65, costPerResult: 4.08, amountSpent: 354.53, frequency: 2.20, deliveryStatus: 'active', reviewStatus: 'pending', reviewFeedback: null },
      // adset_004 ads
      { id: 'ad_008', adSetId: 'adset_004', campaignId: 'camp_002', name: 'Awareness - Video A', status: 'active', creativeId: 'cr_008', results: 180, reach: 32000, impressions: 77200, clicks: 756, ctr: 0.98, cpc: 1.24, cpm: 11.45, costPerResult: 6.12, amountSpent: 1101.84, frequency: 2.41, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_009', adSetId: 'adset_004', campaignId: 'camp_002', name: 'Awareness - Image Carousel', status: 'active', creativeId: 'cr_009', results: 132, reach: 22000, impressions: 53000, clicks: 514, ctr: 0.97, cpc: 1.24, cpm: 11.44, costPerResult: 6.11, amountSpent: 807.60, frequency: 2.41, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      // adset_005 ads
      { id: 'ad_010', adSetId: 'adset_005', campaignId: 'camp_002', name: 'Lookalike - Brand Story A', status: 'active', creativeId: 'cr_010', results: 125, reach: 21000, impressions: 50700, clicks: 497, ctr: 0.98, cpc: 1.24, cpm: 11.45, costPerResult: 6.13, amountSpent: 766.25, frequency: 2.41, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_011', adSetId: 'adset_005', campaignId: 'camp_002', name: 'Lookalike - Brand Story B', status: 'active', creativeId: 'cr_011', results: 86, reach: 14000, impressions: 34100, clicks: 333, ctr: 0.98, cpc: 1.23, cpm: 11.44, costPerResult: 6.12, amountSpent: 525.67, frequency: 2.44, deliveryStatus: 'active', reviewStatus: 'approved', reviewFeedback: null },
      // adset_006 ads
      { id: 'ad_012', adSetId: 'adset_006', campaignId: 'camp_003', name: 'Spring - Women Image A', status: 'paused', creativeId: 'cr_012', results: 950, reach: 58000, impressions: 161000, clicks: 5065, ctr: 3.15, cpc: 0.42, cpm: 13.24, costPerResult: 2.24, amountSpent: 2128.00, frequency: 2.78, deliveryStatus: 'not_delivering', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_013', adSetId: 'adset_006', campaignId: 'camp_003', name: 'Spring - Women Carousel', status: 'paused', creativeId: 'cr_013', results: 850, reach: 52000, impressions: 144000, clicks: 4535, ctr: 3.15, cpc: 0.42, cpm: 13.26, costPerResult: 2.25, amountSpent: 1904.00, frequency: 2.77, deliveryStatus: 'not_delivering', reviewStatus: 'approved', reviewFeedback: null },
      // adset_007 ads
      { id: 'ad_014', adSetId: 'adset_007', campaignId: 'camp_003', name: 'Spring Retarget - Image A', status: 'paused', creativeId: 'cr_014', results: 900, reach: 56000, impressions: 154000, clicks: 4824, ctr: 3.13, cpc: 0.42, cpm: 13.14, costPerResult: 2.24, amountSpent: 2016.00, frequency: 2.75, deliveryStatus: 'not_delivering', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_015', adSetId: 'adset_007', campaignId: 'camp_003', name: 'Spring Retarget - Video', status: 'paused', creativeId: 'cr_015', results: 720, reach: 44000, impressions: 121000, clicks: 3776, ctr: 3.12, cpc: 0.42, cpm: 13.17, costPerResult: 2.24, amountSpent: 1612.80, frequency: 2.75, deliveryStatus: 'not_delivering', reviewStatus: 'approved', reviewFeedback: null },
      // adset_008 ads
      { id: 'ad_016', adSetId: 'adset_008', campaignId: 'camp_004', name: 'Webinar Lead Gen - Image A', status: 'active', creativeId: 'cr_016', results: 85, reach: 13000, impressions: 28000, clicks: 498, ctr: 1.78, cpc: 0.86, cpm: 15.30, costPerResult: 5.22, amountSpent: 443.70, frequency: 2.15, deliveryStatus: 'completed', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_017', adSetId: 'adset_008', campaignId: 'camp_004', name: 'Webinar Lead Gen - Image B', status: 'active', creativeId: 'cr_017', results: 70, reach: 11000, impressions: 24000, clicks: 426, ctr: 1.78, cpc: 0.86, cpm: 15.31, costPerResult: 5.24, amountSpent: 366.95, frequency: 2.18, deliveryStatus: 'completed', reviewStatus: 'approved', reviewFeedback: null },
      // adset_009 ads
      { id: 'ad_018', adSetId: 'adset_009', campaignId: 'camp_004', name: 'Video Viewers - Webinar Promo', status: 'active', creativeId: 'cr_018', results: 72, reach: 11000, impressions: 25000, clicks: 444, ctr: 1.78, cpc: 0.86, cpm: 15.32, costPerResult: 5.23, amountSpent: 376.56, frequency: 2.27, deliveryStatus: 'completed', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_019', adSetId: 'adset_009', campaignId: 'camp_004', name: 'Video Viewers - Webinar Invite', status: 'active', creativeId: 'cr_019', results: 60, reach: 10000, impressions: 21000, clicks: 372, ctr: 1.77, cpc: 0.86, cpm: 15.29, costPerResult: 5.23, amountSpent: 313.80, frequency: 2.10, deliveryStatus: 'completed', reviewStatus: 'rejected', reviewFeedback: 'Ad text contains prohibited claims about guaranteed results.' },
      // adset_010 ads (draft)
      { id: 'ad_020', adSetId: 'adset_010', campaignId: 'camp_005', name: 'Holiday - Hero Image Draft', status: 'draft', creativeId: 'cr_020', results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0, frequency: 0, deliveryStatus: 'not_delivering', reviewStatus: 'pending', reviewFeedback: null },
      { id: 'ad_021', adSetId: 'adset_010', campaignId: 'camp_005', name: 'Holiday - Carousel Draft', status: 'draft', creativeId: 'cr_021', results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0, frequency: 0, deliveryStatus: 'not_delivering', reviewStatus: 'pending', reviewFeedback: null },
      // adset_012 ads (error)
      { id: 'ad_022', adSetId: 'adset_012', campaignId: 'camp_006', name: 'App Install - iOS Young Adults', status: 'active', creativeId: 'cr_022', results: 54, reach: 15000, impressions: 31800, clicks: 1108, ctr: 3.48, cpc: 0.88, cpm: 23.71, costPerResult: 13.44, amountSpent: 725.76, frequency: 2.12, deliveryStatus: 'error', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_023', adSetId: 'adset_012', campaignId: 'camp_006', name: 'App Install - iOS Game Feature', status: 'active', creativeId: 'cr_023', results: 36, reach: 10000, impressions: 21100, clicks: 736, ctr: 3.49, cpc: 0.87, cpm: 23.70, costPerResult: 13.47, amountSpent: 485.64, frequency: 2.11, deliveryStatus: 'error', reviewStatus: 'approved', reviewFeedback: null },
      // adset_013 ads
      { id: 'ad_024', adSetId: 'adset_013', campaignId: 'camp_006', name: 'Tech Enthusiasts - App Demo', status: 'active', creativeId: 'cr_024', results: 40, reach: 10000, impressions: 21400, clicks: 745, ctr: 3.48, cpc: 0.88, cpm: 23.73, costPerResult: 13.45, amountSpent: 537.80, frequency: 2.14, deliveryStatus: 'error', reviewStatus: 'approved', reviewFeedback: null },
      { id: 'ad_025', adSetId: 'adset_013', campaignId: 'camp_006', name: 'Tech Enthusiasts - Video Ad', status: 'active', creativeId: 'cr_025', results: 26, reach: 7000, impressions: 14700, clicks: 511, ctr: 3.48, cpc: 0.87, cpm: 23.71, costPerResult: 13.46, amountSpent: 350.56, frequency: 2.10, deliveryStatus: 'error', reviewStatus: 'approved', reviewFeedback: null }
    ],
    creatives: [
      { id: 'cr_001', name: 'Summer Sale Creative A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr001/300/300', primaryText: 'Shop our biggest summer sale! Up to 50% off all items. Limited time offer.', headline: 'Summer Sale - Up to 50% Off', description: 'Free shipping on orders over $50.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/summer-sale', displayUrl: 'example.com/summer-sale', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr001/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_002', name: 'Summer Sale Creative B', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr002/300/300', primaryText: 'Don\'t miss out! Summer deals up to 50% off. Shop now before it\'s too late.', headline: 'Huge Summer Savings', description: 'Ends August 31st.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/summer-sale', displayUrl: 'example.com', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr002/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_003', name: 'Summer Carousel Creative', format: 'carousel', thumbnailUrl: 'https://picsum.photos/seed/cr003/300/300', primaryText: 'Explore our summer collection! Multiple categories on sale.', headline: 'Summer Sale Collection', description: 'Shop all categories.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/summer-sale', displayUrl: 'example.com', mediaItems: [], carouselCards: [{ headline: 'Women\'s Fashion', description: 'Up to 40% off', imageUrl: 'https://picsum.photos/seed/cr003a/400/400', linkUrl: 'https://example.com/womens' }, { headline: 'Men\'s Collection', description: 'Up to 35% off', imageUrl: 'https://picsum.photos/seed/cr003b/400/400', linkUrl: 'https://example.com/mens' }, { headline: 'Accessories', description: 'Up to 50% off', imageUrl: 'https://picsum.photos/seed/cr003c/400/400', linkUrl: 'https://example.com/accessories' }] },
      { id: 'cr_004', name: 'Retargeting Dynamic A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr004/300/300', primaryText: 'You left something behind! Complete your purchase and save 10% with code COMEBACK.', headline: 'Complete Your Order - 10% Off', description: 'Use code COMEBACK at checkout.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/cart', displayUrl: 'example.com/cart', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr004/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_005', name: 'Retargeting Dynamic B', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr005/300/300', primaryText: 'Still thinking about it? We saved your cart. Plus enjoy free shipping on your next order!', headline: 'Your Cart is Waiting', description: 'Free shipping available now.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/cart', displayUrl: 'example.com', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr005/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_006', name: 'UK Summer Image A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr006/300/300', primaryText: 'Summer\'s here! Get up to 50% off our latest collection. Free delivery on UK orders.', headline: 'Summer Sale - UK Exclusive', description: 'Free UK delivery included.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/uk/summer', displayUrl: 'example.com/uk', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr006/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_007', name: 'UK Summer Video A', format: 'single_video', thumbnailUrl: 'https://picsum.photos/seed/cr007/300/300', primaryText: 'See what\'s new this summer at Acme. Up to 50% off selected styles.', headline: 'Summer at Acme', description: 'Shop the latest trends.', callToAction: 'learn_more', websiteUrl: 'https://www.example.com/uk/summer', displayUrl: 'example.com/uk', mediaItems: [{ type: 'video', url: 'https://example.com/videos/summer-uk.mp4', width: 1920, height: 1080 }], carouselCards: null },
      { id: 'cr_008', name: 'Awareness Video A', format: 'single_video', thumbnailUrl: 'https://picsum.photos/seed/cr008/300/300', primaryText: 'Acme Corporation — building quality products since 1998. Discover our story.', headline: 'Trusted by Millions', description: 'Quality you can count on.', callToAction: 'learn_more', websiteUrl: 'https://www.example.com/about', displayUrl: 'example.com', mediaItems: [{ type: 'video', url: 'https://example.com/videos/brand-story.mp4', width: 1920, height: 1080 }], carouselCards: null },
      { id: 'cr_009', name: 'Awareness Carousel', format: 'carousel', thumbnailUrl: 'https://picsum.photos/seed/cr009/300/300', primaryText: 'Discover why customers trust Acme for quality and value. See what we offer.', headline: 'Why Choose Acme?', description: 'Quality guaranteed.', callToAction: 'learn_more', websiteUrl: 'https://www.example.com/about', displayUrl: 'example.com', mediaItems: [], carouselCards: [{ headline: 'Premium Quality', description: 'Every product tested', imageUrl: 'https://picsum.photos/seed/cr009a/400/400', linkUrl: 'https://example.com/quality' }, { headline: 'Fast Shipping', description: '2-day delivery available', imageUrl: 'https://picsum.photos/seed/cr009b/400/400', linkUrl: 'https://example.com/shipping' }, { headline: '24/7 Support', description: 'Always here to help', imageUrl: 'https://picsum.photos/seed/cr009c/400/400', linkUrl: 'https://example.com/support' }] },
      { id: 'cr_010', name: 'Brand Story A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr010/300/300', primaryText: 'Join millions of satisfied customers. Experience the Acme difference today.', headline: 'Join the Acme Family', description: 'Quality products, exceptional service.', callToAction: 'learn_more', websiteUrl: 'https://www.example.com', displayUrl: 'example.com', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr010/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_011', name: 'Brand Story B', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr011/300/300', primaryText: 'Acme: Where quality meets affordability. Browse our full collection now.', headline: 'Quality Meets Value', description: 'Shop our full range today.', callToAction: 'learn_more', websiteUrl: 'https://www.example.com', displayUrl: 'example.com', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr011/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_012', name: 'Spring Women Image A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr012/300/300', primaryText: 'Spring is here! New arrivals in women\'s fashion. Fresh styles, great prices.', headline: 'New Spring Arrivals', description: 'Shop the latest women\'s styles.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/spring/women', displayUrl: 'example.com/spring', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr012/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_013', name: 'Spring Women Carousel', format: 'carousel', thumbnailUrl: 'https://picsum.photos/seed/cr013/300/300', primaryText: 'Refresh your wardrobe this spring! Explore our newest women\'s collection.', headline: 'Spring Women\'s Collection', description: 'New styles just arrived.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/spring', displayUrl: 'example.com/spring', mediaItems: [], carouselCards: [{ headline: 'Dresses', description: 'From $39', imageUrl: 'https://picsum.photos/seed/cr013a/400/400', linkUrl: 'https://example.com/dresses' }, { headline: 'Tops & Blouses', description: 'From $24', imageUrl: 'https://picsum.photos/seed/cr013b/400/400', linkUrl: 'https://example.com/tops' }, { headline: 'Activewear', description: 'From $29', imageUrl: 'https://picsum.photos/seed/cr013c/400/400', linkUrl: 'https://example.com/active' }] },
      { id: 'cr_014', name: 'Spring Retarget Image', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr014/300/300', primaryText: 'We noticed you checking out our spring collection. Come back and find your perfect look!', headline: 'Find Your Spring Style', description: 'New arrivals waiting for you.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/spring', displayUrl: 'example.com', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr014/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_015', name: 'Spring Retarget Video', format: 'single_video', thumbnailUrl: 'https://picsum.photos/seed/cr015/300/300', primaryText: 'The spring pieces you loved are still available. Don\'t miss out on the season\'s best looks.', headline: 'Spring Styles Still Available', description: 'Limited quantities remaining.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/spring', displayUrl: 'example.com/spring', mediaItems: [{ type: 'video', url: 'https://example.com/videos/spring-retarget.mp4', width: 1920, height: 1080 }], carouselCards: null },
      { id: 'cr_016', name: 'Webinar Lead Gen Image A', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr016/300/300', primaryText: 'Join our free webinar: "Growth Strategies for 2025". Limited spots available. Register now!', headline: 'Free Webinar: Growth in 2025', description: 'Register now — limited seats.', callToAction: 'sign_up', websiteUrl: 'https://www.example.com/webinar', displayUrl: 'example.com/webinar', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr016/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_017', name: 'Webinar Lead Gen Image B', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr017/300/300', primaryText: 'Learn proven strategies to grow your business in 2025. Expert-led, 100% free webinar.', headline: 'Grow Your Business in 2025', description: 'Expert-led free webinar.', callToAction: 'sign_up', websiteUrl: 'https://www.example.com/webinar', displayUrl: 'example.com/webinar', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr017/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_018', name: 'Webinar Video Viewers Promo', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr018/300/300', primaryText: 'You watched our content — now take the next step! Join our upcoming growth webinar.', headline: 'Next Step: Free Webinar', description: 'You\'re invited — register free.', callToAction: 'sign_up', websiteUrl: 'https://www.example.com/webinar', displayUrl: 'example.com/webinar', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr018/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_019', name: 'Webinar Video Viewers Invite', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr019/300/300', primaryText: 'GUARANTEED results! Sign up for our webinar and we guarantee your business will grow 300%.', headline: 'Guaranteed Business Growth', description: '300% growth guaranteed.', callToAction: 'sign_up', websiteUrl: 'https://www.example.com/webinar', displayUrl: 'example.com/webinar', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr019/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_020', name: 'Holiday Hero Draft', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr020/300/300', primaryText: 'Biggest sale of the year! Holiday deals up to 70% off. Shop our full collection.', headline: 'Holiday Sale - 70% Off', description: 'Limited time holiday offer.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/holiday', displayUrl: 'example.com/holiday', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr020/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_021', name: 'Holiday Carousel Draft', format: 'carousel', thumbnailUrl: 'https://picsum.photos/seed/cr021/300/300', primaryText: 'Holiday gifts for everyone! Explore our curated gift guide.', headline: 'Holiday Gift Guide', description: 'Find the perfect gift.', callToAction: 'shop_now', websiteUrl: 'https://www.example.com/holiday-gifts', displayUrl: 'example.com/holiday', mediaItems: [], carouselCards: [{ headline: 'Gifts Under $25', description: 'Great stocking stuffers', imageUrl: 'https://picsum.photos/seed/cr021a/400/400', linkUrl: 'https://example.com/gifts-25' }, { headline: 'Gifts Under $50', description: 'Something for everyone', imageUrl: 'https://picsum.photos/seed/cr021b/400/400', linkUrl: 'https://example.com/gifts-50' }, { headline: 'Luxury Gifts', description: 'Premium selections', imageUrl: 'https://picsum.photos/seed/cr021c/400/400', linkUrl: 'https://example.com/luxury' }] },
      { id: 'cr_022', name: 'App Install iOS Young Adults', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr022/300/300', primaryText: 'Download the Acme app now! Shop on the go, track orders, and get exclusive app-only deals.', headline: 'Get the Acme App', description: 'Exclusive app-only offers.', callToAction: 'download', websiteUrl: 'https://apps.apple.com/app/acme', displayUrl: 'apps.apple.com/acme', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr022/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_023', name: 'App Install iOS Game Feature', format: 'single_image', thumbnailUrl: 'https://picsum.photos/seed/cr023/300/300', primaryText: 'Earn reward points with every purchase on the Acme app. Download free and start earning today!', headline: 'Earn Rewards - Download App', description: 'Points on every purchase.', callToAction: 'download', websiteUrl: 'https://apps.apple.com/app/acme', displayUrl: 'apps.apple.com/acme', mediaItems: [{ type: 'image', url: 'https://picsum.photos/seed/cr023/1080/1080', width: 1080, height: 1080 }], carouselCards: null },
      { id: 'cr_024', name: 'Tech App Demo', format: 'single_video', thumbnailUrl: 'https://picsum.photos/seed/cr024/300/300', primaryText: 'See the Acme app in action! Smart features, seamless shopping, exclusive deals.', headline: 'Smart Shopping App', description: 'Available free on iOS.', callToAction: 'download', websiteUrl: 'https://apps.apple.com/app/acme', displayUrl: 'apps.apple.com/acme', mediaItems: [{ type: 'video', url: 'https://example.com/videos/app-demo.mp4', width: 1920, height: 1080 }], carouselCards: null },
      { id: 'cr_025', name: 'Tech Enthusiasts Video Ad', format: 'single_video', thumbnailUrl: 'https://picsum.photos/seed/cr025/300/300', primaryText: 'Level up your shopping experience with the Acme app. AI-powered recommendations just for you.', headline: 'AI-Powered Shopping', description: 'Personalized just for you.', callToAction: 'download', websiteUrl: 'https://apps.apple.com/app/acme', displayUrl: 'apps.apple.com/acme', mediaItems: [{ type: 'video', url: 'https://example.com/videos/ai-shopping.mp4', width: 1920, height: 1080 }], carouselCards: null }
    ],
    audiences: [
      { id: 'aud_001', name: 'Website Visitors - 30 Days', type: 'custom', source: 'website', size: 45000, sizeRange: '40,000 - 50,000', availability: 'ready', createdAt: '2025-05-15T09:00:00Z', updatedAt: '2025-07-01T12:00:00Z', description: 'People who visited our website in the last 30 days', lookalikeSpec: null },
      { id: 'aud_002', name: 'Email Subscribers', type: 'custom', source: 'customer_list', size: 12000, sizeRange: '10,000 - 14,000', availability: 'ready', createdAt: '2025-04-10T11:00:00Z', updatedAt: '2025-06-20T09:30:00Z', description: 'Our current email subscriber list', lookalikeSpec: null },
      { id: 'aud_003', name: '1% Lookalike - Top Purchasers', type: 'lookalike', source: null, size: 2100000, sizeRange: '2.0M - 2.2M', availability: 'ready', createdAt: '2025-04-12T14:00:00Z', updatedAt: '2025-06-25T16:00:00Z', description: '1% lookalike audience based on top purchasers', lookalikeSpec: { sourceAudienceId: 'aud_002', country: 'US', ratio: 0.01 } },
      { id: 'aud_004', name: 'Video Viewers 75%+', type: 'custom', source: 'engagement', size: 28000, sizeRange: '25,000 - 31,000', availability: 'ready', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-07-10T14:00:00Z', description: 'People who watched 75% or more of our video ads', lookalikeSpec: null },
      { id: 'aud_005', name: 'US 25-44 Shoppers - Saved', type: 'saved', source: null, size: 15000000, sizeRange: '14M - 16M', availability: 'ready', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', description: 'Saved audience: US adults 25-44 interested in shopping', lookalikeSpec: null },
      { id: 'aud_006', name: 'New Prospect List - July 2025', type: 'custom', source: 'customer_list', size: 0, sizeRange: '0', availability: 'populating', createdAt: '2025-07-15T13:00:00Z', updatedAt: '2025-07-15T13:00:00Z', description: 'Recently uploaded customer prospect list, still processing', lookalikeSpec: null }
    ],
    notifications: [
      { id: 'notif_001', type: 'ad_approved', title: 'Ad Approved', message: 'Your ad "Summer Sale - Image A" has been approved and is now running.', timestamp: '2025-07-10T08:30:00Z', read: true, actionUrl: '/campaigns/camp_001', relatedEntityId: 'ad_001' },
      { id: 'notif_002', type: 'ad_approved', title: 'Ad Approved', message: 'Your ad "Summer Sale - Image B" has been approved and is now running.', timestamp: '2025-07-10T08:35:00Z', read: true, actionUrl: '/campaigns/camp_001', relatedEntityId: 'ad_002' },
      { id: 'notif_003', type: 'ad_approved', title: 'Ad Approved', message: 'Your ad "Brand Awareness - Video A" has been reviewed and approved.', timestamp: '2025-07-08T11:00:00Z', read: true, actionUrl: '/campaigns/camp_002', relatedEntityId: 'ad_008' },
      { id: 'notif_004', type: 'ad_rejected', title: 'Ad Rejected', message: 'Your ad "Webinar Video Viewers - Invite" was rejected. Reason: Ad text contains prohibited claims about guaranteed results.', timestamp: '2025-07-09T14:20:00Z', read: false, actionUrl: '/campaigns/camp_004', relatedEntityId: 'ad_019' },
      { id: 'notif_005', type: 'budget_alert', title: 'Budget Alert', message: 'Your campaign "Spring Collection Traffic" has reached 90% of its total budget.', timestamp: '2025-07-07T16:00:00Z', read: true, actionUrl: '/campaigns/camp_003', relatedEntityId: 'camp_003' },
      { id: 'notif_006', type: 'budget_alert', title: 'Daily Budget Alert', message: 'Your campaign "App Install Push - iOS" exceeded its daily budget yesterday by 12%.', timestamp: '2025-07-11T09:00:00Z', read: false, actionUrl: '/campaigns/camp_006', relatedEntityId: 'camp_006' },
      { id: 'notif_007', type: 'performance_alert', title: 'Performance Milestone', message: 'Great news! "Summer Sale 2025" has achieved a ROAS of 3.45x — above your target of 3x.', timestamp: '2025-07-08T17:30:00Z', read: true, actionUrl: '/campaigns/camp_001', relatedEntityId: 'camp_001' },
      { id: 'notif_008', type: 'performance_alert', title: 'Low Performance Alert', message: 'Your campaign "Brand Awareness Q3" has a CTR of 0.98%, below the average of 1.5%. Consider refreshing your creative.', timestamp: '2025-07-10T10:00:00Z', read: false, actionUrl: '/campaigns/camp_002', relatedEntityId: 'camp_002' },
      { id: 'notif_009', type: 'account_update', title: 'Ad Account Updated', message: 'Your ad account "Acme Corp Ad Account" has been updated with new payment information.', timestamp: '2025-07-05T14:00:00Z', read: true, actionUrl: '/billing', relatedEntityId: null },
      { id: 'notif_010', type: 'account_update', title: 'Policy Update', message: 'Meta has updated its advertising policies. Review the changes to ensure your ads remain compliant.', timestamp: '2025-07-03T09:00:00Z', read: true, actionUrl: '/settings', relatedEntityId: null }
    ],
    paymentMethods: [
      { id: 'pm_001', type: 'credit_card', name: 'Visa ending in 4242', isPrimary: true, expiresAt: '12/2027' }
    ],
    billingTransactions: (() => {
      const txns = [];
      const base = new Date('2026-04-10');
      for (let i = 0; i < 15; i++) {
        const d = new Date(base);
        d.setDate(d.getDate() - i - 1);
        const amount = 80 + Math.floor(Math.random() * 170);
        txns.push({
          id: `txn_${String(i + 1).padStart(3, '0')}`,
          date: d.toISOString(),
          description: `Ad charges for ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          amount: parseFloat(amount.toFixed(2)),
          status: i === 0 ? 'pending' : 'completed',
          paymentMethod: 'Visa ending in 4242'
        });
      }
      return txns;
    })(),
    savedReports: [
      { id: 'report_001', name: 'Weekly Performance Summary', columns: ['name', 'results', 'reach', 'impressions', 'amountSpent', 'ctr', 'roas'], dateRange: 'last_7_days', filters: { status: ['active'] }, breakdown: null, createdAt: '2025-06-01T10:00:00Z' },
      { id: 'report_002', name: 'Monthly Campaign Comparison', columns: ['name', 'results', 'reach', 'impressions', 'clicks', 'amountSpent', 'costPerResult', 'roas'], dateRange: 'last_30_days', filters: {}, breakdown: null, createdAt: '2025-06-15T14:00:00Z' },
      { id: 'report_003', name: 'Audience Insights - Age', columns: ['name', 'results', 'reach', 'impressions', 'amountSpent'], dateRange: 'last_14_days', filters: {}, breakdown: 'age', createdAt: '2025-07-01T09:00:00Z' }
    ],
    eventsManager: {
      pixels: [
        {
          id: 'pixel_001',
          name: 'Acme Corp Pixel',
          status: 'active',
          pixelId: '1234567890123456',
          domain: 'www.example.com',
          lastActivity: '2 minutes ago',
          eventsToday: 4521,
          eventsYesterday: 5102,
          createdAt: '2024-08-15T10:00:00Z'
        }
      ],
      events: [
        { id: 'evt_001', name: 'PageView', source: 'pixel', status: 'active', eventsReceived: 245000, eventsMatched: 198000, matchRate: 80.8, lastReceived: '2 min ago', parameters: ['url', 'referrer', 'user_agent'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_002', name: 'ViewContent', source: 'pixel', status: 'active', eventsReceived: 89200, eventsMatched: 71500, matchRate: 80.2, lastReceived: '5 min ago', parameters: ['content_ids', 'content_type', 'value', 'currency'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_003', name: 'AddToCart', source: 'pixel', status: 'active', eventsReceived: 34500, eventsMatched: 28100, matchRate: 81.4, lastReceived: '8 min ago', parameters: ['content_ids', 'content_type', 'value', 'currency', 'num_items'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_004', name: 'InitiateCheckout', source: 'pixel', status: 'active', eventsReceived: 18700, eventsMatched: 15200, matchRate: 81.3, lastReceived: '12 min ago', parameters: ['value', 'currency', 'num_items'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_005', name: 'Purchase', source: 'pixel', status: 'active', eventsReceived: 8900, eventsMatched: 7400, matchRate: 83.1, lastReceived: '15 min ago', parameters: ['value', 'currency', 'content_ids', 'content_type', 'num_items', 'order_id'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_006', name: 'Lead', source: 'pixel', status: 'active', eventsReceived: 4200, eventsMatched: 3400, matchRate: 81.0, lastReceived: '22 min ago', parameters: ['value', 'currency'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_007', name: 'CompleteRegistration', source: 'pixel', status: 'active', eventsReceived: 2800, eventsMatched: 2200, matchRate: 78.6, lastReceived: '1 hour ago', parameters: ['value', 'currency', 'status'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_008', name: 'Search', source: 'pixel', status: 'active', eventsReceived: 56000, eventsMatched: 44800, matchRate: 80.0, lastReceived: '3 min ago', parameters: ['search_string', 'content_category'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_009', name: 'ServerPurchase', source: 'server', status: 'active', eventsReceived: 3200, eventsMatched: 2900, matchRate: 90.6, lastReceived: '30 min ago', parameters: ['value', 'currency', 'order_id', 'email_hash', 'phone_hash'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
        { id: 'evt_010', name: 'ServerLead', source: 'server', status: 'error', eventsReceived: 1500, eventsMatched: 0, matchRate: 0, lastReceived: '2 days ago', parameters: ['value', 'email_hash'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: false, recentErrors: [
          { message: 'Invalid access token - server-side API token expired', time: '2 days ago' },
          { message: 'Connection timeout to Conversions API endpoint', time: '3 days ago' }
        ] }
      ],
      customConversions: [
        { id: 'cc_001', name: 'High-Value Purchase', rule: 'Purchase event where value > 100', eventSource: 'Purchase', status: 'active', totalFires: 2340, createdAt: '2025-03-01T10:00:00Z' },
        { id: 'cc_002', name: 'Checkout Abandonment', rule: 'InitiateCheckout without Purchase within 24h', eventSource: 'InitiateCheckout', status: 'active', totalFires: 9800, createdAt: '2025-04-15T14:00:00Z' },
        { id: 'cc_003', name: 'Product Page - Sale Items', rule: 'ViewContent where URL contains /sale/', eventSource: 'ViewContent', status: 'active', totalFires: 15600, createdAt: '2025-05-20T08:00:00Z' }
      ],
      diagnostics: {
        overallHealth: 'good',
        pixelFireRate: 98.2,
        eventMatchQuality: 'Great',
        domainVerification: 'verified',
        aggregatedEventMeasurement: true,
        serverEventsDeduplication: 92.1
      }
    },
    // UI State
    selectedTab: 'campaigns',
    selectedDateRange: 'last_7_days',
    visibleColumns: ['status', 'name', 'delivery', 'bidStrategy', 'budget', 'results', 'reach', 'impressions', 'costPerResult', 'amountSpent', 'roas'],
    filters: {},
    searchQuery: '',
    selectedRows: [],
    sidebarCollapsed: false,
    activeBreakdown: null,
    notificationsOpen: false,
    settings: {
      notificationPreferences: {
        adApprovals: true,
        budgetAlerts: true,
        performanceAlerts: true,
        deliveryIssues: true
      }
    }
  };
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid);
  const iKey = initialKey(sid);

  const stored = localStorage.getItem(sKey);
  const isRefresh = localStorage.getItem(iKey) !== null;

  if (isRefresh && !customState) {
    // returning visitor — use stored state
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (e) {
      // fall through to default
    }
  }

  const defaults = createInitialData();
  let data = customState ? deepMerge(defaults, customState) : defaults;

  if (!isRefresh) {
    localStorage.setItem(iKey, JSON.stringify(data));
  }
  localStorage.setItem(sKey, JSON.stringify(data));
  return data;
}
