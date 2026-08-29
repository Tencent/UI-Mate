# XayPal Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure used by `dataManager.js` (currently `src/lib/initialData.js`).

---

## Entity Types

### 1. User (singleton)

The currently logged-in user. Always exactly one.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"u_1"` | Unique identifier |
| `name` | string | `"Alex Johnson"` | Display name |
| `email` | string | `"alex.johnson@email.com"` | Primary email |
| `phone` | string | `"+1 (555) 123-4567"` | Phone number |
| `balance` | number | `4250.50` | XayPal balance in primary currency |
| `currency` | string | `"USD"` | Primary currency code |
| `avatar` | string | `"https://..."` | Profile picture URL |
| `address` | object | `{ street, city, state, zip, country }` | Mailing address |
| `businessName` | string \| null | `null` | If freelancer/business |
| `accountType` | string | `"personal"` | `"personal"` or `"business"` |
| `verified` | boolean | `true` | Account verification status |

### 2. Contact

People the user has transacted with or added.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"c_1"` | Unique identifier |
| `name` | string | `"Sarah Smith"` | Display name |
| `email` | string | `"sarah@example.com"` | Email address |
| `phone` | string \| null | `"+1 (555) 234-5678"` | Optional phone |
| `avatar` | string | URL or `null` | Profile picture |
| `initials` | string | `"SS"` | Derived from name, for avatar fallback |
| `initialsColor` | string | `"#e91e63"` | Background color for initials avatar |
| `isFavorite` | boolean | `false` | Pinned/favorite contact |

### 3. Transaction

All financial activities — payments sent, received, withdrawals, refunds, requests.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"t_1"` | Unique identifier |
| `type` | string | `"payment_sent"` | One of: `payment_sent`, `payment_received`, `withdrawal`, `deposit`, `refund`, `request_sent`, `request_received`, `invoice_payment` |
| `amount` | number | `150.00` | Absolute amount |
| `currency` | string | `"USD"` | Currency code |
| `fee` | number | `0.00` | Transaction fee (if any) |
| `netAmount` | number | `150.00` | Amount after fees |
| `recipientName` | string | `"Sarah Smith"` | For outgoing payments |
| `recipientEmail` | string | `"sarah@example.com"` | For outgoing payments |
| `senderName` | string | `"Mike Johnson"` | For incoming payments |
| `senderEmail` | string | `"mike@example.com"` | For incoming payments |
| `destination` | string | `"Chase Bank ****4422"` | For withdrawals |
| `source` | string | `"XayPal balance"` | Payment source |
| `date` | string (ISO) | `"2025-03-07T10:30:00Z"` | Transaction timestamp |
| `status` | string | `"completed"` | One of: `completed`, `pending`, `failed`, `refunded`, `cancelled`, `on_hold` |
| `description` | string | `"Dinner split"` | User-entered note or auto description |
| `category` | string | `"personal"` | `"personal"`, `"goods"`, `"services"` |
| `transactionId` | string | `"TXN-8A3F2B1D"` | Public transaction ID |
| `relatedInvoiceId` | string \| null | `"inv_1"` | If linked to an invoice |

### 4. PaymentMethod

Linked cards and bank accounts.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"pm_1"` | Unique identifier |
| `type` | string | `"card"` | `"card"` or `"bank"` |
| `brand` | string | `"Visa"` | Card brand: Visa, Mastercard, Amex, Discover |
| `bankName` | string | `"Chase"` | Bank name (for bank type) |
| `last4` | string | `"4242"` | Last 4 digits |
| `expiry` | string | `"12/26"` | Card expiry (MM/YY) |
| `accountType` | string | `"checking"` | `"checking"` or `"savings"` (for banks) |
| `verified` | boolean | `true` | Verification status |
| `isDefault` | boolean | `false` | Default payment method |
| `cardholderName` | string | `"Alex Johnson"` | Name on card |
| `addedDate` | string (ISO) | `"2024-01-15T00:00:00Z"` | When linked |

### 5. Invoice

Invoices created and sent by the user.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"inv_1"` | Unique identifier |
| `number` | string | `"INV-0001"` | Human-readable invoice number |
| `recipientName` | string | `"Acme Corp"` | Client/recipient name |
| `recipientEmail` | string | `"billing@acme.com"` | Client email |
| `amount` | number | `1200.00` | Total invoice amount |
| `currency` | string | `"USD"` | Currency |
| `status` | string | `"sent"` | One of: `draft`, `sent`, `viewed`, `paid`, `overdue`, `cancelled` |
| `createdDate` | string (ISO) | `"2025-03-01T00:00:00Z"` | Date created |
| `dueDate` | string (ISO) | `"2025-03-31T00:00:00Z"` | Payment due date |
| `paidDate` | string (ISO) \| null | `null` | Date payment received |
| `items` | InvoiceItem[] | See below | Line items |
| `note` | string | `"Thank you for your business"` | Optional note to recipient |
| `terms` | string | `"Net 30"` | Payment terms |
| `tax` | number | `0` | Tax percentage |

### 5a. InvoiceItem (sub-entity, nested in Invoice)

| Field | Type | Example |
|-------|------|---------|
| `description` | string | `"Web Design Services"` |
| `quantity` | number | `1` |
| `price` | number | `1200.00` |

### 6. Notification

In-app notifications and alerts.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"n_1"` | Unique identifier |
| `type` | string | `"payment_received"` | `payment_received`, `payment_sent`, `request_received`, `invoice_paid`, `security`, `system`, `promotion` |
| `title` | string | `"Payment received"` | Short title |
| `message` | string | `"Mike Johnson sent you $150.00"` | Full message |
| `read` | boolean | `false` | Read/unread status |
| `date` | string (ISO) | `"2025-03-09T14:00:00Z"` | Notification timestamp |
| `actionUrl` | string \| null | `"/activity"` | Link to navigate to |
| `relatedId` | string \| null | `"t_2"` | Related transaction/invoice ID |

### 7. Subscription (optional/stretch)

Recurring payment subscriptions managed through XayPal.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"sub_1"` | Unique identifier |
| `merchantName` | string | `"Netflix"` | Service name |
| `merchantLogo` | string | URL | Merchant logo |
| `amount` | number | `15.99` | Recurring amount |
| `currency` | string | `"USD"` | Currency |
| `frequency` | string | `"monthly"` | `"monthly"`, `"yearly"`, `"weekly"` |
| `status` | string | `"active"` | `"active"`, `"paused"`, `"cancelled"` |
| `nextBillingDate` | string (ISO) | `"2025-04-01T00:00:00Z"` | Next charge date |
| `startDate` | string (ISO) | `"2024-06-15T00:00:00Z"` | Subscription start |
| `paymentMethodId` | string | `"pm_1"` | Linked payment method |

### 8. PaymentLink

Shareable payment links for receiving money.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"pl_1"` | Unique identifier |
| `description` | string | `"Consulting Session"` | Description |
| `amount` | number \| null | `100.00` | Fixed amount or null for any amount |
| `currency` | string | `"USD"` | Currency |
| `url` | string | `"https://paypal.me/alexjohnson/100"` | Shareable URL |
| `active` | boolean | `true` | Whether link is active |
| `createdDate` | string (ISO) | `"2025-03-05T00:00:00Z"` | Creation date |
| `timesUsed` | number | `3` | Number of payments received |
| `totalCollected` | number | `300.00` | Total amount collected |

---

## Entity Relationships

```
User (1) ───── (*) Transaction       (user is sender or receiver)
User (1) ───── (*) Contact           (user's contact list)
User (1) ───── (*) PaymentMethod     (user's linked cards/banks)
User (1) ───── (*) Invoice           (invoices created by user)
User (1) ───── (*) Notification      (user's notifications)
User (1) ───── (*) Subscription      (user's subscriptions)
User (1) ───── (*) PaymentLink       (user's payment links)

Transaction (*) ─── (0..1) Invoice   (invoice payments link to invoice)
Invoice (1) ──────── (*) InvoiceItem (line items within invoice)
Subscription (*) ─── (1) PaymentMethod (charged to specific method)
```

---

## Suggested `createInitialData()` Structure

```javascript
export const INITIAL_STATE = {
  user: {
    id: "u_1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    balance: 4250.50,
    currency: "USD",
    avatar: null, // Use initials avatar
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "US"
    },
    businessName: null,
    accountType: "personal",
    verified: true
  },

  contacts: [
    // 8-10 contacts for realistic "Send again" section
    { id: "c_1", name: "Sarah Smith", email: "sarah.smith@email.com", phone: "+1 (555) 234-5678", avatar: null, initials: "SS", initialsColor: "#e91e63", isFavorite: true },
    { id: "c_2", name: "Mike Johnson", email: "mike.j@email.com", phone: "+1 (555) 345-6789", avatar: null, initials: "MJ", initialsColor: "#2196f3", isFavorite: true },
    { id: "c_3", name: "Emily Chen", email: "emily.chen@email.com", phone: null, avatar: null, initials: "EC", initialsColor: "#4caf50", isFavorite: false },
    { id: "c_4", name: "Tech Gadgets Inc", email: "billing@techgadgets.com", phone: null, avatar: null, initials: "TG", initialsColor: "#ff9800", isFavorite: false },
    { id: "c_5", name: "David Wilson", email: "d.wilson@email.com", phone: "+1 (555) 456-7890", avatar: null, initials: "DW", initialsColor: "#9c27b0", isFavorite: false },
    { id: "c_6", name: "Lisa Anderson", email: "lisa.a@email.com", phone: null, avatar: null, initials: "LA", initialsColor: "#f44336", isFavorite: true },
    { id: "c_7", name: "Robert Brown", email: "r.brown@email.com", phone: "+1 (555) 567-8901", avatar: null, initials: "RB", initialsColor: "#00bcd4", isFavorite: false },
    { id: "c_8", name: "Jennifer Lee", email: "jen.lee@email.com", phone: null, avatar: null, initials: "JL", initialsColor: "#ff5722", isFavorite: false }
  ],

  transactions: [
    // 12-15 transactions covering various types for realistic activity page
    // Mix of: payment_sent, payment_received, withdrawal, refund, request_sent
    // Dates spread over last 30 days
    {
      id: "t_1", type: "payment_sent", amount: 12.50, currency: "USD", fee: 0,
      netAmount: 12.50, recipientName: "Starbucks", recipientEmail: "orders@starbucks.com",
      senderName: null, senderEmail: null, destination: null, source: "XayPal balance",
      date: /* 2 hours ago */, status: "completed", description: "Morning Coffee",
      category: "goods", transactionId: "TXN-A1B2C3D4", relatedInvoiceId: null
    },
    {
      id: "t_2", type: "payment_received", amount: 150.00, currency: "USD", fee: 0,
      netAmount: 150.00, recipientName: null, recipientEmail: null,
      senderName: "Mike Johnson", senderEmail: "mike.j@email.com",
      destination: null, source: null,
      date: /* 1 day ago */, status: "completed", description: "Dinner split",
      category: "personal", transactionId: "TXN-E5F6G7H8", relatedInvoiceId: null
    },
    {
      id: "t_3", type: "withdrawal", amount: 500.00, currency: "USD", fee: 0,
      netAmount: 500.00, recipientName: null, recipientEmail: null,
      senderName: null, senderEmail: null,
      destination: "Chase Bank ····4422", source: "XayPal balance",
      date: /* 3 days ago */, status: "completed", description: "Transfer to bank",
      category: "personal", transactionId: "TXN-I9J0K1L2", relatedInvoiceId: null
    },
    {
      id: "t_4", type: "payment_sent", amount: 45.99, currency: "USD", fee: 0,
      netAmount: 45.99, recipientName: "Amazon", recipientEmail: "payments@amazon.com",
      senderName: null, senderEmail: null, destination: null, source: "Visa ····4242",
      date: /* 4 days ago */, status: "completed", description: "Online purchase",
      category: "goods", transactionId: "TXN-M3N4O5P6", relatedInvoiceId: null
    },
    {
      id: "t_5", type: "payment_received", amount: 1200.00, currency: "USD", fee: 4.50,
      netAmount: 1195.50, recipientName: null, recipientEmail: null,
      senderName: "Acme Corp", senderEmail: "billing@acme.com",
      destination: null, source: null,
      date: /* 5 days ago */, status: "completed", description: "Invoice #INV-0001 payment",
      category: "services", transactionId: "TXN-Q7R8S9T0", relatedInvoiceId: "inv_1"
    },
    {
      id: "t_6", type: "payment_sent", amount: 25.00, currency: "USD", fee: 0,
      netAmount: 25.00, recipientName: "Sarah Smith", recipientEmail: "sarah.smith@email.com",
      senderName: null, senderEmail: null, destination: null, source: "XayPal balance",
      date: /* 7 days ago */, status: "completed", description: "Lunch",
      category: "personal", transactionId: "TXN-U1V2W3X4", relatedInvoiceId: null
    },
    {
      id: "t_7", type: "refund", amount: 29.99, currency: "USD", fee: 0,
      netAmount: 29.99, recipientName: null, recipientEmail: null,
      senderName: "Tech Gadgets Inc", senderEmail: "billing@techgadgets.com",
      destination: null, source: null,
      date: /* 8 days ago */, status: "completed", description: "Refund for order #12345",
      category: "goods", transactionId: "TXN-Y5Z6A7B8", relatedInvoiceId: null
    },
    {
      id: "t_8", type: "payment_received", amount: 75.00, currency: "USD", fee: 0,
      netAmount: 75.00, recipientName: null, recipientEmail: null,
      senderName: "Emily Chen", senderEmail: "emily.chen@email.com",
      destination: null, source: null,
      date: /* 10 days ago */, status: "completed", description: "Concert tickets",
      category: "personal", transactionId: "TXN-C9D0E1F2", relatedInvoiceId: null
    },
    {
      id: "t_9", type: "request_sent", amount: 50.00, currency: "USD", fee: 0,
      netAmount: 50.00, recipientName: "David Wilson", recipientEmail: "d.wilson@email.com",
      senderName: null, senderEmail: null, destination: null, source: null,
      date: /* 12 days ago */, status: "pending", description: "Camping supplies share",
      category: "personal", transactionId: "TXN-G3H4I5J6", relatedInvoiceId: null
    },
    {
      id: "t_10", type: "payment_sent", amount: 89.00, currency: "USD", fee: 0,
      netAmount: 89.00, recipientName: "Spotify", recipientEmail: "billing@spotify.com",
      senderName: null, senderEmail: null, destination: null, source: "Visa ····4242",
      date: /* 15 days ago */, status: "completed", description: "Annual subscription",
      category: "services", transactionId: "TXN-K7L8M9N0", relatedInvoiceId: null
    },
    {
      id: "t_11", type: "payment_received", amount: 320.00, currency: "USD", fee: 1.20,
      netAmount: 318.80, recipientName: null, recipientEmail: null,
      senderName: "Robert Brown", senderEmail: "r.brown@email.com",
      destination: null, source: null,
      date: /* 18 days ago */, status: "completed", description: "Freelance project payment",
      category: "services", transactionId: "TXN-O1P2Q3R4", relatedInvoiceId: null
    },
    {
      id: "t_12", type: "withdrawal", amount: 1000.00, currency: "USD", fee: 0,
      netAmount: 1000.00, recipientName: null, recipientEmail: null,
      senderName: null, senderEmail: null,
      destination: "Chase Bank ····4422", source: "XayPal balance",
      date: /* 20 days ago */, status: "completed", description: "Transfer to bank",
      category: "personal", transactionId: "TXN-S5T6U7V8", relatedInvoiceId: null
    }
  ],

  paymentMethods: [
    { id: "pm_1", type: "card", brand: "Visa", bankName: null, last4: "4242", expiry: "12/26", accountType: null, verified: true, isDefault: true, cardholderName: "Alex Johnson", addedDate: "2024-01-15T00:00:00Z" },
    { id: "pm_2", type: "bank", brand: null, bankName: "Chase", last4: "4422", expiry: null, accountType: "checking", verified: true, isDefault: false, cardholderName: "Alex Johnson", addedDate: "2024-02-20T00:00:00Z" },
    { id: "pm_3", type: "card", brand: "Mastercard", bankName: null, last4: "8910", expiry: "03/27", accountType: null, verified: true, isDefault: false, cardholderName: "Alex Johnson", addedDate: "2024-06-10T00:00:00Z" }
  ],

  invoices: [
    {
      id: "inv_1", number: "INV-0001", recipientName: "Acme Corp",
      recipientEmail: "billing@acme.com", amount: 1200.00, currency: "USD",
      status: "paid", createdDate: /* 30 days ago */, dueDate: /* 15 days ago */,
      paidDate: /* 5 days ago */,
      items: [{ description: "Web Design Services", quantity: 1, price: 1200.00 }],
      note: "Thank you for your business", terms: "Net 30", tax: 0
    },
    {
      id: "inv_2", number: "INV-0002", recipientName: "StartupXYZ",
      recipientEmail: "finance@startupxyz.com", amount: 850.00, currency: "USD",
      status: "sent", createdDate: /* 7 days ago */, dueDate: /* 23 days from now */,
      paidDate: null,
      items: [
        { description: "Logo Design", quantity: 1, price: 500.00 },
        { description: "Brand Guidelines Document", quantity: 1, price: 350.00 }
      ],
      note: "Payment due within 30 days", terms: "Net 30", tax: 0
    },
    {
      id: "inv_3", number: "INV-0003", recipientName: "Freelance Client",
      recipientEmail: "john.doe@company.com", amount: 2500.00, currency: "USD",
      status: "overdue", createdDate: /* 45 days ago */, dueDate: /* 15 days ago */,
      paidDate: null,
      items: [
        { description: "Consulting - Strategy Session", quantity: 5, price: 200.00 },
        { description: "Research Report", quantity: 1, price: 1500.00 }
      ],
      note: "", terms: "Net 30", tax: 0
    },
    {
      id: "inv_4", number: "INV-0004", recipientName: "Local Coffee Shop",
      recipientEmail: "owner@localcoffee.com", amount: 175.00, currency: "USD",
      status: "draft", createdDate: /* 1 day ago */, dueDate: /* 29 days from now */,
      paidDate: null,
      items: [{ description: "Menu Photography", quantity: 1, price: 175.00 }],
      note: "", terms: "Net 30", tax: 0
    }
  ],

  notifications: [
    { id: "n_1", type: "payment_received", title: "Payment received", message: "Mike Johnson sent you $150.00", read: false, date: /* 1 day ago */, actionUrl: "/activity", relatedId: "t_2" },
    { id: "n_2", type: "security", title: "Security alert", message: "New login from Chrome on macOS", read: false, date: /* 2 days ago */, actionUrl: null, relatedId: null },
    { id: "n_3", type: "invoice_paid", title: "Invoice paid", message: "Acme Corp paid invoice #INV-0001 ($1,200.00)", read: true, date: /* 5 days ago */, actionUrl: "/invoices", relatedId: "inv_1" },
    { id: "n_4", type: "system", title: "Account verified", message: "Your Mastercard ending in 8910 has been verified", read: true, date: /* 10 days ago */, actionUrl: "/wallet", relatedId: "pm_3" },
    { id: "n_5", type: "payment_sent", title: "Payment sent", message: "You sent $25.00 to Sarah Smith", read: true, date: /* 7 days ago */, actionUrl: "/activity", relatedId: "t_6" }
  ],

  subscriptions: [
    { id: "sub_1", merchantName: "Netflix", merchantLogo: null, amount: 15.99, currency: "USD", frequency: "monthly", status: "active", nextBillingDate: /* 15 days from now */, startDate: "2023-06-15T00:00:00Z", paymentMethodId: "pm_1" },
    { id: "sub_2", merchantName: "Spotify", merchantLogo: null, amount: 9.99, currency: "USD", frequency: "monthly", status: "active", nextBillingDate: /* 22 days from now */, startDate: "2023-09-01T00:00:00Z", paymentMethodId: "pm_1" },
    { id: "sub_3", merchantName: "Adobe Creative Cloud", merchantLogo: null, amount: 54.99, currency: "USD", frequency: "monthly", status: "active", nextBillingDate: /* 8 days from now */, startDate: "2024-01-10T00:00:00Z", paymentMethodId: "pm_3" }
  ],

  paymentLinks: [
    { id: "pl_1", description: "Consulting Session", amount: 100.00, currency: "USD", url: "https://paypal.me/alexjohnson/100", active: true, createdDate: /* 14 days ago */, timesUsed: 3, totalCollected: 300.00 },
    { id: "pl_2", description: "Donate to My Project", amount: null, currency: "USD", url: "https://paypal.me/alexjohnson", active: true, createdDate: /* 30 days ago */, timesUsed: 7, totalCollected: 185.00 }
  ],

  // UI state (not persisted to /go endpoint, but tracked for session)
  settings: {
    language: "en",
    timezone: "America/Los_Angeles",
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    autoAcceptPayments: true,
    defaultCurrency: "USD"
  }
};
```

---

## Notes for Dev Agent

1. **Dates should be relative to `Date.now()`** — use expressions like `new Date(Date.now() - 1000*60*60*24*N).toISOString()` to generate dates relative to when the app loads, so data always looks fresh.

2. **Initials avatars**: When `avatar` is null, render a colored circle with white initials using `initialsColor`. This matches the real XayPal UI (see `dashboard_03.jpg`).

3. **Transaction IDs**: Use format `TXN-XXXXXXXX` (8 alphanumeric chars) for realistic transaction identifiers.

4. **Balance consistency**: The seed balance ($4,250.50) doesn't need to mathematically match all transactions — it's a snapshot balance.

5. **Invoice amounts**: Include a variety of statuses (paid, sent, overdue, draft) so the invoice list looks realistic and filterable.

6. **Subscriptions and PaymentLinks**: These are P2 features. Include seed data but implementation of management UI can come later.
