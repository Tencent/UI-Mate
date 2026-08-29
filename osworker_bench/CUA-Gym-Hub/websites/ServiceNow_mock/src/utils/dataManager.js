/* src/utils/dataManager.js — XerviceNow Mock State Management */

const REF_DATE = '2026-03-01T09:00:00.000Z';

function d(daysOffset, hoursOffset = 0) {
  const base = new Date(REF_DATE);
  base.setDate(base.getDate() + daysOffset);
  base.setHours(base.getHours() + hoursOffset);
  return base.toISOString();
}

export function createInitialData() {
  const users = [
    { sys_id: 'u1', user_name: 'admin', first_name: 'System', last_name: 'Administrator', email: 'admin@example.com', title: 'System Administrator', department: 'IT', phone: '555-0100', avatar: 'SA', role: 'admin', active: true, vip: false },
    { sys_id: 'u2', user_name: 'beth.anglin', first_name: 'Beth', last_name: 'Anglin', email: 'beth.anglin@example.com', title: 'Service Desk Agent', department: 'IT Service Desk', phone: '555-0201', avatar: 'BA', role: 'itil', active: true, vip: false },
    { sys_id: 'u3', user_name: 'david.loo', first_name: 'David', last_name: 'Loo', email: 'david.loo@example.com', title: 'Service Desk Agent', department: 'IT Service Desk', phone: '555-0202', avatar: 'DL', role: 'itil', active: true, vip: false },
    { sys_id: 'u4', user_name: 'fred.luddy', first_name: 'Fred', last_name: 'Luddy', email: 'fred.luddy@example.com', title: 'Network Engineer', department: 'IT Network', phone: '555-0301', avatar: 'FL', role: 'itil', active: true, vip: false },
    { sys_id: 'u5', user_name: 'luke.wilson', first_name: 'Luke', last_name: 'Wilson', email: 'luke.wilson@example.com', title: 'Database Administrator', department: 'IT Database', phone: '555-0401', avatar: 'LW', role: 'itil', active: true, vip: false },
    { sys_id: 'u6', user_name: 'bud.richman', first_name: 'Bud', last_name: 'Richman', email: 'bud.richman@example.com', title: 'Sales Manager', department: 'Sales', phone: '555-0501', avatar: 'BR', role: 'user', active: true, vip: false },
    { sys_id: 'u7', user_name: 'don.goodliffe', first_name: 'Don', last_name: 'Goodliffe', email: 'don.goodliffe@example.com', title: 'HR Coordinator', department: 'Human Resources', phone: '555-0601', avatar: 'DG', role: 'user', active: true, vip: false },
    { sys_id: 'u8', user_name: 'abel.tuter', first_name: 'Abel', last_name: 'Tuter', email: 'abel.tuter@example.com', title: 'Finance Analyst', department: 'Finance', phone: '555-0701', avatar: 'AT', role: 'user', active: true, vip: false },
  ];

  const groups = [
    { sys_id: 'g1', name: 'Service Desk', description: 'Front-line support', manager: 'u2', members: ['u2', 'u3'], type: 'itil', active: true },
    { sys_id: 'g2', name: 'Network', description: 'Network operations and engineering', manager: 'u4', members: ['u4'], type: 'itil', active: true },
    { sys_id: 'g3', name: 'Database', description: 'Database administration and support', manager: 'u5', members: ['u5'], type: 'itil', active: true },
    { sys_id: 'g4', name: 'Hardware', description: 'Hardware provisioning and repair', manager: 'u4', members: ['u4', 'u5'], type: 'itil', active: true },
    { sys_id: 'g5', name: 'Software', description: 'Software licensing and deployment', manager: 'u2', members: ['u2', 'u3', 'u5'], type: 'itil', active: true },
  ];

  const incidents = [
    { sys_id: 'inc1', number: 'INC0010001', caller_id: 'u6', category: 'Network', subcategory: 'VPN', contact_type: 'Phone', short_description: 'Unable to connect to VPN', description: 'User reports VPN client shows error code 619 when attempting to connect from home office. Was working yesterday. No changes made to laptop configuration.', state: 2, impact: 1, urgency: 2, priority: 2, assignment_group: 'g2', assigned_to: 'u4', opened_at: d(-1, -18.5), opened_by: 'u2', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-1, -15), sla_due: d(0, 5.5), cmdb_ci: 'ci1', knowledge: false },
    { sys_id: 'inc2', number: 'INC0010002', caller_id: 'u7', category: 'Software', subcategory: 'Email', contact_type: 'Email', short_description: 'Email not syncing on mobile', description: 'Outlook app on iPhone not syncing new emails. Last sync was 2 days ago. Other apps work fine on same device.', state: 1, impact: 2, urgency: 2, priority: 3, assignment_group: 'g1', assigned_to: null, opened_at: d(-0.5), opened_by: 'u3', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-0.5), sla_due: d(1, 9), cmdb_ci: 'ci2', knowledge: false },
    { sys_id: 'inc3', number: 'INC0010003', caller_id: 'u8', category: 'Software', subcategory: 'Application', contact_type: 'Phone', short_description: 'SAP application crashing', description: 'SAP GUI crashes immediately upon login. Error message: "Memory allocation failed". Happens on all transactions. Tried restarting laptop - same issue.', state: 2, impact: 1, urgency: 1, priority: 1, assignment_group: 'g5', assigned_to: 'u3', opened_at: d(-2, -6), opened_by: 'u2', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-1, -3), sla_due: d(0, -6), cmdb_ci: 'ci4', knowledge: false },
    { sys_id: 'inc4', number: 'INC0010004', caller_id: 'u6', category: 'Hardware', subcategory: 'Printer', contact_type: 'Self-service', short_description: 'Printer not responding on 3rd floor', description: 'HP LaserJet on 3rd floor shows offline status. Power cycled the printer, still not connecting. Need for urgent print jobs.', state: 3, impact: 3, urgency: 2, priority: 4, assignment_group: 'g4', assigned_to: 'u2', opened_at: d(-3, -4), opened_by: 'u6', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-2, -1), sla_due: d(0, 20), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc5', number: 'INC0010005', caller_id: 'u7', category: 'Software', subcategory: 'Application', contact_type: 'Phone', short_description: 'Password reset request', description: 'User locked out of Active Directory account after too many failed attempts. Needs password reset.', state: 6, impact: 3, urgency: 2, priority: 4, assignment_group: 'g1', assigned_to: 'u2', opened_at: d(-4, -2), opened_by: 'u2', resolved_at: d(-4, -1), resolved_by: 'u2', closed_at: null, closed_by: null, close_code: 'Solved (Permanently)', close_notes: 'Reset user AD password and unlocked account. Advised user on password policy.', updated_at: d(-4, -1), sla_due: d(-3, 6), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc6', number: 'INC0010006', caller_id: 'u8', category: 'Network', subcategory: 'Connectivity', contact_type: 'Phone', short_description: 'Cannot access shared drive', description: 'User unable to map network drive \\\\fileserver\\shared. Getting access denied error. Was working last week before office move.', state: 2, impact: 2, urgency: 2, priority: 3, assignment_group: 'g1', assigned_to: 'u3', opened_at: d(-1, -10), opened_by: 'u3', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-1, -5), sla_due: d(0, 14), cmdb_ci: 'ci7', knowledge: false },
    { sys_id: 'inc7', number: 'INC0010007', caller_id: 'u6', category: 'Hardware', subcategory: 'Monitor', contact_type: 'Walk-in', short_description: 'Monitor flickering intermittently', description: 'Dell 27" monitor flickers every few minutes. Sometimes goes black for 1-2 seconds. Using DisplayPort connection.', state: 1, impact: 3, urgency: 3, priority: 4, assignment_group: 'g4', assigned_to: null, opened_at: d(-0.25), opened_by: 'u2', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-0.25), sla_due: d(2, 9), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc8', number: 'INC0010008', caller_id: 'u7', category: 'Network', subcategory: 'Wireless', contact_type: 'Phone', short_description: 'Slow internet connection in Building A', description: 'Multiple users in Building A reporting very slow internet speeds. Downloads at 1-2 Mbps instead of normal 100 Mbps. Affects all devices.', state: 2, impact: 1, urgency: 2, priority: 2, assignment_group: 'g2', assigned_to: 'u4', opened_at: d(-1, -8), opened_by: 'u2', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-0.5, -2), sla_due: d(0, 1), cmdb_ci: 'ci5', knowledge: false },
    { sys_id: 'inc9', number: 'INC0010009', caller_id: 'u8', category: 'Software', subcategory: 'Application', contact_type: 'Email', short_description: 'Software license expired - Adobe CC', description: 'Adobe Creative Cloud subscription shows expired. User needs access for marketing materials project due this week.', state: 6, impact: 2, urgency: 2, priority: 3, assignment_group: 'g5', assigned_to: 'u2', opened_at: d(-5, -4), opened_by: 'u3', resolved_at: d(-4, 2), resolved_by: 'u2', closed_at: null, closed_by: null, close_code: 'Solved (Permanently)', close_notes: 'Renewed Adobe CC license through volume agreement. License activated on user workstation.', updated_at: d(-4, 2), sla_due: d(-3, -4), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc10', number: 'INC0010010', caller_id: 'u6', category: 'Hardware', subcategory: 'Keyboard', contact_type: 'Self-service', short_description: 'Laptop keyboard not working', description: 'Several keys on Dell Latitude laptop not responding. Letters Q, W, and E do not register. Spill incident last week.', state: 7, impact: 2, urgency: 2, priority: 3, assignment_group: 'g4', assigned_to: 'u3', opened_at: d(-8, -6), opened_by: 'u6', resolved_at: d(-6, 2), resolved_by: 'u3', closed_at: d(-5, 4), closed_by: 'u3', close_code: 'Solved (Permanently)', close_notes: 'Replaced laptop keyboard assembly. All keys tested and functioning. User confirmed resolution.', updated_at: d(-5, 4), sla_due: d(-6, -6), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc11', number: 'INC0010011', caller_id: 'u7', category: 'Hardware', subcategory: 'Computer', contact_type: 'Phone', short_description: 'VoIP phone no dial tone', description: 'Cisco desk phone showing "Registering" message. No dial tone. Network cable tested and working with laptop.', state: 1, impact: 2, urgency: 2, priority: 3, assignment_group: 'g2', assigned_to: null, opened_at: d(-0.125), opened_by: 'u2', resolved_at: null, resolved_by: null, closed_at: null, closed_by: null, close_code: '', close_notes: '', updated_at: d(-0.125), sla_due: d(1, 8.875), cmdb_ci: null, knowledge: false },
    { sys_id: 'inc12', number: 'INC0010012', caller_id: 'u2', category: 'Database', subcategory: 'Oracle', contact_type: 'Self-service', short_description: 'Database backup failure alert', description: 'Automated backup job for Oracle production database failed at 02:00 AM. Error: ORA-19502 write error on backup piece. Disk space issue suspected.', state: 7, impact: 1, urgency: 1, priority: 2, assignment_group: 'g3', assigned_to: 'u5', opened_at: d(-7, -31), opened_by: 'u2', resolved_at: d(-6, -25), resolved_by: 'u5', closed_at: d(-5, -19), closed_by: 'u5', close_code: 'Solved (Permanently)', close_notes: 'Cleared archive logs consuming disk space. Increased backup disk allocation. Backup job re-run successfully. Added monitoring alert for disk usage.', updated_at: d(-5, -19), sla_due: d(-6, -27), cmdb_ci: 'ci3', knowledge: false },
    { sys_id: 'inc13', number: 'INC0010013', caller_id: 'u6', category: 'Hardware', subcategory: 'Monitor', contact_type: 'Self-service', short_description: 'Request for additional monitor', description: 'Requesting a second monitor for improved productivity. Manager has approved.', state: 8, impact: 3, urgency: 3, priority: 5, assignment_group: 'g4', assigned_to: null, opened_at: d(-10, -6), opened_by: 'u6', resolved_at: null, resolved_by: null, closed_at: d(-9, -4), closed_by: 'u2', close_code: 'Closed/Resolved by Caller', close_notes: 'Redirected to Service Catalog for hardware ordering. User submitted catalog request instead.', updated_at: d(-9, -4), sla_due: null, cmdb_ci: null, knowledge: false },
    { sys_id: 'inc14', number: 'INC0010014', caller_id: 'u8', category: 'Network', subcategory: 'Wireless', contact_type: 'Phone', short_description: 'Wireless drops in conference room B', description: 'WiFi signal drops frequently in conference room B during video calls. Signal strength shows 1-2 bars. Other rooms are fine.', state: 6, impact: 2, urgency: 2, priority: 3, assignment_group: 'g2', assigned_to: 'u4', opened_at: d(-6, -4), opened_by: 'u2', resolved_at: d(-4, -2), resolved_by: 'u4', closed_at: null, closed_by: null, close_code: 'Solved (Workaround)', close_notes: 'Repositioned wireless access point in adjacent hallway. Signal now shows 4-5 bars in conference room B. Permanent fix: new AP installation scheduled via change request.', updated_at: d(-4, -2), sla_due: d(-4, -4), cmdb_ci: 'ci5', knowledge: false },
    { sys_id: 'inc15', number: 'INC0010015', caller_id: 'u7', category: 'Inquiry / Help', subcategory: '', contact_type: 'Phone', short_description: 'New employee onboarding - IT setup', description: 'New hire starting Monday in Marketing department. Needs standard laptop, email account, VPN access, and Office 365 license. Manager: Jane Smith.', state: 7, impact: 3, urgency: 2, priority: 4, assignment_group: 'g1', assigned_to: 'u2', opened_at: d(-12, -6), opened_by: 'u2', resolved_at: d(-10, 2), resolved_by: 'u2', closed_at: d(-9, 4), closed_by: 'u2', close_code: 'Solved (Permanently)', close_notes: 'All IT equipment provisioned: Dell Latitude laptop, Outlook email configured, VPN credentials provided, Office 365 license assigned. User confirmed everything working on first day.', updated_at: d(-9, 4), sla_due: d(-10, -6), cmdb_ci: null, knowledge: false },
  ];

  const problems = [
    { sys_id: 'prb1', number: 'PRB0040001', short_description: 'Recurring VPN disconnections', description: 'Multiple users experiencing intermittent VPN disconnections during peak hours (9 AM - 11 AM). Affects remote workers connecting via Cisco AnyConnect. Pattern started after last firewall firmware update.', state: 3, priority: 2, impact: 1, urgency: 2, assignment_group: 'g2', assigned_to: 'u4', opened_at: d(-9, 1), opened_by: 'u2', resolved_at: null, closed_at: null, cause_notes: 'Firewall firmware update v4.2.1 introduced a session timeout bug affecting SSL VPN connections under high load.', fix_notes: '', known_error: true, related_incidents: ['inc1', 'inc8'], updated_at: d(-2, -3), cmdb_ci: 'ci1' },
    { sys_id: 'prb2', number: 'PRB0040002', short_description: 'Email sync failures on mobile devices', description: 'Growing number of incidents related to email sync failures on iOS and Android devices. ActiveSync protocol appears to be intermittently failing.', state: 2, priority: 3, impact: 2, urgency: 2, assignment_group: 'g1', assigned_to: 'u3', opened_at: d(-5, -2), opened_by: 'u3', resolved_at: null, closed_at: null, cause_notes: '', fix_notes: '', known_error: false, related_incidents: ['inc2'], updated_at: d(-3, 1), cmdb_ci: 'ci2' },
    { sys_id: 'prb3', number: 'PRB0040003', short_description: 'Database backup job intermittent failures', description: 'Oracle backup jobs failing intermittently with ORA-19502 errors. Appears related to archive log accumulation and disk space management.', state: 5, priority: 2, impact: 1, urgency: 2, assignment_group: 'g3', assigned_to: 'u5', opened_at: d(-12, -6), opened_by: 'u5', resolved_at: d(-5, 2), closed_at: null, cause_notes: 'Archive logs not being purged after backup. Accumulation eventually fills backup disk partition.', fix_notes: 'Implemented automated archive log purge script running after each backup. Added disk space monitoring with threshold alerts at 80% and 90%.', known_error: false, related_incidents: ['inc12'], updated_at: d(-5, 2), cmdb_ci: 'ci3' },
    { sys_id: 'prb4', number: 'PRB0040004', short_description: 'Wireless coverage gaps in Building A', description: 'Multiple incidents reporting poor WiFi in Building A, especially in conference rooms. Coverage survey shows dead zones on 2nd and 3rd floors.', state: 1, priority: 3, impact: 2, urgency: 2, assignment_group: 'g2', assigned_to: null, opened_at: d(-3, -1), opened_by: 'u2', resolved_at: null, closed_at: null, cause_notes: '', fix_notes: '', known_error: false, related_incidents: ['inc8', 'inc14'], updated_at: d(-3, -1), cmdb_ci: 'ci5' },
  ];

  const changeRequests = [
    { sys_id: 'chg1', number: 'CHG0030001', type: 'Normal', short_description: 'Upgrade VPN concentrator firmware', description: 'Upgrade Cisco ASA firmware from v4.2.1 to v4.2.3 to resolve VPN session timeout bug. Requires maintenance window with VPN downtime of approximately 30 minutes.', state: -2, priority: 3, impact: 2, risk: 'Moderate', category: 'Network', assignment_group: 'g2', assigned_to: 'u4', requested_by: 'u4', opened_at: d(-5, 2), opened_by: 'u4', start_date: d(2, 22), end_date: d(2, 23), close_code: '', close_notes: '', updated_at: d(-2, 4), cmdb_ci: 'ci1', approval: 'Approved', conflict_status: 'No Conflicts' },
    { sys_id: 'chg2', number: 'CHG0030002', type: 'Normal', short_description: 'Deploy new email server', description: 'Deploy Exchange Server 2024 to replace aging Exchange 2019 infrastructure. Includes data migration, DNS updates, and client reconfiguration.', state: -4, priority: 2, impact: 1, risk: 'High', category: 'Software', assignment_group: 'g1', assigned_to: 'u3', requested_by: 'u3', opened_at: d(-7, 2), opened_by: 'u3', start_date: d(14, 22), end_date: d(15, 6), close_code: '', close_notes: '', updated_at: d(-4, 1), cmdb_ci: 'ci2', approval: 'Requested', conflict_status: 'Not Run' },
    { sys_id: 'chg3', number: 'CHG0030003', type: 'Standard', short_description: 'Patch Windows servers - March cycle', description: 'Apply March 2026 Windows security patches to all production servers. Standard monthly patching procedure following approved template.', state: -2, priority: 4, impact: 2, risk: 'Low', category: 'Software', assignment_group: 'g5', assigned_to: 'u5', requested_by: 'u5', opened_at: d(-3, 1), opened_by: 'u5', start_date: d(5, 22), end_date: d(6, 4), close_code: '', close_notes: '', updated_at: d(-2, 3), cmdb_ci: null, approval: 'Approved', conflict_status: 'No Conflicts' },
    { sys_id: 'chg4', number: 'CHG0030004', type: 'Emergency', short_description: 'Emergency DB failover configuration', description: 'Configure automatic failover for production Oracle database after near-miss incident. Current single-point-of-failure poses critical risk to business operations.', state: -1, priority: 1, impact: 1, risk: 'High', category: 'Database', assignment_group: 'g3', assigned_to: 'u5', requested_by: 'u5', opened_at: d(-1, -4), opened_by: 'u5', start_date: d(0, -4), end_date: d(0, 4), close_code: '', close_notes: '', updated_at: d(-0.5), cmdb_ci: 'ci3', approval: 'Approved', conflict_status: 'No Conflicts' },
    { sys_id: 'chg5', number: 'CHG0030005', type: 'Normal', short_description: 'Replace Building A wireless access points', description: 'Replace 8 aging Cisco Aironet access points in Building A with new Meraki MR46 units. Will resolve coverage gaps identified in wireless survey.', state: 3, priority: 3, impact: 2, risk: 'Moderate', category: 'Network', assignment_group: 'g2', assigned_to: 'u4', requested_by: 'u4', opened_at: d(-20, 2), opened_by: 'u4', start_date: d(-10, 20), end_date: d(-9, 6), close_code: 'Successful', close_notes: 'All 8 access points replaced and configured. Wireless survey confirms full coverage in Building A. Signal strength improved from 1-2 bars to 4-5 bars in all areas.', updated_at: d(-8, 2), cmdb_ci: 'ci5', approval: 'Approved', conflict_status: 'No Conflicts' },
  ];

  const catalog = { sys_id: 'cat1', title: 'Service Catalog', description: 'Browse and order IT services and equipment', active: true };

  const catalogCategories = [
    { sys_id: 'scc1', title: 'Hardware', description: 'Hardware requests and accessories', icon: '\u{1F5A5}\uFE0F', parent: null, catalog: 'cat1', active: true, order: 1 },
    { sys_id: 'scc2', title: 'Software', description: 'Software licenses and installations', icon: '\u{1F4BF}', parent: null, catalog: 'cat1', active: true, order: 2 },
    { sys_id: 'scc3', title: 'Services', description: 'IT service requests', icon: '\u{1F527}', parent: null, catalog: 'cat1', active: true, order: 3 },
    { sys_id: 'scc4', title: 'Office', description: 'Office supplies and services', icon: '\u{1F3E2}', parent: null, catalog: 'cat1', active: true, order: 4 },
    { sys_id: 'scc5', title: 'Can We Help You?', description: 'General IT support gateway', icon: '\u{2753}', parent: null, catalog: 'cat1', active: true, order: 5 },
    { sys_id: 'scc6', title: 'Peripherals', description: 'Monitors, keyboards, mice, cables', icon: '\u{1F5B1}\uFE0F', parent: null, catalog: 'cat1', active: true, order: 6 },
  ];

  const catalogItems = [
    { sys_id: 'sci1', name: 'Standard Laptop', short_description: 'Dell Latitude 5540 with 16GB RAM and 512GB SSD', description: '<p>Dell Latitude 5540 business laptop with Intel Core i7 processor, 16GB DDR5 RAM, 512GB NVMe SSD, and 15.6" FHD display. Includes standard software image with Windows 11 Pro, Microsoft Office 365, and security tools.</p><p>Delivery includes initial setup and data migration from previous device if applicable.</p>', category: 'scc1', price: '$1,200', delivery_time: '5 business days', active: true, order: 1, popular: true, picture: '\u{1F4BB}' },
    { sys_id: 'sci2', name: 'Apple iPad', short_description: 'iPad Air with 64GB storage and WiFi', description: '<p>Apple iPad Air (5th generation) with M1 chip, 64GB storage, WiFi. Includes Smart Cover and Apple Pencil. Pre-configured with corporate email and security profiles via MDM.</p>', category: 'scc1', price: '$599', delivery_time: '3 business days', active: true, order: 2, popular: true, picture: '\u{1F4F1}' },
    { sys_id: 'sci3', name: 'Desktop Computer', short_description: 'Dell OptiPlex 7090 desktop workstation', description: '<p>Dell OptiPlex 7090 Micro Form Factor with Intel Core i5, 16GB RAM, 256GB SSD. Compact design for office use. Includes keyboard, mouse, and standard software image.</p>', category: 'scc1', price: '$900', delivery_time: '5 business days', active: true, order: 3, popular: false, picture: '\u{1F5A5}\uFE0F' },
    { sys_id: 'sci4', name: 'Microsoft Office 365', short_description: 'Office 365 Business Premium license', description: '<p>Microsoft Office 365 Business Premium license including Word, Excel, PowerPoint, Outlook, Teams, and OneDrive with 1TB cloud storage. License provisioned through corporate tenant.</p>', category: 'scc2', price: '$15/mo', delivery_time: '1 business day', active: true, order: 1, popular: true, picture: '\u{1F4E6}' },
    { sys_id: 'sci5', name: 'Adobe Creative Cloud', short_description: 'Full Adobe Creative Cloud suite license', description: '<p>Adobe Creative Cloud All Apps license including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, and 100GB cloud storage. Requires manager approval for non-creative departments.</p>', category: 'scc2', price: '$55/mo', delivery_time: '1 business day', active: true, order: 2, popular: false, picture: '\u{1F3A8}' },
    { sys_id: 'sci6', name: 'VPN Access', short_description: 'Remote access VPN credentials and client', description: '<p>Cisco AnyConnect VPN client installation and credential provisioning for secure remote access to corporate network. Includes setup guide and troubleshooting documentation.</p>', category: 'scc3', price: 'Free', delivery_time: '1 business day', active: true, order: 1, popular: true, picture: '\u{1F510}' },
    { sys_id: 'sci7', name: 'New Email Account', short_description: 'Create new corporate email account', description: '<p>New corporate email account creation on Exchange/Office 365. Includes mailbox provisioning, distribution group membership, and mobile device configuration guide.</p>', category: 'scc3', price: 'Free', delivery_time: '1 business day', active: true, order: 2, popular: false, picture: '\u{1F4E7}' },
    { sys_id: 'sci8', name: 'Network Access', short_description: 'Wired and wireless network access setup', description: '<p>Configure network access for new or relocated employees. Includes network port activation, VLAN assignment, and wireless credentials. Covers both wired and wireless connectivity.</p>', category: 'scc3', price: 'Free', delivery_time: '2 business days', active: true, order: 3, popular: true, picture: '\u{1F310}' },
    { sys_id: 'sci9', name: 'Desk Phone', short_description: 'Cisco IP desk phone with extension', description: '<p>Cisco 8845 IP video phone with HD voice, 5" color display, and integrated Bluetooth. Includes extension assignment and voicemail setup.</p>', category: 'scc4', price: '$0', delivery_time: '3 business days', active: true, order: 1, popular: false, picture: '\u{1F4DE}' },
    { sys_id: 'sci10', name: 'Standing Desk', short_description: 'Electric height-adjustable standing desk', description: '<p>Uplift V2 electric standing desk with 60"x30" bamboo top. Height adjustable from 25.3" to 50.9". Includes cable management tray and power strip. Requires facilities coordination for installation.</p>', category: 'scc4', price: '$450', delivery_time: '10 business days', active: true, order: 2, popular: false, picture: '\u{1FA91}' },
    { sys_id: 'sci11', name: 'External Monitor', short_description: 'Dell 27" 4K USB-C monitor', description: '<p>Dell U2723QE 27" 4K USB-C monitor with built-in KVM switch, USB-C hub, and adjustable stand. Includes USB-C and DisplayPort cables.</p>', category: 'scc6', price: '$350', delivery_time: '3 business days', active: true, order: 1, popular: true, picture: '\u{1F5B5}' },
    { sys_id: 'sci12', name: 'Wireless Mouse & Keyboard', short_description: 'Logitech MX Keys + MX Master 3S combo', description: '<p>Logitech MX Keys Advanced wireless keyboard and MX Master 3S wireless mouse combo. Connects via Bluetooth or included USB receiver. Multi-device switching supported.</p>', category: 'scc6', price: '$75', delivery_time: '2 business days', active: true, order: 2, popular: false, picture: '\u{2328}\uFE0F' },
  ];

  const requests = [
    { sys_id: 'req1', number: 'REQ0010001', requested_for: 'u6', opened_at: d(-2, -3), opened_by: 'u6', state: 'Open', stage: 'Delivery', items: ['ritm1'], updated_at: d(-1, 2) },
    { sys_id: 'req2', number: 'REQ0010002', requested_for: 'u7', opened_at: d(-3, -1), opened_by: 'u7', state: 'Open', stage: 'Requested', items: ['ritm2', 'ritm3'], updated_at: d(-2, 3) },
    { sys_id: 'req3', number: 'REQ0010003', requested_for: 'u8', opened_at: d(-10, -5), opened_by: 'u8', state: 'Closed Complete', stage: 'Completed', items: ['ritm4'], updated_at: d(-8, 2) },
  ];

  const requestedItems = [
    { sys_id: 'ritm1', number: 'RITM0010001', request: 'req1', cat_item: 'sci1', state: 'Work in Progress', assigned_to: 'u2', assignment_group: 'g4', quantity: 1, opened_at: d(-2, -3), updated_at: d(-1, 2), short_description: 'Standard Laptop' },
    { sys_id: 'ritm2', number: 'RITM0010002', request: 'req2', cat_item: 'sci6', state: 'Open', assigned_to: null, assignment_group: 'g2', quantity: 1, opened_at: d(-3, -1), updated_at: d(-3, -1), short_description: 'VPN Access' },
    { sys_id: 'ritm3', number: 'RITM0010003', request: 'req2', cat_item: 'sci11', state: 'Open', assigned_to: null, assignment_group: 'g4', quantity: 1, opened_at: d(-3, -1), updated_at: d(-3, -1), short_description: 'External Monitor' },
    { sys_id: 'ritm4', number: 'RITM0010004', request: 'req3', cat_item: 'sci4', state: 'Closed Complete', assigned_to: 'u2', assignment_group: 'g5', quantity: 1, opened_at: d(-10, -5), updated_at: d(-8, 2), short_description: 'Microsoft Office 365' },
  ];

  const kbCategories = [
    { sys_id: 'kbc1', label: 'Applications', parent_id: null, description: 'Application support articles', active: true, article_count: 2 },
    { sys_id: 'kbc2', label: 'Email', parent_id: null, description: 'Email configuration and troubleshooting', active: true, article_count: 3 },
    { sys_id: 'kbc3', label: 'Hardware', parent_id: null, description: 'Hardware support and setup guides', active: true, article_count: 2 },
    { sys_id: 'kbc4', label: 'Network', parent_id: null, description: 'Network connectivity and VPN guides', active: true, article_count: 3 },
    { sys_id: 'kbc5', label: 'Operating Systems', parent_id: null, description: 'OS configuration and troubleshooting', active: true, article_count: 2 },
    { sys_id: 'kbc6', label: 'Policies', parent_id: null, description: 'IT policies and acceptable use guidelines', active: true, article_count: 1 },
    { sys_id: 'kbc7', label: 'Outlook', parent_id: 'kbc2', description: 'Microsoft Outlook guides', active: true, article_count: 2 },
    { sys_id: 'kbc8', label: 'Gmail', parent_id: 'kbc2', description: 'Gmail configuration guides', active: true, article_count: 1 },
    { sys_id: 'kbc9', label: 'Windows', parent_id: 'kbc5', description: 'Windows OS guides', active: true, article_count: 1 },
    { sys_id: 'kbc10', label: 'Mac OS X', parent_id: 'kbc5', description: 'macOS guides', active: true, article_count: 1 },
  ];

  const kbArticles = [
    { sys_id: 'kb1', number: 'KB0010001', short_description: 'How to connect to VPN', text: '<h2>Connecting to the Corporate VPN</h2><p>Follow these steps to set up and connect to the corporate VPN using Cisco AnyConnect.</p><h3>Prerequisites</h3><ul><li>Cisco AnyConnect client installed (available from Software Center)</li><li>Active corporate credentials</li><li>Internet connection</li></ul><h3>Steps</h3><ol><li>Open Cisco AnyConnect Secure Mobility Client</li><li>Enter the VPN server address: <code>vpn.example.com</code></li><li>Click <strong>Connect</strong></li><li>Enter your corporate username and password</li><li>If prompted, approve the multi-factor authentication request on your phone</li><li>Wait for the connection to establish — the AnyConnect icon will show a lock symbol</li></ol><h3>Troubleshooting</h3><p>If you receive error code 619, try restarting the AnyConnect service. Go to Services (services.msc) and restart "Cisco AnyConnect VPN Agent".</p><p>If the issue persists, contact the Service Desk at ext. 5555.</p>', category: 'kbc4', author: 'u4', published: d(-30), workflow_state: 'Published', rating: 4.5, view_count: 342, helpful_count: 287, updated_at: d(-10) },
    { sys_id: 'kb2', number: 'KB0010002', short_description: 'Resetting your password', text: '<h2>Password Reset Guide</h2><p>This guide covers how to reset your corporate password using the self-service portal.</p><h3>Self-Service Password Reset</h3><ol><li>Navigate to <code>https://passwordreset.example.com</code></li><li>Enter your username (email address without @example.com)</li><li>Answer your security questions or use phone verification</li><li>Create a new password following these requirements:</li></ol><h3>Password Requirements</h3><ul><li>Minimum 12 characters</li><li>At least 1 uppercase letter</li><li>At least 1 lowercase letter</li><li>At least 1 number</li><li>At least 1 special character (!@#$%^&*)</li><li>Cannot reuse last 12 passwords</li></ul><h3>Account Lockout</h3><p>After 5 failed login attempts, your account will be locked for 30 minutes. If you need immediate access, contact the Service Desk.</p>', category: 'kbc1', author: 'u2', published: d(-45), workflow_state: 'Published', rating: 4.2, view_count: 891, helpful_count: 723, updated_at: d(-20) },
    { sys_id: 'kb3', number: 'KB0010003', short_description: 'Setting up email on mobile', text: '<h2>Mobile Email Configuration</h2><p>Configure your corporate email on iOS and Android devices.</p><h3>iOS (iPhone/iPad)</h3><ol><li>Go to Settings > Mail > Accounts > Add Account</li><li>Select Microsoft Exchange</li><li>Enter your corporate email address</li><li>Tap Configure Manually</li><li>Server: <code>outlook.office365.com</code></li><li>Enter your password and tap Next</li><li>Select which services to sync (Mail, Calendar, Contacts)</li></ol><h3>Android</h3><ol><li>Open the Outlook app (download from Play Store if needed)</li><li>Tap Get Started or Add Account</li><li>Enter your corporate email address</li><li>Enter your password</li><li>Follow the on-screen prompts to complete setup</li></ol>', category: 'kbc2', author: 'u3', published: d(-35), workflow_state: 'Published', rating: 4.0, view_count: 456, helpful_count: 356, updated_at: d(-15) },
    { sys_id: 'kb4', number: 'KB0010004', short_description: 'Outlook configuration guide', text: '<h2>Microsoft Outlook Desktop Configuration</h2><p>Complete guide for configuring Outlook on your corporate workstation.</p><h3>New Installation Setup</h3><ol><li>Open Outlook from the Start menu</li><li>When prompted, enter your corporate email address</li><li>Outlook will auto-discover settings — click Connect</li><li>Enter your password if prompted</li><li>Wait for the initial mailbox sync to complete</li></ol><h3>Adding Shared Mailboxes</h3><ol><li>Go to File > Account Settings > Account Settings</li><li>Select your email account and click Change</li><li>Click More Settings > Advanced tab</li><li>Click Add and enter the shared mailbox name</li></ol><h3>Calendar Sharing</h3><p>To share your calendar, right-click your calendar in the navigation pane and select Sharing Permissions.</p>', category: 'kbc7', author: 'u3', published: d(-40), workflow_state: 'Published', rating: 3.8, view_count: 234, helpful_count: 178, updated_at: d(-25) },
    { sys_id: 'kb5', number: 'KB0010005', short_description: 'Troubleshooting printer issues', text: '<h2>Printer Troubleshooting Guide</h2><p>Common printer issues and their solutions.</p><h3>Printer Shows Offline</h3><ol><li>Check that the printer is powered on and has paper</li><li>Verify the network cable is connected (or WiFi is connected)</li><li>On your computer, go to Control Panel > Devices and Printers</li><li>Right-click the printer and select "See what\'s printing"</li><li>Click Printer menu > uncheck "Use Printer Offline"</li></ol><h3>Print Quality Issues</h3><ul><li>Faded prints: Replace toner/ink cartridge</li><li>Streaks/lines: Run cleaning cycle from printer menu</li><li>Paper jams: Check all paper trays and rollers for obstructions</li></ul><h3>Cannot Find Printer</h3><p>Use the Add Printer wizard and browse the network. Corporate printers follow the naming convention: FLOOR-WING-TYPE (e.g., 3-EAST-CLR for 3rd floor, east wing, color printer).</p>', category: 'kbc3', author: 'u2', published: d(-50), workflow_state: 'Published', rating: 3.5, view_count: 567, helpful_count: 398, updated_at: d(-30) },
    { sys_id: 'kb6', number: 'KB0010006', short_description: 'Connecting to wireless network', text: '<h2>Corporate Wireless Network Guide</h2><p>Connect to the corporate WiFi network.</p><h3>Network Names (SSIDs)</h3><ul><li><strong>Corp-Secure</strong> — Main corporate network (802.1X authentication)</li><li><strong>Corp-Guest</strong> — Guest network (web portal authentication)</li></ul><h3>Connecting to Corp-Secure (Windows)</h3><ol><li>Click the WiFi icon in the system tray</li><li>Select "Corp-Secure"</li><li>When prompted for credentials, enter your corporate username and password</li><li>Check "Connect automatically" for future connections</li></ol><h3>Connecting to Corp-Secure (Mac)</h3><ol><li>Click the WiFi icon in the menu bar</li><li>Select "Corp-Secure"</li><li>Enter your corporate credentials when prompted</li><li>Click Trust when asked about the certificate</li></ol>', category: 'kbc4', author: 'u4', published: d(-28), workflow_state: 'Published', rating: 4.3, view_count: 289, helpful_count: 241, updated_at: d(-12) },
    { sys_id: 'kb7', number: 'KB0010007', short_description: 'Installing software via Software Center', text: '<h2>Software Installation Guide</h2><p>How to install approved software using the corporate Software Center.</p><h3>Opening Software Center</h3><ol><li>Click Start and search for "Software Center"</li><li>Alternatively, find it in the Microsoft Endpoint Manager folder</li></ol><h3>Installing Software</h3><ol><li>Browse or search for the application you need</li><li>Click on the application name to see details</li><li>Click <strong>Install</strong></li><li>Wait for the download and installation to complete</li><li>Some applications may require a restart</li></ol><h3>Available Software</h3><p>The following software is available for self-service installation without approval: 7-Zip, Firefox, Chrome, Notepad++, VLC Media Player, PuTTY.</p><p>Software requiring manager approval: Adobe Creative Cloud, AutoCAD, MATLAB, specialized tools.</p>', category: 'kbc1', author: 'u2', published: d(-38), workflow_state: 'Published', rating: 4.1, view_count: 445, helpful_count: 367, updated_at: d(-18) },
    { sys_id: 'kb8', number: 'KB0010008', short_description: 'Creating email distribution list', text: '<h2>Email Distribution List Management</h2><p>How to request and manage email distribution lists.</p><h3>Requesting a New Distribution List</h3><ol><li>Submit a request through the Service Catalog under "Services > New Email Account"</li><li>Specify the desired list name (e.g., marketing-team@example.com)</li><li>Provide the list of members to be added</li><li>Indicate the list owner (who can manage membership)</li></ol><h3>Managing an Existing List</h3><p>If you are the list owner, you can manage membership through the Outlook web app (outlook.office365.com) under Groups.</p>', category: 'kbc8', author: 'u3', published: d(-22), workflow_state: 'Published', rating: 3.9, view_count: 156, helpful_count: 112, updated_at: d(-8) },
    { sys_id: 'kb9', number: 'KB0010009', short_description: 'VPN troubleshooting FAQ', text: '<h2>VPN Troubleshooting FAQ</h2><h3>Q: I get "Connection attempt failed" error</h3><p>A: This usually indicates a network issue. Try: (1) Restart your internet connection, (2) Disable any personal firewall temporarily, (3) Try connecting from a different network.</p><h3>Q: VPN connects but I cannot access internal resources</h3><p>A: Check if split tunneling is enabled. Try accessing resources by IP address instead of hostname. If that works, it is a DNS issue — disconnect and reconnect VPN.</p><h3>Q: VPN keeps disconnecting</h3><p>A: This is a known issue during peak hours (9-11 AM). A fix is being deployed via change CHG0030001. In the meantime, reconnect when disconnected. Consider using the backup VPN server: vpn2.example.com.</p><h3>Q: How do I check my VPN connection status?</h3><p>A: The AnyConnect icon in your system tray shows connection status. A lock icon means connected. Click the icon for details including connected time and data transferred.</p>', category: 'kbc4', author: 'u4', published: d(-15), workflow_state: 'Published', rating: 4.6, view_count: 678, helpful_count: 589, updated_at: d(-5) },
    { sys_id: 'kb10', number: 'KB0010010', short_description: 'IT acceptable use policy', text: '<h2>Information Technology Acceptable Use Policy</h2><h3>1. Purpose</h3><p>This policy defines acceptable use of information technology resources at Example Corporation. All employees, contractors, and temporary workers must comply with this policy.</p><h3>2. Scope</h3><p>This policy applies to all IT resources including computers, networks, email, internet access, phones, and software.</p><h3>3. Acceptable Use</h3><ul><li>IT resources are provided primarily for business purposes</li><li>Limited personal use is permitted if it does not interfere with work duties</li><li>Users must protect their credentials and not share passwords</li><li>Users must report any security incidents immediately</li></ul><h3>4. Prohibited Activities</h3><ul><li>Installing unauthorized software</li><li>Accessing inappropriate or illegal content</li><li>Attempting to bypass security controls</li><li>Using IT resources for commercial activities outside of work duties</li></ul><h3>5. Monitoring</h3><p>The company reserves the right to monitor all IT resource usage. Users should have no expectation of privacy when using corporate IT resources.</p>', category: 'kbc6', author: 'u1', published: d(-60), workflow_state: 'Published', rating: 3.2, view_count: 1203, helpful_count: 456, updated_at: d(-45) },
  ];

  const cmdbItems = [
    { sys_id: 'ci1', name: 'VPN-GW-01', sys_class_name: 'cmdb_ci_netgear', status: 'Installed', environment: 'Production', category: 'Network', assigned_to: 'u4', department: 'IT Network', location: 'Data Center - Rack A3', ip_address: '10.1.1.1', serial_number: 'FTX1234A001', manufacturer: 'Cisco', model: 'ASA 5525-X' },
    { sys_id: 'ci2', name: 'MAIL-SVR-01', sys_class_name: 'cmdb_ci_server', status: 'Installed', environment: 'Production', category: 'Hardware', assigned_to: 'u3', department: 'IT Service Desk', location: 'Data Center - Rack B1', ip_address: '10.1.2.10', serial_number: 'MXL1234B002', manufacturer: 'Dell', model: 'PowerEdge R740' },
    { sys_id: 'ci3', name: 'DB-PROD-01', sys_class_name: 'cmdb_ci_database', status: 'Installed', environment: 'Production', category: 'Software', assigned_to: 'u5', department: 'IT Database', location: 'Data Center - Rack C2', ip_address: '10.1.3.20', serial_number: 'MXL1234C003', manufacturer: 'Dell', model: 'PowerEdge R840' },
    { sys_id: 'ci4', name: 'WEB-SVR-01', sys_class_name: 'cmdb_ci_app_server', status: 'Installed', environment: 'Production', category: 'Software', assigned_to: 'u3', department: 'IT Service Desk', location: 'Data Center - Rack B2', ip_address: '10.1.2.30', serial_number: 'MXL1234D004', manufacturer: 'Dell', model: 'PowerEdge R650' },
    { sys_id: 'ci5', name: 'AP-BLDGA-01', sys_class_name: 'cmdb_ci_netgear', status: 'In Maintenance', environment: 'Production', category: 'Network', assigned_to: 'u4', department: 'IT Network', location: 'Building A - 2nd Floor', ip_address: '10.1.10.1', serial_number: 'FCW1234E005', manufacturer: 'Cisco', model: 'Meraki MR46' },
    { sys_id: 'ci6', name: 'DB-DEV-01', sys_class_name: 'cmdb_ci_database', status: 'Installed', environment: 'Development', category: 'Software', assigned_to: 'u5', department: 'IT Database', location: 'Data Center - Rack C1', ip_address: '10.2.3.20', serial_number: 'MXL1234F006', manufacturer: 'Dell', model: 'PowerEdge R640' },
    { sys_id: 'ci7', name: 'FILE-SVR-01', sys_class_name: 'cmdb_ci_server', status: 'Installed', environment: 'Production', category: 'Hardware', assigned_to: 'u5', department: 'IT Database', location: 'Data Center - Rack A1', ip_address: '10.1.2.50', serial_number: 'MXL1234G007', manufacturer: 'Dell', model: 'PowerEdge R740xd' },
    { sys_id: 'ci8', name: 'BACKUP-SVR-01', sys_class_name: 'cmdb_ci_server', status: 'Installed', environment: 'Production', category: 'Hardware', assigned_to: 'u5', department: 'IT Database', location: 'Data Center - Rack A2', ip_address: '10.1.2.60', serial_number: 'MXL1234H008', manufacturer: 'Dell', model: 'PowerEdge R750' },
  ];

  const journal = [
    { sys_id: 'j1', element_id: 'inc1', element: 'work_notes', value: 'Contacted user, attempting remote VPN diagnostic. User confirmed AnyConnect client version 4.10. Checking VPN gateway logs.', sys_created_by: 'u4', sys_created_on: d(-1, -17), name: 'incident' },
    { sys_id: 'j2', element_id: 'inc1', element: 'comments', value: 'Hi, I\'ve submitted a VPN issue. Urgently need access for client presentation tomorrow morning. Please prioritize.', sys_created_by: 'u6', sys_created_on: d(-1, -18), name: 'incident' },
    { sys_id: 'j3', element_id: 'inc3', element: 'work_notes', value: 'SAP team notified. Escalating to vendor support. Memory dump analysis shows heap corruption in SAP GUI module.', sys_created_by: 'u3', sys_created_on: d(-2, -4), name: 'incident' },
    { sys_id: 'j4', element_id: 'inc3', element: 'work_notes', value: 'Vendor confirmed bug in latest SAP GUI patch (v7.70.5). Rollback to v7.70.4 planned. Workaround: use SAP Web GUI in the meantime.', sys_created_by: 'u3', sys_created_on: d(-1, -5), name: 'incident' },
    { sys_id: 'j5', element_id: 'inc4', element: 'comments', value: 'Awaiting replacement toner cartridge from vendor. Expected delivery by Thursday. Redirected user to 2nd floor printer in the meantime.', sys_created_by: 'u2', sys_created_on: d(-2, -2), name: 'incident' },
    { sys_id: 'j6', element_id: 'inc6', element: 'work_notes', value: 'Checking file server permissions for the shared drive. User was moved to new office last week — checking if AD group membership needs updating.', sys_created_by: 'u3', sys_created_on: d(-1, -8), name: 'incident' },
    { sys_id: 'j7', element_id: 'inc6', element: 'work_notes', value: 'Found the issue: user\'s new workstation was not added to the FILE-ACCESS AD security group. Adding now.', sys_created_by: 'u3', sys_created_on: d(-1, -6), name: 'incident' },
    { sys_id: 'j8', element_id: 'inc8', element: 'work_notes', value: 'Running wireless diagnostics in Building A. Initial scan shows AP-BLDGA-01 has degraded signal. Checking for hardware issues.', sys_created_by: 'u4', sys_created_on: d(-0.5, -3), name: 'incident' },
    { sys_id: 'j9', element_id: 'inc1', element: 'work_notes', value: 'VPN gateway logs show session timeout at exactly 30 min intervals. This matches known bug in firmware v4.2.1. Linked to Problem PRB0040001.', sys_created_by: 'u4', sys_created_on: d(-1, -15), name: 'incident' },
    { sys_id: 'j10', element_id: 'inc3', element: 'comments', value: 'Thank you for the update. I can use SAP Web GUI as a temporary solution. Please let me know when the fix is ready.', sys_created_by: 'u8', sys_created_on: d(-1, -3), name: 'incident' },
    { sys_id: 'j11', element_id: 'inc8', element: 'comments', value: 'The slow speeds are really impacting our team meetings. Is there an ETA for the fix?', sys_created_by: 'u7', sys_created_on: d(-0.5, -1), name: 'incident' },
    { sys_id: 'j12', element_id: 'inc4', element: 'work_notes', value: 'Printer issue is not toner — network cable was damaged during office cleaning. Ordered replacement cable. Temporarily connected via USB to nearby workstation.', sys_created_by: 'u2', sys_created_on: d(-2.5), name: 'incident' },
  ];

  const notifications = [
    { sys_id: 'notif1', type: 'assignment', target_table: 'incident', target_id: 'inc3', target_number: 'INC0010003', message: 'INC0010003 assigned to you', created_at: d(-2, -6), read: false, actor: 'u2' },
    { sys_id: 'notif2', type: 'comment', target_table: 'incident', target_id: 'inc1', target_number: 'INC0010001', message: 'INC0010001 updated with new work notes', created_at: d(-1, -15), read: false, actor: 'u4' },
    { sys_id: 'notif3', type: 'approval', target_table: 'change_request', target_id: 'chg4', target_number: 'CHG0030004', message: 'CHG0030004 requires approval', created_at: d(-1, -4), read: false, actor: 'u5' },
    { sys_id: 'notif4', type: 'state_change', target_table: 'incident', target_id: 'inc5', target_number: 'INC0010005', message: 'INC0010005 has been resolved', created_at: d(-4, -1), read: true, actor: 'u2' },
    { sys_id: 'notif5', type: 'sla_warning', target_table: 'incident', target_id: 'inc3', target_number: 'INC0010003', message: 'SLA warning: INC0010003 due in 2 hours', created_at: d(-1, -2), read: true, actor: 'u1' },
    { sys_id: 'notif6', type: 'state_change', target_table: 'incident', target_id: 'inc9', target_number: 'INC0010009', message: 'INC0010009 has been resolved', created_at: d(-4, 2), read: true, actor: 'u2' },
    { sys_id: 'notif7', type: 'state_change', target_table: 'sc_req_item', target_id: 'ritm1', target_number: 'REQ0010001', message: 'REQ0010001 is being processed', created_at: d(-1, 2), read: true, actor: 'u2' },
    { sys_id: 'notif8', type: 'state_change', target_table: 'change_request', target_id: 'chg1', target_number: 'CHG0030001', message: 'CHG0030001 moved to Scheduled', created_at: d(-2, 4), read: true, actor: 'u4' },
  ];

  return {
    currentUser: { ...users[0] },
    users,
    groups,
    incidents,
    problems,
    changeRequests,
    catalog,
    catalogCategories,
    catalogItems,
    requests,
    requestedItems,
    kbCategories,
    kbArticles,
    cmdbItems,
    journal,
    notifications,
    shoppingCart: [],
    navigatorFilter: '',
    navigatorExpandedSections: ['Incident'],
    activeModule: 'dashboard',
    favorites: [],
    history: [],
    currentListFilters: {},
    currentSortColumn: null,
    currentSortDirection: 'asc',
  };
}

export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('sid') || null;
}

let _syncTimer = null;

export function saveState(state, sid) {
  const key = sid ? `servicenow_state_${sid}` : 'servicenow_state';
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
}

export function loadState(sid) {
  const key = sid ? `servicenow_state_${sid}` : 'servicenow_state';
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return null;
}

export function saveInitialState(state, sid) {
  const key = sid ? `servicenow_initialState_${sid}` : 'servicenow_initialState';
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving initial state:', e);
  }
}

export function getInitialState(sid) {
  const key = sid ? `servicenow_initialState_${sid}` : 'servicenow_initialState';
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading initial state:', e);
  }
  return null;
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
    console.error('Error fetching custom state:', e);
  }
  return null;
}

export function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(custom)) {
    if (custom[key] && typeof custom[key] === 'object' && !Array.isArray(custom[key]) && defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
    } else {
      result[key] = custom[key];
    }
  }
  return result;
}

export async function initializeData(sid, customState) {
  const defaults = createInitialData();
  let state;

  if (customState) {
    state = { ...defaults, ...customState };
  } else if (sid) {
    const serverState = await fetchCustomState(sid);
    if (serverState) {
      state = { ...defaults, ...serverState };
    } else {
      const localState = loadState(sid);
      state = localState || defaults;
    }
  } else {
    const localState = loadState(null);
    state = localState || defaults;
  }

  // Save initial state if not already saved
  const existingInitial = getInitialState(sid);
  if (!existingInitial) {
    saveInitialState(JSON.parse(JSON.stringify(state)), sid);
  }

  saveState(state, sid);
  return state;
}

// Priority matrix: impact x urgency => priority
export function calculatePriority(impact, urgency) {
  const matrix = {
    '1-1': 1, '1-2': 2, '1-3': 3,
    '2-1': 2, '2-2': 3, '2-3': 4,
    '3-1': 3, '3-2': 4, '3-3': 5,
  };
  return matrix[`${impact}-${urgency}`] || 3;
}

export function getPriorityLabel(priority) {
  const labels = { 1: '1 - Critical', 2: '2 - High', 3: '3 - Moderate', 4: '4 - Low', 5: '5 - Planning' };
  return labels[priority] || `${priority} - Unknown`;
}

export function getPriorityColor(priority) {
  const colors = { 1: '#d32f2f', 2: '#f57c00', 3: '#fbc02d', 4: '#388e3c', 5: '#90a4ae' };
  return colors[priority] || '#999';
}

export function getIncidentStateLabel(state) {
  const labels = { 1: 'New', 2: 'In Progress', 3: 'On Hold', 6: 'Resolved', 7: 'Closed', 8: 'Cancelled' };
  return labels[state] || 'Unknown';
}

export function getProblemStateLabel(state) {
  const labels = { 1: 'New', 2: 'Assess', 3: 'Root Cause Analysis', 4: 'Fix in Progress', 5: 'Resolved', 6: 'Closed' };
  return labels[state] || 'Unknown';
}

export function getChangeStateLabel(state) {
  const labels = { '-5': 'New', '-4': 'Assess', '-3': 'Authorize', '-2': 'Scheduled', '-1': 'Implement', '0': 'Review', '3': 'Closed', '4': 'Cancelled' };
  return labels[String(state)] || 'Unknown';
}

export function getUserDisplayName(users, userId) {
  if (!userId) return '';
  const u = users.find(u => u.sys_id === userId);
  return u ? `${u.first_name} ${u.last_name}` : userId;
}

export function getGroupDisplayName(groups, groupId) {
  if (!groupId) return '';
  const g = groups.find(g => g.sys_id === groupId);
  return g ? g.name : groupId;
}

export function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

export function getNextNumber(records, prefix) {
  let max = 0;
  const regex = new RegExp(`^${prefix}(\\d+)$`);
  for (const r of records) {
    const match = r.number.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  return prefix + String(max + 1).padStart(7, '0');
}
