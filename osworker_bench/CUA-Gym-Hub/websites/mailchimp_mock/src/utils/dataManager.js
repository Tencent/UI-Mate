const BASE_KEY = 'mailchimp_mock_state';
const BASE_INITIAL_KEY = 'mailchimp_mock_initial_state';

export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('mailchimp_mock_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('mailchimp_mock_sid') || null;
}

export function storageKey(sid) {
  return sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
}

export function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export async function fetchCustomState(sid) {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`);
    const data = await res.json();
    if (data.has_custom_state && data.stored_state) {
      return data.stored_state;
    }
  } catch (e) {
    console.error('Failed to fetch custom state:', e);
  }
  return null;
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid);
  const iKey = initialKey(sid);

  if (customState) {
    const merged = deepMerge(createInitialData(), customState);
    localStorage.setItem(sKey, JSON.stringify(merged));
    localStorage.setItem(iKey, JSON.stringify(merged));
    return merged;
  }

  const stored = localStorage.getItem(sKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored state:', e);
    }
  }

  const initial = createInitialData();
  localStorage.setItem(sKey, JSON.stringify(initial));
  localStorage.setItem(iKey, JSON.stringify(initial));
  return initial;
}

export function saveState(state, sid) {
  const sKey = storageKey(sid);
  localStorage.setItem(sKey, JSON.stringify(state));

  fetch(`/post${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
}

export function calculateStateDiff(initial, current) {
  const diff = {};
  if (!initial || !current) return diff;

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
  for (const key of allKeys) {
    const oldVal = JSON.stringify(initial[key]);
    const newVal = JSON.stringify(current[key]);
    if (oldVal !== newVal) {
      diff[key] = { old: initial[key], new: current[key] };
    }
  }
  return diff;
}

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function imageAsset(label, bg = '#FFE01B', accent = '#007C89') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="${bg}"/><circle cx="930" cy="120" r="190" fill="${accent}" opacity=".18"/><circle cx="160" cy="520" r="210" fill="#241C15" opacity=".12"/><rect x="110" y="110" width="450" height="70" rx="10" fill="#241C15"/><rect x="110" y="210" width="760" height="28" rx="8" fill="#241C15" opacity=".58"/><rect x="110" y="260" width="620" height="28" rx="8" fill="#241C15" opacity=".42"/><rect x="110" y="350" width="230" height="62" rx="31" fill="${accent}"/><text x="150" y="392" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#fff">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Seeded random for deterministic contact generation
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Barbara','William','Elizabeth','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle','Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather','Tyler','Diane','Aaron','Ruth','Jose','Julie','Adam','Olivia','Nathan','Joyce','Henry','Virginia','Douglas','Victoria','Peter','Kelly','Zachary','Lauren','Kyle','Christina','Noah','Joan','Ethan','Evelyn','Jeremy','Judith','Walter','Megan','Christian','Andrea','Keith','Cheryl','Roger','Hannah','Terry','Jacqueline','Austin','Martha','Sean','Gloria','Gerald','Teresa','Carl','Ann','Harold','Sara','Dylan','Madison','Arthur','Frances','Lawrence','Kathryn','Jordan','Janice','Jesse','Jean','Bryan','Abigail','Billy','Alice','Bruce','Judy','Gabriel','Sophia','Joe','Grace','Logan','Denise','Albert','Amber','Willie','Doris','Alan','Marilyn','Eugene','Danielle','Russell','Beverly','Vincent','Isabella','Philip','Theresa','Bobby','Diana','Johnny','Natalie','Bradley','Brittany','Roy','Charlotte','Caleb','Marie','Wayne','Kayla','Travis','Alexis','Jeffrey','Lori'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Marshall','Stokes','Ortega','Mcdonald','Stevens','Freeman','Carlson','Chandler','Holt','Benson','Larson','Klein','Morton','Bishop'];
const domains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','fastmail.com','zoho.com','aol.com','mail.com','company.io','work.co','business.org','corp.net','enterprise.com','startup.io','agency.co','solutions.com','digital.co','tech.io','media.com','group.com','consulting.co','services.net','inc.com'];
const cities = [
  {city:'New York',state:'NY'},{city:'Los Angeles',state:'CA'},{city:'Chicago',state:'IL'},{city:'Houston',state:'TX'},{city:'Phoenix',state:'AZ'},
  {city:'Philadelphia',state:'PA'},{city:'San Antonio',state:'TX'},{city:'San Diego',state:'CA'},{city:'Dallas',state:'TX'},{city:'San Jose',state:'CA'},
  {city:'Austin',state:'TX'},{city:'Jacksonville',state:'FL'},{city:'San Francisco',state:'CA'},{city:'Columbus',state:'OH'},{city:'Indianapolis',state:'IN'},
  {city:'Charlotte',state:'NC'},{city:'Seattle',state:'WA'},{city:'Denver',state:'CO'},{city:'Nashville',state:'TN'},{city:'Portland',state:'OR'},
  {city:'Boston',state:'MA'},{city:'Las Vegas',state:'NV'},{city:'Detroit',state:'MI'},{city:'Memphis',state:'TN'},{city:'Miami',state:'FL'},
  {city:'Atlanta',state:'GA'},{city:'Minneapolis',state:'MN'},{city:'Tampa',state:'FL'},{city:'New Orleans',state:'LA'},{city:'Cleveland',state:'OH'},
  {city:'Pittsburgh',state:'PA'},{city:'St. Louis',state:'MO'},{city:'Baltimore',state:'MD'},{city:'Salt Lake City',state:'UT'},{city:'Kansas City',state:'MO'},
  {city:'Raleigh',state:'NC'},{city:'London',state:''},{city:'Toronto',state:''},{city:'Vancouver',state:''},{city:'Berlin',state:''},
  {city:'Paris',state:''},{city:'Sydney',state:''},{city:'Melbourne',state:''},{city:'Dublin',state:''},{city:'Amsterdam',state:''}
];
const intlCountries = {'London':'UK','Toronto':'CA','Vancouver':'CA','Berlin':'DE','Paris':'FR','Sydney':'AU','Melbourne':'AU','Dublin':'IE','Amsterdam':'NL'};
const tagPool = ['VIP','Newsletter','Leads','Customers','Event Attendees','New','Inactive','Wholesale','Premium','Enterprise','Free Trial','Referral','Partner','Seasonal','Product Updates','Blog Reader','Webinar','Early Adopter','Beta Tester','Social Media'];
const sources = ['Signup Form','Import','API','Manual','Landing Page','Popup','Facebook Ads','Google Ads','Referral','Event'];

function generateContacts(count) {
  const rand = seededRand(42);
  const contacts = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(rand() * firstNames.length)];
    const ln = lastNames[Math.floor(rand() * lastNames.length)];
    const domain = domains[Math.floor(rand() * domains.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 100 ? i : ''}@${domain}`;
    const loc = cities[Math.floor(rand() * cities.length)];
    const country = intlCountries[loc.city] || 'US';
    const statusRoll = rand();
    const status = statusRoll < 0.82 ? 'subscribed' : statusRoll < 0.92 ? 'unsubscribed' : statusRoll < 0.96 ? 'cleaned' : 'non-subscribed';
    const rating = status === 'subscribed' ? Math.ceil(rand() * 5) : status === 'unsubscribed' ? Math.ceil(rand() * 2) : 1;
    const numTags = Math.floor(rand() * 4);
    const contactTags = [];
    for (let t = 0; t < numTags; t++) {
      const tag = tagPool[Math.floor(rand() * tagPool.length)];
      if (!contactTags.includes(tag)) contactTags.push(tag);
    }
    if (status === 'unsubscribed' || status === 'cleaned') {
      if (!contactTags.includes('Inactive')) contactTags.push('Inactive');
    }
    const subscribedDaysAgo = Math.floor(rand() * 365) + 30;
    const openRate = status === 'subscribed' ? Math.round(rand() * 65) / 100 : Math.round(rand() * 10) / 100;
    const clickRate = Math.round(openRate * (0.2 + rand() * 0.3) * 100) / 100;
    const lastOpenedDays = status === 'subscribed' ? Math.floor(rand() * 30) + 1 : Math.floor(rand() * 90) + 30;
    const lastClickedDays = lastOpenedDays + Math.floor(rand() * 15);
    const source = sources[Math.floor(rand() * sources.length)];
    const month = String(Math.floor(rand() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(rand() * 28) + 1).padStart(2, '0');

    const activity = [];
    if (status === 'subscribed' && openRate > 0.2) {
      activity.push({ type: 'open', description: 'Opened "December Newsletter"', date: daysAgo(lastOpenedDays) });
      if (clickRate > 0.1) {
        activity.push({ type: 'click', description: 'Clicked link in "Holiday Sale"', date: daysAgo(lastClickedDays) });
      }
    }
    if (status === 'unsubscribed') {
      activity.push({ type: 'unsubscribe', description: 'Unsubscribed from mailing list', date: daysAgo(Math.floor(rand() * 60) + 5) });
    }
    if (status === 'cleaned') {
      activity.push({ type: 'bounce', description: 'Email hard bounced', date: daysAgo(Math.floor(rand() * 60) + 20) });
    }
    activity.push({ type: 'subscribe', description: `Subscribed via ${source}`, date: daysAgo(subscribedDaysAgo) });

    contacts.push({
      id: `contact_${i + 1}`,
      audienceId: 'aud_1',
      email,
      firstName: fn,
      lastName: ln,
      phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      status,
      tags: contactTags,
      source,
      rating,
      location: { city: loc.city, state: loc.state, country },
      birthday: `${month}/${day}`,
      notes: rating >= 5 ? 'High-value contact' : '',
      openRate,
      clickRate,
      lastOpened: openRate > 0 ? daysAgo(lastOpenedDays) : null,
      lastClicked: clickRate > 0 ? daysAgo(lastClickedDays) : null,
      subscribedAt: daysAgo(subscribedDaysAgo),
      createdAt: daysAgo(subscribedDaysAgo),
      activity
    });
  }
  return contacts;
}

export function createInitialData() {
  const now = new Date();

  const user = {
    id: 'user_1',
    firstName: 'Rakesh',
    lastName: 'Mondal',
    email: 'rakesh@acmemarketing.com',
    company: 'Acme Marketing Co.',
    timezone: 'America/New_York',
    avatar: null,
    plan: 'Standard',
    monthlyEmailLimit: 50000,
    emailsSentThisMonth: 8521,
    defaultFromName: 'Acme Marketing',
    defaultFromEmail: 'hello@acmemarketing.com',
    defaultReplyTo: 'hello@acmemarketing.com',
    billingCycle: 'monthly',
    nextBillDate: '2026-05-01T00:00:00Z',
    monthlyPrice: 59.99
  };

  const audiences = [{
    id: 'aud_1',
    name: 'Acme Marketing Audience',
    stats: { totalContacts: 2847, subscribed: 2340, unsubscribed: 312, cleaned: 95, nonSubscribed: 100 },
    defaultFromName: 'Acme Marketing',
    defaultFromEmail: 'hello@acmemarketing.com',
    createdAt: '2023-06-15T10:00:00Z',
    growthHistory: [
      { date: daysAgo(90), total: 2410 }, { date: daysAgo(80), total: 2445 }, { date: daysAgo(70), total: 2490 },
      { date: daysAgo(60), total: 2530 }, { date: daysAgo(50), total: 2580 }, { date: daysAgo(40), total: 2620 },
      { date: daysAgo(30), total: 2680 }, { date: daysAgo(20), total: 2740 }, { date: daysAgo(10), total: 2800 },
      { date: daysAgo(5), total: 2825 }, { date: daysAgo(0), total: 2847 }
    ]
  }];

  const tags = [
    { id: 'tag_1', name: 'VIP', contactCount: 87, createdAt: '2024-02-01T10:00:00Z' },
    { id: 'tag_2', name: 'Newsletter', contactCount: 342, createdAt: '2024-02-01T10:00:00Z' },
    { id: 'tag_3', name: 'Leads', contactCount: 156, createdAt: '2024-03-15T10:00:00Z' },
    { id: 'tag_4', name: 'Customers', contactCount: 234, createdAt: '2024-04-01T10:00:00Z' },
    { id: 'tag_5', name: 'Event Attendees', contactCount: 45, createdAt: '2024-05-10T10:00:00Z' },
    { id: 'tag_6', name: 'New', contactCount: 98, createdAt: '2024-06-01T10:00:00Z' },
    { id: 'tag_7', name: 'Inactive', contactCount: 78, createdAt: '2024-07-01T10:00:00Z' },
    { id: 'tag_8', name: 'Wholesale', contactCount: 32, createdAt: '2024-08-01T10:00:00Z' },
    { id: 'tag_9', name: 'Premium', contactCount: 64, createdAt: '2024-09-01T10:00:00Z' },
    { id: 'tag_10', name: 'Enterprise', contactCount: 28, createdAt: '2024-10-01T10:00:00Z' },
    { id: 'tag_11', name: 'Free Trial', contactCount: 112, createdAt: '2024-11-01T10:00:00Z' },
    { id: 'tag_12', name: 'Referral', contactCount: 43, createdAt: '2024-12-01T10:00:00Z' },
    { id: 'tag_13', name: 'Partner', contactCount: 18, createdAt: '2025-01-01T10:00:00Z' },
    { id: 'tag_14', name: 'Product Updates', contactCount: 189, createdAt: '2025-01-15T10:00:00Z' },
    { id: 'tag_15', name: 'Blog Reader', contactCount: 76, createdAt: '2025-02-01T10:00:00Z' }
  ];

  const contacts = generateContacts(520);

  const segments = [
    { id: 'seg_1', audienceId: 'aud_1', name: 'Active Subscribers', conditions: [{ field: 'emailActivity', operator: 'opened', value: 'last_30_days' }], conditionMatch: 'all', memberCount: 1250, type: 'saved', createdAt: '2024-03-10T12:00:00Z', updatedAt: daysAgo(5) },
    { id: 'seg_2', audienceId: 'aud_1', name: 'New This Month', conditions: [{ field: 'subscribedDate', operator: 'after', value: daysAgo(30) }], conditionMatch: 'all', memberCount: 45, type: 'saved', createdAt: '2024-04-01T10:00:00Z', updatedAt: daysAgo(1) },
    { id: 'seg_3', audienceId: 'aud_1', name: 'VIP Customers', conditions: [{ field: 'tags', operator: 'is', value: 'VIP' }], conditionMatch: 'all', memberCount: 156, type: 'saved', createdAt: '2024-05-15T10:00:00Z', updatedAt: daysAgo(3) },
    { id: 'seg_4', audienceId: 'aud_1', name: 'Inactive 90 Days', conditions: [{ field: 'emailActivity', operator: 'did_not_open', value: 'last_90_days' }], conditionMatch: 'all', memberCount: 320, type: 'pre-built', createdAt: '2024-02-01T10:00:00Z', updatedAt: daysAgo(7) },
    { id: 'seg_5', audienceId: 'aud_1', name: 'Newsletter Only', conditions: [{ field: 'tags', operator: 'is', value: 'Newsletter' }, { field: 'tags', operator: 'is_not', value: 'Customers' }], conditionMatch: 'all', memberCount: 180, type: 'saved', createdAt: '2024-06-01T10:00:00Z', updatedAt: daysAgo(4) },
    { id: 'seg_6', audienceId: 'aud_1', name: 'High Engagement', conditions: [{ field: 'rating', operator: 'greater_than', value: 3 }], conditionMatch: 'all', memberCount: 410, type: 'pre-built', createdAt: '2024-03-01T10:00:00Z', updatedAt: daysAgo(2) },
    { id: 'seg_7', audienceId: 'aud_1', name: 'Enterprise Accounts', conditions: [{ field: 'tags', operator: 'is', value: 'Enterprise' }], conditionMatch: 'all', memberCount: 28, type: 'saved', createdAt: '2024-08-01T10:00:00Z', updatedAt: daysAgo(10) },
    { id: 'seg_8', audienceId: 'aud_1', name: 'US Contacts', conditions: [{ field: 'location', operator: 'is', value: 'US' }], conditionMatch: 'all', memberCount: 2150, type: 'saved', createdAt: '2024-09-01T10:00:00Z', updatedAt: daysAgo(6) }
  ];

  const campaigns = [
    {
      id: 'camp_1', name: 'December Newsletter', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: null,
      recipients: { listName: 'Acme Marketing Audience', segmentName: null, count: 1250 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Your December Digest is Here!', previewText: 'See what\'s new this month...',
      templateId: 'tmpl_1', content: [
        { id: 'block_1', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Acme Marketing' } },
        { id: 'block_2', type: 'text', order: 1, content: { html: '<h2>December Newsletter</h2><p>Hello! Here are the latest updates from Acme Marketing.</p>' } },
        { id: 'block_3', type: 'image', order: 2, content: { src: imageAsset('Featured'), alt: 'Featured product', width: '100%', link: '' } },
        { id: 'block_4', type: 'button', order: 3, content: { text: 'Read More', url: 'https://example.com', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_5', type: 'footer', order: 4, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(5),
      report: {
        campaignId: 'camp_1', sent: 1250, delivered: 1230, opens: 492, uniqueOpens: 410, openRate: 0.3333,
        clicks: 156, uniqueClicks: 130, clickRate: 0.1057, bounces: 20, hardBounces: 5, softBounces: 15,
        unsubscribes: 8, complaints: 1, forwards: 12, revenue: 1245.50,
        topLinks: [
          { url: 'https://example.com/sale', clicks: 89, uniqueClicks: 72 },
          { url: 'https://example.com/blog', clicks: 34, uniqueClicks: 28 },
          { url: 'https://example.com/products', clicks: 22, uniqueClicks: 19 },
          { url: 'https://example.com/about', clicks: 8, uniqueClicks: 7 },
          { url: 'https://example.com/contact', clicks: 3, uniqueClicks: 3 }
        ],
        opensByHour: [5,8,12,18,25,35,42,55,48,40,38,32,28,25,22,18,15,12,10,8,6,4,3,2],
        clicksByDay: [18,22,35,28,15,8,4],
        deviceStats: { desktop: 52, mobile: 41, tablet: 7 },
        locationStats: [{ country: 'US', opens: 340 }, { country: 'UK', opens: 32 }, { country: 'CA', opens: 28 }, { country: 'AU', opens: 10 }]
      },
      createdAt: daysAgo(10), updatedAt: daysAgo(5)
    },
    {
      id: 'camp_2', name: 'Holiday Sale Announcement', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: 'seg_1',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'Active Subscribers', count: 1250 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Holiday Sale - Up to 50% Off!', previewText: 'Don\'t miss our biggest sale of the year',
      templateId: 'tmpl_2', content: [
        { id: 'block_6', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Acme Marketing' } },
        { id: 'block_7', type: 'text', order: 1, content: { html: '<h2>Holiday Sale!</h2><p>Up to 50% off on all products. Limited time offer.</p>' } },
        { id: 'block_8', type: 'button', order: 2, content: { text: 'Shop Now', url: 'https://example.com/sale', bgColor: '#E87040', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_9', type: 'footer', order: 3, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(12),
      report: {
        campaignId: 'camp_2', sent: 1250, delivered: 1235, opens: 550, uniqueOpens: 475, openRate: 0.3846,
        clicks: 210, uniqueClicks: 180, clickRate: 0.1457, bounces: 15, hardBounces: 3, softBounces: 12,
        unsubscribes: 5, complaints: 0, forwards: 18, revenue: 3420.00,
        topLinks: [
          { url: 'https://example.com/sale', clicks: 150, uniqueClicks: 130 },
          { url: 'https://example.com/products', clicks: 45, uniqueClicks: 38 },
          { url: 'https://example.com/deals', clicks: 15, uniqueClicks: 12 }
        ],
        opensByHour: [8,12,18,28,38,48,55,62,50,45,40,35,30,25,20,18,15,12,10,8,5,4,3,2],
        clicksByDay: [25,38,52,40,30,15,10],
        deviceStats: { desktop: 48, mobile: 44, tablet: 8 },
        locationStats: [{ country: 'US', opens: 395 }, { country: 'UK', opens: 38 }, { country: 'CA', opens: 30 }, { country: 'AU', opens: 12 }]
      },
      createdAt: daysAgo(18), updatedAt: daysAgo(12)
    },
    {
      id: 'camp_3', name: 'Product Launch Preview', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: 'seg_3',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'VIP Customers', count: 156 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Exclusive Preview: New Product Line', previewText: 'Be the first to see our latest collection',
      templateId: 'tmpl_3', content: [
        { id: 'block_10', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Acme Marketing' } },
        { id: 'block_11', type: 'text', order: 1, content: { html: '<h2>Exclusive Preview</h2><p>As a valued VIP customer, get early access to our new product line.</p>' } },
        { id: 'block_12', type: 'image', order: 2, content: { src: imageAsset('Product', '#E0F7FA', '#007C89'), alt: 'New product', width: '100%', link: '' } },
        { id: 'block_13', type: 'button', order: 3, content: { text: 'Preview Now', url: 'https://example.com/preview', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_14', type: 'footer', order: 4, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(20),
      report: {
        campaignId: 'camp_3', sent: 156, delivered: 154, opens: 72, uniqueOpens: 65, openRate: 0.4221,
        clicks: 28, uniqueClicks: 24, clickRate: 0.1558, bounces: 2, hardBounces: 1, softBounces: 1,
        unsubscribes: 1, complaints: 0, forwards: 5, revenue: 890.75,
        topLinks: [
          { url: 'https://example.com/preview', clicks: 20, uniqueClicks: 18 },
          { url: 'https://example.com/products', clicks: 8, uniqueClicks: 6 }
        ],
        opensByHour: [1,2,3,5,8,10,8,7,5,4,3,3,2,2,1,1,1,1,1,0,0,0,0,0],
        clicksByDay: [6,8,5,3,1,1,0],
        deviceStats: { desktop: 55, mobile: 38, tablet: 7 },
        locationStats: [{ country: 'US', opens: 55 }, { country: 'UK', opens: 6 }, { country: 'CA', opens: 4 }]
      },
      createdAt: daysAgo(25), updatedAt: daysAgo(20)
    },
    {
      id: 'camp_4', name: 'Re-engagement: We Miss You', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: 'seg_4',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'Inactive 90 Days', count: 320 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'We Miss You! Come Back for 20% Off', previewText: 'It\'s been a while - here\'s a special offer',
      templateId: null, content: [
        { id: 'block_15', type: 'text', order: 0, content: { html: '<h2>We Miss You!</h2><p>It has been a while since we heard from you. Enjoy 20% off your next purchase.</p>' } },
        { id: 'block_16', type: 'button', order: 1, content: { text: 'Claim Offer', url: 'https://example.com/offer', bgColor: '#E87040', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_17', type: 'footer', order: 2, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(30),
      report: {
        campaignId: 'camp_4', sent: 320, delivered: 308, opens: 45, uniqueOpens: 38, openRate: 0.1234,
        clicks: 12, uniqueClicks: 10, clickRate: 0.0325, bounces: 12, hardBounces: 8, softBounces: 4,
        unsubscribes: 15, complaints: 2, forwards: 0, revenue: 156.00,
        topLinks: [
          { url: 'https://example.com/offer', clicks: 10, uniqueClicks: 8 },
          { url: 'https://example.com', clicks: 2, uniqueClicks: 2 }
        ],
        opensByHour: [1,1,2,3,4,5,4,3,3,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0],
        clicksByDay: [3,4,2,1,1,1,0],
        deviceStats: { desktop: 60, mobile: 35, tablet: 5 },
        locationStats: [{ country: 'US', opens: 32 }, { country: 'UK', opens: 4 }, { country: 'CA', opens: 2 }]
      },
      createdAt: daysAgo(35), updatedAt: daysAgo(30)
    },
    {
      id: 'camp_5', name: 'Year in Review', type: 'regular', status: 'scheduled', audienceId: 'aud_1', segmentId: null,
      recipients: { listName: 'Acme Marketing Audience', segmentName: null, count: 2340 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Your 2025 Year in Review', previewText: 'A look back at an amazing year',
      templateId: 'tmpl_1', content: [
        { id: 'block_18', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Acme Marketing' } },
        { id: 'block_19', type: 'text', order: 1, content: { html: '<h2>2025 Year in Review</h2><p>What an incredible year! Here is a summary of our journey together.</p>' } },
        { id: 'block_20', type: 'footer', order: 2, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: null, report: null,
      createdAt: daysAgo(3), updatedAt: daysAgo(1)
    },
    {
      id: 'camp_6', name: 'Welcome Special Offer', type: 'regular', status: 'draft', audienceId: 'aud_1', segmentId: 'seg_2',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'New This Month', count: 45 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: '', previewText: '',
      templateId: null, content: [],
      scheduledAt: null, sentAt: null, report: null,
      createdAt: daysAgo(2), updatedAt: daysAgo(2)
    },
    {
      id: 'camp_7', name: 'Weekly Tips #47', type: 'regular', status: 'draft', audienceId: 'aud_1', segmentId: null,
      recipients: { listName: 'Acme Marketing Audience', segmentName: null, count: 2340 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Weekly Tips #47: Boost Your Productivity', previewText: 'This week\'s top tips for getting more done',
      templateId: 'tmpl_1', content: [
        { id: 'block_21', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Acme Marketing' } },
        { id: 'block_22', type: 'text', order: 1, content: { html: '<h2>Weekly Tips #47</h2><p>Boost your productivity with these expert tips.</p>' } },
        { id: 'block_23', type: 'footer', order: 2, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: null, report: null,
      createdAt: daysAgo(4), updatedAt: daysAgo(1)
    },
    {
      id: 'camp_8', name: 'Flash Sale Alert', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: 'seg_1',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'Active Subscribers', count: 1250 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Flash Sale: 24 Hours Only!', previewText: 'Hurry - deals end at midnight!',
      templateId: 'tmpl_2', content: [
        { id: 'block_24', type: 'text', order: 0, content: { html: '<h2>Flash Sale!</h2><p>24 hours only! Get up to 60% off.</p>' } },
        { id: 'block_25', type: 'button', order: 1, content: { text: 'Shop the Sale', url: 'https://example.com/flash-sale', bgColor: '#D5432F', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_26', type: 'footer', order: 2, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(8),
      report: {
        campaignId: 'camp_8', sent: 1250, delivered: 1240, opens: 620, uniqueOpens: 530, openRate: 0.4274,
        clicks: 280, uniqueClicks: 240, clickRate: 0.1935, bounces: 10, hardBounces: 2, softBounces: 8,
        unsubscribes: 3, complaints: 0, forwards: 25, revenue: 5680.00,
        topLinks: [
          { url: 'https://example.com/flash-sale', clicks: 220, uniqueClicks: 190 },
          { url: 'https://example.com/products', clicks: 45, uniqueClicks: 38 },
          { url: 'https://example.com', clicks: 15, uniqueClicks: 12 }
        ],
        opensByHour: [15,20,30,45,55,65,60,50,45,40,35,30,25,22,18,15,12,10,8,6,5,4,3,2],
        clicksByDay: [42,55,68,45,35,22,13],
        deviceStats: { desktop: 45, mobile: 48, tablet: 7 },
        locationStats: [{ country: 'US', opens: 445 }, { country: 'UK', opens: 42 }, { country: 'CA', opens: 30 }, { country: 'AU', opens: 13 }]
      },
      createdAt: daysAgo(12), updatedAt: daysAgo(8)
    },
    {
      id: 'camp_9', name: 'New Year Promotions', type: 'regular', status: 'draft', audienceId: 'aud_1', segmentId: null,
      recipients: { listName: 'Acme Marketing Audience', segmentName: null, count: 2340 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: '', previewText: '',
      templateId: null, content: [],
      scheduledAt: null, sentAt: null, report: null,
      createdAt: daysAgo(1), updatedAt: daysAgo(1)
    },
    {
      id: 'camp_10', name: 'Customer Appreciation Week', type: 'regular', status: 'sent', audienceId: 'aud_1', segmentId: 'seg_3',
      recipients: { listName: 'Acme Marketing Audience', segmentName: 'VIP Customers', count: 156 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'You\'re Valued - Here\'s a Thank You Gift', previewText: 'A special gift just for you',
      templateId: 'tmpl_3', content: [
        { id: 'block_27', type: 'text', order: 0, content: { html: '<h2>Thank You!</h2><p>As a valued customer, enjoy this exclusive 30% discount code: THANKYOU30</p>' } },
        { id: 'block_28', type: 'button', order: 1, content: { text: 'Shop Now', url: 'https://example.com/vip', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_29', type: 'footer', order: 2, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(15),
      report: {
        campaignId: 'camp_10', sent: 156, delivered: 155, opens: 88, uniqueOpens: 78, openRate: 0.5032,
        clicks: 42, uniqueClicks: 36, clickRate: 0.2323, bounces: 1, hardBounces: 0, softBounces: 1,
        unsubscribes: 0, complaints: 0, forwards: 8, revenue: 2340.50,
        topLinks: [
          { url: 'https://example.com/vip', clicks: 36, uniqueClicks: 31 },
          { url: 'https://example.com', clicks: 6, uniqueClicks: 5 }
        ],
        opensByHour: [2,3,5,8,10,12,10,8,6,5,4,3,2,1,1,1,0,0,0,0,0,0,0,0],
        clicksByDay: [8,12,8,5,3,2,2],
        deviceStats: { desktop: 58, mobile: 35, tablet: 7 },
        locationStats: [{ country: 'US', opens: 65 }, { country: 'UK', opens: 8 }, { country: 'CA', opens: 5 }]
      },
      createdAt: daysAgo(20), updatedAt: daysAgo(15)
    },
    {
      id: 'camp_11', name: 'Spring Collection Launch', type: 'ab_test', status: 'sent', audienceId: 'aud_1', segmentId: null,
      recipients: { listName: 'Acme Marketing Audience', segmentName: null, count: 2340 },
      fromName: 'Acme Marketing', fromEmail: 'hello@acmemarketing.com', replyTo: 'hello@acmemarketing.com',
      subject: 'Introducing Our Spring Collection', previewText: 'Fresh styles for the new season',
      templateId: 'tmpl_2', content: [
        { id: 'block_30', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Spring Collection' } },
        { id: 'block_31', type: 'text', order: 1, content: { html: '<h2>Spring Has Arrived</h2><p>Discover our brand new spring collection, curated just for you.</p>' } },
        { id: 'block_32', type: 'image', order: 2, content: { src: imageAsset('Spring', '#E8F5E9', '#2E7D32'), alt: 'Spring collection', width: '100%', link: '' } },
        { id: 'block_33', type: 'button', order: 3, content: { text: 'Explore Collection', url: 'https://example.com/spring', bgColor: '#2E7D32', textColor: '#FFFFFF', align: 'center' } },
        { id: 'block_34', type: 'footer', order: 4, content: { text: '2025 Acme Marketing Co.', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
      ],
      scheduledAt: null, sentAt: daysAgo(25),
      report: {
        campaignId: 'camp_11', sent: 2340, delivered: 2310, opens: 812, uniqueOpens: 695, openRate: 0.3008,
        clicks: 245, uniqueClicks: 210, clickRate: 0.0909, bounces: 30, hardBounces: 8, softBounces: 22,
        unsubscribes: 12, complaints: 1, forwards: 20, revenue: 4580.25,
        topLinks: [
          { url: 'https://example.com/spring', clicks: 180, uniqueClicks: 155 },
          { url: 'https://example.com/products', clicks: 40, uniqueClicks: 35 },
          { url: 'https://example.com/sale', clicks: 25, uniqueClicks: 20 }
        ],
        opensByHour: [10,15,25,35,50,60,55,48,42,38,35,30,28,25,20,18,15,12,10,8,5,4,3,2],
        clicksByDay: [35,45,55,42,35,25,18],
        deviceStats: { desktop: 50, mobile: 43, tablet: 7 },
        locationStats: [{ country: 'US', opens: 580 }, { country: 'UK', opens: 55 }, { country: 'CA', opens: 40 }, { country: 'AU', opens: 20 }]
      },
      createdAt: daysAgo(30), updatedAt: daysAgo(25)
    }
  ];

  const templates = [
    { id: 'tmpl_1', name: 'Monthly Newsletter', category: 'featured', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_1', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Newsletter' } },
      { id: 'tb_2', type: 'text', order: 1, content: { html: '<h2>Monthly Update</h2><p>Your monthly roundup of news and updates.</p>' } },
      { id: 'tb_3', type: 'image', order: 2, content: { src: imageAsset('Newsletter'), alt: 'Featured', width: '100%', link: '' } },
      { id: 'tb_4', type: 'button', order: 3, content: { text: 'Read More', url: '#', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_5', type: 'footer', order: 4, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_2', name: 'Sell Products', category: 'sell_products', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_6', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Shop' } },
      { id: 'tb_7', type: 'image', order: 1, content: { src: imageAsset('Shop', '#FFF3E0', '#E87040'), alt: 'Product', width: '100%', link: '' } },
      { id: 'tb_8', type: 'text', order: 2, content: { html: '<h2>Featured Product</h2><p>Check out our latest offering.</p>' } },
      { id: 'tb_9', type: 'button', order: 3, content: { text: 'Shop Now', url: '#', bgColor: '#E87040', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_10', type: 'footer', order: 4, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_3', name: 'Make an Announcement', category: 'announcement', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_11', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Announcement' } },
      { id: 'tb_12', type: 'text', order: 1, content: { html: '<h2>Big News!</h2><p>We have an exciting announcement to share with you.</p>' } },
      { id: 'tb_13', type: 'button', order: 2, content: { text: 'Learn More', url: '#', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_14', type: 'footer', order: 3, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_4', name: 'Share a Story', category: 'tell_a_story', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_15', type: 'text', order: 0, content: { html: '<h2>Our Story</h2><p>Let us share something meaningful with you.</p>' } },
      { id: 'tb_16', type: 'image', order: 1, content: { src: imageAsset('Story', '#F3E5F5', '#6A1B9A'), alt: 'Story image', width: '100%', link: '' } },
      { id: 'tb_17', type: 'text', order: 2, content: { html: '<p>Continue reading to discover more...</p>' } },
      { id: 'tb_18', type: 'footer', order: 3, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_5', name: 'Follow Up', category: 'follow_up', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_19', type: 'text', order: 0, content: { html: '<h2>Following Up</h2><p>Just checking in - did you get a chance to review our previous email?</p>' } },
      { id: 'tb_20', type: 'button', order: 1, content: { text: 'Take Action', url: '#', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_21', type: 'footer', order: 2, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_6', name: 'Educate', category: 'educate', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_22', type: 'text', order: 0, content: { html: '<h2>Did You Know?</h2><p>Here are some tips and insights to help you succeed.</p>' } },
      { id: 'tb_23', type: 'text', order: 1, content: { html: '<h3>Tip #1</h3><p>Start with the basics and build from there.</p>' } },
      { id: 'tb_24', type: 'text', order: 2, content: { html: '<h3>Tip #2</h3><p>Consistency is key to long-term success.</p>' } },
      { id: 'tb_25', type: 'footer', order: 3, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_7', name: 'Basic One Column', category: 'basic', thumbnail: null, isPrebuilt: true, content: [
      { id: 'tb_43', type: 'text', order: 0, content: { html: '<p>Your content here</p>' } },
      { id: 'tb_44', type: 'footer', order: 1, content: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' } }
    ], createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tmpl_8', name: 'Holiday Promo', category: 'custom', thumbnail: null, isPrebuilt: false, content: [
      { id: 'tb_26', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Holiday Special' } },
      { id: 'tb_27', type: 'text', order: 1, content: { html: '<h2>Holiday Special!</h2><p>Celebrate the season with exclusive deals.</p>' } },
      { id: 'tb_28', type: 'button', order: 2, content: { text: 'Shop Deals', url: '#', bgColor: '#D5432F', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_29', type: 'footer', order: 3, content: { text: 'Acme Marketing', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
    ], createdAt: daysAgo(30) },
    { id: 'tmpl_9', name: 'Welcome Series', category: 'custom', thumbnail: null, isPrebuilt: false, content: [
      { id: 'tb_30', type: 'text', order: 0, content: { html: '<h2>Welcome!</h2><p>Thanks for joining our community.</p>' } },
      { id: 'tb_31', type: 'button', order: 1, content: { text: 'Get Started', url: '#', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center' } },
      { id: 'tb_32', type: 'footer', order: 2, content: { text: 'Acme Marketing', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
    ], createdAt: daysAgo(60) },
    { id: 'tmpl_10', name: 'Product Update', category: 'custom', thumbnail: null, isPrebuilt: false, content: [
      { id: 'tb_33', type: 'header', order: 0, content: { logoSrc: '/logo.png', text: 'Product Update' } },
      { id: 'tb_34', type: 'text', order: 1, content: { html: '<h2>What\'s New</h2><p>Exciting new features and improvements.</p>' } },
      { id: 'tb_35', type: 'image', order: 2, content: { src: imageAsset('Update', '#E3F2FD', '#1565C0'), alt: 'Product update', width: '100%', link: '' } },
      { id: 'tb_36', type: 'footer', order: 3, content: { text: 'Acme Marketing', unsubscribeText: 'Unsubscribe', address: '123 Main St, New York, NY' } }
    ], createdAt: daysAgo(45) }
  ];

  const automations = [
    {
      id: 'auto_1', name: 'Welcome Series', type: 'welcome', status: 'active',
      trigger: { type: 'signup', audienceId: 'aud_1' },
      steps: [
        { id: 'step_1', type: 'send_email', order: 0, config: { subject: 'Welcome to Acme!', previewText: 'We\'re glad you\'re here', content: [{ id: 'as_1', type: 'text', order: 0, content: { html: '<h2>Welcome!</h2><p>Thanks for joining Acme Marketing.</p>' } }] } },
        { id: 'step_2', type: 'wait', order: 1, config: { duration: 2, unit: 'days' } },
        { id: 'step_3', type: 'send_email', order: 2, config: { subject: 'Getting Started with Acme', previewText: 'Tips to make the most of your subscription', content: [{ id: 'as_2', type: 'text', order: 0, content: { html: '<h2>Getting Started</h2><p>Here are some tips to get the most out of Acme.</p>' } }] } },
        { id: 'step_4', type: 'wait', order: 3, config: { duration: 5, unit: 'days' } },
        { id: 'step_5', type: 'send_email', order: 4, config: { subject: 'Your First Month with Acme', previewText: 'A recap of your journey so far', content: [{ id: 'as_3', type: 'text', order: 0, content: { html: '<h2>Your First Month</h2><p>Here is what you have accomplished so far.</p>' } }] } }
      ],
      stats: { emailsSent: 4521, opened: 2890, clicked: 1230 },
      createdAt: '2024-06-01T10:00:00Z', updatedAt: daysAgo(2)
    },
    {
      id: 'auto_2', name: 'Abandoned Cart', type: 'abandoned_cart', status: 'active',
      trigger: { type: 'cart_abandoned', audienceId: 'aud_1' },
      steps: [
        { id: 'step_6', type: 'wait', order: 0, config: { duration: 1, unit: 'hours' } },
        { id: 'step_7', type: 'send_email', order: 1, config: { subject: 'You left something behind!', previewText: 'Complete your purchase', content: [{ id: 'as_4', type: 'text', order: 0, content: { html: '<h2>Forgot Something?</h2><p>You left items in your cart. Complete your purchase now.</p>' } }] } },
        { id: 'step_8', type: 'wait', order: 2, config: { duration: 1, unit: 'days' } },
        { id: 'step_9', type: 'send_email', order: 3, config: { subject: 'Last chance: Items in your cart', previewText: 'Don\'t miss out', content: [{ id: 'as_5', type: 'text', order: 0, content: { html: '<h2>Last Chance!</h2><p>Your cart items are waiting. Order now before they sell out.</p>' } }] } }
      ],
      stats: { emailsSent: 1890, opened: 1120, clicked: 580 },
      createdAt: '2024-07-15T10:00:00Z', updatedAt: daysAgo(3)
    },
    {
      id: 'auto_3', name: 'Birthday Greeting', type: 'birthday', status: 'paused',
      trigger: { type: 'birthday', audienceId: 'aud_1' },
      steps: [
        { id: 'step_10', type: 'send_email', order: 0, config: { subject: 'Happy Birthday! Here\'s a gift for you', previewText: 'Celebrate with a special offer', content: [{ id: 'as_6', type: 'text', order: 0, content: { html: '<h2>Happy Birthday!</h2><p>Enjoy a special 25% discount as our gift to you.</p>' } }] } }
      ],
      stats: { emailsSent: 623, opened: 445, clicked: 210 },
      createdAt: '2024-08-01T10:00:00Z', updatedAt: daysAgo(15)
    },
    {
      id: 'auto_4', name: 'Re-engagement', type: 're_engagement', status: 'draft',
      trigger: { type: 'inactivity', audienceId: 'aud_1' },
      steps: [],
      stats: { emailsSent: 0, opened: 0, clicked: 0 },
      createdAt: daysAgo(5), updatedAt: daysAgo(5)
    },
    {
      id: 'auto_5', name: 'Post-Purchase Follow-up', type: 'post_purchase', status: 'active',
      trigger: { type: 'purchase', audienceId: 'aud_1' },
      steps: [
        { id: 'step_11', type: 'wait', order: 0, config: { duration: 3, unit: 'days' } },
        { id: 'step_12', type: 'send_email', order: 1, config: { subject: 'How\'s your purchase?', previewText: 'We\'d love your feedback', content: [{ id: 'as_7', type: 'text', order: 0, content: { html: '<h2>How are you enjoying your purchase?</h2><p>We\'d love to hear your thoughts. Leave a review!</p>' } }] } }
      ],
      stats: { emailsSent: 2100, opened: 1380, clicked: 620 },
      createdAt: '2024-09-01T10:00:00Z', updatedAt: daysAgo(4)
    }
  ];

  const contentFiles = [
    { id: 'file_1', name: 'hero-banner.jpg', type: 'image', url: '/content/hero-banner.jpg', size: 245000, dimensions: { width: 1200, height: 600 }, createdAt: daysAgo(60) },
    { id: 'file_2', name: 'product-photo-1.jpg', type: 'image', url: '/content/product-photo-1.jpg', size: 180000, dimensions: { width: 800, height: 800 }, createdAt: daysAgo(45) },
    { id: 'file_3', name: 'logo.png', type: 'image', url: '/content/logo.png', size: 35000, dimensions: { width: 400, height: 100 }, createdAt: daysAgo(90) },
    { id: 'file_4', name: 'sale-graphic.png', type: 'image', url: '/content/sale-graphic.png', size: 320000, dimensions: { width: 1000, height: 500 }, createdAt: daysAgo(30) },
    { id: 'file_5', name: 'team-photo.jpg', type: 'image', url: '/content/team-photo.jpg', size: 420000, dimensions: { width: 1600, height: 900 }, createdAt: daysAgo(75) },
    { id: 'file_6', name: 'product-photo-2.jpg', type: 'image', url: '/content/product-photo-2.jpg', size: 195000, dimensions: { width: 800, height: 800 }, createdAt: daysAgo(40) },
    { id: 'file_7', name: 'email-header.png', type: 'image', url: '/content/email-header.png', size: 85000, dimensions: { width: 600, height: 200 }, createdAt: daysAgo(55) },
    { id: 'file_8', name: 'social-share.jpg', type: 'image', url: '/content/social-share.jpg', size: 150000, dimensions: { width: 1200, height: 630 }, createdAt: daysAgo(25) },
    { id: 'file_9', name: 'brand-guide.pdf', type: 'document', url: '/content/brand-guide.pdf', size: 2500000, dimensions: null, createdAt: daysAgo(85) },
    { id: 'file_10', name: 'product-photo-3.jpg', type: 'image', url: '/content/product-photo-3.jpg', size: 210000, dimensions: { width: 800, height: 800 }, createdAt: daysAgo(20) }
  ];

  const landingPages = [
    { id: 'lp_1', name: 'Holiday Sale', status: 'published', url: 'https://mailchi.mp/acme/holiday-sale', views: 2340, signups: 186, conversionRate: 7.9, publishedAt: daysAgo(15), createdAt: daysAgo(20) },
    { id: 'lp_2', name: 'Newsletter Signup', status: 'published', url: 'https://mailchi.mp/acme/newsletter', views: 890, signups: 124, conversionRate: 13.9, publishedAt: daysAgo(45), createdAt: daysAgo(50) },
    { id: 'lp_3', name: 'Product Launch', status: 'draft', url: '', views: 0, signups: 0, conversionRate: 0, publishedAt: null, createdAt: daysAgo(3) },
    { id: 'lp_4', name: 'Webinar Registration', status: 'published', url: 'https://mailchi.mp/acme/webinar', views: 450, signups: 89, conversionRate: 19.8, publishedAt: daysAgo(10), createdAt: daysAgo(12) }
  ];

  const signupForms = [
    { id: 'form_1', name: 'Main Website Signup', type: 'embedded', status: 'active', views: 8420, submissions: 342, conversionRate: 4.1, audienceId: 'aud_1', createdAt: daysAgo(120) },
    { id: 'form_2', name: 'Exit Intent Popup', type: 'popup', status: 'active', views: 3200, submissions: 128, conversionRate: 4.0, audienceId: 'aud_1', createdAt: daysAgo(90) },
    { id: 'form_3', name: 'Footer Signup', type: 'embedded', status: 'active', views: 5600, submissions: 210, conversionRate: 3.8, audienceId: 'aud_1', createdAt: daysAgo(150) },
    { id: 'form_4', name: 'Blog Sidebar', type: 'embedded', status: 'paused', views: 1800, submissions: 56, conversionRate: 3.1, audienceId: 'aud_1', createdAt: daysAgo(60) }
  ];

  const notifications = [
    { id: 'notif_1', type: 'campaign_sent', title: 'Campaign Sent', message: '"December Newsletter" was sent to 1,250 contacts', read: false, link: '/campaigns/camp_1/report', createdAt: daysAgo(5) },
    { id: 'notif_2', type: 'import_complete', title: 'Import Complete', message: '50 contacts added successfully', read: true, link: '/audience', createdAt: daysAgo(3) },
    { id: 'notif_3', type: 'report_ready', title: 'Report Ready', message: '"Holiday Sale Announcement" report is now available', read: false, link: '/campaigns/camp_2/report', createdAt: daysAgo(2) },
    { id: 'notif_4', type: 'automation_triggered', title: 'Automation Triggered', message: 'Welcome Series sent to 12 new subscribers', read: true, link: '/automations/auto_1', createdAt: daysAgo(2) },
    { id: 'notif_5', type: 'system', title: 'New Subscriber', message: 'emma@example.com joined your audience', read: true, link: '/audience', createdAt: daysAgo(4) },
    { id: 'notif_6', type: 'campaign_sent', title: 'Campaign Scheduled', message: '"Year in Review" is scheduled for next week', read: false, link: '/campaigns/camp_5', createdAt: daysAgo(1) },
    { id: 'notif_7', type: 'system', title: 'Weekly Summary', message: 'Your weekly performance summary is available', read: true, link: '/analytics', createdAt: daysAgo(1) },
    { id: 'notif_8', type: 'revenue', title: 'Revenue Milestone', message: 'You\'ve earned $18,313 in tracked revenue this month', read: false, link: '/analytics', createdAt: hoursAgo(6) }
  ];

  const ecommerce = {
    totalRevenue: 18313.00,
    revenueThisMonth: 5680.00,
    revenueLastMonth: 4890.50,
    ordersThisMonth: 142,
    averageOrderValue: 40.00,
    revenueByMonth: [
      { month: 'Jul', revenue: 2100 }, { month: 'Aug', revenue: 2450 }, { month: 'Sep', revenue: 2800 },
      { month: 'Oct', revenue: 3200 }, { month: 'Nov', revenue: 4890 }, { month: 'Dec', revenue: 5680 }
    ]
  };

  return {
    user,
    audiences,
    contacts,
    tags,
    segments,
    campaigns,
    templates,
    automations,
    contentFiles,
    landingPages,
    signupForms,
    surveys: [
      {
        id: 'survey_1',
        name: 'Customer Satisfaction Q1',
        description: 'Quarterly customer satisfaction survey',
        status: 'active',
        questions: [
          { id: 'sq1', text: 'How satisfied are you with our product?', type: 'rating' },
          { id: 'sq2', text: 'Would you recommend us to a friend?', type: 'yes_no' },
          { id: 'sq3', text: 'What could we improve?', type: 'text' }
        ],
        responses: 187,
        completionRate: 72,
        audienceId: 'aud_1',
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-03-28T14:30:00Z'
      },
      {
        id: 'survey_2',
        name: 'New Feature Feedback',
        description: 'Gather feedback on upcoming feature ideas',
        status: 'draft',
        questions: [
          { id: 'sq4', text: 'Which feature interests you the most?', type: 'multiple_choice' },
          { id: 'sq5', text: 'How often do you use our platform?', type: 'rating' }
        ],
        responses: 0,
        completionRate: 0,
        audienceId: 'aud_1',
        createdAt: '2026-03-20T11:00:00Z',
        updatedAt: '2026-03-20T11:00:00Z'
      }
    ],
    notifications,
    ecommerce
  };
}
