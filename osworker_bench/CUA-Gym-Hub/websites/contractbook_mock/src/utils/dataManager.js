const BASE_KEY = 'contractbook_state';
const BASE_INITIAL_KEY = 'contractbook_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('contractbook_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('contractbook_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${sid}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.current_state || null;
  } catch (e) {
    return null;
  }
};

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const CONTRACT_HTML = {
  'contract-1': `<h2>SaaS License Agreement</h2>
<p>This Software as a Service License Agreement ("Agreement") is entered into as of <strong>[DATE]</strong>, by and between Acme Corporation, a Delaware corporation ("Licensor"), and CloudBase Systems, a California limited liability company ("Licensee").</p>
<h2>1. Definitions</h2>
<p>1.1 "Software" means the proprietary software-as-a-service platform provided by Licensor, including all updates, upgrades, and modifications thereto.</p>
<p>1.2 "Authorized Users" means the employees, contractors, and agents of Licensee who are permitted to access and use the Software in accordance with the terms of this Agreement.</p>
<h2>2. License Grant</h2>
<p>Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable, limited license to access and use the Software during the Term solely for Licensee's internal business purposes.</p>
<h2>3. Fees and Payment</h2>
<p>3.1 Licensee shall pay Licensor the fees set forth in Schedule A attached hereto. All fees are due and payable within thirty (30) days of the invoice date.</p>
<p>3.2 All fees are exclusive of taxes, levies, or duties imposed by taxing authorities, and Licensee shall be responsible for payment of all such taxes, levies, or duties.</p>
<h2>4. Confidentiality</h2>
<p>Each party agrees to maintain in confidence all Confidential Information of the other party and to use such Confidential Information only for the purposes of this Agreement.</p>`,

  'contract-2': `<h2>Employment Offer Letter</h2>
<p>Dear <strong>[CANDIDATE NAME]</strong>,</p>
<p>We are pleased to extend this offer of employment with Acme Corporation (the "Company") for the position of Senior Software Developer, reporting to the Engineering Manager.</p>
<h2>Position Details</h2>
<p><strong>Title:</strong> Senior Software Developer<br/>
<strong>Department:</strong> Engineering<br/>
<strong>Start Date:</strong> [START DATE]<br/>
<strong>Location:</strong> Remote (with occasional travel to headquarters)</p>
<h2>Compensation</h2>
<p>2.1 <strong>Base Salary:</strong> Your annual base salary will be $[AMOUNT], paid bi-weekly.</p>
<p>2.2 <strong>Equity:</strong> You will receive a grant of [SHARES] stock options, subject to the terms of the Company's equity incentive plan.</p>
<h2>Benefits</h2>
<p>You will be eligible to participate in the Company's standard employee benefits programs, including medical, dental, and vision insurance, 401(k) plan with employer matching, flexible paid time off, and professional development stipend.</p>`,

  'contract-3': `<h2>Consulting Agreement</h2>
<p>This Consulting Agreement ("Agreement") is made and entered into as of <strong>[DATE]</strong>, between Acme Corporation ("Client") and Laurent Consulting, a professional services firm organized under the laws of France ("Consultant").</p>
<h2>1. Services</h2>
<p>Consultant agrees to perform the consulting services described in Exhibit A (the "Services") in a professional and workmanlike manner.</p>
<h2>2. Compensation and Expenses</h2>
<p>2.1 In consideration for the Services, Client shall pay Consultant a consulting fee of EUR [RATE] per day. Invoices shall be submitted monthly and are due within thirty (30) days of receipt.</p>
<p>2.2 Client shall reimburse Consultant for all pre-approved reasonable and necessary expenses incurred in connection with the performance of the Services.</p>
<h2>3. Independent Contractor</h2>
<p>Consultant is an independent contractor and not an employee of Client.</p>`,

  'contract-4': `<h2>Master Service Agreement</h2>
<p>This Master Service Agreement ("MSA" or "Agreement") is entered into as of <strong>November 10, 2024</strong>, by and between Acme Corporation, a Delaware corporation ("Company"), and Tech Ventures Inc., a California corporation ("Service Provider").</p>
<h2>1. Services</h2>
<p>1.1 Subject to the terms and conditions of this Agreement, Service Provider shall provide to Company the services described in each Statement of Work ("SOW").</p>
<p>1.2 Service Provider shall perform the Services in a professional and workmanlike manner.</p>
<h2>2. Fees and Payment Terms</h2>
<p>2.1 Company shall pay Service Provider the fees specified in the applicable SOW. Unless otherwise specified, invoices are payable within forty-five (45) days of receipt.</p>
<p>2.2 Late payments shall accrue interest at the rate of 1.5% per month.</p>
<h2>3. Intellectual Property</h2>
<p>3.1 All work product created by Service Provider specifically for Company shall be "work made for hire" and the exclusive property of Company.</p>
<h2>4. Indemnification</h2>
<p>Each party shall indemnify the other from claims arising from breach of this Agreement or negligence.</p>`,

  'contract-5': `<h2>Non-Disclosure Agreement</h2>
<p>This Non-Disclosure Agreement ("NDA") is entered into as of <strong>${daysAgo(1).split('T')[0]}</strong> between Acme Corporation ("Disclosing Party") and Nordic Solutions AB ("Receiving Party").</p>
<h2>1. Definition of Confidential Information</h2>
<p>1.1 "Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which Disclosing Party is engaged.</p>
<h2>2. Obligations of Receiving Party</h2>
<p>The Receiving Party agrees to: (a) hold the Confidential Information in strict confidence; (b) not to disclose the Confidential Information to any third parties without the prior written consent of the Disclosing Party.</p>
<h2>3. Term</h2>
<p>This Agreement shall remain in effect for a period of three (3) years from the date of execution.</p>`,

  'contract-6': `<h2>Vendor Agreement</h2>
<p>This Vendor Agreement ("Agreement") is entered into as of <strong>November 1, 2024</strong>, between Acme Corporation ("Buyer"), and GlobalTech Ltd., a United Kingdom limited company ("Vendor").</p>
<h2>1. Purchase Orders and Acceptance</h2>
<p>1.1 Buyer may issue purchase orders to Vendor for the goods and/or services described therein.</p>
<p>1.2 Vendor shall confirm acceptance of each Purchase Order within two (2) business days of receipt.</p>
<h2>2. Delivery and Risk of Loss</h2>
<p>All goods shall be delivered DDP (Delivered Duty Paid) to the delivery address specified in the applicable Purchase Order.</p>`,

  'contract-7': `<h2>Annual Support Contract</h2>
<p>This Annual Support and Maintenance Contract ("Agreement") is entered into as of <strong>October 1, 2023</strong>, between Acme Corporation ("Customer") and Emerald Group ("Provider"). This Agreement has been duly executed by both parties.</p>
<h2>1. Support Services</h2>
<p>Provider shall provide Customer with technical support via phone, email, and ticketing system during business hours; bug fixes and patches; access to all minor version updates; and quarterly review meetings.</p>
<h2>2. Service Level Agreement</h2>
<p>2.1 Priority 1 (Critical) issues: respond within one (1) hour, resolve within four (4) hours.</p>
<p>2.2 Priority 2 (High) issues: respond within four (4) hours, resolve within one (1) business day.</p>
<h2>3. Contract Value</h2>
<p>The total value of this Agreement is Seventy-Five Thousand US Dollars ($75,000 USD), payable in equal monthly installments of $6,250.</p>`,

  'contract-8': `<h2>Partnership Agreement</h2>
<p>This Partnership and Revenue Sharing Agreement ("Agreement") is entered into as of <strong>September 1, 2024</strong>, between Acme Corporation ("Company") and Santos & Partners ("Partner"). SIGNED AND EXECUTED.</p>
<h2>1. Partnership Structure</h2>
<p>The parties agree to enter into a strategic partnership for jointly developing and marketing compliance automation solutions to mid-market enterprises in the Latin American market.</p>
<h2>2. Revenue Sharing</h2>
<p>2.1 Net revenues shall be split 60% to Company and 40% to Partner.</p>
<p>2.2 Revenue accounting and distributions shall occur quarterly.</p>
<h2>3. Total Agreement Value</h2>
<p>The minimum guaranteed payment is Two Hundred Thousand US Dollars ($200,000 USD) over the initial two-year term.</p>`,

  'contract-9': `<h2>Office Lease Agreement</h2>
<p>This Commercial Lease Agreement ("Lease") is entered into as of <strong>January 15, 2024</strong>, between Prestige Properties LLC ("Landlord") and Acme Corporation ("Tenant"). FULLY EXECUTED.</p>
<h2>1. Premises</h2>
<p>Landlord hereby leases to Tenant the premises at Suite 1200, 350 Park Avenue, New York, NY 10022, comprising approximately 8,500 rentable square feet.</p>
<h2>2. Term</h2>
<p>The term shall commence on February 1, 2024, and expire on January 31, 2027.</p>
<h2>3. Base Rent</h2>
<p>Tenant shall pay Landlord a monthly base rent of Forty-Two Thousand Five Hundred Dollars ($42,500.00).</p>`,

  'contract-10': `<h2>Employee Non-Disclosure Agreement</h2>
<p>This Employee Non-Disclosure, Confidentiality, and Intellectual Property Agreement ("Agreement") is entered into as of <strong>June 1, 2024</strong>, between Acme Corporation ("Company") and Michael Park ("Employee"). SIGNED.</p>
<h2>1. Confidential Information</h2>
<p>Employee acknowledges that in the course of employment, Employee will have access to Confidential Information. Employee agrees to hold all Confidential Information in trust and confidence.</p>`,

  'contract-11': `<h2>Software Development Contract</h2>
<p>This Software Development Agreement ("Agreement") was proposed between Acme Corporation ("Client") and Shenzhen Digital Co. ("Developer"). STATUS: REJECTED.</p>
<h2>1. Development Services</h2>
<p>Developer was to provide custom software development services as described in Appendix A. Following review, specific indemnification and intellectual property clauses were found to be unacceptable, resulting in rejection.</p>`,

  'contract-12': `<h2>Maintenance Agreement</h2>
<p>This Maintenance and Support Agreement ("Agreement") was entered into as of <strong>January 1, 2023</strong>, between Acme Corporation ("Customer") and Legacy Systems Corp. ("Vendor"). STATUS: EXPIRED.</p>
<h2>1. Maintenance Services</h2>
<p>Vendor agreed to provide preventive and corrective maintenance services for Customer's legacy infrastructure systems. This Agreement expired on December 31, 2023 and was not renewed.</p>`,

  'contract-13': `<h2>Data Processing Agreement</h2>
<p>This Data Processing Agreement ("DPA") is entered into as of <strong>March 15, 2025</strong>, by and between Acme Corporation, as the data controller ("Controller"), and Nexus Cloud Services, a Delaware corporation, as the data processor ("Processor").</p>
<h2>1. Definitions</h2>
<p>1.1 "Personal Data" means any information relating to an identified or identifiable natural person as defined under applicable Data Protection Laws.</p>
<p>1.2 "Processing" means any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure, or erasure.</p>
<h2>2. Scope of Processing</h2>
<p>Processor shall process Personal Data only on documented instructions from Controller, including transfers to third countries or international organizations.</p>
<h2>3. Security Measures</h2>
<p>Processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption of personal data, ensuring ongoing confidentiality, and regular testing of security measures.</p>
<h2>4. Sub-processors</h2>
<p>Processor shall not engage any sub-processor without prior specific written authorization from Controller. Processor shall impose equivalent data protection obligations on any sub-processor.</p>`,

  'contract-14': `<h2>Reseller Agreement</h2>
<p>This Reseller Agreement ("Agreement") is entered into as of <strong>February 1, 2025</strong>, between Acme Corporation ("Vendor") and Pacific Rim Distributors Ltd. ("Reseller").</p>
<h2>1. Appointment</h2>
<p>Vendor hereby appoints Reseller as a non-exclusive authorized reseller of the Products listed in Exhibit A within the Territory (Asia-Pacific region).</p>
<h2>2. Pricing and Margins</h2>
<p>2.1 Reseller shall purchase Products at the wholesale prices set forth in the Price List. Reseller may set its own retail prices but shall not exceed the Manufacturer's Suggested Retail Price.</p>
<p>2.2 Minimum order quantity: 100 units per quarter.</p>
<h2>3. Marketing Support</h2>
<p>Vendor shall provide Reseller with marketing materials, product training, and a co-marketing fund equal to 5% of Reseller's quarterly purchase volume.</p>
<h2>4. Performance Targets</h2>
<p>Reseller agrees to achieve minimum annual sales of $500,000 in Year 1 and $750,000 in Year 2. Failure to meet targets may result in termination.</p>`,

  'contract-15': `<h2>Intellectual Property Assignment Agreement</h2>
<p>This Intellectual Property Assignment Agreement ("Agreement") is made as of <strong>April 1, 2025</strong>, between PixelForge Studios Inc. ("Assignor") and Acme Corporation ("Assignee").</p>
<h2>1. Assignment</h2>
<p>Assignor hereby irrevocably assigns, transfers, and conveys to Assignee all right, title, and interest in and to the Intellectual Property described in Exhibit A, including all patents, copyrights, trademarks, and trade secrets.</p>
<h2>2. Consideration</h2>
<p>In consideration for the assignment, Assignee shall pay Assignor a one-time fee of Two Hundred Fifty Thousand Dollars ($250,000), payable within thirty (30) days of execution.</p>
<h2>3. Representations and Warranties</h2>
<p>Assignor represents and warrants that: (a) it is the sole owner of the Intellectual Property; (b) the Intellectual Property does not infringe any third-party rights; (c) there are no pending claims or litigation regarding the Intellectual Property.</p>`,

  'contract-16': `<h2>Service Level Agreement</h2>
<p>This Service Level Agreement ("SLA") supplements the Master Service Agreement dated November 10, 2024 between Acme Corporation ("Customer") and Pinnacle IT Solutions ("Provider").</p>
<h2>1. Service Availability</h2>
<p>Provider guarantees 99.9% uptime for all production services, measured monthly. Scheduled maintenance windows (maximum 4 hours/month) are excluded from availability calculations.</p>
<h2>2. Response Times</h2>
<p>Critical (P1): Response within 15 minutes, resolution within 4 hours.<br/>
High (P2): Response within 1 hour, resolution within 8 hours.<br/>
Medium (P3): Response within 4 hours, resolution within 2 business days.<br/>
Low (P4): Response within 1 business day, resolution within 5 business days.</p>
<h2>3. Service Credits</h2>
<p>If monthly uptime falls below 99.9%, Customer shall receive service credits: 99.0-99.9% = 10% credit; 95.0-99.0% = 25% credit; below 95.0% = 50% credit.</p>`,

  'contract-17': `<h2>Joint Venture Agreement</h2>
<p>This Joint Venture Agreement ("Agreement") is entered into as of <strong>January 20, 2025</strong>, between Acme Corporation ("Party A") and Meridian Industries ("Party B"), collectively referred to as the "Parties."</p>
<h2>1. Purpose</h2>
<p>The Parties agree to form a joint venture ("JV") for the purpose of developing, manufacturing, and distributing next-generation IoT sensor technology for industrial applications.</p>
<h2>2. Capital Contributions</h2>
<p>Party A shall contribute $2,000,000 in cash and all relevant IP licenses. Party B shall contribute $1,500,000 in cash and manufacturing facilities.</p>
<h2>3. Governance</h2>
<p>The JV shall be managed by a Board of four members: two appointed by Party A and two by Party B. Major decisions require unanimous Board approval.</p>
<h2>4. Profit Distribution</h2>
<p>Net profits shall be distributed 55% to Party A and 45% to Party B, reflecting their respective capital contributions and IP value.</p>`,
};

const TEMPLATE_HTML = {
  'template-1': `<h2>Master Service Agreement</h2>
<p>This Master Service Agreement ("MSA") is entered into as of <strong>[EFFECTIVE DATE]</strong>, by and between [CLIENT NAME] ("Company"), and [SERVICE PROVIDER NAME] ("Service Provider").</p>
<h2>1. Services</h2>
<p>Service Provider shall provide to Company the services described in each Statement of Work ("SOW").</p>
<h2>2. Fees and Payment Terms</h2>
<p>Company shall pay Service Provider the fees specified in the applicable SOW. Invoices are payable within [PAYMENT DAYS] days.</p>
<h2>3. Intellectual Property</h2>
<p>All work product created by Service Provider for Company shall be "work made for hire."</p>
<h2>4. Term and Termination</h2>
<p>This Agreement commences on [START DATE] and continues until terminated with [NOTICE DAYS] days written notice.</p>`,

  'template-2': `<h2>Non-Disclosure Agreement</h2>
<p>This Non-Disclosure Agreement is entered into as of <strong>[DATE]</strong> between [PARTY A] ("Disclosing Party") and [PARTY B] ("Receiving Party").</p>
<h2>1. Confidential Information</h2>
<p>"Confidential Information" means any information marked as confidential or that reasonably should be understood to be confidential.</p>
<h2>2. Obligations</h2>
<p>The Receiving Party agrees to hold all Confidential Information in strict confidence.</p>
<h2>3. Term</h2>
<p>This Agreement shall remain in effect for [DURATION] years from execution.</p>`,

  'template-3': `<h2>Employment Offer Letter</h2>
<p>Dear <strong>[CANDIDATE NAME]</strong>,</p>
<p>We are pleased to extend an offer of employment with [COMPANY NAME] for [POSITION TITLE], reporting to [REPORTING MANAGER].</p>
<h2>Compensation</h2>
<p>Annual base salary: $[SALARY], paid [FREQUENCY]. Equity: [EQUITY DETAILS].</p>
<h2>Benefits</h2>
<p>You will be eligible for [BENEFITS DESCRIPTION].</p>
<h2>Start Date</h2>
<p>Your anticipated start date is [START DATE].</p>`,

  'template-4': `<h2>Vendor Agreement</h2>
<p>This Vendor Agreement is entered into as of <strong>[DATE]</strong>, between [BUYER NAME] ("Buyer") and [VENDOR NAME] ("Vendor").</p>
<h2>1. Purchase Orders</h2>
<p>Buyer may issue purchase orders specifying goods or services. Vendor shall confirm acceptance within [DAYS] business days.</p>
<h2>2. Payment Terms</h2>
<p>Payment terms are Net [DAYS] from invoice date.</p>`,

  'template-5': `<h2>Consulting Agreement</h2>
<p>This Consulting Agreement is made as of <strong>[DATE]</strong>, between [CLIENT NAME] ("Client") and [CONSULTANT NAME] ("Consultant").</p>
<h2>1. Services</h2>
<p>Consultant shall provide [DESCRIPTION OF SERVICES] as detailed in Exhibit A.</p>
<h2>2. Compensation</h2>
<p>Client shall pay Consultant [RATE] per [HOUR/DAY/MONTH]. Invoices are due within 30 days.</p>
<h2>3. Independent Contractor</h2>
<p>Consultant is an independent contractor and not an employee of Client.</p>`,

  'template-6': `<h2>Software License Agreement</h2>
<p>This Software License Agreement is entered into as of <strong>[DATE]</strong>, between [LICENSOR] ("Licensor") and [LICENSEE] ("Licensee").</p>
<h2>1. License Grant</h2>
<p>Licensor grants Licensee a non-exclusive, non-transferable license to use [SOFTWARE NAME] for [PURPOSE].</p>
<h2>2. Fees</h2>
<p>Licensee shall pay annual license fees of $[AMOUNT] due on [DATE].</p>
<h2>3. Restrictions</h2>
<p>Licensee shall not sublicense, sell, resell, transfer, assign, or otherwise commercially exploit the Software.</p>`,

  'template-7': `<h2>Partnership Agreement</h2>
<p>This Partnership Agreement is entered into as of <strong>[DATE]</strong>, between [PARTNER A] and [PARTNER B].</p>
<h2>1. Purpose</h2>
<p>The parties agree to form a strategic partnership for [PURPOSE].</p>
<h2>2. Revenue Sharing</h2>
<p>Net revenues shall be split [PERCENTAGE A]% to [PARTNER A] and [PERCENTAGE B]% to [PARTNER B].</p>`,

  'template-8': `<h2>Lease Agreement</h2>
<p>This Commercial Lease Agreement is entered into as of <strong>[DATE]</strong>, between [LANDLORD] ("Landlord") and [TENANT] ("Tenant").</p>
<h2>1. Premises</h2>
<p>Landlord leases to Tenant the premises at [ADDRESS], comprising approximately [SQFT] square feet.</p>
<h2>2. Term</h2>
<p>The lease term commences on [START DATE] and expires on [END DATE].</p>
<h2>3. Rent</h2>
<p>Monthly base rent shall be $[AMOUNT], payable on the first of each month.</p>`,

  'template-9': `<h2>Data Processing Agreement</h2>
<p>This Data Processing Agreement ("DPA") is entered into as of <strong>[DATE]</strong>, by and between [CONTROLLER NAME] ("Controller") and [PROCESSOR NAME] ("Processor").</p>
<h2>1. Scope</h2>
<p>Processor shall process Personal Data only on documented instructions from Controller.</p>
<h2>2. Security Measures</h2>
<p>Processor shall implement appropriate technical and organizational security measures including [MEASURES].</p>
<h2>3. Sub-processors</h2>
<p>Processor shall not engage sub-processors without prior written authorization from Controller.</p>
<h2>4. Data Subject Rights</h2>
<p>Processor shall assist Controller in responding to data subject requests within [DAYS] business days.</p>`,

  'template-10': `<h2>Service Level Agreement</h2>
<p>This SLA supplements the agreement between [CUSTOMER] and [PROVIDER] dated [DATE].</p>
<h2>1. Service Availability</h2>
<p>Provider guarantees [UPTIME]% uptime, measured monthly.</p>
<h2>2. Response Times</h2>
<p>Critical: [P1 TIME]. High: [P2 TIME]. Medium: [P3 TIME]. Low: [P4 TIME].</p>
<h2>3. Service Credits</h2>
<p>Below target uptime: [CREDIT SCHEDULE].</p>`,
};

export function createInitialData() {
  const now = new Date();
  const d = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const currentUser = {
    id: 'user-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@acmecorp.com',
    avatar: null,
    role: 'admin',
    company: 'Acme Corporation',
    jobTitle: 'Head of Legal',
    phone: '+1 (555) 234-5678',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      inApp: true,
      signingReminders: true,
      expirationAlerts: true,
    },
  };

  const users = [
    { id: 'user-2', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@acmecorp.com', avatar: null, role: 'member', jobTitle: 'Contract Manager', status: 'active' },
    { id: 'user-3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.r@acmecorp.com', avatar: null, role: 'member', jobTitle: 'Legal Counsel', status: 'active' },
    { id: 'user-4', firstName: 'Michael', lastName: 'Park', email: 'michael.park@acmecorp.com', avatar: null, role: 'admin', jobTitle: 'CEO', status: 'active' },
    { id: 'user-5', firstName: 'Lisa', lastName: 'Thompson', email: 'lisa.t@acmecorp.com', avatar: null, role: 'member', jobTitle: 'Operations Lead', status: 'active' },
    { id: 'user-6', firstName: 'David', lastName: 'Kim', email: 'david.kim@acmecorp.com', avatar: null, role: 'viewer', jobTitle: 'Finance Director', status: 'active' },
  ];

  const contacts = [
    { id: 'contact-1', firstName: 'Robert', lastName: 'Martinez', email: 'robert@techventures.io', company: 'Tech Ventures Inc.', jobTitle: 'CEO', phone: '+1 (555) 987-6543', notes: 'Preferred contact method: email', createdAt: d(180), updatedAt: d(30) },
    { id: 'contact-2', firstName: 'Anna', lastName: 'Johansson', email: 'anna@nordicsolutions.com', company: 'Nordic Solutions AB', jobTitle: 'COO', phone: '+46 8 555 1234', notes: '', createdAt: d(150), updatedAt: d(10) },
    { id: 'contact-3', firstName: 'Tom', lastName: 'Bradley', email: 'tom.bradley@globaltech.com', company: 'GlobalTech Ltd.', jobTitle: 'Head of Procurement', phone: '+44 20 7946 0958', notes: 'Based in London', createdAt: d(120), updatedAt: d(20) },
    { id: 'contact-4', firstName: 'Maria', lastName: 'Santos', email: 'maria@santospartners.com', company: 'Santos & Partners', jobTitle: 'Legal Director', phone: '+55 11 9876-5432', notes: 'Key partner contact', createdAt: d(200), updatedAt: d(60) },
    { id: 'contact-5', firstName: 'Chen', lastName: 'Wei', email: 'chen.wei@shenzhendigital.cn', company: 'Shenzhen Digital Co.', jobTitle: 'VP Engineering', phone: '+86 755 8800 1234', notes: 'Different time zone', createdAt: d(90), updatedAt: d(7) },
    { id: 'contact-6', firstName: 'Sophie', lastName: 'Laurent', email: 'sophie@laurentconsulting.fr', company: 'Laurent Consulting', jobTitle: 'Managing Partner', phone: '+33 1 4455 6677', notes: 'French timezone', createdAt: d(60), updatedAt: d(5) },
    { id: 'contact-7', firstName: 'Raj', lastName: 'Patel', email: 'raj@cloudbasesystems.io', company: 'CloudBase Systems', jobTitle: 'CTO', phone: '+1 (650) 555-7890', notes: '', createdAt: d(45), updatedAt: d(3) },
    { id: 'contact-8', firstName: 'Karen', lastName: "O'Brien", email: 'karen.obrien@emeraldgroup.ie', company: 'Emerald Group', jobTitle: 'HR Director', phone: '+353 1 234 5678', notes: 'Dublin-based', createdAt: d(365), updatedAt: d(14) },
    { id: 'contact-9', firstName: 'Hiroshi', lastName: 'Tanaka', email: 'hiroshi@nexuscloud.jp', company: 'Nexus Cloud Services', jobTitle: 'VP Data Privacy', phone: '+81 3 5555 1234', notes: 'Data privacy specialist', createdAt: d(40), updatedAt: d(8) },
    { id: 'contact-10', firstName: 'Derek', lastName: 'Chang', email: 'derek@pacificrim.com.au', company: 'Pacific Rim Distributors', jobTitle: 'Director of Sales', phone: '+61 2 9876 5432', notes: 'APAC region lead', createdAt: d(35), updatedAt: d(6) },
    { id: 'contact-11', firstName: 'Amanda', lastName: 'Fischer', email: 'amanda@pixelforge.com', company: 'PixelForge Studios', jobTitle: 'CEO', phone: '+1 (415) 555-9012', notes: 'IP acquisition contact', createdAt: d(20), updatedAt: d(4) },
    { id: 'contact-12', firstName: 'Nathan', lastName: 'Brooks', email: 'nathan@pinnacleit.com', company: 'Pinnacle IT Solutions', jobTitle: 'VP Operations', phone: '+1 (312) 555-3456', notes: 'SLA discussions', createdAt: d(15), updatedAt: d(2) },
    { id: 'contact-13', firstName: 'Lena', lastName: 'Kruger', email: 'lena@meridianindustries.de', company: 'Meridian Industries', jobTitle: 'Head of Strategy', phone: '+49 30 5555 7890', notes: 'JV contact', createdAt: d(25), updatedAt: d(5) },
  ];

  const folders = [
    { id: 'folder-1', name: 'Client Agreements', parentId: null, color: '#1C00FF', createdAt: d(365), createdBy: 'user-1' },
    { id: 'folder-2', name: 'Enterprise Clients', parentId: 'folder-1', color: '#1C00FF', createdAt: d(350), createdBy: 'user-1' },
    { id: 'folder-3', name: 'SMB Clients', parentId: 'folder-1', color: '#1C00FF', createdAt: d(340), createdBy: 'user-1' },
    { id: 'folder-4', name: 'Vendor Contracts', parentId: null, color: '#10B981', createdAt: d(360), createdBy: 'user-1' },
    { id: 'folder-5', name: 'Employment', parentId: null, color: '#F59E0B', createdAt: d(355), createdBy: 'user-1' },
    { id: 'folder-6', name: 'Offer Letters', parentId: 'folder-5', color: '#F59E0B', createdAt: d(345), createdBy: 'user-1' },
    { id: 'folder-7', name: 'NDAs', parentId: 'folder-5', color: '#8B5CF6', createdAt: d(330), createdBy: 'user-1' },
    { id: 'folder-8', name: 'Partnerships', parentId: null, color: '#EF4444', createdAt: d(300), createdBy: 'user-1' },
    { id: 'folder-9', name: 'Compliance', parentId: null, color: '#06B6D4', createdAt: d(50), createdBy: 'user-1' },
  ];

  const tags = [
    { id: 'tag-1', name: 'High Priority', color: '#EF4444' },
    { id: 'tag-2', name: 'Auto-Renew', color: '#F59E0B' },
    { id: 'tag-3', name: 'Confidential', color: '#8B5CF6' },
    { id: 'tag-4', name: 'Revenue', color: '#10B981' },
    { id: 'tag-5', name: 'Legal Review', color: '#3B82F6' },
    { id: 'tag-6', name: 'Urgent', color: '#EF4444' },
    { id: 'tag-7', name: 'GDPR', color: '#06B6D4' },
    { id: 'tag-8', name: 'Needs Approval', color: '#F97316' },
  ];

  const contracts = [
    {
      id: 'contract-1',
      title: 'SaaS License Agreement - CloudBase',
      status: 'draft',
      content: CONTRACT_HTML['contract-1'],
      folderId: 'folder-2',
      templateId: 'template-6',
      tags: ['tag-5'],
      parties: [
        { id: 'party-1a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-1a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Authorized Signatory', signedAt: null, status: 'not_sent', order: 1 },
        ]},
        { id: 'party-1b', name: 'CloudBase Systems', type: 'external', signees: [
          { id: 'signee-1b', contactId: 'contact-7', userId: null, name: 'Raj Patel', email: 'raj@cloudbasesystems.io', role: 'CTO', signedAt: null, status: 'not_sent', order: 2 },
        ]},
      ],
      createdAt: d(5), updatedAt: d(2), createdBy: 'user-1',
      expiresAt: f(360), signedAt: null, sentAt: null,
      value: 48000, currency: 'USD', renewalDate: f(365), notes: 'Annual SaaS license for cloud infrastructure',
      approvals: [
        { id: 'approval-1', userId: 'user-3', status: 'approved', requestedAt: d(4), respondedAt: d(3), comment: 'Looks good, standard terms.' },
        { id: 'approval-2', userId: 'user-6', status: 'pending', requestedAt: d(3), respondedAt: null, comment: null },
      ],
    },
    {
      id: 'contract-2',
      title: 'Employment Offer - Senior Developer',
      status: 'draft',
      content: CONTRACT_HTML['contract-2'],
      folderId: 'folder-6',
      templateId: 'template-3',
      tags: ['tag-6'],
      parties: [
        { id: 'party-2a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-2a', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: null, status: 'not_sent', order: 1 },
        ]},
      ],
      createdAt: d(3), updatedAt: d(1), createdBy: 'user-1',
      expiresAt: f(30), signedAt: null, sentAt: null,
      value: null, currency: 'USD', renewalDate: null, notes: 'Need CEO signature urgently',
      approvals: [
        { id: 'approval-3', userId: 'user-4', status: 'approved', requestedAt: d(2), respondedAt: d(1), comment: 'Approved. Competitive offer.' },
      ],
    },
    {
      id: 'contract-3',
      title: 'Consulting Agreement - Laurent',
      status: 'draft',
      content: CONTRACT_HTML['contract-3'],
      folderId: 'folder-8',
      templateId: null,
      tags: [],
      parties: [
        { id: 'party-3a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-3a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: null, status: 'not_sent', order: 1 },
        ]},
        { id: 'party-3b', name: 'Laurent Consulting', type: 'external', signees: [
          { id: 'signee-3b', contactId: 'contact-6', userId: null, name: 'Sophie Laurent', email: 'sophie@laurentconsulting.fr', role: 'Managing Partner', signedAt: null, status: 'not_sent', order: 2 },
        ]},
      ],
      createdAt: d(7), updatedAt: d(7), createdBy: 'user-2',
      expiresAt: f(180), signedAt: null, sentAt: null,
      value: 85000, currency: 'EUR', renewalDate: null, notes: '',
      approvals: [],
    },
    {
      id: 'contract-4',
      title: 'Master Service Agreement - Tech Ventures',
      status: 'pending',
      content: CONTRACT_HTML['contract-4'],
      folderId: 'folder-2',
      templateId: 'template-1',
      tags: ['tag-1', 'tag-4'],
      parties: [
        { id: 'party-4a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-4a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: d(2), status: 'signed', order: 1 },
        ]},
        { id: 'party-4b', name: 'Tech Ventures Inc.', type: 'external', signees: [
          { id: 'signee-4b', contactId: 'contact-1', userId: null, name: 'Robert Martinez', email: 'robert@techventures.io', role: 'CEO', signedAt: null, status: 'pending', order: 2 },
        ]},
      ],
      createdAt: d(10), updatedAt: d(3), createdBy: 'user-1',
      expiresAt: f(355), signedAt: null, sentAt: d(3),
      value: 150000, currency: 'USD', renewalDate: f(360), notes: 'Key enterprise client',
      approvals: [
        { id: 'approval-4', userId: 'user-4', status: 'approved', requestedAt: d(8), respondedAt: d(7), comment: 'Approved. Good deal.' },
        { id: 'approval-5', userId: 'user-6', status: 'approved', requestedAt: d(8), respondedAt: d(6), comment: 'Budget confirmed.' },
      ],
    },
    {
      id: 'contract-5',
      title: 'NDA - Nordic Solutions',
      status: 'pending',
      content: CONTRACT_HTML['contract-5'],
      folderId: 'folder-7',
      templateId: 'template-2',
      tags: ['tag-3'],
      parties: [
        { id: 'party-5a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-5a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: null, status: 'pending', order: 1 },
        ]},
        { id: 'party-5b', name: 'Nordic Solutions AB', type: 'external', signees: [
          { id: 'signee-5b', contactId: 'contact-2', userId: null, name: 'Anna Johansson', email: 'anna@nordicsolutions.com', role: 'COO', signedAt: null, status: 'pending', order: 2 },
        ]},
      ],
      createdAt: d(2), updatedAt: d(1), createdBy: 'user-3',
      expiresAt: f(1095), signedAt: null, sentAt: d(1),
      value: null, currency: 'USD', renewalDate: null, notes: '',
      approvals: [],
    },
    {
      id: 'contract-6',
      title: 'Vendor Agreement - GlobalTech',
      status: 'pending',
      content: CONTRACT_HTML['contract-6'],
      folderId: 'folder-4',
      templateId: 'template-4',
      tags: [],
      parties: [
        { id: 'party-6a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-6a', contactId: null, userId: 'user-5', name: 'Lisa Thompson', email: 'lisa.t@acmecorp.com', role: 'Operations Lead', signedAt: d(4), status: 'signed', order: 1 },
        ]},
        { id: 'party-6b', name: 'GlobalTech Ltd.', type: 'external', signees: [
          { id: 'signee-6b', contactId: 'contact-3', userId: null, name: 'Tom Bradley', email: 'tom.bradley@globaltech.com', role: 'Head of Procurement', signedAt: null, status: 'pending', order: 2 },
        ]},
      ],
      createdAt: d(15), updatedAt: d(5), createdBy: 'user-2',
      expiresAt: f(350), signedAt: null, sentAt: d(5),
      value: 95000, currency: 'USD', renewalDate: f(365), notes: '',
      approvals: [],
    },
    {
      id: 'contract-7',
      title: 'Annual Support Contract - Emerald Group',
      status: 'signed',
      content: CONTRACT_HTML['contract-7'],
      folderId: 'folder-2',
      templateId: null,
      tags: ['tag-2', 'tag-4'],
      parties: [
        { id: 'party-7a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-7a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: d(15), status: 'signed', order: 1 },
        ]},
        { id: 'party-7b', name: 'Emerald Group', type: 'external', signees: [
          { id: 'signee-7b', contactId: 'contact-8', userId: null, name: "Karen O'Brien", email: 'karen.obrien@emeraldgroup.ie', role: 'HR Director', signedAt: d(14), status: 'signed', order: 2 },
        ]},
      ],
      createdAt: d(30), updatedAt: d(14), createdBy: 'user-1',
      expiresAt: f(335), signedAt: d(14), sentAt: d(20),
      value: 75000, currency: 'USD', renewalDate: f(335), notes: 'Auto-renews annually with 30-day notice period',
      approvals: [],
    },
    {
      id: 'contract-8',
      title: 'Partnership Agreement - Santos & Partners',
      status: 'signed',
      content: CONTRACT_HTML['contract-8'],
      folderId: 'folder-8',
      templateId: 'template-7',
      tags: ['tag-4'],
      parties: [
        { id: 'party-8a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-8a', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: d(32), status: 'signed', order: 1 },
        ]},
        { id: 'party-8b', name: 'Santos & Partners', type: 'external', signees: [
          { id: 'signee-8b', contactId: 'contact-4', userId: null, name: 'Maria Santos', email: 'maria@santospartners.com', role: 'Legal Director', signedAt: d(30), status: 'signed', order: 2 },
        ]},
      ],
      createdAt: d(45), updatedAt: d(30), createdBy: 'user-1',
      expiresAt: f(720), signedAt: d(30), sentAt: d(38),
      value: 200000, currency: 'USD', renewalDate: f(730), notes: 'Latin American market partnership',
      approvals: [],
    },
    {
      id: 'contract-9',
      title: 'Office Lease Agreement',
      status: 'signed',
      content: CONTRACT_HTML['contract-9'],
      folderId: 'folder-4',
      templateId: null,
      tags: [],
      parties: [
        { id: 'party-9a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-9a', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: d(90), status: 'signed', order: 1 },
        ]},
      ],
      createdAt: d(95), updatedAt: d(90), createdBy: 'user-1',
      expiresAt: f(1005), signedAt: d(90), sentAt: d(92),
      value: 510000, currency: 'USD', renewalDate: f(1005), notes: 'NYC office - 3 year lease',
      approvals: [],
    },
    {
      id: 'contract-10',
      title: 'Employee NDA - Michael Park',
      status: 'signed',
      content: CONTRACT_HTML['contract-10'],
      folderId: 'folder-7',
      templateId: 'template-2',
      tags: ['tag-3'],
      parties: [
        { id: 'party-10a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-10a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: d(180), status: 'signed', order: 1 },
        ]},
        { id: 'party-10b', name: 'Michael Park', type: 'internal', signees: [
          { id: 'signee-10b', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: d(180), status: 'signed', order: 2 },
        ]},
      ],
      createdAt: d(185), updatedAt: d(180), createdBy: 'user-1',
      expiresAt: null, signedAt: d(180), sentAt: d(182),
      value: null, currency: 'USD', renewalDate: null, notes: '',
      approvals: [],
    },
    {
      id: 'contract-11',
      title: 'Software Development Contract - Shenzhen Digital',
      status: 'rejected',
      content: CONTRACT_HTML['contract-11'],
      folderId: 'folder-2',
      templateId: null,
      tags: [],
      parties: [
        { id: 'party-11a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-11a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: null, status: 'rejected', order: 1 },
        ]},
        { id: 'party-11b', name: 'Shenzhen Digital Co.', type: 'external', signees: [
          { id: 'signee-11b', contactId: 'contact-5', userId: null, name: 'Chen Wei', email: 'chen.wei@shenzhendigital.cn', role: 'VP Engineering', signedAt: null, status: 'rejected', order: 2 },
        ]},
      ],
      createdAt: d(25), updatedAt: d(7), createdBy: 'user-2',
      expiresAt: null, signedAt: null, sentAt: d(12),
      value: 120000, currency: 'USD', renewalDate: null, notes: 'Rejected due to unacceptable IP clauses',
      approvals: [],
    },
    {
      id: 'contract-12',
      title: 'Maintenance Agreement - Old Vendor',
      status: 'expired',
      content: CONTRACT_HTML['contract-12'],
      folderId: 'folder-4',
      templateId: null,
      tags: ['tag-2'],
      parties: [
        { id: 'party-12a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-12a', contactId: null, userId: 'user-5', name: 'Lisa Thompson', email: 'lisa.t@acmecorp.com', role: 'Operations Lead', signedAt: d(380), status: 'signed', order: 1 },
        ]},
      ],
      createdAt: d(400), updatedAt: d(14), createdBy: 'user-5',
      expiresAt: d(14), signedAt: d(380), sentAt: d(395),
      value: 30000, currency: 'USD', renewalDate: null, notes: 'Not renewing - switching vendors',
      approvals: [],
    },
    {
      id: 'contract-13',
      title: 'Data Processing Agreement - Nexus Cloud',
      status: 'pending',
      content: CONTRACT_HTML['contract-13'],
      folderId: 'folder-9',
      templateId: 'template-9',
      tags: ['tag-7', 'tag-3'],
      parties: [
        { id: 'party-13a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-13a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: d(1), status: 'signed', order: 1 },
        ]},
        { id: 'party-13b', name: 'Nexus Cloud Services', type: 'external', signees: [
          { id: 'signee-13b', contactId: 'contact-9', userId: null, name: 'Hiroshi Tanaka', email: 'hiroshi@nexuscloud.jp', role: 'VP Data Privacy', signedAt: null, status: 'pending', order: 2 },
        ]},
      ],
      createdAt: d(8), updatedAt: d(1), createdBy: 'user-3',
      expiresAt: f(730), signedAt: null, sentAt: d(2),
      value: 35000, currency: 'USD', renewalDate: f(365), notes: 'GDPR compliant DPA - required for EU data',
      approvals: [
        { id: 'approval-6', userId: 'user-3', status: 'approved', requestedAt: d(6), respondedAt: d(5), comment: 'GDPR requirements met.' },
      ],
    },
    {
      id: 'contract-14',
      title: 'Reseller Agreement - Pacific Rim',
      status: 'draft',
      content: CONTRACT_HTML['contract-14'],
      folderId: 'folder-3',
      templateId: null,
      tags: ['tag-4', 'tag-8'],
      parties: [
        { id: 'party-14a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-14a', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: null, status: 'not_sent', order: 1 },
          { id: 'signee-14c', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: null, status: 'not_sent', order: 2 },
        ]},
        { id: 'party-14b', name: 'Pacific Rim Distributors', type: 'external', signees: [
          { id: 'signee-14b', contactId: 'contact-10', userId: null, name: 'Derek Chang', email: 'derek@pacificrim.com.au', role: 'Director of Sales', signedAt: null, status: 'not_sent', order: 3 },
        ]},
      ],
      createdAt: d(4), updatedAt: d(1), createdBy: 'user-2',
      expiresAt: f(730), signedAt: null, sentAt: null,
      value: 500000, currency: 'USD', renewalDate: f(365), notes: 'APAC distribution deal - needs CEO approval',
      approvals: [
        { id: 'approval-7', userId: 'user-4', status: 'pending', requestedAt: d(2), respondedAt: null, comment: null },
        { id: 'approval-8', userId: 'user-6', status: 'rejected', requestedAt: d(2), respondedAt: d(1), comment: 'Budget for co-marketing fund not confirmed. Please revise section 3.' },
      ],
    },
    {
      id: 'contract-15',
      title: 'IP Assignment - PixelForge Studios',
      status: 'pending',
      content: CONTRACT_HTML['contract-15'],
      folderId: 'folder-2',
      templateId: null,
      tags: ['tag-1', 'tag-5'],
      parties: [
        { id: 'party-15a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-15a', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: d(1), status: 'signed', order: 1 },
        ]},
        { id: 'party-15b', name: 'PixelForge Studios', type: 'external', signees: [
          { id: 'signee-15b', contactId: 'contact-11', userId: null, name: 'Amanda Fischer', email: 'amanda@pixelforge.com', role: 'CEO', signedAt: null, status: 'pending', order: 2 },
        ]},
      ],
      createdAt: d(6), updatedAt: d(1), createdBy: 'user-1',
      expiresAt: f(30), signedAt: null, sentAt: d(2),
      value: 250000, currency: 'USD', renewalDate: null, notes: 'Critical IP acquisition',
      approvals: [
        { id: 'approval-9', userId: 'user-4', status: 'approved', requestedAt: d(5), respondedAt: d(4), comment: 'Strategic acquisition. Approved.' },
        { id: 'approval-10', userId: 'user-6', status: 'approved', requestedAt: d(5), respondedAt: d(4), comment: 'Budget allocated in Q2.' },
      ],
    },
    {
      id: 'contract-16',
      title: 'SLA - Pinnacle IT Solutions',
      status: 'signed',
      content: CONTRACT_HTML['contract-16'],
      folderId: 'folder-4',
      templateId: 'template-10',
      tags: ['tag-2'],
      parties: [
        { id: 'party-16a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-16a', contactId: null, userId: 'user-5', name: 'Lisa Thompson', email: 'lisa.t@acmecorp.com', role: 'Operations Lead', signedAt: d(10), status: 'signed', order: 1 },
        ]},
        { id: 'party-16b', name: 'Pinnacle IT Solutions', type: 'external', signees: [
          { id: 'signee-16b', contactId: 'contact-12', userId: null, name: 'Nathan Brooks', email: 'nathan@pinnacleit.com', role: 'VP Operations', signedAt: d(9), status: 'signed', order: 2 },
        ]},
      ],
      createdAt: d(20), updatedAt: d(9), createdBy: 'user-5',
      expiresAt: f(345), signedAt: d(9), sentAt: d(15),
      value: 60000, currency: 'USD', renewalDate: f(345), notes: 'SLA supplementing MSA',
      approvals: [],
    },
    {
      id: 'contract-17',
      title: 'Joint Venture - Meridian Industries',
      status: 'draft',
      content: CONTRACT_HTML['contract-17'],
      folderId: 'folder-8',
      templateId: null,
      tags: ['tag-1', 'tag-4', 'tag-8'],
      parties: [
        { id: 'party-17a', name: 'Acme Corporation', type: 'internal', signees: [
          { id: 'signee-17a', contactId: null, userId: 'user-4', name: 'Michael Park', email: 'michael.park@acmecorp.com', role: 'CEO', signedAt: null, status: 'not_sent', order: 1 },
          { id: 'signee-17c', contactId: null, userId: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', role: 'Head of Legal', signedAt: null, status: 'not_sent', order: 2 },
        ]},
        { id: 'party-17b', name: 'Meridian Industries', type: 'external', signees: [
          { id: 'signee-17b', contactId: 'contact-13', userId: null, name: 'Lena Kruger', email: 'lena@meridianindustries.de', role: 'Head of Strategy', signedAt: null, status: 'not_sent', order: 3 },
        ]},
      ],
      createdAt: d(3), updatedAt: d(0.5), createdBy: 'user-1',
      expiresAt: f(365), signedAt: null, sentAt: null,
      value: 3500000, currency: 'USD', renewalDate: null, notes: 'Major JV - IoT sensor technology - board approval needed',
      approvals: [
        { id: 'approval-11', userId: 'user-4', status: 'pending', requestedAt: d(2), respondedAt: null, comment: null },
        { id: 'approval-12', userId: 'user-6', status: 'pending', requestedAt: d(2), respondedAt: null, comment: null },
        { id: 'approval-13', userId: 'user-3', status: 'approved', requestedAt: d(2), respondedAt: d(1), comment: 'Legal terms are solid. Recommend proceeding.' },
      ],
    },
  ];

  const templates = [
    { id: 'template-1', title: 'Master Service Agreement', description: 'Standard MSA for client engagements covering services, IP, and payment terms.', content: TEMPLATE_HTML['template-1'], category: 'Service Agreements', language: 'English', tags: ['tag-4'], usageCount: 12, createdAt: d(300), updatedAt: d(30), createdBy: 'user-1', isDefault: false },
    { id: 'template-2', title: 'Non-Disclosure Agreement', description: 'Standard NDA for protecting confidential information in business discussions.', content: TEMPLATE_HTML['template-2'], category: 'NDAs', language: 'English', tags: ['tag-3'], usageCount: 24, createdAt: d(280), updatedAt: d(45), createdBy: 'user-1', isDefault: true },
    { id: 'template-3', title: 'Employment Offer Letter', description: 'Template for extending employment offers with compensation and benefits details.', content: TEMPLATE_HTML['template-3'], category: 'Employment', language: 'English', tags: [], usageCount: 8, createdAt: d(250), updatedAt: d(60), createdBy: 'user-3', isDefault: false },
    { id: 'template-4', title: 'Vendor Agreement', description: 'Standard vendor agreement for procurement of goods and services.', content: TEMPLATE_HTML['template-4'], category: 'Procurement', language: 'English', tags: [], usageCount: 6, createdAt: d(220), updatedAt: d(90), createdBy: 'user-2', isDefault: false },
    { id: 'template-5', title: 'Consulting Agreement', description: 'Agreement for engaging independent consultants on a project basis.', content: TEMPLATE_HTML['template-5'], category: 'Service Agreements', language: 'English', tags: [], usageCount: 15, createdAt: d(200), updatedAt: d(120), createdBy: 'user-1', isDefault: false },
    { id: 'template-6', title: 'Software License Agreement', description: 'License agreement for SaaS and software products with usage restrictions.', content: TEMPLATE_HTML['template-6'], category: 'Licensing', language: 'English', tags: [], usageCount: 9, createdAt: d(180), updatedAt: d(150), createdBy: 'user-3', isDefault: false },
    { id: 'template-7', title: 'Partnership Agreement', description: 'Strategic partnership agreement with revenue sharing provisions.', content: TEMPLATE_HTML['template-7'], category: 'Partnerships', language: 'English', tags: [], usageCount: 3, createdAt: d(150), updatedAt: d(150), createdBy: 'user-1', isDefault: false },
    { id: 'template-8', title: 'Lease Agreement', description: 'Commercial lease agreement for office and retail spaces.', content: TEMPLATE_HTML['template-8'], category: 'Real Estate', language: 'English', tags: [], usageCount: 2, createdAt: d(120), updatedAt: d(120), createdBy: 'user-5', isDefault: false },
    { id: 'template-9', title: 'Data Processing Agreement', description: 'GDPR-compliant DPA for data controllers and processors.', content: TEMPLATE_HTML['template-9'], category: 'NDAs', language: 'English', tags: ['tag-7'], usageCount: 5, createdAt: d(60), updatedAt: d(30), createdBy: 'user-3', isDefault: false },
    { id: 'template-10', title: 'Service Level Agreement', description: 'SLA template with uptime guarantees, response times, and credit schedules.', content: TEMPLATE_HTML['template-10'], category: 'Service Agreements', language: 'English', tags: [], usageCount: 4, createdAt: d(45), updatedAt: d(20), createdBy: 'user-5', isDefault: false },
  ];

  const tasks = [
    { id: 'task-1', title: 'Review MSA terms for Tech Ventures', description: 'Check indemnification and IP clauses', type: 'review', status: 'pending', contractId: 'contract-4', assigneeId: 'user-1', createdBy: 'user-3', dueDate: f(3), completedAt: null, createdAt: d(5) },
    { id: 'task-2', title: 'Approve employment offer', description: 'CEO signature required on offer letter', type: 'approval', status: 'pending', contractId: 'contract-2', assigneeId: 'user-4', createdBy: 'user-1', dueDate: f(1), completedAt: null, createdAt: d(2) },
    { id: 'task-3', title: 'Renew Emerald Group support contract', description: 'Negotiate renewal terms and pricing', type: 'renewal', status: 'pending', contractId: 'contract-7', assigneeId: 'user-1', createdBy: 'user-2', dueDate: f(14), completedAt: null, createdAt: d(7) },
    { id: 'task-4', title: 'Legal review of NDA template', description: 'Annual template review and update', type: 'review', status: 'completed', contractId: null, assigneeId: 'user-3', createdBy: 'user-1', dueDate: d(3), completedAt: d(7), createdAt: d(14) },
    { id: 'task-5', title: 'Approve vendor agreement changes', description: 'Review proposed changes to payment terms', type: 'approval', status: 'pending', contractId: 'contract-6', assigneeId: 'user-1', createdBy: 'user-5', dueDate: d(2), completedAt: null, createdAt: d(10) },
    { id: 'task-6', title: 'Review partnership terms', description: 'Initial review of Santos partnership draft', type: 'review', status: 'completed', contractId: 'contract-8', assigneeId: 'user-1', createdBy: 'user-1', dueDate: d(10), completedAt: d(3), createdAt: d(15) },
    { id: 'task-7', title: 'Review DPA for GDPR compliance', description: 'Ensure all GDPR requirements are met in Nexus Cloud DPA', type: 'review', status: 'pending', contractId: 'contract-13', assigneeId: 'user-3', createdBy: 'user-1', dueDate: f(5), completedAt: null, createdAt: d(4) },
    { id: 'task-8', title: 'Approve JV budget allocation', description: 'Finance review of $3.5M JV commitment', type: 'approval', status: 'pending', contractId: 'contract-17', assigneeId: 'user-6', createdBy: 'user-1', dueDate: f(7), completedAt: null, createdAt: d(2) },
  ];

  const activities = [
    { id: 'activity-1', contractId: 'contract-1', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(5), metadata: null },
    { id: 'activity-2', contractId: 'contract-1', type: 'edited', userId: 'user-1', contactId: null, description: 'Sarah Chen edited the contract content', timestamp: d(2), metadata: null },
    { id: 'activity-3', contractId: 'contract-4', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(10), metadata: null },
    { id: 'activity-4', contractId: 'contract-4', type: 'edited', userId: 'user-2', contactId: null, description: 'James Wilson edited the contract', timestamp: d(8), metadata: null },
    { id: 'activity-5', contractId: 'contract-4', type: 'sent', userId: 'user-1', contactId: null, description: 'Sarah Chen sent contract for signature', timestamp: d(3), metadata: null },
    { id: 'activity-6', contractId: 'contract-4', type: 'signed', userId: 'user-1', contactId: null, description: 'Sarah Chen signed the contract', timestamp: d(2), metadata: null },
    { id: 'activity-7', contractId: 'contract-4', type: 'viewed', userId: null, contactId: 'contact-1', description: 'Robert Martinez viewed the contract', timestamp: d(0.08), metadata: null },
    { id: 'activity-8', contractId: 'contract-5', type: 'created', userId: 'user-3', contactId: null, description: 'Emily Rodriguez created this contract', timestamp: d(2), metadata: null },
    { id: 'activity-9', contractId: 'contract-5', type: 'sent', userId: 'user-3', contactId: null, description: 'Emily Rodriguez sent contract for signature', timestamp: d(1), metadata: null },
    { id: 'activity-10', contractId: 'contract-6', type: 'created', userId: 'user-2', contactId: null, description: 'James Wilson created this contract', timestamp: d(15), metadata: null },
    { id: 'activity-11', contractId: 'contract-6', type: 'sent', userId: 'user-2', contactId: null, description: 'James Wilson sent contract for signature', timestamp: d(5), metadata: null },
    { id: 'activity-12', contractId: 'contract-6', type: 'signed', userId: 'user-5', contactId: null, description: 'Lisa Thompson signed the contract', timestamp: d(4), metadata: null },
    { id: 'activity-13', contractId: 'contract-7', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(30), metadata: null },
    { id: 'activity-14', contractId: 'contract-7', type: 'signed', userId: 'user-1', contactId: null, description: 'Sarah Chen signed the contract', timestamp: d(15), metadata: null },
    { id: 'activity-15', contractId: 'contract-7', type: 'signed', userId: null, contactId: 'contact-8', description: "Karen O'Brien signed the contract", timestamp: d(14), metadata: null },
    { id: 'activity-16', contractId: 'contract-8', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(45), metadata: null },
    { id: 'activity-17', contractId: 'contract-8', type: 'signed', userId: 'user-4', contactId: null, description: 'Michael Park signed the contract', timestamp: d(32), metadata: null },
    { id: 'activity-18', contractId: 'contract-8', type: 'signed', userId: null, contactId: 'contact-4', description: 'Maria Santos signed the contract', timestamp: d(30), metadata: null },
    { id: 'activity-19', contractId: 'contract-11', type: 'created', userId: 'user-2', contactId: null, description: 'James Wilson created this contract', timestamp: d(25), metadata: null },
    { id: 'activity-20', contractId: 'contract-11', type: 'rejected', userId: null, contactId: 'contact-5', description: 'Chen Wei rejected the contract - Terms not acceptable', timestamp: d(7), metadata: { reason: 'Terms not acceptable' } },
    { id: 'activity-21', contractId: 'contract-12', type: 'created', userId: 'user-5', contactId: null, description: 'Lisa Thompson created this contract', timestamp: d(400), metadata: null },
    { id: 'activity-22', contractId: 'contract-12', type: 'status_changed', userId: null, contactId: null, description: 'Contract expired', timestamp: d(14), metadata: { oldStatus: 'signed', newStatus: 'expired' } },
    { id: 'activity-23', contractId: 'contract-2', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(3), metadata: null },
    { id: 'activity-24', contractId: 'contract-3', type: 'created', userId: 'user-2', contactId: null, description: 'James Wilson created this contract', timestamp: d(7), metadata: null },
    { id: 'activity-25', contractId: 'contract-9', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(95), metadata: null },
    { id: 'activity-26', contractId: 'contract-9', type: 'signed', userId: 'user-4', contactId: null, description: 'Michael Park signed the lease', timestamp: d(90), metadata: null },
    { id: 'activity-27', contractId: 'contract-10', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this NDA', timestamp: d(185), metadata: null },
    { id: 'activity-28', contractId: 'contract-13', type: 'created', userId: 'user-3', contactId: null, description: 'Emily Rodriguez created this DPA', timestamp: d(8), metadata: null },
    { id: 'activity-29', contractId: 'contract-13', type: 'approval_requested', userId: 'user-3', contactId: null, description: 'Emily Rodriguez requested approval', timestamp: d(6), metadata: null },
    { id: 'activity-30', contractId: 'contract-13', type: 'sent', userId: 'user-3', contactId: null, description: 'Emily Rodriguez sent for signature', timestamp: d(2), metadata: null },
    { id: 'activity-31', contractId: 'contract-14', type: 'created', userId: 'user-2', contactId: null, description: 'James Wilson created this contract', timestamp: d(4), metadata: null },
    { id: 'activity-32', contractId: 'contract-14', type: 'approval_rejected', userId: 'user-6', contactId: null, description: 'David Kim rejected approval - budget concerns', timestamp: d(1), metadata: null },
    { id: 'activity-33', contractId: 'contract-15', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this contract', timestamp: d(6), metadata: null },
    { id: 'activity-34', contractId: 'contract-15', type: 'sent', userId: 'user-1', contactId: null, description: 'Sarah Chen sent for signature', timestamp: d(2), metadata: null },
    { id: 'activity-35', contractId: 'contract-15', type: 'signed', userId: 'user-4', contactId: null, description: 'Michael Park signed the contract', timestamp: d(1), metadata: null },
    { id: 'activity-36', contractId: 'contract-16', type: 'created', userId: 'user-5', contactId: null, description: 'Lisa Thompson created this SLA', timestamp: d(20), metadata: null },
    { id: 'activity-37', contractId: 'contract-16', type: 'signed', userId: 'user-5', contactId: null, description: 'Lisa Thompson signed the SLA', timestamp: d(10), metadata: null },
    { id: 'activity-38', contractId: 'contract-16', type: 'signed', userId: null, contactId: 'contact-12', description: 'Nathan Brooks signed the SLA', timestamp: d(9), metadata: null },
    { id: 'activity-39', contractId: 'contract-17', type: 'created', userId: 'user-1', contactId: null, description: 'Sarah Chen created this JV agreement', timestamp: d(3), metadata: null },
    { id: 'activity-40', contractId: 'contract-17', type: 'approval_requested', userId: 'user-1', contactId: null, description: 'Sarah Chen requested approval from CEO and Finance', timestamp: d(2), metadata: null },
  ];

  const notifications = [
    { id: 'notif-1', type: 'contract_viewed', title: 'Robert Martinez viewed your contract', description: 'Tech Ventures MSA has been viewed by Robert Martinez', contractId: 'contract-4', read: false, createdAt: d(0.08) },
    { id: 'notif-2', type: 'signature_received', title: 'Michael Park signed IP Assignment', description: 'PixelForge IP Assignment has been signed by CEO', contractId: 'contract-15', read: false, createdAt: d(1) },
    { id: 'notif-3', type: 'task_assigned', title: 'New task: Review DPA for GDPR compliance', description: 'You need to review the Nexus Cloud DPA', contractId: 'contract-13', read: false, createdAt: d(1) },
    { id: 'notif-4', type: 'contract_expired', title: 'Contract expired: Maintenance Agreement', description: 'Maintenance Agreement - Old Vendor has expired', contractId: 'contract-12', read: true, createdAt: d(2) },
    { id: 'notif-5', type: 'reminder', title: 'Approval needed: JV - Meridian Industries', description: 'Joint Venture agreement is waiting for CEO and Finance approval', contractId: 'contract-17', read: false, createdAt: d(2) },
    { id: 'notif-6', type: 'comment', title: 'David Kim rejected Reseller Agreement approval', description: 'Budget for co-marketing fund not confirmed', contractId: 'contract-14', read: false, createdAt: d(1) },
    { id: 'notif-7', type: 'reminder', title: 'Emerald Group contract renewal in 2 weeks', description: 'The Emerald Group support contract is up for renewal', contractId: 'contract-7', read: true, createdAt: d(3) },
    { id: 'notif-8', type: 'reminder', title: 'Signing reminder sent for NDA', description: 'Reminder sent to parties on Nordic Solutions NDA', contractId: 'contract-5', read: true, createdAt: d(7) },
  ];

  const comments = [
    { id: 'comment-1', contractId: 'contract-4', userId: 'user-3', content: 'I think we should revise the payment terms in section 2.1 - Net 45 days is too long for a contract of this size.', createdAt: d(6), updatedAt: null, resolved: false },
    { id: 'comment-2', contractId: 'contract-4', userId: 'user-1', content: 'Agreed. I will negotiate to Net 30. Also check the indemnification cap in section 4.', createdAt: d(5), updatedAt: null, resolved: false },
    { id: 'comment-3', contractId: 'contract-4', userId: 'user-2', content: 'The IP ownership clause looks standard. Robert mentioned they may want a carve-out for pre-existing tools.', createdAt: d(4), updatedAt: null, resolved: false },
    { id: 'comment-4', contractId: 'contract-7', userId: 'user-1', content: 'This contract auto-renews in 335 days. Start renewal negotiations at least 60 days before.', createdAt: d(14), updatedAt: null, resolved: true },
    { id: 'comment-5', contractId: 'contract-11', userId: 'user-2', content: 'Chen Wei specifically objected to the unlimited indemnification clause.', createdAt: d(8), updatedAt: null, resolved: false },
    { id: 'comment-6', contractId: 'contract-1', userId: 'user-1', content: 'Waiting on legal review from Emily before sending to Raj.', createdAt: d(2), updatedAt: null, resolved: false },
    { id: 'comment-7', contractId: 'contract-6', userId: 'user-5', content: 'Tom Bradley confirmed delivery terms. Waiting on signature.', createdAt: d(4), updatedAt: null, resolved: true },
    { id: 'comment-8', contractId: 'contract-3', userId: 'user-2', content: 'Sophie Laurent confirmed she is available to sign this week.', createdAt: d(5), updatedAt: null, resolved: false },
    { id: 'comment-9', contractId: 'contract-17', userId: 'user-3', content: 'Legal terms are solid. The governance structure with 4 board members gives both parties equal control.', createdAt: d(1), updatedAt: null, resolved: false },
    { id: 'comment-10', contractId: 'contract-14', userId: 'user-6', content: 'The co-marketing fund at 5% is aggressive. Can we negotiate to 3% for Year 1 with escalation to 5% in Year 2?', createdAt: d(1), updatedAt: null, resolved: false },
    { id: 'comment-11', contractId: 'contract-13', userId: 'user-3', content: 'DPA meets all GDPR Article 28 requirements. Sub-processor clause is well drafted.', createdAt: d(5), updatedAt: null, resolved: false },
  ];

  const savedViews = [
    { id: 'view-1', name: 'All Documents', filters: {}, sortBy: 'updatedAt', sortOrder: 'desc', columns: ['title', 'counterparty', 'updatedAt', 'signees', 'status'], isDefault: true, createdBy: 'user-1' },
    { id: 'view-2', name: 'My Drafts', filters: { status: ['draft'], createdBy: 'user-1' }, sortBy: 'updatedAt', sortOrder: 'desc', columns: ['title', 'updatedAt', 'tags', 'status'], isDefault: false, createdBy: 'user-1' },
    { id: 'view-3', name: 'Pending Signatures', filters: { status: ['pending'] }, sortBy: 'sentAt', sortOrder: 'asc', columns: ['title', 'counterparty', 'sentAt', 'signees', 'status'], isDefault: false, createdBy: 'user-1' },
    { id: 'view-4', name: 'Expiring Soon', filters: { expiringDays: 30 }, sortBy: 'expiresAt', sortOrder: 'asc', columns: ['title', 'expiresAt', 'status'], isDefault: false, createdBy: 'user-1' },
    { id: 'view-5', name: 'High Value', filters: { minValue: 100000 }, sortBy: 'value', sortOrder: 'desc', columns: ['title', 'value', 'status', 'signees'], isDefault: false, createdBy: 'user-1' },
  ];

  const settings = {
    companyName: 'Acme Corporation',
    defaultCurrency: 'USD',
    defaultLanguage: 'English',
    emailNotifications: true,
    inAppNotifications: true,
    signingReminders: true,
    expirationAlerts: true,
    reminderDays: [1, 3, 7],
    timezone: 'America/New_York',
  };

  return {
    currentUser,
    users,
    contacts,
    folders,
    tags,
    contracts,
    templates,
    tasks,
    activities,
    notifications,
    comments,
    savedViews,
    settings,
  };
}

export function loadState(sid = null) {
  const key = storageKey(sid);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

let _saveDebounceTimer = null;

export function saveState(state, sid = null) {
  const key = storageKey(sid);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
  // Debounced server sync
  if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    const effectiveSid = sid || 'default';
    fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  }, 300);
}

export function initializeData(sid = null, customState = null) {
  const initKey = initialKey(sid);
  const stateKey = storageKey(sid);

  if (customState) {
    localStorage.setItem(initKey, JSON.stringify(customState));
    localStorage.setItem(stateKey, JSON.stringify(customState));
    // Sync initial state to server
    const effectiveSid = sid || 'default';
    fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: customState }),
    }).catch(() => {});
    return customState;
  }

  const existing = localStorage.getItem(stateKey);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (!localStorage.getItem(initKey)) {
        localStorage.setItem(initKey, existing);
      }
      return parsed;
    } catch (e) {
      // Fall through to defaults
    }
  }

  const defaults = createInitialData();
  localStorage.setItem(initKey, JSON.stringify(defaults));
  localStorage.setItem(stateKey, JSON.stringify(defaults));
  // Sync initial state to server
  const effectiveSid = sid || 'default';
  fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', state: defaults }),
  }).catch(() => {});
  return defaults;
}
