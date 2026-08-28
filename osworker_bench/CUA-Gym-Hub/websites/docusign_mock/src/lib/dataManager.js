// --- Session-based state management ---

const BASE_STORAGE_KEY = 'documock_state';
const BASE_INITIAL_KEY = 'documock_initialState';

function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const data = await resp.json(); if (data.has_custom_state && data.stored_state) return data.stored_state; }
  } catch (e) { console.warn('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to sync state to server', e);
  }
};

export const getSavedInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

// Generate a simple cursive signature data URL for Sarah Chen
function generateSignatureDataUrl() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 200, 50);
    ctx.font = 'italic 28px "Brush Script MT", cursive, serif';
    ctx.fillStyle = '#000080';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sarah Chen', 10, 28);
    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
}

function generateInitialsDataUrl() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 80, 40);
    ctx.font = 'italic 24px "Brush Script MT", cursive, serif';
    ctx.fillStyle = '#000080';
    ctx.textBaseline = 'middle';
    ctx.fillText('SC', 15, 22);
    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
}

export function getDefaultState() {
  const sigDataUrl = generateSignatureDataUrl();
  const initDataUrl = generateInitialsDataUrl();

  return {
    user: {
      id: "user_1",
      name: "Sarah Chen",
      email: "sarah.chen@acmecorp.com",
      title: "VP of Operations",
      company: "Acme Corporation",
      avatar: "https://picsum.photos/seed/sarah/100/100",
      signatureDataUrl: sigDataUrl,
      initialsDataUrl: initDataUrl,
      memberSince: "2021-03-15",
      settings: {
        defaultReminderDays: 3,
        defaultExpirationDays: 120,
        timezone: "America/Los_Angeles"
      }
    },

    envelopes: [
      // 1. Draft - Sales Agreement
      {
        id: "env_1",
        subject: "Acme Corp - Q1 Sales Agreement",
        message: "Please review and sign the attached sales agreement for Q1 2025.",
        status: "draft",
        createdAt: "2025-02-10T09:15:00Z",
        sentAt: null,
        completedAt: null,
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-02-10T09:15:00Z",
        expiresAt: null,
        senderId: "user_1",
        folderId: null,
        templateId: null,
        reminderEnabled: false,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_1_1",
            name: "Q1_Sales_Agreement.pdf",
            pageCount: 4,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc1/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_1_1",
            name: "Michael Torres",
            email: "m.torres@globalventures.com",
            role: "signer",
            routingOrder: 1,
            status: "created",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          },
          {
            id: "rec_1_2",
            name: "Jennifer Park",
            email: "j.park@globalventures.com",
            role: "cc",
            routingOrder: 2,
            status: "created",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [],
        history: [
          {
            id: "evt_1_1",
            timestamp: "2025-02-10T09:15:00Z",
            action: "created",
            actorName: "Sarah Chen",
            actorEmail: "sarah.chen@acmecorp.com",
            details: "Envelope created"
          }
        ]
      },

      // 2. Draft - Consulting Contract
      {
        id: "env_2",
        subject: "Consulting Services Agreement - Rivera & Associates",
        message: "",
        status: "draft",
        createdAt: "2025-02-15T14:30:00Z",
        sentAt: null,
        completedAt: null,
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-02-15T14:30:00Z",
        expiresAt: null,
        senderId: "user_1",
        folderId: null,
        templateId: null,
        reminderEnabled: false,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_2_1",
            name: "Consulting_Contract_2025.pdf",
            pageCount: 6,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc2/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [],
        fields: [],
        history: [
          {
            id: "evt_2_1",
            timestamp: "2025-02-15T14:30:00Z",
            action: "created",
            actorName: "Sarah Chen",
            actorEmail: "sarah.chen@acmecorp.com",
            details: "Envelope created"
          }
        ]
      },

      // 3. Sent - NDA Agreement
      {
        id: "env_3",
        subject: "Mutual Non-Disclosure Agreement - TechStart Inc",
        message: "Hi, please review and sign the attached NDA at your earliest convenience. Let me know if you have any questions.",
        status: "sent",
        createdAt: "2025-01-28T10:00:00Z",
        sentAt: "2025-01-28T10:05:00Z",
        completedAt: null,
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-01-29T08:20:00Z",
        expiresAt: "2025-05-28T10:05:00Z",
        senderId: "user_1",
        folderId: null,
        templateId: "tmpl_1",
        reminderEnabled: true,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_3_1",
            name: "Mutual_NDA_TechStart.pdf",
            pageCount: 3,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc3/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_3_1",
            name: "David Kim",
            email: "d.kim@techstart.io",
            role: "signer",
            routingOrder: 1,
            status: "delivered",
            signedAt: null,
            viewedAt: "2025-01-29T08:20:00Z",
            deliveredAt: "2025-01-28T10:06:00Z",
            declinedAt: null,
            declineReason: null
          },
          {
            id: "rec_3_2",
            name: "Sarah Chen",
            email: "sarah.chen@acmecorp.com",
            role: "signer",
            routingOrder: 2,
            status: "sent",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_3_1", type: "signature", recipientId: "rec_3_1", documentId: "doc_3_1", pageNumber: 1, x: 100, y: 750, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_3_2", type: "dateSigned", recipientId: "rec_3_1", documentId: "doc_3_1", pageNumber: 1, x: 350, y: 760, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_3_3", type: "name", recipientId: "rec_3_1", documentId: "doc_3_1", pageNumber: 1, x: 100, y: 700, width: 150, height: 30, value: "", required: true, label: "Printed Name", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_3_4", type: "signature", recipientId: "rec_3_2", documentId: "doc_3_1", pageNumber: 1, x: 450, y: 750, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_3_5", type: "dateSigned", recipientId: "rec_3_2", documentId: "doc_3_1", pageNumber: 1, x: 650, y: 760, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_3_6", type: "name", recipientId: "rec_3_2", documentId: "doc_3_1", pageNumber: 1, x: 450, y: 700, width: 150, height: 30, value: "", required: true, label: "Printed Name", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_3_1", timestamp: "2025-01-28T10:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_3_2", timestamp: "2025-01-28T10:05:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to 2 recipients" },
          { id: "evt_3_3", timestamp: "2025-01-28T10:06:00Z", action: "delivered", actorName: "David Kim", actorEmail: "d.kim@techstart.io", details: "Envelope delivered to David Kim" },
          { id: "evt_3_4", timestamp: "2025-01-29T08:20:00Z", action: "viewed", actorName: "David Kim", actorEmail: "d.kim@techstart.io", details: "David Kim viewed the document" }
        ]
      },

      // 4. Delivered - Vendor Agreement
      {
        id: "env_4",
        subject: "Vendor Services Agreement - Summit LLC",
        message: "Please review the vendor agreement and return your signed copy. The agreement covers services for Q1-Q2 2025.",
        status: "delivered",
        createdAt: "2025-02-01T11:00:00Z",
        sentAt: "2025-02-01T11:10:00Z",
        completedAt: null,
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-02-02T09:45:00Z",
        expiresAt: "2025-06-01T11:10:00Z",
        senderId: "user_1",
        folderId: null,
        templateId: null,
        reminderEnabled: true,
        reminderDays: 5,
        reminderFrequency: 3,
        documents: [
          {
            id: "doc_4_1",
            name: "Vendor_Agreement_Summit.pdf",
            pageCount: 5,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc4a/800/1100",
            fileType: "pdf"
          },
          {
            id: "doc_4_2",
            name: "Vendor_SOW_Exhibit_A.pdf",
            pageCount: 2,
            order: 2,
            fileUrl: "https://picsum.photos/seed/doc4b/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_4_1",
            name: "Robert Chang",
            email: "r.chang@summitllc.com",
            role: "signer",
            routingOrder: 1,
            status: "delivered",
            signedAt: null,
            viewedAt: "2025-02-02T09:45:00Z",
            deliveredAt: "2025-02-01T11:12:00Z",
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_4_1", type: "signature", recipientId: "rec_4_1", documentId: "doc_4_1", pageNumber: 5, x: 100, y: 800, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_4_2", type: "dateSigned", recipientId: "rec_4_1", documentId: "doc_4_1", pageNumber: 5, x: 350, y: 810, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_4_3", type: "initial", recipientId: "rec_4_1", documentId: "doc_4_1", pageNumber: 3, x: 650, y: 950, width: 80, height: 40, value: "", required: true, label: "Initial here", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_4_4", type: "title", recipientId: "rec_4_1", documentId: "doc_4_1", pageNumber: 5, x: 100, y: 860, width: 150, height: 30, value: "", required: false, label: "Title", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_4_1", timestamp: "2025-02-01T11:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_4_2", timestamp: "2025-02-01T11:10:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to Robert Chang" },
          { id: "evt_4_3", timestamp: "2025-02-01T11:12:00Z", action: "delivered", actorName: "Robert Chang", actorEmail: "r.chang@summitllc.com", details: "Envelope delivered to Robert Chang" },
          { id: "evt_4_4", timestamp: "2025-02-02T09:45:00Z", action: "viewed", actorName: "Robert Chang", actorEmail: "r.chang@summitllc.com", details: "Robert Chang viewed the document" }
        ]
      },

      // 5. Partially Signed - Partnership Agreement
      {
        id: "env_5",
        subject: "Strategic Partnership Agreement - Acme & Partner Corp",
        message: "This partnership agreement outlines our collaboration terms for 2025. Please review carefully and sign.",
        status: "signed",
        createdAt: "2025-01-20T08:30:00Z",
        sentAt: "2025-01-20T08:45:00Z",
        completedAt: null,
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-01-22T16:00:00Z",
        expiresAt: "2025-05-20T08:45:00Z",
        senderId: "user_1",
        folderId: "folder_1",
        templateId: null,
        reminderEnabled: true,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_5_1",
            name: "Partnership_Agreement_2025.pdf",
            pageCount: 8,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc5/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_5_1",
            name: "Alice Williams",
            email: "a.williams@partnercorp.com",
            role: "signer",
            routingOrder: 1,
            status: "signed",
            signedAt: "2025-01-21T14:30:00Z",
            viewedAt: "2025-01-20T09:00:00Z",
            deliveredAt: "2025-01-20T08:46:00Z",
            declinedAt: null,
            declineReason: null
          },
          {
            id: "rec_5_2",
            name: "James Liu",
            email: "j.liu@partnercorp.com",
            role: "signer",
            routingOrder: 2,
            status: "delivered",
            signedAt: null,
            viewedAt: "2025-01-22T16:00:00Z",
            deliveredAt: "2025-01-21T14:31:00Z",
            declinedAt: null,
            declineReason: null
          },
          {
            id: "rec_5_3",
            name: "Sarah Chen",
            email: "sarah.chen@acmecorp.com",
            role: "signer",
            routingOrder: 3,
            status: "sent",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_5_1", type: "signature", recipientId: "rec_5_1", documentId: "doc_5_1", pageNumber: 8, x: 80, y: 400, width: 200, height: 50, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_2", type: "dateSigned", recipientId: "rec_5_1", documentId: "doc_5_1", pageNumber: 8, x: 300, y: 410, width: 120, height: 30, value: "01/21/2025", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_3", type: "name", recipientId: "rec_5_1", documentId: "doc_5_1", pageNumber: 8, x: 80, y: 350, width: 150, height: 30, value: "Alice Williams", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_4", type: "signature", recipientId: "rec_5_2", documentId: "doc_5_1", pageNumber: 8, x: 80, y: 550, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_5", type: "dateSigned", recipientId: "rec_5_2", documentId: "doc_5_1", pageNumber: 8, x: 300, y: 560, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_6", type: "signature", recipientId: "rec_5_3", documentId: "doc_5_1", pageNumber: 8, x: 80, y: 700, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_7", type: "dateSigned", recipientId: "rec_5_3", documentId: "doc_5_1", pageNumber: 8, x: 300, y: 710, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_5_8", type: "company", recipientId: "rec_5_3", documentId: "doc_5_1", pageNumber: 8, x: 80, y: 760, width: 150, height: 30, value: "", required: true, label: "Company", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_5_1", timestamp: "2025-01-20T08:30:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_5_2", timestamp: "2025-01-20T08:45:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to 3 recipients" },
          { id: "evt_5_3", timestamp: "2025-01-20T08:46:00Z", action: "delivered", actorName: "Alice Williams", actorEmail: "a.williams@partnercorp.com", details: "Delivered to Alice Williams" },
          { id: "evt_5_4", timestamp: "2025-01-20T09:00:00Z", action: "viewed", actorName: "Alice Williams", actorEmail: "a.williams@partnercorp.com", details: "Alice Williams viewed the document" },
          { id: "evt_5_5", timestamp: "2025-01-21T14:30:00Z", action: "signed", actorName: "Alice Williams", actorEmail: "a.williams@partnercorp.com", details: "Alice Williams signed the document" },
          { id: "evt_5_6", timestamp: "2025-01-21T14:31:00Z", action: "delivered", actorName: "James Liu", actorEmail: "j.liu@partnercorp.com", details: "Delivered to James Liu" },
          { id: "evt_5_7", timestamp: "2025-01-22T16:00:00Z", action: "viewed", actorName: "James Liu", actorEmail: "j.liu@partnercorp.com", details: "James Liu viewed the document" }
        ]
      },

      // 6. Completed - Employment Offer
      {
        id: "env_6",
        subject: "Employment Offer Letter - Maria Santos",
        message: "Congratulations! Please find your offer letter attached. Review and sign to accept.",
        status: "completed",
        createdAt: "2025-01-10T09:00:00Z",
        sentAt: "2025-01-10T09:15:00Z",
        completedAt: "2025-01-11T11:30:00Z",
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-01-11T11:30:00Z",
        expiresAt: null,
        senderId: "user_1",
        folderId: "folder_2",
        templateId: "tmpl_2",
        reminderEnabled: false,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_6_1",
            name: "Offer_Letter_Santos.pdf",
            pageCount: 2,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc6/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_6_1",
            name: "Maria Santos",
            email: "m.santos@email.com",
            role: "signer",
            routingOrder: 1,
            status: "signed",
            signedAt: "2025-01-11T11:30:00Z",
            viewedAt: "2025-01-10T10:00:00Z",
            deliveredAt: "2025-01-10T09:16:00Z",
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_6_1", type: "signature", recipientId: "rec_6_1", documentId: "doc_6_1", pageNumber: 2, x: 100, y: 600, width: 200, height: 50, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_6_2", type: "dateSigned", recipientId: "rec_6_1", documentId: "doc_6_1", pageNumber: 2, x: 350, y: 610, width: 120, height: 30, value: "01/11/2025", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_6_3", type: "name", recipientId: "rec_6_1", documentId: "doc_6_1", pageNumber: 2, x: 100, y: 550, width: 150, height: 30, value: "Maria Santos", required: true, label: "Full Name", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_6_4", type: "text", recipientId: "rec_6_1", documentId: "doc_6_1", pageNumber: 2, x: 100, y: 660, width: 200, height: 30, value: "123 Main Street, San Jose, CA 95112", required: false, label: "Address", readOnly: false, fontSize: 12, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_6_1", timestamp: "2025-01-10T09:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created from template 'Employment Agreement'" },
          { id: "evt_6_2", timestamp: "2025-01-10T09:15:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to Maria Santos" },
          { id: "evt_6_3", timestamp: "2025-01-10T09:16:00Z", action: "delivered", actorName: "Maria Santos", actorEmail: "m.santos@email.com", details: "Delivered to Maria Santos" },
          { id: "evt_6_4", timestamp: "2025-01-10T10:00:00Z", action: "viewed", actorName: "Maria Santos", actorEmail: "m.santos@email.com", details: "Maria Santos viewed the document" },
          { id: "evt_6_5", timestamp: "2025-01-11T11:30:00Z", action: "signed", actorName: "Maria Santos", actorEmail: "m.santos@email.com", details: "Maria Santos signed the document" },
          { id: "evt_6_6", timestamp: "2025-01-11T11:30:00Z", action: "completed", actorName: "System", actorEmail: "", details: "All recipients have completed signing" }
        ]
      },

      // 7. Completed - Lease Agreement
      {
        id: "env_7",
        subject: "Office Lease Agreement - 500 Market Street",
        message: "Attached is the lease agreement for our new office space. Both parties need to sign.",
        status: "completed",
        createdAt: "2025-01-05T13:00:00Z",
        sentAt: "2025-01-05T13:15:00Z",
        completedAt: "2025-01-08T10:45:00Z",
        voidedAt: null,
        declinedAt: null,
        lastActivityAt: "2025-01-08T10:45:00Z",
        expiresAt: null,
        senderId: "user_1",
        folderId: "folder_1",
        templateId: null,
        reminderEnabled: false,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_7_1",
            name: "Office_Lease_Agreement.pdf",
            pageCount: 12,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc7a/800/1100",
            fileType: "pdf"
          },
          {
            id: "doc_7_2",
            name: "Lease_Exhibit_B_FloorPlan.pdf",
            pageCount: 1,
            order: 2,
            fileUrl: "https://picsum.photos/seed/doc7b/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_7_1",
            name: "Patricia Nakamura",
            email: "p.nakamura@legalassociates.com",
            role: "signer",
            routingOrder: 1,
            status: "signed",
            signedAt: "2025-01-06T15:20:00Z",
            viewedAt: "2025-01-06T10:00:00Z",
            deliveredAt: "2025-01-05T13:16:00Z",
            declinedAt: null,
            declineReason: null
          },
          {
            id: "rec_7_2",
            name: "Sarah Chen",
            email: "sarah.chen@acmecorp.com",
            role: "signer",
            routingOrder: 2,
            status: "signed",
            signedAt: "2025-01-08T10:45:00Z",
            viewedAt: "2025-01-07T09:00:00Z",
            deliveredAt: "2025-01-06T15:21:00Z",
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_7_1", type: "signature", recipientId: "rec_7_1", documentId: "doc_7_1", pageNumber: 12, x: 80, y: 400, width: 200, height: 50, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_7_2", type: "dateSigned", recipientId: "rec_7_1", documentId: "doc_7_1", pageNumber: 12, x: 300, y: 410, width: 120, height: 30, value: "01/06/2025", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_7_3", type: "initial", recipientId: "rec_7_1", documentId: "doc_7_1", pageNumber: 6, x: 650, y: 950, width: 80, height: 40, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_7_4", type: "signature", recipientId: "rec_7_2", documentId: "doc_7_1", pageNumber: 12, x: 80, y: 550, width: 200, height: 50, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_7_5", type: "dateSigned", recipientId: "rec_7_2", documentId: "doc_7_1", pageNumber: 12, x: 300, y: 560, width: 120, height: 30, value: "01/08/2025", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_7_6", type: "initial", recipientId: "rec_7_2", documentId: "doc_7_1", pageNumber: 6, x: 650, y: 1000, width: 80, height: 40, value: "data:image/png;base64,iVBORw0KGgo=", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_7_1", timestamp: "2025-01-05T13:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_7_2", timestamp: "2025-01-05T13:15:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to 2 recipients" },
          { id: "evt_7_3", timestamp: "2025-01-05T13:16:00Z", action: "delivered", actorName: "Patricia Nakamura", actorEmail: "p.nakamura@legalassociates.com", details: "Delivered to Patricia Nakamura" },
          { id: "evt_7_4", timestamp: "2025-01-06T10:00:00Z", action: "viewed", actorName: "Patricia Nakamura", actorEmail: "p.nakamura@legalassociates.com", details: "Patricia Nakamura viewed the document" },
          { id: "evt_7_5", timestamp: "2025-01-06T15:20:00Z", action: "signed", actorName: "Patricia Nakamura", actorEmail: "p.nakamura@legalassociates.com", details: "Patricia Nakamura signed the document" },
          { id: "evt_7_6", timestamp: "2025-01-06T15:21:00Z", action: "delivered", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Delivered to Sarah Chen" },
          { id: "evt_7_7", timestamp: "2025-01-07T09:00:00Z", action: "viewed", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Sarah Chen viewed the document" },
          { id: "evt_7_8", timestamp: "2025-01-08T10:45:00Z", action: "signed", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Sarah Chen signed the document" },
          { id: "evt_7_9", timestamp: "2025-01-08T10:45:00Z", action: "completed", actorName: "System", actorEmail: "", details: "All recipients have completed signing" }
        ]
      },

      // 8. Voided - Old Proposal
      {
        id: "env_8",
        subject: "Proposal - Digital Transformation Project (VOID)",
        message: "Please review the attached proposal for the digital transformation initiative.",
        status: "voided",
        createdAt: "2024-12-15T10:00:00Z",
        sentAt: "2024-12-15T10:30:00Z",
        completedAt: null,
        voidedAt: "2025-01-02T09:00:00Z",
        declinedAt: null,
        lastActivityAt: "2025-01-02T09:00:00Z",
        expiresAt: "2025-04-15T10:30:00Z",
        senderId: "user_1",
        folderId: null,
        templateId: null,
        reminderEnabled: false,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_8_1",
            name: "Digital_Transformation_Proposal.pdf",
            pageCount: 15,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc8/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_8_1",
            name: "Michael Torres",
            email: "m.torres@globalventures.com",
            role: "signer",
            routingOrder: 1,
            status: "sent",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_8_1", type: "signature", recipientId: "rec_8_1", documentId: "doc_8_1", pageNumber: 15, x: 100, y: 800, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_8_2", type: "dateSigned", recipientId: "rec_8_1", documentId: "doc_8_1", pageNumber: 15, x: 350, y: 810, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_8_1", timestamp: "2024-12-15T10:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_8_2", timestamp: "2024-12-15T10:30:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to Michael Torres" },
          { id: "evt_8_3", timestamp: "2025-01-02T09:00:00Z", action: "voided", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope voided: Proposal superseded by updated version" }
        ]
      },

      // 9. Declined - Service Agreement
      {
        id: "env_9",
        subject: "Managed IT Services Agreement - TechStart Inc",
        message: "Please review the attached managed services agreement and sign at your convenience.",
        status: "declined",
        createdAt: "2025-01-18T08:00:00Z",
        sentAt: "2025-01-18T08:15:00Z",
        completedAt: null,
        voidedAt: null,
        declinedAt: "2025-01-19T14:00:00Z",
        lastActivityAt: "2025-01-19T14:00:00Z",
        expiresAt: "2025-05-18T08:15:00Z",
        senderId: "user_1",
        folderId: null,
        templateId: null,
        reminderEnabled: true,
        reminderDays: 3,
        reminderFrequency: 2,
        documents: [
          {
            id: "doc_9_1",
            name: "IT_Services_Agreement.pdf",
            pageCount: 7,
            order: 1,
            fileUrl: "https://picsum.photos/seed/doc9/800/1100",
            fileType: "pdf"
          }
        ],
        recipients: [
          {
            id: "rec_9_1",
            name: "David Kim",
            email: "d.kim@techstart.io",
            role: "signer",
            routingOrder: 1,
            status: "declined",
            signedAt: null,
            viewedAt: "2025-01-19T13:30:00Z",
            deliveredAt: "2025-01-18T08:16:00Z",
            declinedAt: "2025-01-19T14:00:00Z",
            declineReason: "Terms not acceptable - pricing structure needs revision"
          },
          {
            id: "rec_9_2",
            name: "Lisa Patel",
            email: "l.patel@techstart.io",
            role: "cc",
            routingOrder: 2,
            status: "sent",
            signedAt: null,
            viewedAt: null,
            deliveredAt: null,
            declinedAt: null,
            declineReason: null
          }
        ],
        fields: [
          { id: "field_9_1", type: "signature", recipientId: "rec_9_1", documentId: "doc_9_1", pageNumber: 7, x: 100, y: 800, width: 200, height: 50, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_9_2", type: "dateSigned", recipientId: "rec_9_1", documentId: "doc_9_1", pageNumber: 7, x: 350, y: 810, width: 120, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_9_3", type: "name", recipientId: "rec_9_1", documentId: "doc_9_1", pageNumber: 7, x: 100, y: 750, width: 150, height: 30, value: "", required: true, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_9_4", type: "title", recipientId: "rec_9_1", documentId: "doc_9_1", pageNumber: 7, x: 100, y: 860, width: 150, height: 30, value: "", required: false, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" },
          { id: "field_9_5", type: "company", recipientId: "rec_9_1", documentId: "doc_9_1", pageNumber: 7, x: 350, y: 860, width: 150, height: 30, value: "", required: false, label: "", readOnly: false, fontSize: 14, fontColor: "#000000" }
        ],
        history: [
          { id: "evt_9_1", timestamp: "2025-01-18T08:00:00Z", action: "created", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope created" },
          { id: "evt_9_2", timestamp: "2025-01-18T08:15:00Z", action: "sent", actorName: "Sarah Chen", actorEmail: "sarah.chen@acmecorp.com", details: "Envelope sent to 2 recipients" },
          { id: "evt_9_3", timestamp: "2025-01-18T08:16:00Z", action: "delivered", actorName: "David Kim", actorEmail: "d.kim@techstart.io", details: "Delivered to David Kim" },
          { id: "evt_9_4", timestamp: "2025-01-19T13:30:00Z", action: "viewed", actorName: "David Kim", actorEmail: "d.kim@techstart.io", details: "David Kim viewed the document" },
          { id: "evt_9_5", timestamp: "2025-01-19T14:00:00Z", action: "declined", actorName: "David Kim", actorEmail: "d.kim@techstart.io", details: "David Kim declined: Terms not acceptable - pricing structure needs revision" }
        ]
      }
    ],

    templates: [
      {
        id: "tmpl_1",
        name: "Standard NDA",
        description: "Non-disclosure agreement for new partners and vendors",
        createdAt: "2024-06-01T12:00:00Z",
        lastUsedAt: "2025-01-28T10:00:00Z",
        usageCount: 15,
        ownerId: "user_1",
        shared: true,
        documents: [
          { id: "tdoc_1_1", name: "Standard_NDA_Template.pdf", pageCount: 3, order: 1, fileUrl: "https://picsum.photos/seed/tmpl1/800/1100", fileType: "pdf" }
        ],
        roles: [
          { id: "role_1_1", name: "Disclosing Party", role: "signer", routingOrder: 1 },
          { id: "role_1_2", name: "Receiving Party", role: "signer", routingOrder: 2 }
        ],
        fields: [
          { id: "tfield_1_1", type: "signature", roleId: "role_1_1", documentId: "tdoc_1_1", pageNumber: 3, x: 100, y: 750, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_1_2", type: "dateSigned", roleId: "role_1_1", documentId: "tdoc_1_1", pageNumber: 3, x: 350, y: 760, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_1_3", type: "name", roleId: "role_1_1", documentId: "tdoc_1_1", pageNumber: 3, x: 100, y: 700, width: 150, height: 30, required: true, label: "Printed Name" },
          { id: "tfield_1_4", type: "signature", roleId: "role_1_2", documentId: "tdoc_1_1", pageNumber: 3, x: 450, y: 750, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_1_5", type: "dateSigned", roleId: "role_1_2", documentId: "tdoc_1_1", pageNumber: 3, x: 650, y: 760, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_1_6", type: "name", roleId: "role_1_2", documentId: "tdoc_1_1", pageNumber: 3, x: 450, y: 700, width: 150, height: 30, required: true, label: "Printed Name" }
        ]
      },
      {
        id: "tmpl_2",
        name: "Employment Agreement",
        description: "Standard employment offer letter with compensation details",
        createdAt: "2024-07-15T09:00:00Z",
        lastUsedAt: "2025-01-10T09:00:00Z",
        usageCount: 8,
        ownerId: "user_1",
        shared: true,
        documents: [
          { id: "tdoc_2_1", name: "Employment_Agreement_Template.pdf", pageCount: 4, order: 1, fileUrl: "https://picsum.photos/seed/tmpl2/800/1100", fileType: "pdf" }
        ],
        roles: [
          { id: "role_2_1", name: "New Hire", role: "signer", routingOrder: 1 },
          { id: "role_2_2", name: "HR Manager", role: "cc", routingOrder: 2 }
        ],
        fields: [
          { id: "tfield_2_1", type: "signature", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 100, y: 600, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_2_2", type: "dateSigned", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 350, y: 610, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_2_3", type: "name", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 100, y: 550, width: 150, height: 30, required: true, label: "Full Name" },
          { id: "tfield_2_4", type: "text", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 100, y: 660, width: 200, height: 30, required: false, label: "Address" },
          { id: "tfield_2_5", type: "email", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 100, y: 700, width: 180, height: 30, required: true, label: "Email" },
          { id: "tfield_2_6", type: "text", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 350, y: 660, width: 150, height: 30, required: false, label: "Phone Number" },
          { id: "tfield_2_7", type: "dateSigned", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 350, y: 700, width: 120, height: 30, required: true, label: "Start Date" },
          { id: "tfield_2_8", type: "checkbox", roleId: "role_2_1", documentId: "tdoc_2_1", pageNumber: 4, x: 100, y: 740, width: 20, height: 20, required: false, label: "I agree to the terms" }
        ]
      },
      {
        id: "tmpl_3",
        name: "Sales Contract",
        description: "Standard sales contract for product/service agreements",
        createdAt: "2024-08-20T14:00:00Z",
        lastUsedAt: "2025-02-05T11:00:00Z",
        usageCount: 12,
        ownerId: "user_1",
        shared: true,
        documents: [
          { id: "tdoc_3_1", name: "Sales_Contract_Template.pdf", pageCount: 6, order: 1, fileUrl: "https://picsum.photos/seed/tmpl3/800/1100", fileType: "pdf" }
        ],
        roles: [
          { id: "role_3_1", name: "Seller", role: "signer", routingOrder: 1 },
          { id: "role_3_2", name: "Buyer", role: "signer", routingOrder: 2 }
        ],
        fields: [
          { id: "tfield_3_1", type: "signature", roleId: "role_3_1", documentId: "tdoc_3_1", pageNumber: 6, x: 80, y: 700, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_3_2", type: "dateSigned", roleId: "role_3_1", documentId: "tdoc_3_1", pageNumber: 6, x: 300, y: 710, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_3_3", type: "name", roleId: "role_3_1", documentId: "tdoc_3_1", pageNumber: 6, x: 80, y: 650, width: 150, height: 30, required: true, label: "Seller Name" },
          { id: "tfield_3_4", type: "company", roleId: "role_3_1", documentId: "tdoc_3_1", pageNumber: 6, x: 80, y: 760, width: 150, height: 30, required: true, label: "Company" },
          { id: "tfield_3_5", type: "title", roleId: "role_3_1", documentId: "tdoc_3_1", pageNumber: 6, x: 250, y: 760, width: 150, height: 30, required: false, label: "Title" },
          { id: "tfield_3_6", type: "signature", roleId: "role_3_2", documentId: "tdoc_3_1", pageNumber: 6, x: 450, y: 700, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_3_7", type: "dateSigned", roleId: "role_3_2", documentId: "tdoc_3_1", pageNumber: 6, x: 670, y: 710, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_3_8", type: "name", roleId: "role_3_2", documentId: "tdoc_3_1", pageNumber: 6, x: 450, y: 650, width: 150, height: 30, required: true, label: "Buyer Name" },
          { id: "tfield_3_9", type: "company", roleId: "role_3_2", documentId: "tdoc_3_1", pageNumber: 6, x: 450, y: 760, width: 150, height: 30, required: true, label: "Company" },
          { id: "tfield_3_10", type: "title", roleId: "role_3_2", documentId: "tdoc_3_1", pageNumber: 6, x: 620, y: 760, width: 150, height: 30, required: false, label: "Title" }
        ]
      },
      {
        id: "tmpl_4",
        name: "Lease Agreement",
        description: "Commercial lease agreement for office spaces",
        createdAt: "2024-10-10T16:00:00Z",
        lastUsedAt: "2025-01-05T13:00:00Z",
        usageCount: 3,
        ownerId: "user_1",
        shared: false,
        documents: [
          { id: "tdoc_4_1", name: "Lease_Agreement_Template.pdf", pageCount: 10, order: 1, fileUrl: "https://picsum.photos/seed/tmpl4a/800/1100", fileType: "pdf" },
          { id: "tdoc_4_2", name: "Lease_Exhibit_A.pdf", pageCount: 2, order: 2, fileUrl: "https://picsum.photos/seed/tmpl4b/800/1100", fileType: "pdf" }
        ],
        roles: [
          { id: "role_4_1", name: "Landlord", role: "signer", routingOrder: 1 },
          { id: "role_4_2", name: "Tenant", role: "signer", routingOrder: 2 }
        ],
        fields: [
          { id: "tfield_4_1", type: "signature", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 400, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_4_2", type: "dateSigned", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 10, x: 300, y: 410, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_4_3", type: "initial", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 5, x: 650, y: 950, width: 80, height: 40, required: true, label: "" },
          { id: "tfield_4_4", type: "name", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 350, width: 150, height: 30, required: true, label: "Landlord Name" },
          { id: "tfield_4_5", type: "company", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 460, width: 150, height: 30, required: true, label: "Company" },
          { id: "tfield_4_6", type: "text", roleId: "role_4_1", documentId: "tdoc_4_1", pageNumber: 10, x: 250, y: 460, width: 200, height: 30, required: false, label: "Property Address" },
          { id: "tfield_4_7", type: "signature", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 580, width: 200, height: 50, required: true, label: "" },
          { id: "tfield_4_8", type: "dateSigned", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 10, x: 300, y: 590, width: 120, height: 30, required: true, label: "" },
          { id: "tfield_4_9", type: "initial", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 5, x: 650, y: 1000, width: 80, height: 40, required: true, label: "" },
          { id: "tfield_4_10", type: "name", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 530, width: 150, height: 30, required: true, label: "Tenant Name" },
          { id: "tfield_4_11", type: "company", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 10, x: 80, y: 640, width: 150, height: 30, required: true, label: "Company" },
          { id: "tfield_4_12", type: "email", roleId: "role_4_2", documentId: "tdoc_4_1", pageNumber: 10, x: 250, y: 640, width: 180, height: 30, required: true, label: "Contact Email" }
        ]
      }
    ],

    folders: [
      {
        id: "folder_1",
        name: "Q1 2025 Contracts",
        parentFolder: null,
        createdAt: "2025-01-02T08:00:00Z"
      },
      {
        id: "folder_2",
        name: "HR Documents",
        parentFolder: null,
        createdAt: "2025-01-02T08:05:00Z"
      }
    ],

    contacts: [
      { id: "contact_1", name: "Alice Williams", email: "a.williams@partnercorp.com", company: "Partner Corp", title: "Legal Counsel" },
      { id: "contact_2", name: "James Liu", email: "j.liu@partnercorp.com", company: "Partner Corp", title: "Director of Partnerships" },
      { id: "contact_3", name: "Patricia Nakamura", email: "p.nakamura@legalassociates.com", company: "Legal Associates", title: "Senior Attorney" },
      { id: "contact_4", name: "David Kim", email: "d.kim@techstart.io", company: "TechStart Inc", title: "CTO" },
      { id: "contact_5", name: "Lisa Patel", email: "l.patel@techstart.io", company: "TechStart Inc", title: "COO" },
      { id: "contact_6", name: "Michael Torres", email: "m.torres@globalventures.com", company: "Global Ventures", title: "Managing Partner" },
      { id: "contact_7", name: "Robert Chang", email: "r.chang@summitllc.com", company: "Summit LLC", title: "CEO" },
      { id: "contact_8", name: "Jennifer Park", email: "j.park@globalventures.com", company: "Global Ventures", title: "VP of Business Development" }
    ],

    auditLog: [
      { id: "audit_1", timestamp: "2024-12-15T10:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: Digital Transformation Proposal", envelopeId: "env_8" },
      { id: "audit_2", timestamp: "2024-12-15T10:30:00Z", action: "SEND_ENVELOPE", details: "Sent envelope env_8 to 1 recipient", envelopeId: "env_8" },
      { id: "audit_3", timestamp: "2025-01-02T09:00:00Z", action: "VOID_ENVELOPE", details: "Voided envelope env_8: Proposal superseded", envelopeId: "env_8" },
      { id: "audit_4", timestamp: "2025-01-05T13:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: Office Lease Agreement", envelopeId: "env_7" },
      { id: "audit_5", timestamp: "2025-01-05T13:15:00Z", action: "SEND_ENVELOPE", details: "Sent envelope env_7 to 2 recipients", envelopeId: "env_7" },
      { id: "audit_6", timestamp: "2025-01-08T10:45:00Z", action: "COMPLETE_ENVELOPE", details: "Envelope env_7 completed - all signed", envelopeId: "env_7" },
      { id: "audit_7", timestamp: "2025-01-10T09:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: Employment Offer - Maria Santos", envelopeId: "env_6" },
      { id: "audit_8", timestamp: "2025-01-10T09:15:00Z", action: "SEND_ENVELOPE", details: "Sent envelope env_6 to 1 recipient", envelopeId: "env_6" },
      { id: "audit_9", timestamp: "2025-01-11T11:30:00Z", action: "COMPLETE_ENVELOPE", details: "Envelope env_6 completed - all signed", envelopeId: "env_6" },
      { id: "audit_10", timestamp: "2025-01-18T08:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: IT Services Agreement", envelopeId: "env_9" },
      { id: "audit_11", timestamp: "2025-01-18T08:15:00Z", action: "SEND_ENVELOPE", details: "Sent envelope env_9 to 2 recipients", envelopeId: "env_9" },
      { id: "audit_12", timestamp: "2025-01-19T14:00:00Z", action: "DECLINE_ENVELOPE", details: "Envelope env_9 declined by David Kim", envelopeId: "env_9" },
      { id: "audit_13", timestamp: "2025-01-20T08:30:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: Partnership Agreement", envelopeId: "env_5" },
      { id: "audit_14", timestamp: "2025-01-28T10:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: NDA - TechStart", envelopeId: "env_3" },
      { id: "audit_15", timestamp: "2025-02-01T11:00:00Z", action: "CREATE_ENVELOPE", details: "Created envelope: Vendor Agreement - Summit", envelopeId: "env_4" }
    ]
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else { result[key] = custom[key]; }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const d = deepMergeWithDefaults(getDefaultState(), customState);
    localStorage.setItem(sk, JSON.stringify(d));
    localStorage.setItem(ik, JSON.stringify(d));
    return d;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const d = getDefaultState();
  localStorage.setItem(sk, JSON.stringify(d));
  localStorage.setItem(ik, JSON.stringify(d));
  return d;
};
