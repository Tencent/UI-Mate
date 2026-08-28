const BASE_KEY = 'klaviyo_mock_state';
const BASE_INITIAL_KEY = 'klaviyo_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('klaviyo_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('klaviyo_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await res.json();
    if (data.has_custom_state && data.stored_state) {
      return data.stored_state;
    }
  } catch (e) {
    console.error('Error fetching custom state:', e);
  }
  return null;
};

export const saveState = (state, sid = null) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
    if (sid) {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

export const loadState = (sid = null) => {
  try {
    const stored = localStorage.getItem(storageKey(sid));
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return null;
};

export const saveInitialState = (state, sid = null) => {
  try {
    localStorage.setItem(initialKey(sid), JSON.stringify(state));
  } catch (e) {
    console.error('Error saving initial state:', e);
  }
};

export const loadInitialState = (sid = null) => {
  try {
    const stored = localStorage.getItem(initialKey(sid));
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading initial state:', e);
  }
  return null;
};

export const initializeData = (sid = null, customState = null) => {
  if (customState) {
    const defaultData = createInitialData();
    const merged = { ...defaultData, ...customState };
    saveState(merged, sid);
    saveInitialState(merged, sid);
    return merged;
  }

  const existing = loadState(sid);
  if (existing) return existing;

  const defaultData = createInitialData();
  saveState(defaultData, sid);
  saveInitialState(defaultData, sid);
  return defaultData;
};

// Deterministic seeded random for profile generation
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateProfiles() {
  const rand = seededRandom(42);
  const firstNames = ['Emma','James','Sophia','Michael','Olivia','David','Isabella','William','Ava','Alexander','Mia','Benjamin','Charlotte','Daniel','Amelia','Ethan','Harper','Liam','Evelyn','Noah','Abigail','Lucas','Grace','Mason','Chloe','Logan','Ella','Aiden','Lily','Jacob','Nora','Jackson','Zoe','Henry','Hannah','Sebastian','Aria','Owen','Scarlett','Jack','Madison','Caleb','Layla','Carter','Penelope','Luke','Riley','Nathan','Zoey','Ryan','Victoria','Isaac','Stella','Dylan','Hazel','Elijah','Aurora','Matthew','Savannah','Gabriel','Aubrey','Samuel','Brooklyn','Joshua','Paisley','Andrew','Ellie','Leo','Anna','Jayden','Caroline','Asher','Maya','Lincoln','Naomi','Theodore','Aaliyah','Adrian','Eleanor','Miles','Leah','Eli','Willow','Ezra','Skylar','Josiah','Addison','Ian','Lucy','Cameron','Lillian','Thomas','Natalie','Christopher','Sophie','Christian','Valentina','Jaxon','Sadie','Colton','Piper','Dominic','Josephine','Landon','Ivy','Austin','Ruby','Connor','Kennedy','Kai','Alice','Robert','Jasmine','Chase','Gianna','Max','Clara','Finn','Kinsley','Beau','Emilia','Tucker','Quinn','Tyler','Lydia','Oliver','Morgan','Cooper','Peyton','George','Kylie','Sawyer','Brielle','Parker','Blake','Axel','Taylor','Jeremiah','Madelyn','Ryder','Andrea','Damian','Allison','Cole','Eva','Atlas','Ariana','Maverick','Serenity'];
  const lastNames = ['Wilson','Chen','Martinez','Brown','Johnson','Kim','Garcia','Taylor','Anderson','Davis','White','Harris','Robinson','Walker','Hall','Allen','Young','King','Wright','Scott','Clark','Lee','Hill','Green','Adams','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzalez','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace','West','Jordan','Owens','Reynolds','Fisher','Ellis','Harrison','Gibson','McDonald','Cruz','Marshall','Ortiz','Stone','Murray','Freeman','Wells','Webb','Palmer','Hunt','Spencer','Hoffman','Nguyen','Tucker','Castro','Coleman','Patel','Warren','Ruiz','Shaw','Black','Fox','Ramos'];
  const cities = [
    { city: 'New York', region: 'NY', zip: '10001' },
    { city: 'Los Angeles', region: 'CA', zip: '90001' },
    { city: 'Chicago', region: 'IL', zip: '60601' },
    { city: 'Houston', region: 'TX', zip: '77001' },
    { city: 'Phoenix', region: 'AZ', zip: '85001' },
    { city: 'Philadelphia', region: 'PA', zip: '19101' },
    { city: 'San Antonio', region: 'TX', zip: '78201' },
    { city: 'San Diego', region: 'CA', zip: '92101' },
    { city: 'Dallas', region: 'TX', zip: '75201' },
    { city: 'Austin', region: 'TX', zip: '78701' },
    { city: 'Boston', region: 'MA', zip: '02101' },
    { city: 'Seattle', region: 'WA', zip: '98101' },
    { city: 'Denver', region: 'CO', zip: '80201' },
    { city: 'Miami', region: 'FL', zip: '33101' },
    { city: 'Atlanta', region: 'GA', zip: '30301' },
    { city: 'San Francisco', region: 'CA', zip: '94101' },
    { city: 'Portland', region: 'OR', zip: '97201' },
    { city: 'Nashville', region: 'TN', zip: '37201' },
    { city: 'Charlotte', region: 'NC', zip: '28201' },
    { city: 'Minneapolis', region: 'MN', zip: '55401' },
    { city: 'Tampa', region: 'FL', zip: '33601' },
    { city: 'Detroit', region: 'MI', zip: '48201' },
    { city: 'Raleigh', region: 'NC', zip: '27601' },
    { city: 'Salt Lake City', region: 'UT', zip: '84101' },
    { city: 'Columbus', region: 'OH', zip: '43201' },
    { city: 'Indianapolis', region: 'IN', zip: '46201' },
    { city: 'Kansas City', region: 'MO', zip: '64101' },
    { city: 'San Jose', region: 'CA', zip: '95101' },
    { city: 'Orlando', region: 'FL', zip: '32801' },
    { city: 'Pittsburgh', region: 'PA', zip: '15201' },
  ];
  const titles = ['Marketing Director','Software Engineer','Graphic Designer','Product Manager','Entrepreneur','Data Analyst','Fashion Buyer','Accountant','Teacher','Chef','Photographer','Lawyer','Nurse','Freelance Writer','Interior Designer','Sales Manager','HR Manager','Architect','Marketing Coordinator','Musician','Consultant','Developer','Project Manager','UX Designer','Content Strategist','Financial Analyst','Operations Manager','Creative Director','Founder','VP of Sales','CTO','Brand Manager','Social Media Manager','Customer Success Manager','Account Executive','Research Scientist','Therapist','Real Estate Agent','Dental Hygienist','Pharmacist',''];
  const orgs = ['TechFlow Inc','DataSync Corp','Creative Studio','ShopWave','Olive & Co','MetricsHub','StyleHaus','NumbersCo','Lincoln Academy','Bistro 44','Lens & Light','Davis & Partners','City Hospital','Home & Luxe','SalesForce Pro','PeopleFirst','BuildDesign','BrandUp','Pulse Digital','Horizon Labs','NexGen Solutions','Vertex Media','Quantum Analytics','CloudBase Inc','GreenLeaf Co','Peak Performance','Silverline Studio','Ironwood Partners','Blue Ocean Ventures','Cascade Systems','Swift Commerce','Evergreen Media','Pinnacle Group','Spark Innovation','Harbor Consulting','Summit Creative','Atlas Partners','Redwood Digital','Crystal Clear Media','','','',''];
  const domains = ['gmail.com','outlook.com','yahoo.com','protonmail.com','icloud.com','aol.com','hotmail.com'];

  const profiles = [];
  for (let i = 1; i <= 520; i++) {
    const fIdx = Math.floor(rand() * firstNames.length);
    const lIdx = Math.floor(rand() * lastNames.length);
    const firstName = firstNames[fIdx];
    const lastName = lastNames[lIdx];
    const locIdx = Math.floor(rand() * cities.length);
    const loc = cities[locIdx];
    const domIdx = Math.floor(rand() * domains.length);
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 100 ? i : ''}`;
    const email = `${emailPrefix}@${domains[domIdx]}`;
    const titleIdx = Math.floor(rand() * titles.length);
    const orgIdx = Math.floor(rand() * orgs.length);

    // Vary profile attributes
    const isVIP = i <= 45;
    const isActive = i <= 340;
    const isNew = i > 400 && i <= 480;
    const isLapsed = i > 340 && i <= 400;
    const isSMSOnly = i > 480 && i <= 510;
    const isWholesale = i > 510;

    const totalOrders = isVIP ? Math.floor(rand() * 30 + 8) :
                        isActive ? Math.floor(rand() * 12 + 1) :
                        isNew ? Math.floor(rand() * 2) :
                        isLapsed ? Math.floor(rand() * 6 + 1) :
                        isSMSOnly ? Math.floor(rand() * 2) :
                        Math.floor(rand() * 3);

    const avgOV = 40 + rand() * 120;
    const ltv = totalOrders * avgOV;
    const predictedLTV = ltv * (1 + rand() * 0.5);

    const createdYear = isNew ? 2025 : (2024 + Math.floor(rand() * 1));
    const createdMonth = isNew ? Math.floor(rand() * 3 + 1) : Math.floor(rand() * 12 + 1);
    const createdDay = Math.floor(rand() * 28 + 1);
    const createdAt = `${createdYear}-${String(createdMonth).padStart(2,'0')}-${String(createdDay).padStart(2,'0')}T${String(Math.floor(rand()*12+7)).padStart(2,'0')}:${String(Math.floor(rand()*60)).padStart(2,'0')}:00Z`;

    const lastActiveMonth = isLapsed ? Math.floor(rand() * 3 + 6) : Math.floor(rand() * 3 + 1);
    const lastActiveDay = Math.floor(rand() * 28 + 1);
    const lastActive = isLapsed ?
      `2024-${String(lastActiveMonth).padStart(2,'0')}-${String(lastActiveDay).padStart(2,'0')}T${String(Math.floor(rand()*12+7)).padStart(2,'0')}:${String(Math.floor(rand()*60)).padStart(2,'0')}:00Z` :
      `2025-03-${String(Math.floor(rand()*19+1)).padStart(2,'0')}T${String(Math.floor(rand()*12+7)).padStart(2,'0')}:${String(Math.floor(rand()*60)).padStart(2,'0')}:00Z`;

    const listIds = [];
    const segmentIds = [];
    const tags = [];

    // List assignments
    if (!isSMSOnly && !isWholesale) listIds.push('list_001');
    if (isVIP) { listIds.push('list_002'); tags.push('vip', 'repeat-buyer'); segmentIds.push('seg_001'); }
    if (isSMSOnly || (rand() > 0.6 && isActive)) listIds.push('list_003');
    if (isNew) { listIds.push('list_004'); segmentIds.push('seg_007'); }
    if (isWholesale) { listIds.push('list_005'); tags.push('wholesale'); }

    // Segment assignments
    if (isActive && !isNew) segmentIds.push('seg_002');
    if (totalOrders > 2) segmentIds.push('seg_004');
    if (isLapsed) { segmentIds.push('seg_005', 'seg_008'); tags.push('at-risk'); }
    if (isSMSOnly) { segmentIds.push('seg_006'); tags.push('sms-only'); }

    const emailConsent = isSMSOnly ? 'not_subscribed' : (isLapsed && rand() > 0.7 ? 'unsubscribed' : 'subscribed');
    const smsConsent = isSMSOnly ? 'subscribed' : (rand() > 0.55 ? 'subscribed' : 'not_subscribed');
    const gender = rand() > 0.5 ? 'female' : 'male';

    profiles.push({
      id: `prof_${String(i).padStart(3,'0')}`,
      email,
      firstName,
      lastName,
      phone: `+1-555-${String(1000 + i).padStart(4,'0')}`,
      location: { city: loc.city, region: loc.region, country: 'US', zip: loc.zip },
      title: titles[titleIdx],
      organization: orgs[orgIdx],
      createdAt,
      lastActive,
      customProperties: {
        lifetime_value: parseFloat(ltv.toFixed(2)),
        total_orders: totalOrders,
        avg_order_value: totalOrders > 0 ? parseFloat(avgOV.toFixed(2)) : 0,
        preferred_category: ['Apparel','Electronics','Home & Garden','Beauty','Sports','Books','Food & Drink'][Math.floor(rand() * 7)],
        source: ['organic','paid_social','referral','email','direct','affiliate'][Math.floor(rand() * 6)]
      },
      predictedGender: gender,
      predictedLTV: parseFloat(predictedLTV.toFixed(2)),
      listIds,
      segmentIds,
      consent: { email: emailConsent, sms: smsConsent },
      tags
    });
  }
  return profiles;
}

export function createInitialData() {
  const profiles = generateProfiles();

  return {
    account: {
      id: 'acct_001',
      companyName: 'Acme Store',
      industry: 'E-commerce',
      website: 'https://acmestore.com',
      defaultSenderName: 'Acme Store',
      defaultSenderEmail: 'hello@acmestore.com',
      timezone: 'America/New_York',
      plan: 'growth',
      contactCount: profiles.length,
      user: { name: 'Sarah Johnson', email: 'sarah@acmestore.com', role: 'owner' },
      brandSettings: {
        primaryColor: '#000000',
        secondaryColor: '#00D68F',
        accentColor: '#4E7CFF',
        fontFamily: 'Sans-serif',
        logoUrl: ''
      }
    },
    profiles,
    campaigns: [
      { id: 'camp_001', name: 'Spring Sale 2025 - 20% Off', status: 'sent', channel: 'email', subject: 'Spring into savings! 20% off everything', previewText: 'Limited time offer for our best customers', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_008', audienceInclude: ['list_001', 'seg_002'], audienceExclude: ['seg_005'], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-15T09:02:34Z', createdAt: '2025-03-10T14:00:00Z', updatedAt: '2025-03-15T09:02:34Z', tags: ['spring-sale', 'promotional'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 8483, delivered: 8350, opens: 4073, uniqueOpens: 3680, clicks: 214, uniqueClicks: 198, bounced: 133, unsubscribed: 42, spamComplaints: 3, revenue: 15230.50, ordersPlaced: 87, openRate: 0.4869, clickRate: 0.0252, conversionRate: 0.0104 } },
      { id: 'camp_002', name: 'New Arrivals Alert', status: 'sent', channel: 'email', subject: 'Just dropped: New arrivals you will love', previewText: 'Fresh styles just landed in our store', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_002', audienceInclude: ['list_001'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-08T10:00:00Z', createdAt: '2025-03-05T09:00:00Z', updatedAt: '2025-03-08T10:00:00Z', tags: ['promotional'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 15234, delivered: 14980, opens: 5243, uniqueOpens: 4870, clicks: 312, uniqueClicks: 289, bounced: 254, unsubscribed: 67, spamComplaints: 5, revenue: 8945.00, ordersPlaced: 56, openRate: 0.3442, clickRate: 0.0205, conversionRate: 0.0037 } },
      { id: 'camp_003', name: 'Flash Sale Weekend', status: 'sent', channel: 'sms', subject: '', previewText: '', senderName: 'Acme Store', senderEmail: '', templateId: null, audienceInclude: ['list_003'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-12T08:00:00Z', createdAt: '2025-03-11T14:00:00Z', updatedAt: '2025-03-12T08:00:00Z', tags: ['promotional', 'sms'], trackingOptions: { isTrackingOpens: false, isTrackingClicks: true, addUtm: false }, stats: { recipients: 8567, delivered: 8432, opens: 0, uniqueOpens: 0, clicks: 1245, uniqueClicks: 1102, bounced: 135, unsubscribed: 89, spamComplaints: 0, revenue: 12340.00, ordersPlaced: 134, openRate: 0, clickRate: 0.1454, conversionRate: 0.0156 } },
      { id: 'camp_004', name: 'Monthly Newsletter March', status: 'sent', channel: 'email', subject: 'Your March update from Acme Store', previewText: 'What happened this month + exclusive deals', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_003', audienceInclude: ['list_001'], audienceExclude: ['seg_008'], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-01T09:00:00Z', createdAt: '2025-02-25T10:00:00Z', updatedAt: '2025-03-01T09:00:00Z', tags: ['newsletter'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 13134, delivered: 12945, opens: 3884, uniqueOpens: 3625, clicks: 156, uniqueClicks: 143, bounced: 189, unsubscribed: 34, spamComplaints: 2, revenue: 2345.00, ordersPlaced: 23, openRate: 0.2958, clickRate: 0.0119, conversionRate: 0.0018 } },
      { id: 'camp_005', name: 'Customer Appreciation Week', status: 'scheduled', channel: 'email', subject: 'You are appreciated! Special rewards inside', previewText: 'Thank you for being a valued customer', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_001', audienceInclude: ['list_001', 'seg_001'], audienceExclude: [], sendStrategy: 'scheduled', scheduledAt: '2025-03-22T09:00:00Z', sentAt: null, createdAt: '2025-03-18T11:00:00Z', updatedAt: '2025-03-18T11:00:00Z', tags: ['promotional'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } },
      { id: 'camp_006', name: 'Summer Preview', status: 'scheduled', channel: 'email', subject: 'Sneak peek: Summer collection 2025', previewText: 'Be the first to see what is coming', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_002', audienceInclude: ['list_001'], audienceExclude: [], sendStrategy: 'scheduled', scheduledAt: '2025-03-28T09:00:00Z', sentAt: null, createdAt: '2025-03-15T14:00:00Z', updatedAt: '2025-03-15T14:00:00Z', tags: ['seasonal'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } },
      { id: 'camp_007', name: 'Re-engagement: We Miss You', status: 'draft', channel: 'email', subject: 'We miss you! Come back for 15% off', previewText: 'It has been a while - here is a special offer', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: null, audienceInclude: ['seg_008'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: null, createdAt: '2025-03-16T10:00:00Z', updatedAt: '2025-03-16T10:00:00Z', tags: ['promotional'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } },
      { id: 'camp_008', name: 'Product Launch Teaser', status: 'draft', channel: 'email', subject: '', previewText: '', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: null, audienceInclude: [], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: null, createdAt: '2025-03-17T15:00:00Z', updatedAt: '2025-03-17T15:00:00Z', tags: [], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } },
      { id: 'camp_009', name: 'VIP Early Access', status: 'draft', channel: 'sms', subject: '', previewText: '', senderName: 'Acme Store', senderEmail: '', templateId: null, audienceInclude: ['seg_001'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: null, createdAt: '2025-03-18T09:00:00Z', updatedAt: '2025-03-18T09:00:00Z', tags: ['vip', 'sms'], trackingOptions: { isTrackingOpens: false, isTrackingClicks: true, addUtm: false }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } },
      { id: 'camp_010', name: 'Easter Collection', status: 'sent', channel: 'email', subject: 'Hop into Easter savings!', previewText: 'Egg-citing deals inside', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_008', audienceInclude: ['list_001'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-18T09:00:00Z', createdAt: '2025-03-14T10:00:00Z', updatedAt: '2025-03-18T09:00:00Z', tags: ['seasonal'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 15234, delivered: 14998, opens: 4570, uniqueOpens: 4231, clicks: 267, uniqueClicks: 245, bounced: 236, unsubscribed: 45, spamComplaints: 2, revenue: 6780.00, ordersPlaced: 45, openRate: 0.2999, clickRate: 0.0175, conversionRate: 0.003 } },
      { id: 'camp_011', name: 'Shipping Update SMS', status: 'sent', channel: 'sms', subject: '', previewText: '', senderName: 'Acme Store', senderEmail: '', templateId: null, audienceInclude: ['list_003'], audienceExclude: [], sendStrategy: 'immediate', scheduledAt: null, sentAt: '2025-03-19T12:00:00Z', createdAt: '2025-03-19T10:00:00Z', updatedAt: '2025-03-19T12:00:00Z', tags: ['transactional', 'sms'], trackingOptions: { isTrackingOpens: false, isTrackingClicks: true, addUtm: false }, stats: { recipients: 8567, delivered: 8501, opens: 0, uniqueOpens: 0, clicks: 2345, uniqueClicks: 2100, bounced: 66, unsubscribed: 12, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0.2738, conversionRate: 0 } },
      { id: 'camp_012', name: 'Loyalty Rewards Reminder', status: 'scheduled', channel: 'email', subject: 'Your loyalty rewards are waiting!', previewText: 'Redeem your points before they expire', senderName: 'Acme Store', senderEmail: 'hello@acmestore.com', templateId: 'tmpl_001', audienceInclude: ['seg_004'], audienceExclude: [], sendStrategy: 'scheduled', scheduledAt: '2025-03-25T09:00:00Z', sentAt: null, createdAt: '2025-03-19T08:00:00Z', updatedAt: '2025-03-19T08:00:00Z', tags: ['promotional'], trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true }, stats: { recipients: 0, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 } }
    ],
    flows: [
      { id: 'flow_001', name: 'Welcome Series', status: 'live', triggerType: 'list', triggerDetails: { type: 'added_to_list', listId: 'list_001', listName: 'Newsletter Subscribers' }, createdAt: '2024-08-01T10:00:00Z', updatedAt: '2025-02-20T16:45:00Z', tags: ['onboarding', 'welcome'], actions: [
        { id: 'fa_001', flowId: 'flow_001', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'Welcome to Acme Store!', senderName: 'Acme Store', templateId: 'tmpl_001' }, stats: { delivered: 12450, openRate: 0.58, clickRate: 0.12 } },
        { id: 'fa_002', flowId: 'flow_001', type: 'time_delay', position: { x: 0, y: 120 }, parentId: 'fa_001', branchType: null, config: { value: 3, unit: 'days' }, stats: {} },
        { id: 'fa_003', flowId: 'flow_001', type: 'send_email', position: { x: 0, y: 240 }, parentId: 'fa_002', branchType: null, config: { subject: 'Discover our best sellers', senderName: 'Acme Store', templateId: 'tmpl_002' }, stats: { delivered: 11200, openRate: 0.42, clickRate: 0.08 } },
        { id: 'fa_004', flowId: 'flow_001', type: 'conditional_split', position: { x: 0, y: 360 }, parentId: 'fa_003', branchType: null, config: { conditions: [{ property: 'total_orders', operator: 'greater_than', value: 0 }] }, stats: {} }
      ], stats: { delivered: 12450, opens: 7221, clicks: 1494, revenue: 34500, conversions: 245 } },
      { id: 'flow_002', name: 'Abandoned Cart', status: 'live', triggerType: 'metric', triggerDetails: { type: 'metric_triggered', metricName: 'Started Checkout', filter: 'has_not_placed_order_within_1h' }, createdAt: '2024-09-15T10:00:00Z', updatedAt: '2025-03-01T12:00:00Z', tags: ['abandoned-cart'], actions: [
        { id: 'fa_005', flowId: 'flow_002', type: 'time_delay', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { value: 1, unit: 'hours' }, stats: {} },
        { id: 'fa_006', flowId: 'flow_002', type: 'send_email', position: { x: 0, y: 120 }, parentId: 'fa_005', branchType: null, config: { subject: 'You left something behind!', senderName: 'Acme Store', templateId: 'tmpl_004' }, stats: { delivered: 8920, openRate: 0.52, clickRate: 0.15 } },
        { id: 'fa_007', flowId: 'flow_002', type: 'time_delay', position: { x: 0, y: 240 }, parentId: 'fa_006', branchType: null, config: { value: 24, unit: 'hours' }, stats: {} },
        { id: 'fa_008', flowId: 'flow_002', type: 'send_email', position: { x: 0, y: 360 }, parentId: 'fa_007', branchType: null, config: { subject: 'Last chance: Your cart is expiring', senderName: 'Acme Store', templateId: 'tmpl_004' }, stats: { delivered: 7650, openRate: 0.38, clickRate: 0.09 } }
      ], stats: { delivered: 16570, opens: 7489, clicks: 2072, revenue: 28900, conversions: 312 } },
      { id: 'flow_003', name: 'Post-Purchase Thank You', status: 'live', triggerType: 'metric', triggerDetails: { type: 'metric_triggered', metricName: 'Placed Order' }, createdAt: '2024-10-01T10:00:00Z', updatedAt: '2025-02-15T09:00:00Z', tags: ['transactional'], actions: [
        { id: 'fa_009', flowId: 'flow_003', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'Thank you for your order!', senderName: 'Acme Store', templateId: 'tmpl_006' }, stats: { delivered: 45230, openRate: 0.72, clickRate: 0.05 } },
        { id: 'fa_010', flowId: 'flow_003', type: 'time_delay', position: { x: 0, y: 120 }, parentId: 'fa_009', branchType: null, config: { value: 14, unit: 'days' }, stats: {} },
        { id: 'fa_011', flowId: 'flow_003', type: 'send_email', position: { x: 0, y: 240 }, parentId: 'fa_010', branchType: null, config: { subject: 'How was your purchase? Leave a review', senderName: 'Acme Store', templateId: 'tmpl_005' }, stats: { delivered: 38900, openRate: 0.35, clickRate: 0.08 } }
      ], stats: { delivered: 84130, opens: 46275, clicks: 5356, revenue: 12500, conversions: 1890 } },
      { id: 'flow_004', name: 'Browse Abandonment', status: 'manual', triggerType: 'metric', triggerDetails: { type: 'metric_triggered', metricName: 'Viewed Product', filter: 'has_not_started_checkout_within_2h' }, createdAt: '2024-11-01T10:00:00Z', updatedAt: '2025-01-20T14:00:00Z', tags: ['abandoned-cart'], actions: [
        { id: 'fa_012', flowId: 'flow_004', type: 'time_delay', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { value: 2, unit: 'hours' }, stats: {} },
        { id: 'fa_013', flowId: 'flow_004', type: 'send_email', position: { x: 0, y: 120 }, parentId: 'fa_012', branchType: null, config: { subject: 'Still interested? Check these out', senderName: 'Acme Store', templateId: 'tmpl_005' }, stats: { delivered: 3200, openRate: 0.28, clickRate: 0.06 } },
        { id: 'fa_014', flowId: 'flow_004', type: 'send_sms', position: { x: 0, y: 240 }, parentId: 'fa_013', branchType: null, config: { body: 'Hey! We noticed you were browsing. Come back and check out our latest deals! Reply STOP to opt out.' }, stats: { delivered: 1500, openRate: 0, clickRate: 0.12 } }
      ], stats: { delivered: 4700, opens: 896, clicks: 372, revenue: 4500, conversions: 45 } },
      { id: 'flow_005', name: 'Win-Back Series', status: 'draft', triggerType: 'segment', triggerDetails: { type: 'entered_segment', segmentId: 'seg_008', segmentName: 'Lapsed Customers 90+ Days' }, createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-03-10T11:00:00Z', tags: ['promotional'], actions: [
        { id: 'fa_015', flowId: 'flow_005', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'We miss you! Here is 20% off', senderName: 'Acme Store', templateId: 'tmpl_001' }, stats: {} },
        { id: 'fa_016', flowId: 'flow_005', type: 'time_delay', position: { x: 0, y: 120 }, parentId: 'fa_015', branchType: null, config: { value: 7, unit: 'days' }, stats: {} }
      ], stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, conversions: 0 } },
      { id: 'flow_006', name: 'Birthday Flow', status: 'live', triggerType: 'date', triggerDetails: { type: 'date_property', property: 'birthday', timing: 'on_date' }, createdAt: '2024-12-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z', tags: ['promotional'], actions: [
        { id: 'fa_017', flowId: 'flow_006', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'Happy Birthday! A special gift for you', senderName: 'Acme Store', templateId: 'tmpl_001' }, stats: { delivered: 2340, openRate: 0.65, clickRate: 0.22 } }
      ], stats: { delivered: 2340, opens: 1521, clicks: 515, revenue: 8900, conversions: 78 } },
      { id: 'flow_007', name: 'VIP Loyalty Rewards', status: 'live', triggerType: 'segment', triggerDetails: { type: 'entered_segment', segmentId: 'seg_001', segmentName: 'VIP Customers - High LTV' }, createdAt: '2024-11-15T10:00:00Z', updatedAt: '2025-03-05T10:00:00Z', tags: ['vip'], actions: [
        { id: 'fa_018', flowId: 'flow_007', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'Welcome to VIP! Exclusive perks inside', senderName: 'Acme Store', templateId: 'tmpl_001' }, stats: { delivered: 2341, openRate: 0.72, clickRate: 0.18 } },
        { id: 'fa_019', flowId: 'flow_007', type: 'time_delay', position: { x: 0, y: 120 }, parentId: 'fa_018', branchType: null, config: { value: 30, unit: 'days' }, stats: {} },
        { id: 'fa_020', flowId: 'flow_007', type: 'send_email', position: { x: 0, y: 240 }, parentId: 'fa_019', branchType: null, config: { subject: 'Your VIP monthly recap', senderName: 'Acme Store', templateId: 'tmpl_003' }, stats: { delivered: 2100, openRate: 0.55, clickRate: 0.12 } }
      ], stats: { delivered: 4441, opens: 2894, clicks: 674, revenue: 15600, conversions: 134 } },
      { id: 'flow_008', name: 'Price Drop Alert', status: 'draft', triggerType: 'price_drop', triggerDetails: { type: 'price_drop', percentage: 10 }, createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-03-15T10:00:00Z', tags: ['promotional'], actions: [
        { id: 'fa_021', flowId: 'flow_008', type: 'send_email', position: { x: 0, y: 0 }, parentId: null, branchType: null, config: { subject: 'Price drop! An item you viewed is on sale', senderName: 'Acme Store', templateId: 'tmpl_005' }, stats: {} },
        { id: 'fa_022', flowId: 'flow_008', type: 'send_sms', position: { x: 0, y: 120 }, parentId: 'fa_021', branchType: null, config: { body: 'Price drop alert! An item you viewed is now on sale. Check it out!' }, stats: {} }
      ], stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, conversions: 0 } }
    ],
    lists: [
      { id: 'list_001', name: 'Newsletter Subscribers', type: 'double_opt_in', memberCount: 15234, createdAt: '2024-01-15T08:00:00Z', updatedAt: '2025-03-20T12:00:00Z', tags: ['active'] },
      { id: 'list_002', name: 'VIP Customers', type: 'manual', memberCount: 2341, createdAt: '2024-02-01T10:00:00Z', updatedAt: '2025-03-18T14:00:00Z', tags: ['vip'] },
      { id: 'list_003', name: 'SMS Subscribers', type: 'single_opt_in', memberCount: 8567, createdAt: '2024-03-01T09:00:00Z', updatedAt: '2025-03-20T10:00:00Z', tags: ['sms'] },
      { id: 'list_004', name: 'New Customers Last 30 Days', type: 'manual', memberCount: 1234, createdAt: '2024-06-15T11:00:00Z', updatedAt: '2025-03-20T08:00:00Z', tags: [] },
      { id: 'list_005', name: 'Wholesale Contacts', type: 'manual', memberCount: 456, createdAt: '2024-04-01T08:00:00Z', updatedAt: '2025-03-10T10:00:00Z', tags: ['wholesale'] }
    ],
    segments: [
      { id: 'seg_001', name: 'VIP Customers - High LTV', isStarred: true, isActive: true, memberCount: 2341, conditionGroups: [{ conditions: [{ type: 'profile-metric', metricId: 'met_placed_order', measurement: 'count', operator: 'greater_than', value: 5, timeframe: 'all_time' }, { type: 'profile-property', property: 'customProperties.lifetime_value', operator: 'greater_than', value: 500 }] }], createdAt: '2024-05-01T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_002', name: 'Engaged Last 30 Days', isStarred: false, isActive: true, memberCount: 4567, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'lastActive', operator: 'is_within', value: 30, timeframe: 'days' }] }], createdAt: '2024-05-15T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_003', name: 'Abandoned Cart - No Purchase', isStarred: false, isActive: true, memberCount: 892, conditionGroups: [{ conditions: [{ type: 'profile-metric', metricId: 'met_started_checkout', measurement: 'count', operator: 'greater_than', value: 0, timeframe: 'last_7_days' }, { type: 'profile-metric', metricId: 'met_placed_order', measurement: 'count', operator: 'equals', value: 0, timeframe: 'last_7_days' }] }], createdAt: '2024-06-01T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_004', name: 'Repeat Buyers 3+ Orders', isStarred: false, isActive: true, memberCount: 3456, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'customProperties.total_orders', operator: 'greater_than', value: 2 }] }], createdAt: '2024-06-15T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_005', name: 'At-Risk Customers', isStarred: false, isActive: true, memberCount: 1234, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'lastActive', operator: 'is_not_within', value: 60, timeframe: 'days' }, { type: 'profile-property', property: 'customProperties.total_orders', operator: 'greater_than', value: 1 }] }], createdAt: '2024-07-01T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_006', name: 'SMS Opt-Ins', isStarred: false, isActive: true, memberCount: 8567, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'consent.sms', operator: 'equals', value: 'subscribed' }] }], createdAt: '2024-07-15T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_007', name: 'New Subscribers Last 7 Days', isStarred: false, isActive: true, memberCount: 234, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'createdAt', operator: 'is_within', value: 7, timeframe: 'days' }] }], createdAt: '2024-08-01T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' },
      { id: 'seg_008', name: 'Lapsed Customers 90+ Days', isStarred: false, isActive: true, memberCount: 2100, conditionGroups: [{ conditions: [{ type: 'profile-property', property: 'lastActive', operator: 'is_not_within', value: 90, timeframe: 'days' }] }], createdAt: '2024-08-15T09:00:00Z', lastCalculated: '2025-03-20T06:00:00Z' }
    ],
    templates: [
      { id: 'tmpl_001', name: 'Welcome Email - Modern', category: 'outreach', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#000;color:#fff;padding:30px;text-align:center;"><h1>Welcome to Acme Store</h1></div><div style="padding:30px;"><p>Hi there!</p><p>Thanks for joining us.</p><a href="#" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Shop Now</a></div></div>', previewImageUrl: '', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2025-01-15T14:30:00Z', tags: ['welcome', 'onboarding'] },
      { id: 'tmpl_002', name: 'Brand Announcement', category: 'outreach', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#f0f0f0;padding:30px;text-align:center;"><h1>Big News from Acme</h1></div><div style="padding:30px;"><p>We have something exciting to share.</p></div></div>', previewImageUrl: '', createdAt: '2024-04-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z', tags: ['outreach'] },
      { id: 'tmpl_003', name: 'Monthly Newsletter', category: 'outreach', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#1a1a1a;color:#fff;padding:20px;"><h2>Acme Store Monthly</h2></div><div style="padding:20px;"><h3>This Month Highlights</h3><p>Check out what happened.</p></div></div>', previewImageUrl: '', createdAt: '2024-05-01T10:00:00Z', updatedAt: '2025-03-01T10:00:00Z', tags: ['newsletter'] },
      { id: 'tmpl_004', name: 'Cart Reminder', category: 'reminders', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="padding:30px;text-align:center;"><h1>Forgot something?</h1><p>You left items in your cart.</p><a href="#" style="display:inline-block;background:#28A745;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Complete Your Order</a></div></div>', previewImageUrl: '', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z', tags: ['abandoned-cart'] },
      { id: 'tmpl_005', name: 'Back in Stock', category: 'reminders', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="padding:30px;text-align:center;"><h1>It is Back!</h1><p>An item you viewed is back in stock.</p><a href="#" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">View Item</a></div></div>', previewImageUrl: '', createdAt: '2024-07-01T10:00:00Z', updatedAt: '2025-02-15T10:00:00Z', tags: ['reminders'] },
      { id: 'tmpl_006', name: 'Order Confirmation', category: 'confirmation', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#28A745;color:#fff;padding:20px;text-align:center;"><h1>Order Confirmed!</h1></div><div style="padding:20px;"><p>Thanks for your order.</p></div></div>', previewImageUrl: '', createdAt: '2024-08-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z', tags: ['transactional'] },
      { id: 'tmpl_007', name: 'Shipping Notification', category: 'confirmation', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#0066FF;color:#fff;padding:20px;text-align:center;"><h1>Your Order Has Shipped!</h1></div><div style="padding:20px;"><p>Great news! Your order is on its way.</p></div></div>', previewImageUrl: '', createdAt: '2024-09-01T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z', tags: ['transactional'] },
      { id: 'tmpl_008', name: 'Spring Sale', category: 'seasonal', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:40px;text-align:center;"><h1 style="color:#fff;">Spring Sale!</h1><p style="color:#fff;font-size:24px;">Up to 50% Off</p></div><div style="padding:30px;text-align:center;"><a href="#" style="display:inline-block;background:#FF6B6B;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;">Shop the Sale</a></div></div>', previewImageUrl: '', createdAt: '2025-02-15T10:00:00Z', updatedAt: '2025-03-10T10:00:00Z', tags: ['seasonal'] },
      { id: 'tmpl_009', name: 'Holiday Gift Guide', category: 'seasonal', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><div style="background:#1a1a1a;color:#fff;padding:30px;text-align:center;"><h1>Holiday Gift Guide</h1></div><div style="padding:20px;"><p>Browse our curated gift collections.</p></div></div>', previewImageUrl: '', createdAt: '2024-10-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z', tags: ['seasonal'] },
      { id: 'tmpl_010', name: 'Blank Custom', category: 'custom', channel: 'email', htmlContent: '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;padding:30px;"><p>Start building your email here.</p></div>', previewImageUrl: '', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z', tags: [] }
    ],
    metrics: [
      { id: 'met_001', name: 'Placed Order', integration: 'Shopify', eventCount: 45230, lastEventAt: '2025-03-20T15:45:00Z' },
      { id: 'met_002', name: 'Viewed Product', integration: 'Shopify', eventCount: 234567, lastEventAt: '2025-03-20T16:00:00Z' },
      { id: 'met_003', name: 'Added to Cart', integration: 'Shopify', eventCount: 89432, lastEventAt: '2025-03-20T15:30:00Z' },
      { id: 'met_004', name: 'Started Checkout', integration: 'Shopify', eventCount: 56234, lastEventAt: '2025-03-20T14:00:00Z' },
      { id: 'met_005', name: 'Received Email', integration: 'Xlaviyo', eventCount: 125000, lastEventAt: '2025-03-20T12:00:00Z' },
      { id: 'met_006', name: 'Opened Email', integration: 'Xlaviyo', eventCount: 58750, lastEventAt: '2025-03-20T11:30:00Z' },
      { id: 'met_007', name: 'Clicked Email', integration: 'Xlaviyo', eventCount: 12500, lastEventAt: '2025-03-20T10:45:00Z' },
      { id: 'met_008', name: 'Received SMS', integration: 'Xlaviyo', eventCount: 34000, lastEventAt: '2025-03-20T09:00:00Z' },
      { id: 'met_009', name: 'Clicked SMS', integration: 'Xlaviyo', eventCount: 6800, lastEventAt: '2025-03-20T08:30:00Z' },
      { id: 'met_010', name: 'Active on Site', integration: 'Xlaviyo', eventCount: 178900, lastEventAt: '2025-03-20T16:15:00Z' },
      { id: 'met_011', name: 'Subscribed to List', integration: 'Xlaviyo', eventCount: 23450, lastEventAt: '2025-03-20T14:20:00Z' },
      { id: 'met_012', name: 'Unsubscribed', integration: 'Xlaviyo', eventCount: 1890, lastEventAt: '2025-03-19T18:00:00Z' },
      { id: 'met_013', name: 'Fulfilled Order', integration: 'Shopify', eventCount: 43100, lastEventAt: '2025-03-20T13:15:00Z' },
      { id: 'met_014', name: 'Refunded Order', integration: 'Shopify', eventCount: 2340, lastEventAt: '2025-03-18T11:00:00Z' }
    ],
    signupForms: [
      { id: 'form_001', name: 'Homepage Newsletter Popup', type: 'popup', status: 'live', targetListId: 'list_001', views: 54230, submissions: 3245, conversionRate: 0.0598, createdAt: '2024-06-01T10:00:00Z', updatedAt: '2025-02-15T11:00:00Z', config: { title: 'Join our newsletter', description: 'Get 10% off your first order', fields: ['email'], buttonText: 'Sign Up' } },
      { id: 'form_002', name: 'Footer Email Signup', type: 'embedded', status: 'live', targetListId: 'list_001', views: 120450, submissions: 8934, conversionRate: 0.0742, createdAt: '2024-04-01T10:00:00Z', updatedAt: '2025-03-01T10:00:00Z', config: { title: 'Stay in the loop', description: 'Subscribe for updates and exclusive offers', fields: ['email', 'firstName'], buttonText: 'Subscribe' } },
      { id: 'form_003', name: 'Exit Intent Offer', type: 'popup', status: 'draft', targetListId: 'list_001', views: 0, submissions: 0, conversionRate: 0, createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-03-10T10:00:00Z', config: { title: 'Wait! Before you go...', description: 'Get 15% off your first purchase', fields: ['email'], buttonText: 'Get My Discount' } },
      { id: 'form_004', name: 'SMS Signup Flyout', type: 'flyout', status: 'live', targetListId: 'list_003', views: 28450, submissions: 1823, conversionRate: 0.0641, createdAt: '2024-09-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z', config: { title: 'Get SMS updates', description: 'Be the first to know about sales', fields: ['phone'], buttonText: 'Sign Up for SMS' } }
    ],
    tags: [
      { id: 'tag_001', name: 'spring-sale' },
      { id: 'tag_002', name: 'promotional' },
      { id: 'tag_003', name: 'welcome' },
      { id: 'tag_004', name: 'onboarding' },
      { id: 'tag_005', name: 'abandoned-cart' },
      { id: 'tag_006', name: 'vip' },
      { id: 'tag_007', name: 'seasonal' },
      { id: 'tag_008', name: 'newsletter' },
      { id: 'tag_009', name: 'sms' },
      { id: 'tag_010', name: 'transactional' }
    ],
    ui: {
      activePage: 'home',
      campaignFilters: { status: 'all', channel: 'all', search: '' },
      flowFilters: { status: 'all', search: '' },
      audienceTab: 'lists',
      analyticsDateRange: { start: '2025-02-20', end: '2025-03-20', label: 'Last 30 days', comparison: true },
      selectedConversionMetric: 'revenue'
    }
  };
}
