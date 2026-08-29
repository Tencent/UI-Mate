# Xtripe Dashboard — Data Model

This document defines all entity types, their fields, relationships, and example values for the mock Xtripe Dashboard. The dev agent should use this as the schema reference when implementing `dataManager.js` and its `createInitialData()` function.

---

## ID Convention

All Xtripe objects use prefixed IDs:
- Payments: `pi_` (PaymentIntent) or `ch_` (Charge)
- Customers: `cus_`
- Products: `prod_`
- Prices: `price_`
- Invoices: `in_`
- Subscriptions: `sub_`
- Payouts: `po_`
- Disputes: `dp_`
- Refunds: `re_`
- Balance Transactions: `txn_`
- Events: `evt_`
- Payment Methods: `pm_`

IDs are followed by a random alphanumeric string (e.g., `pi_3N1x2kFj49a8cB`).

---

## 1. Payment (PaymentIntent / Charge)

The core transaction record. In the mock, we combine PaymentIntent and Charge into a single entity.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `pi_` prefix | `"pi_3N1x2kFj49a8cB"` |
| `amount` | integer | Amount in cents | `4999` (= $49.99) |
| `currency` | string | 3-letter ISO code, lowercase | `"usd"` |
| `status` | enum | Payment status | `"succeeded"` |
| `description` | string\|null | Payment description | `"Subscription to Pro Plan"` |
| `customer` | string\|null | Customer ID reference | `"cus_P1a2b3c4d5e6f"` |
| `customer_email` | string\|null | Customer email (denormalized) | `"jane@example.com"` |
| `customer_name` | string\|null | Customer name (denormalized) | `"Jane Smith"` |
| `payment_method` | object | Payment method details | `{ type: "card", card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2025 } }` |
| `amount_received` | integer | Amount actually collected | `4999` |
| `amount_refunded` | integer | Amount refunded so far | `0` |
| `refunded` | boolean | Fully refunded? | `false` |
| `disputed` | boolean | Has active dispute? | `false` |
| `captured` | boolean | Has been captured? | `true` |
| `receipt_email` | string\|null | Email to send receipt | `"jane@example.com"` |
| `receipt_url` | string\|null | Receipt URL | `"https://pay.stripe.com/receipts/..."` |
| `metadata` | object | Key-value metadata | `{ order_id: "ORD-1234" }` |
| `created` | integer | Unix timestamp | `1700000000` |
| `livemode` | boolean | Live or test | `true` |
| `risk_score` | integer\|null | 0-100 Radar risk score | `12` |
| `risk_level` | enum\|null | Risk assessment | `"normal"` |
| `outcome` | object | Payment outcome details | `{ type: "authorized", risk_level: "normal", risk_score: 12, reason: null }` |
| `invoice` | string\|null | Linked invoice ID | `"in_1A2b3C4d5E"` |

**Status enum values:** `"succeeded"`, `"pending"`, `"failed"`, `"canceled"`, `"requires_action"`, `"requires_payment_method"`

**Risk level enum:** `"normal"`, `"elevated"`, `"highest"`, `"not_assessed"`

---

## 2. Customer

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `cus_` prefix | `"cus_P1a2b3c4d5e6f"` |
| `name` | string\|null | Full name | `"Jane Smith"` |
| `email` | string\|null | Email address | `"jane@example.com"` |
| `phone` | string\|null | Phone number | `"+1 (555) 123-4567"` |
| `description` | string\|null | Internal description | `"Enterprise customer"` |
| `address` | object\|null | Primary address | `{ line1: "123 Main St", line2: null, city: "San Francisco", state: "CA", postal_code: "94103", country: "US" }` |
| `shipping` | object\|null | Shipping address | Same structure as address, plus name and phone |
| `balance` | integer | Account balance in cents | `0` |
| `currency` | string\|null | Default currency | `"usd"` |
| `default_payment_method` | string\|null | Default PM ID | `"pm_1A2b3C4d5E"` |
| `metadata` | object | Key-value metadata | `{ company: "Acme Inc" }` |
| `created` | integer | Unix timestamp | `1695000000` |
| `livemode` | boolean | Live or test | `true` |
| `delinquent` | boolean | Past due on invoices? | `false` |
| `total_spent` | integer | Total paid amount (computed, for display) | `249500` |
| `payments_count` | integer | Number of payments (computed) | `12` |

---

## 3. Product

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `prod_` prefix | `"prod_A1b2C3d4E5"` |
| `name` | string | Product name | `"Pro Plan"` |
| `description` | string\|null | Customer-facing description | `"Full access to all features"` |
| `active` | boolean | Available for purchase | `true` |
| `images` | string[] | Up to 8 image URLs | `[]` |
| `default_price` | string\|null | Default price ID | `"price_1A2b3C4d5E"` |
| `metadata` | object | Key-value metadata | `{}` |
| `created` | integer | Unix timestamp | `1690000000` |
| `updated` | integer | Last modified | `1700000000` |
| `unit_label` | string\|null | Unit label for metered billing | `"seat"` |

---

## 4. Price

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `price_` prefix | `"price_1A2b3C4d5E"` |
| `product` | string | Product ID reference | `"prod_A1b2C3d4E5"` |
| `active` | boolean | Can be used for new purchases | `true` |
| `currency` | string | 3-letter ISO code | `"usd"` |
| `unit_amount` | integer\|null | Amount in cents (for per_unit) | `2999` |
| `billing_scheme` | enum | `"per_unit"` or `"tiered"` | `"per_unit"` |
| `type` | enum | `"one_time"` or `"recurring"` | `"recurring"` |
| `recurring` | object\|null | Recurring config | `{ interval: "month", interval_count: 1, usage_type: "licensed" }` |
| `nickname` | string\|null | Price nickname | `"Monthly"` |
| `metadata` | object | Key-value metadata | `{}` |
| `created` | integer | Unix timestamp | `1690000000` |

**Recurring interval enum:** `"day"`, `"week"`, `"month"`, `"year"`

---

## 5. Invoice

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `in_` prefix | `"in_1A2b3C4d5E"` |
| `number` | string\|null | Human-readable invoice number | `"INV-0042"` |
| `customer` | string | Customer ID | `"cus_P1a2b3c4d5e6f"` |
| `customer_name` | string\|null | Customer name (denormalized) | `"Jane Smith"` |
| `customer_email` | string\|null | Customer email (denormalized) | `"jane@example.com"` |
| `status` | enum | Invoice status | `"paid"` |
| `amount_due` | integer | Total amount due in cents | `2999` |
| `amount_paid` | integer | Amount that was paid | `2999` |
| `amount_remaining` | integer | Remaining balance | `0` |
| `currency` | string | 3-letter ISO code | `"usd"` |
| `description` | string\|null | Memo/description | `null` |
| `due_date` | integer\|null | Unix timestamp of due date | `1702000000` |
| `collection_method` | enum | How payment is collected | `"charge_automatically"` |
| `billing_reason` | enum | Why invoice was created | `"subscription_cycle"` |
| `subscription` | string\|null | Subscription ID if from sub | `"sub_1A2b3C4d5E"` |
| `lines` | object[] | Invoice line items | See below |
| `subtotal` | integer | Before discounts/tax | `2999` |
| `tax` | integer\|null | Tax amount | `0` |
| `total` | integer | Final total | `2999` |
| `period_start` | integer | Billing period start | `1699000000` |
| `period_end` | integer | Billing period end | `1702000000` |
| `created` | integer | Unix timestamp | `1699000000` |
| `paid_at` | integer\|null | When it was paid | `1699000100` |
| `metadata` | object | Key-value metadata | `{}` |

**Status enum:** `"draft"`, `"open"`, `"paid"`, `"void"`, `"uncollectible"`

**Collection method enum:** `"charge_automatically"`, `"send_invoice"`

**Billing reason enum:** `"manual"`, `"subscription_create"`, `"subscription_cycle"`, `"subscription_update"`

### Invoice Line Item

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Line item ID | `"il_1A2b3C4d5E"` |
| `description` | string | Line description | `"Pro Plan (Monthly)"` |
| `amount` | integer | Amount in cents | `2999` |
| `currency` | string | Currency code | `"usd"` |
| `quantity` | integer | Quantity | `1` |
| `price` | string\|null | Price ID | `"price_1A2b3C4d5E"` |
| `period` | object | `{ start: timestamp, end: timestamp }` | |

---

## 6. Subscription

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `sub_` prefix | `"sub_1A2b3C4d5E"` |
| `customer` | string | Customer ID | `"cus_P1a2b3c4d5e6f"` |
| `customer_name` | string\|null | Denormalized | `"Jane Smith"` |
| `customer_email` | string\|null | Denormalized | `"jane@example.com"` |
| `status` | enum | Subscription status | `"active"` |
| `items` | object[] | Subscription items (product + price) | See below |
| `current_period_start` | integer | Current period start | `1699000000` |
| `current_period_end` | integer | Current period end | `1702000000` |
| `cancel_at_period_end` | boolean | Will cancel at end? | `false` |
| `canceled_at` | integer\|null | Cancellation timestamp | `null` |
| `ended_at` | integer\|null | End timestamp | `null` |
| `trial_start` | integer\|null | Trial start | `null` |
| `trial_end` | integer\|null | Trial end | `null` |
| `collection_method` | enum | How payments collected | `"charge_automatically"` |
| `default_payment_method` | string\|null | PM ID | `"pm_1A2b3C4d5E"` |
| `latest_invoice` | string\|null | Latest invoice ID | `"in_1A2b3C4d5E"` |
| `created` | integer | Unix timestamp | `1695000000` |
| `metadata` | object | Key-value metadata | `{}` |

**Status enum:** `"active"`, `"past_due"`, `"canceled"`, `"unpaid"`, `"trialing"`, `"paused"`, `"incomplete"`

### Subscription Item

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Item ID | `"si_1A2b3C4d5E"` |
| `price` | string | Price ID | `"price_1A2b3C4d5E"` |
| `product` | string | Product ID | `"prod_A1b2C3d4E5"` |
| `product_name` | string | Denormalized product name | `"Pro Plan"` |
| `quantity` | integer | Number of units | `1` |

---

## 7. Payout

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `po_` prefix | `"po_1A2b3C4d5E"` |
| `amount` | integer | Amount in cents | `150000` |
| `currency` | string | Currency code | `"usd"` |
| `status` | enum | Payout status | `"paid"` |
| `arrival_date` | integer | Expected arrival timestamp | `1700200000` |
| `method` | enum | Payout method | `"standard"` |
| `type` | enum | Destination type | `"bank_account"` |
| `description` | string\|null | Description | `"XTRIPE PAYOUT"` |
| `destination` | object | Bank account summary | `{ bank_name: "BANK OF AMERICA", last4: "6789", routing_number: "***4321" }` |
| `created` | integer | Unix timestamp | `1700000000` |
| `metadata` | object | Key-value metadata | `{}` |

**Status enum:** `"paid"`, `"pending"`, `"in_transit"`, `"canceled"`, `"failed"`

**Method enum:** `"standard"`, `"instant"`

---

## 8. Dispute

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `dp_` prefix | `"dp_1A2b3C4d5E"` |
| `amount` | integer | Disputed amount in cents | `4999` |
| `currency` | string | Currency code | `"usd"` |
| `charge` | string | Associated payment ID | `"pi_3N1x2kFj49a8cB"` |
| `customer` | string\|null | Customer ID | `"cus_P1a2b3c4d5e6f"` |
| `reason` | enum | Dispute reason | `"fraudulent"` |
| `status` | enum | Dispute status | `"needs_response"` |
| `evidence_due_by` | integer\|null | Deadline timestamp | `1701500000` |
| `created` | integer | Unix timestamp | `1700500000` |
| `metadata` | object | Key-value metadata | `{}` |

**Reason enum:** `"fraudulent"`, `"product_not_received"`, `"duplicate"`, `"subscription_canceled"`, `"unrecognized"`, `"credit_not_processed"`, `"general"`

**Status enum:** `"needs_response"`, `"under_review"`, `"won"`, `"lost"`, `"warning_needs_response"`, `"warning_under_review"`, `"warning_closed"`

---

## 9. Refund

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `re_` prefix | `"re_1A2b3C4d5E"` |
| `amount` | integer | Refund amount in cents | `4999` |
| `currency` | string | Currency code | `"usd"` |
| `charge` | string | Associated payment ID | `"pi_3N1x2kFj49a8cB"` |
| `reason` | enum\|null | Refund reason | `"requested_by_customer"` |
| `status` | enum | Refund status | `"succeeded"` |
| `created` | integer | Unix timestamp | `1700100000` |
| `metadata` | object | Key-value metadata | `{}` |

**Reason enum:** `"duplicate"`, `"fraudulent"`, `"requested_by_customer"`, `null`

**Status enum:** `"pending"`, `"succeeded"`, `"failed"`, `"canceled"`

---

## 10. Balance Transaction

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `txn_` prefix | `"txn_1A2b3C4d5E"` |
| `amount` | integer | Amount in cents (pos = credit, neg = debit) | `4999` |
| `currency` | string | Currency code | `"usd"` |
| `type` | enum | Transaction type | `"charge"` |
| `fee` | integer | Xtripe fee in cents | `175` |
| `net` | integer | Net amount (amount - fee) | `4824` |
| `status` | enum | `"available"` or `"pending"` | `"available"` |
| `available_on` | integer | When funds become available | `1700200000` |
| `source` | string | Source object ID | `"pi_3N1x2kFj49a8cB"` |
| `description` | string\|null | Description | `"Payment for Pro Plan"` |
| `created` | integer | Unix timestamp | `1700000000` |

**Type enum:** `"charge"`, `"refund"`, `"payout"`, `"adjustment"`, `"stripe_fee"`, `"dispute"`, `"dispute_reversal"`

---

## 11. Event (Audit Log)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `evt_` prefix | `"evt_1A2b3C4d5E"` |
| `type` | string | Event type | `"payment_intent.succeeded"` |
| `created` | integer | Unix timestamp | `1700000000` |
| `data` | object | Event payload | `{ object: { id: "pi_...", amount: 4999 } }` |
| `request` | object\|null | API request that triggered it | `{ id: "req_...", idempotency_key: null }` |
| `livemode` | boolean | Live or test | `true` |

---

## 12. Balance (Singleton)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `available` | integer | Available balance in cents | `553257` |
| `pending` | integer | Pending balance in cents | `125430` |
| `reserved` | integer | Reserved balance | `0` |
| `currency` | string | Primary currency | `"usd"` |

---

## 13. Payment Method

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID with `pm_` prefix | `"pm_1A2b3C4d5E"` |
| `type` | enum | Method type | `"card"` |
| `card` | object\|null | Card details | `{ brand: "visa", last4: "4242", exp_month: 12, exp_year: 2025, funding: "credit" }` |
| `billing_details` | object | Billing info | `{ name: "Jane Smith", email: "jane@example.com", address: {...} }` |
| `created` | integer | Unix timestamp | `1695000000` |
| `customer` | string\|null | Customer ID | `"cus_P1a2b3c4d5e6f"` |

**Card brand enum:** `"visa"`, `"mastercard"`, `"amex"`, `"discover"`, `"jcb"`, `"unionpay"`, `"diners"`

---

## Entity Relationships

```
Customer (1) ──→ (N) Payments
Customer (1) ──→ (N) Subscriptions
Customer (1) ──→ (N) Invoices
Customer (1) ──→ (N) Payment Methods
Customer (1) ──→ (N) Disputes (through payments)

Product (1) ──→ (N) Prices
Product (1) ──→ (N) Subscription Items (through Prices)

Subscription (1) ──→ (N) Subscription Items
Subscription (1) ──→ (N) Invoices

Payment (1) ──→ (N) Refunds
Payment (1) ──→ (0..1) Dispute
Payment (1) ──→ (1) Balance Transaction

Invoice (1) ──→ (N) Line Items
Invoice (1) ──→ (0..1) Payment

Payout (1) ──→ (N) Balance Transactions
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    // Business info
    business: {
      name: "Rocket Rides",
      email: "admin@rocketrides.io",
      url: "https://rocketrides.io",
      support_email: "support@rocketrides.io",
      country: "US",
      currency: "usd",
      timezone: "America/Los_Angeles"
    },

    // Current user (logged-in)
    currentUser: {
      id: "user_admin",
      name: "Alex Johnson",
      email: "alex@rocketrides.io",
      role: "administrator",
      avatar: null
    },

    // Balance singleton
    balance: {
      available: 553257,   // $5,532.57
      pending: 125430,     // $1,254.30
      reserved: 0,
      currency: "usd"
    },

    // Collections
    customers: [...],          // 15-20 customers
    payments: [...],           // 40-50 payments across various statuses
    products: [...],           // 5-8 products
    prices: [...],             // 8-12 prices (some products have multiple prices)
    invoices: [...],           // 20-25 invoices
    subscriptions: [...],      // 8-12 subscriptions
    payouts: [...],            // 10-15 payouts
    disputes: [...],           // 3-5 disputes
    refunds: [...],            // 5-8 refunds
    balanceTransactions: [...], // 50+ transactions
    events: [...],             // 30-40 events
    paymentMethods: [...],     // 15-20 payment methods

    // UI state
    testMode: false,
    searchQuery: "",
    selectedDateRange: "last_4_weeks",

    // Dashboard metrics (pre-computed for charts)
    metrics: {
      today: {
        grossVolume: 352819,         // $3,528.19
        grossVolumeChart: [...],      // Array of { time: "12:00 AM", amount: X } for today
      },
      summary: {
        grossVolume: { amount: 454234545, change: 4.6, previousAmount: 434062124 },
        netVolume: { amount: 418033254, change: 4.2, previousAmount: 401173291 },
        disputeActivity: { rate: 0.36, change: -1.9, previousRate: 0.37 },
      },
      chartData: {
        grossVolume: [...],    // Array of { date: "Jul 18", amount: X } for 4 weeks
        netVolume: [...],
        disputeRate: [...],
      }
    }
  };
}
```

### Seed Data Guidelines

**Customers** (15-20): Mix of personal and business names, US and international addresses, some with multiple payment methods. Include:
- 3-4 high-value enterprise customers (>$1000 total spent)
- 5-6 regular mid-tier customers ($100-$1000)
- 5-6 small/one-time customers (<$100)
- 2-3 delinquent customers

**Payments** (40-50): Spread across last 30 days, variety of amounts ($5-$500), statuses:
- ~70% succeeded
- ~10% pending
- ~10% failed
- ~5% refunded
- ~5% disputed

**Products** (5-8): SaaS-style products like:
- "Starter Plan" ($9.99/mo)
- "Pro Plan" ($29.99/mo)
- "Enterprise Plan" ($99.99/mo)
- "API Access" ($49.99/mo)
- "One-time Setup Fee" ($199.00 one-time)
- "Data Export" ($19.99 one-time)
- "Priority Support" ($149.99/mo)

**Invoices** (20-25): Mix of statuses (draft, open, paid, void), linked to subscriptions and customers.

**Subscriptions** (8-12): Mix of active, past_due, canceled, trialing.

**Payouts** (10-15): Regular bi-weekly payouts, mostly paid, 1-2 pending.

**Disputes** (3-5): Various reasons and statuses.

**Refunds** (5-8): Linked to specific payments, mix of full and partial.

**Balance Transactions** (50+): Comprehensive ledger covering charges, refunds, payouts, fees.

**Events** (30-40): Recent system events covering payment, customer, invoice lifecycle events.
