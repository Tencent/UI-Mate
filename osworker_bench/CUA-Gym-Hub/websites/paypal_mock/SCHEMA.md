# paypal_mock Schema

**Deploy order**: 35 (alphabetical among all *_mock dirs)
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user profile and account info (see User below) |
| `contacts` | array | Address-book contacts for sending/requesting money (see Contact below) |
| `transactions` | array | All transaction history including payments, refunds, withdrawals, requests (see Transaction below) |
| `paymentMethods` | array | Linked cards and bank accounts (see PaymentMethod below) |
| `invoices` | array | Invoices created and received (see Invoice below) |
| `notifications` | array | Notification bell items (see Notification below) |
| `subscriptions` | array | Recurring payment subscriptions (see Subscription below) |
| `paymentLinks` | array | Shareable payment links (see PaymentLink below) |
| `settings` | object | Application preferences (see Settings below) |

**Note**: All monetary amounts are in standard currency units (e.g., `12.50` = $12.50), NOT cents. All timestamps are ISO 8601 strings.

### User

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"u_1"` | User ID |
| `name` | string | `"Alex Johnson"` | Full name |
| `email` | string | `"alex.johnson@email.com"` | Primary email |
| `phone` | string | `"+1 (555) 123-4567"` | Phone number |
| `balance` | number | `4250.50` | XayPal balance in currency units |
| `currency` | string | `"USD"` | Balance currency code |
| `avatar` | string\|null | `null` | Avatar image URL |
| `address` | object | See below | Mailing address |
| `businessName` | string\|null | `null` | Business name (null for personal accounts) |
| `accountType` | string | `"personal"` | `"personal"` or `"business"` |
| `verified` | boolean | `true` | Whether account is verified |

#### User.address

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `street` | string | `"123 Main Street"` | Street address |
| `city` | string | `"San Francisco"` | City |
| `state` | string | `"CA"` | State/province code |
| `zip` | string | `"94105"` | Postal code |
| `country` | string | `"US"` | Country code |

### Contact

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Contact ID (e.g., `"c_1"`) |
| `name` | string | Full name |
| `email` | string | Email address (used to select recipients in Send flow) |
| `phone` | string\|null | Phone number |
| `avatar` | string\|null | Avatar image URL |
| `initials` | string | Two-letter initials for avatar fallback (e.g., `"SS"`) |
| `initialsColor` | string | Hex color for initials avatar background (e.g., `"#e91e63"`) |
| `isFavorite` | boolean | Whether contact appears in "Send again" favorites section |

### Transaction

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Transaction ID (e.g., `"t_1"`) |
| `type` | string | `"payment_sent"\|"payment_received"\|"withdrawal"\|"refund"\|"request_sent"` |
| `amount` | number | Transaction amount in currency units |
| `currency` | string | Currency code (e.g., `"USD"`) |
| `fee` | number | Transaction fee amount |
| `netAmount` | number | Net amount after fees |
| `recipientName` | string\|null | Recipient display name (for sent payments / requests) |
| `recipientEmail` | string\|null | Recipient email address |
| `senderName` | string\|null | Sender display name (for received payments / refunds) |
| `senderEmail` | string\|null | Sender email address |
| `destination` | string\|null | Destination description for withdrawals (e.g., `"Chase Bank ····4422"`) |
| `source` | string\|null | Funding source description (e.g., `"XayPal balance"`, `"Visa ····4242"`) |
| `date` | string | ISO 8601 timestamp |
| `status` | string | `"completed"\|"pending"` |
| `description` | string | Transaction memo/description |
| `category` | string | `"goods"\|"services"\|"personal"` |
| `transactionId` | string | Unique alphanumeric transaction reference (e.g., `"TXN-A1B2C3D4"`) |
| `relatedInvoiceId` | string\|null | Foreign key to `invoices[].id` if payment is linked to an invoice |

### PaymentMethod

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment method ID (e.g., `"pm_1"`) |
| `type` | string | `"card"\|"bank"` |
| `brand` | string\|null | Card brand (e.g., `"Visa"`, `"Mastercard"`, `"Amex"`); null for banks |
| `bankName` | string\|null | Bank name (e.g., `"Chase"`); null for cards |
| `last4` | string | Last 4 digits of card/account number |
| `expiry` | string\|null | Card expiry date (e.g., `"12/26"`); null for banks |
| `accountType` | string\|null | Bank account type (e.g., `"checking"`); null for cards |
| `verified` | boolean | Whether the payment method is verified |
| `isDefault` | boolean | Whether this is the preferred/default payment method |
| `cardholderName` | string | Name on card or account |
| `addedDate` | string | ISO 8601 timestamp when method was added |

### Invoice

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Invoice ID (e.g., `"inv_1"`) |
| `number` | string | Invoice display number (e.g., `"INV-0001"`) |
| `recipientName` | string | Recipient full name |
| `recipientEmail` | string | Recipient email |
| `amount` | number | Total invoice amount in currency units |
| `currency` | string | Currency code |
| `status` | string | `"draft"\|"sent"\|"paid"\|"overdue"` |
| `createdDate` | string | ISO 8601 creation timestamp |
| `dueDate` | string | ISO 8601 due date timestamp |
| `paidDate` | string\|null | ISO 8601 payment date; null if unpaid |
| `items` | array | Line items (see InvoiceItem below) |
| `note` | string | Additional notes for recipient |
| `terms` | string | Payment terms (e.g., `"Net 30"`, `"Net 15"`, `"Due on receipt"`) |
| `tax` | number | Tax amount |

#### InvoiceItem

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Line item description |
| `quantity` | number | Quantity |
| `price` | number | Unit price in currency units |

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Notification ID (e.g., `"n_1"`) |
| `type` | string | `"payment_received"\|"payment_sent"\|"security"\|"invoice_paid"\|"system"` |
| `title` | string | Notification title |
| `message` | string | Notification body text |
| `read` | boolean | Whether notification has been read |
| `date` | string | ISO 8601 timestamp |
| `actionUrl` | string\|null | Navigation URL when clicked (e.g., `"/activity"`, `"/invoices"`, `"/wallet"`) |
| `relatedId` | string\|null | ID of related entity (transaction, invoice, payment method) |

### Subscription

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Subscription ID (e.g., `"sub_1"`) |
| `merchantName` | string | Merchant/service name (e.g., `"Netflix"`) |
| `merchantLogo` | string\|null | Merchant logo URL |
| `amount` | number | Billing amount in currency units |
| `currency` | string | Currency code |
| `frequency` | string | Billing frequency (e.g., `"monthly"`) |
| `status` | string | `"active"\|"cancelled"` |
| `nextBillingDate` | string | ISO 8601 next billing date |
| `startDate` | string | ISO 8601 subscription start date |
| `paymentMethodId` | string\|null | Foreign key to `paymentMethods[].id` |

### PaymentLink

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment link ID (e.g., `"pl_1"`) |
| `description` | string | Description of the payment link / product |
| `amount` | number\|null | Fixed amount (null for open/any-amount links) |
| `currency` | string | Currency code |
| `url` | string | Shareable payment URL |
| `active` | boolean | Whether the link is active |
| `createdDate` | string | ISO 8601 creation timestamp |
| `timesUsed` | number | Number of times the link has been used |
| `totalCollected` | number | Total amount collected through this link |

### Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `language` | string | `"en"` | Interface language |
| `timezone` | string | `"America/Los_Angeles"` | User timezone |
| `emailNotifications` | boolean | `true` | Email notification preference |
| `pushNotifications` | boolean | `true` | Push notification preference |
| `marketingEmails` | boolean | `false` | Marketing email opt-in |
| `autoAcceptPayments` | boolean | `true` | Auto-accept incoming payments |
| `defaultCurrency` | string | `"USD"` | Default currency for new transactions |
| `twoStepVerification` | boolean | `false` | Two-step verification enabled |

### Entity Relationships

- Transaction → Invoice (via `relatedInvoiceId` field, optional)
- Transaction → Contact (via `recipientEmail`/`senderEmail` matching `contacts[].email`)
- Transaction → PaymentMethod (via `source` description matching payment method display)
- Subscription → PaymentMethod (via `paymentMethodId` field)
- Notification → Transaction/Invoice/PaymentMethod (via `relatedId` field, optional)

### Default Data Counts

- 1 user, 8 contacts, 12 transactions, 3 payment methods, 4 invoices, 5 notifications, 3 subscriptions, 2 payment links

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Balance card, recent transactions, favorite contacts, payment methods overview; MoreVertical dropdowns for quick navigation |
| `/send` | Send | Tabbed interface (Send / Request / Contacts); 3-step send/request flow; Contacts tab with CRUD |
| `/send?mode=request` | Send | Request tab is active by default |
| `/send?tab=contacts` | Send | Opens Contacts tab directly |
| `/send?recipient=<email>` | Send | Pre-fills recipient field and advances to step 2 |
| `/wallet` | Wallet | XayPal balance card with Transfer/Add buttons; linked cards and bank accounts (add/verify/delete/set-default); subscriptions management |
| `/activity` | Activity | Full transaction history; type/search/date filtering; transaction detail modal; CSV download |
| `/invoices` | Invoices | Invoice list with status filter tabs (All/Draft/Sent/Paid/Overdue); invoice detail modal; create with line items, recipient name/email, notes, terms; mark sent/paid; delete |
| `/payment-links` | PaymentLinks | Create and display shareable payment links; toggle active/inactive |
| `/help` | Help | FAQ categories with full-text search across questions and answers; expandable answers; Message Us button |
| `/settings` | Settings | Inline editable account fields (Name, Email, Phone, Address, Account Type); password change form with validation; toggle switches for 2FA, notifications, auto-accept, default currency |
| `/go` | Go | State inspector (initial_state, current_state, state_diff) |

## Actions and State Mutations

| Action Method | Parameters | State Change |
|---------------|------------|-------------|
| `sendMoney` | `(recipientDisplay, amount, note, currency)` | Adds `payment_sent` transaction; decrements `user.balance` |
| `requestMoney` | `(recipientDisplay, amount, note, currency)` | Adds `request_sent` transaction with `status: "pending"` |
| `updateTransaction` | `(id, updates)` | Updates fields of a single transaction |
| `addPaymentMethod` | `(method)` | Appends new payment method with `verified: false`, `isDefault: false` |
| `deletePaymentMethod` | `(id)` | Removes payment method from array |
| `updatePaymentMethod` | `(id, updates)` | Updates fields; if `isDefault: true` is set, all others are set to `isDefault: false` |
| `createInvoice` | `(invoiceData)` | Appends invoice with auto-sequential number (e.g., `INV-0005`); status defaults to `"sent"` |
| `updateInvoice` | `(id, updates)` | Updates invoice fields (used for mark as paid, mark as sent, status changes) |
| `deleteInvoice` | `(id)` | Removes invoice from array |
| `markNotificationRead` | `(id)` | Sets `notifications[i].read = true` |
| `markAllNotificationsRead` | `()` | Sets all `notifications[].read = true` |
| `updateSettings` | `(updates)` | Merges settings updates |
| `updateUser` | `(updates)` | Merges user profile updates |
| `addContact` | `(contact)` | Appends contact; auto-generates `initials`, `initialsColor`, and `isFavorite: false` |
| `deleteContact` | `(id)` | Removes contact from array |
| `toggleContactFavorite` | `(id)` | Toggles `contacts[i].isFavorite` |
| `createPaymentLink` | `(linkData)` | Appends payment link with `active: true`, `timesUsed: 0`, `totalCollected: 0` |
| `updatePaymentLink` | `(id, updates)` | Updates payment link fields (e.g., toggle `active`) |
| `cancelSubscription` | `(id)` | Sets `subscriptions[i].status = "cancelled"` |
| `createSubscription` | `(subData)` | Appends subscription with `status: "active"` |
| `addNotification` | `(notification)` | Prepends notification with `read: false` |
| `resetState` | `()` | Clears localStorage and resets to INITIAL_STATE |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "https://cua-gym-xaypal.xlang.ai/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "id": "u_1",
          "name": "Jane Doe",
          "email": "jane.doe@example.com",
          "phone": "+1 (555) 999-0000",
          "balance": 1500.00,
          "currency": "USD",
          "avatar": null,
          "address": {
            "street": "456 Oak Ave",
            "city": "New York",
            "state": "NY",
            "zip": "10001",
            "country": "US"
          },
          "businessName": null,
          "accountType": "personal",
          "verified": true
        },
        "contacts": [
          {
            "id": "c_1",
            "name": "Bob Smith",
            "email": "bob.smith@email.com",
            "phone": "+1 (555) 111-2222",
            "avatar": null,
            "initials": "BS",
            "initialsColor": "#2196f3",
            "isFavorite": true
          }
        ],
        "transactions": [
          {
            "id": "t_1",
            "type": "payment_sent",
            "amount": 50.00,
            "currency": "USD",
            "fee": 0,
            "netAmount": 50.00,
            "recipientName": "Bob Smith",
            "recipientEmail": "bob.smith@email.com",
            "senderName": null,
            "senderEmail": null,
            "destination": null,
            "source": "XayPal balance",
            "date": "2025-01-10T14:30:00.000Z",
            "status": "completed",
            "description": "Lunch payment",
            "category": "personal",
            "transactionId": "TXN-EXAMPLE1",
            "relatedInvoiceId": null
          }
        ],
        "paymentMethods": [
          {
            "id": "pm_1",
            "type": "card",
            "brand": "Visa",
            "bankName": null,
            "last4": "1234",
            "expiry": "06/27",
            "accountType": null,
            "verified": true,
            "isDefault": true,
            "cardholderName": "Jane Doe",
            "addedDate": "2024-05-01T00:00:00Z"
          }
        ],
        "invoices": [],
        "notifications": [],
        "subscriptions": [],
        "paymentLinks": [],
        "settings": {
          "language": "en",
          "timezone": "America/New_York",
          "emailNotifications": true,
          "pushNotifications": true,
          "marketingEmails": false,
          "autoAcceptPayments": true,
          "defaultCurrency": "USD",
          "twoStepVerification": false
        }
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send money | `user.balance` decreases; `transactions` array gains a new `payment_sent` entry at index 0 |
| Request money | `transactions` array gains a new `request_sent` entry with `status: "pending"` at index 0 |
| Add payment method (card) | `paymentMethods` array grows; new item has `verified: false`, `isDefault: false`, `type: "card"` |
| Add payment method (bank) | `paymentMethods` array grows; new item has `verified: false`, `isDefault: false`, `type: "bank"` |
| Verify payment method (micro-deposit) | `paymentMethods[i].verified` → `true` |
| Delete payment method | `paymentMethods` array shrinks |
| Set default payment method | `paymentMethods[i].isDefault` → `true`; all others set to `false` |
| Create invoice | `invoices` array grows with `status: "sent"`, sequential `number` |
| Mark invoice as sent | `invoices[i].status` → `"sent"` |
| Mark invoice as paid | `invoices[i].status` → `"paid"`, `invoices[i].paidDate` set to current timestamp |
| Delete invoice | `invoices` array shrinks |
| Mark notification as read | `notifications[i].read` → `true` |
| Mark all notifications read | All `notifications[].read` → `true` |
| Toggle email notifications | `settings.emailNotifications` toggled |
| Toggle push notifications | `settings.pushNotifications` toggled |
| Toggle marketing emails | `settings.marketingEmails` toggled |
| Toggle auto-accept payments | `settings.autoAcceptPayments` toggled |
| Toggle 2-step verification | `settings.twoStepVerification` toggled |
| Change default currency | `settings.defaultCurrency` updated |
| Update user name | `user.name` updated |
| Update user email | `user.email` updated |
| Update user phone | `user.phone` updated |
| Update user address | `user.address` object updated |
| Upgrade to business account | `user.accountType` → `"business"` |
| Add contact | `contacts` array grows |
| Delete contact | `contacts` array shrinks |
| Toggle contact favorite | `contacts[i].isFavorite` toggled |
| Create payment link | `paymentLinks` array grows with `active: true`, `timesUsed: 0` |
| Toggle payment link active | `paymentLinks[i].active` toggled |
| Cancel subscription | `subscriptions[i].status` → `"cancelled"` |
| Create subscription | `subscriptions` array grows with `status: "active"` |
| Add notification | `notifications` array gains entry at index 0 with `read: false` |
| Log out | Triggers logged-out UI state (no state change; session remains intact) |
| Reset state | All state reverts to default initial values |


## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user profile and account info (see User below) |
| `contacts` | array | Address-book contacts for sending/requesting money (see Contact below) |
| `transactions` | array | All transaction history including payments, refunds, withdrawals, requests (see Transaction below) |
| `paymentMethods` | array | Linked cards and bank accounts (see PaymentMethod below) |
| `invoices` | array | Invoices created and received (see Invoice below) |
| `notifications` | array | Notification bell items (see Notification below) |
| `subscriptions` | array | Recurring payment subscriptions (see Subscription below) |
| `paymentLinks` | array | Shareable payment links (see PaymentLink below) |
| `settings` | object | Application preferences (see Settings below) |

**Note**: All monetary amounts are in standard currency units (e.g., `12.50` = $12.50), NOT cents. All timestamps are ISO 8601 strings.

### User

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"u_1"` | User ID |
| `name` | string | `"Alex Johnson"` | Full name |
| `email` | string | `"alex.johnson@email.com"` | Primary email |
| `phone` | string | `"+1 (555) 123-4567"` | Phone number |
| `balance` | number | `4250.50` | XayPal balance in currency units |
| `currency` | string | `"USD"` | Balance currency code |
| `avatar` | string\|null | `null` | Avatar image URL |
| `address` | object | See below | Mailing address |
| `businessName` | string\|null | `null` | Business name (null for personal accounts) |
| `accountType` | string | `"personal"` | `"personal"` or `"business"` |
| `verified` | boolean | `true` | Whether account is verified |

#### User.address

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `street` | string | `"123 Main Street"` | Street address |
| `city` | string | `"San Francisco"` | City |
| `state` | string | `"CA"` | State/province code |
| `zip` | string | `"94105"` | Postal code |
| `country` | string | `"US"` | Country code |

### Contact

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Contact ID (e.g., `"c_1"`) |
| `name` | string | Full name |
| `email` | string | Email address (used to select recipients in Send flow) |
| `phone` | string\|null | Phone number |
| `avatar` | string\|null | Avatar image URL |
| `initials` | string | Two-letter initials for avatar fallback (e.g., `"SS"`) |
| `initialsColor` | string | Hex color for initials avatar background (e.g., `"#e91e63"`) |
| `isFavorite` | boolean | Whether contact appears in "Send again" favorites section |

### Transaction

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Transaction ID (e.g., `"t_1"`) |
| `type` | string | `"payment_sent"\|"payment_received"\|"withdrawal"\|"refund"\|"request_sent"` |
| `amount` | number | Transaction amount in currency units |
| `currency` | string | Currency code (e.g., `"USD"`) |
| `fee` | number | Transaction fee amount |
| `netAmount` | number | Net amount after fees |
| `recipientName` | string\|null | Recipient display name (for sent payments / requests) |
| `recipientEmail` | string\|null | Recipient email address |
| `senderName` | string\|null | Sender display name (for received payments / refunds) |
| `senderEmail` | string\|null | Sender email address |
| `destination` | string\|null | Destination description for withdrawals (e.g., `"Chase Bank ····4422"`) |
| `source` | string\|null | Funding source description (e.g., `"XayPal balance"`, `"Visa ····4242"`) |
| `date` | string | ISO 8601 timestamp |
| `status` | string | `"completed"\|"pending"` |
| `description` | string | Transaction memo/description |
| `category` | string | `"goods"\|"services"\|"personal"` |
| `transactionId` | string | Unique alphanumeric transaction reference (e.g., `"TXN-A1B2C3D4"`) |
| `relatedInvoiceId` | string\|null | Foreign key to `invoices[].id` if payment is linked to an invoice |

### PaymentMethod

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment method ID (e.g., `"pm_1"`) |
| `type` | string | `"card"\|"bank"` |
| `brand` | string\|null | Card brand (e.g., `"Visa"`, `"Mastercard"`, `"Amex"`); null for banks |
| `bankName` | string\|null | Bank name (e.g., `"Chase"`); null for cards |
| `last4` | string | Last 4 digits of card/account number |
| `expiry` | string\|null | Card expiry date (e.g., `"12/26"`); null for banks |
| `accountType` | string\|null | Bank account type (e.g., `"checking"`); null for cards |
| `verified` | boolean | Whether the payment method is verified |
| `isDefault` | boolean | Whether this is the preferred/default payment method |
| `cardholderName` | string | Name on card or account |
| `addedDate` | string | ISO 8601 timestamp when method was added |

### Invoice

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Invoice ID (e.g., `"inv_1"`) |
| `number` | string | Invoice display number (e.g., `"INV-0001"`) |
| `recipientName` | string | Recipient name |
| `recipientEmail` | string | Recipient email |
| `amount` | number | Total invoice amount in currency units |
| `currency` | string | Currency code |
| `status` | string | `"draft"\|"sent"\|"paid"\|"overdue"` |
| `createdDate` | string | ISO 8601 creation timestamp |
| `dueDate` | string | ISO 8601 due date timestamp |
| `paidDate` | string\|null | ISO 8601 payment date; null if unpaid |
| `items` | array | Line items (see InvoiceItem below) |
| `note` | string | Additional notes for recipient |
| `terms` | string | Payment terms (e.g., `"Net 30"`) |
| `tax` | number | Tax amount |

#### InvoiceItem

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Line item description |
| `quantity` | number | Quantity |
| `price` | number | Unit price in currency units |

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Notification ID (e.g., `"n_1"`) |
| `type` | string | `"payment_received"\|"payment_sent"\|"security"\|"invoice_paid"\|"system"` |
| `title` | string | Notification title |
| `message` | string | Notification body text |
| `read` | boolean | Whether notification has been read |
| `date` | string | ISO 8601 timestamp |
| `actionUrl` | string\|null | Navigation URL when clicked (e.g., `"/activity"`, `"/invoices"`, `"/wallet"`) |
| `relatedId` | string\|null | ID of related entity (transaction, invoice, payment method) |

### Subscription

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Subscription ID (e.g., `"sub_1"`) |
| `merchantName` | string | Merchant/service name (e.g., `"Netflix"`) |
| `merchantLogo` | string\|null | Merchant logo URL |
| `amount` | number | Billing amount in currency units |
| `currency` | string | Currency code |
| `frequency` | string | Billing frequency (e.g., `"monthly"`) |
| `status` | string | `"active"\|"cancelled"` |
| `nextBillingDate` | string | ISO 8601 next billing date |
| `startDate` | string | ISO 8601 subscription start date |
| `paymentMethodId` | string\|null | Foreign key to `paymentMethods[].id` |

### PaymentLink

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment link ID (e.g., `"pl_1"`) |
| `description` | string | Description of the payment link / product |
| `amount` | number\|null | Fixed amount (null for open/any-amount links) |
| `currency` | string | Currency code |
| `url` | string | Shareable payment URL |
| `active` | boolean | Whether the link is active |
| `createdDate` | string | ISO 8601 creation timestamp |
| `timesUsed` | number | Number of times the link has been used |
| `totalCollected` | number | Total amount collected through this link |

### Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `language` | string | `"en"` | Interface language |
| `timezone` | string | `"America/Los_Angeles"` | User timezone |
| `emailNotifications` | boolean | `true` | Email notification preference |
| `pushNotifications` | boolean | `true` | Push notification preference |
| `marketingEmails` | boolean | `false` | Marketing email opt-in |
| `autoAcceptPayments` | boolean | `true` | Auto-accept incoming payments |
| `defaultCurrency` | string | `"USD"` | Default currency for new transactions |

### Entity Relationships

- Transaction → Invoice (via `relatedInvoiceId` field, optional)
- Transaction → Contact (via `recipientEmail`/`senderEmail` matching `contacts[].email`)
- Transaction → PaymentMethod (via `source` description matching payment method display)
- Subscription → PaymentMethod (via `paymentMethodId` field)
- Notification → Transaction/Invoice/PaymentMethod (via `relatedId` field, optional)

### Default Data Counts

- 1 user, 8 contacts, 12 transactions, 3 payment methods, 4 invoices, 5 notifications, 3 subscriptions, 2 payment links

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Balance card, recent transactions, favorite contacts, payment methods overview |
| `/send` | Send | Send or request money flow (3-step: recipient, amount, confirmation) |
| `/send?mode=request` | Send | Request money variant |
| `/wallet` | Wallet | Manage linked cards and bank accounts; add/verify payment methods |
| `/activity` | Activity | Full transaction history with type/search/date filtering |
| `/invoices` | Invoices | Invoice list table; create new invoices with line items |
| `/payment-links` | PaymentLinks | Create and view shareable payment links |
| `/help` | Help | FAQ categories with expandable questions |
| `/settings` | Settings | Account info, security, notification toggles, payment preferences |
| `/go` | Go | State inspector (initial_state, current_state, state_diff) |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "https://cua-gym-xaypal.xlang.ai/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "id": "u_1",
          "name": "Jane Doe",
          "email": "jane.doe@example.com",
          "phone": "+1 (555) 999-0000",
          "balance": 1500.00,
          "currency": "USD",
          "avatar": null,
          "address": {
            "street": "456 Oak Ave",
            "city": "New York",
            "state": "NY",
            "zip": "10001",
            "country": "US"
          },
          "businessName": null,
          "accountType": "personal",
          "verified": true
        },
        "contacts": [
          {
            "id": "c_1",
            "name": "Bob Smith",
            "email": "bob.smith@email.com",
            "phone": "+1 (555) 111-2222",
            "avatar": null,
            "initials": "BS",
            "initialsColor": "#2196f3",
            "isFavorite": true
          }
        ],
        "transactions": [
          {
            "id": "t_1",
            "type": "payment_sent",
            "amount": 50.00,
            "currency": "USD",
            "fee": 0,
            "netAmount": 50.00,
            "recipientName": "Bob Smith",
            "recipientEmail": "bob.smith@email.com",
            "senderName": null,
            "senderEmail": null,
            "destination": null,
            "source": "XayPal balance",
            "date": "2025-01-10T14:30:00.000Z",
            "status": "completed",
            "description": "Lunch payment",
            "category": "personal",
            "transactionId": "TXN-EXAMPLE1",
            "relatedInvoiceId": null
          }
        ],
        "paymentMethods": [
          {
            "id": "pm_1",
            "type": "card",
            "brand": "Visa",
            "bankName": null,
            "last4": "1234",
            "expiry": "06/27",
            "accountType": null,
            "verified": true,
            "isDefault": true,
            "cardholderName": "Jane Doe",
            "addedDate": "2024-05-01T00:00:00Z"
          }
        ],
        "invoices": [],
        "notifications": [],
        "subscriptions": [],
        "paymentLinks": [],
        "settings": {
          "language": "en",
          "timezone": "America/New_York",
          "emailNotifications": true,
          "pushNotifications": true,
          "marketingEmails": false,
          "autoAcceptPayments": true,
          "defaultCurrency": "USD"
        }
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send money | `user.balance` decreases; `transactions` array gains a new `payment_sent` entry at index 0 |
| Request money | `transactions` array gains a new `request_sent` entry with `status: "pending"` at index 0 |
| Add payment method (via Wallet) | `paymentMethods` array grows; new item has `verified: false` |
| Delete payment method | `paymentMethods` array shrinks |
| Set default payment method | `paymentMethods[i].isDefault` updated; all others set to `false` |
| Create invoice | `invoices` array grows with `status: "sent"` |
| Update invoice | `invoices[i]` fields updated |
| Delete invoice | `invoices` array shrinks |
| Mark notification as read | `notifications[i].read` → `true` |
| Mark all notifications read | All `notifications[].read` → `true` |
| Toggle email notifications | `settings.emailNotifications` toggled |
| Toggle push notifications | `settings.pushNotifications` toggled |
| Toggle marketing emails | `settings.marketingEmails` toggled |
| Toggle auto-accept payments | `settings.autoAcceptPayments` toggled |
| Change default currency | `settings.defaultCurrency` updated |
| Add contact | `contacts` array grows |
| Delete contact | `contacts` array shrinks |
| Toggle contact favorite | `contacts[i].isFavorite` toggled |
| Create payment link | `paymentLinks` array grows with `active: true`, `timesUsed: 0` |
| Update payment link | `paymentLinks[i]` fields updated |
| Cancel subscription | `subscriptions[i].status` → `"cancelled"` |
| Create subscription | `subscriptions` array grows with `status: "active"` |
| Add notification | `notifications` array gains entry at index 0 with `read: false` |
| Reset state | All state reverts to default initial values |
