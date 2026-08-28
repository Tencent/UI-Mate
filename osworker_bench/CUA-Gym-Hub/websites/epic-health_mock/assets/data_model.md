# Xpic MyChart Mock — Data Model

> For use in `src/utils/dataManager.js` → `createInitialData()`

---

## Entity Types

### 1. Patient (Current User)

```js
{
  id: "patient-1",
  firstName: "Sarah",
  lastName: "Chen",
  fullName: "Sarah Chen",
  dateOfBirth: "1989-07-15",
  age: 35,
  gender: "Female",
  email: "sarah.chen@email.com",
  phone: "(555) 234-5678",
  address: {
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zip: "62704"
  },
  emergencyContact: {
    name: "David Chen",
    relationship: "Spouse",
    phone: "(555) 234-5679"
  },
  preferredLanguage: "English",
  preferredPharmacy: {
    name: "CVS Pharmacy #4521",
    address: "100 Main St, Springfield, IL 62701",
    phone: "(555) 100-2000"
  },
  avatarInitials: "SC",
  avatarColor: "#0075BC"
}
```

**Relationships**: Has many Appointments, Messages, TestResults, Medications, Conditions, Allergies, Immunizations, Vitals, BillingStatements, InsurancePlans

### 2. Provider

```js
{
  id: "provider-1",
  firstName: "Elizabeth",
  lastName: "Morrison",
  fullName: "Elizabeth Morrison, MD",
  title: "MD",
  specialty: "Family Medicine",
  role: "Primary Care Provider",
  department: "Family Medicine",
  phone: "(555) 800-1234",
  email: "e.morrison@springfieldhealth.org",
  location: "Springfield Health Center — Main Campus",
  avatarInitials: "EM",
  avatarColor: "#4CAF50",
  imageUrl: null // placeholder, uses initials
}
```

**Seed data — 5 providers:**
| id | name | specialty | role |
|---|---|---|---|
| provider-1 | Elizabeth Morrison, MD | Family Medicine | Primary Care Provider |
| provider-2 | James Park, MD | Cardiology | Referring Physician |
| provider-3 | Priya Sharma, MD | Dermatology | Specialist |
| provider-4 | Michael Torres, DDS | Dentistry | Dentist |
| provider-5 | Nursing Staff | Family Medicine | Care Team |

### 3. Appointment

```js
{
  id: "appt-1",
  patientId: "patient-1",
  providerId: "provider-1",
  providerName: "Elizabeth Morrison, MD",
  type: "Office Visit", // "Office Visit" | "Video Visit" | "Phone Visit" | "Annual Physical" | "Follow Up"
  status: "Scheduled", // "Scheduled" | "Checked In" | "Completed" | "Cancelled" | "No Show"
  dateTime: "2025-04-15T09:30:00",
  duration: 30, // minutes
  location: "Springfield Health Center — Main Campus",
  address: "500 Medical Dr, Springfield, IL 62704",
  department: "Family Medicine",
  reason: "Annual Physical Exam",
  instructions: "Please fast for 12 hours before your appointment. Bring current medication list.",
  isUpcoming: true,
  canCheckIn: true, // eCheck-in available
  canCancel: true,
  canReschedule: true,
  afterVisitSummary: null, // populated for completed visits
  questionnairesRequired: ["pre-visit-1"],
  notes: "" // provider notes for completed visits
}
```

**Seed data — 6 appointments (3 upcoming, 3 past):**
| id | dateTime | provider | type | status |
|---|---|---|---|---|
| appt-1 | 2025-04-15T09:30 | Morrison, MD | Annual Physical | Scheduled |
| appt-2 | 2025-04-28T14:00 | Park, MD | Follow Up | Scheduled |
| appt-3 | 2025-05-10T10:00 | Sharma, MD | Office Visit | Scheduled |
| appt-4 | 2025-03-01T11:00 | Morrison, MD | Office Visit | Completed |
| appt-5 | 2025-01-15T09:00 | Park, MD | Follow Up | Completed |
| appt-6 | 2024-11-20T15:30 | Morrison, MD | Annual Physical | Completed |

### 4. Message

```js
{
  id: "msg-1",
  threadId: "thread-1", // groups messages into conversations
  parentId: null, // null for first message, msg id for replies
  from: {
    id: "provider-1",
    name: "Elizabeth Morrison, MD",
    type: "provider" // "provider" | "patient" | "care-team"
  },
  to: {
    id: "patient-1",
    name: "Sarah Chen",
    type: "patient"
  },
  subject: "Your Recent Lab Results",
  body: "Hi Sarah,\n\nI've reviewed your recent lab work and everything looks great. Your cholesterol levels have improved since your last visit. Keep up the good work with diet and exercise!\n\nPlease schedule a follow-up in 6 months.\n\nBest,\nDr. Morrison",
  date: "2025-03-08T14:23:00",
  isRead: false,
  isStarred: false,
  folder: "inbox", // "inbox" | "sent" | "archived" | "trash"
  hasAttachment: false,
  attachments: [],
  isUrgent: false
}
```

**Seed data — 8 messages across 4 threads:**
| threadId | subject | messages | unread |
|---|---|---|---|
| thread-1 | Your Recent Lab Results | 2 (provider → patient, patient → provider reply) | 1 |
| thread-2 | Appointment Reminder - April 15 | 1 (care-team → patient) | 1 |
| thread-3 | Prescription Renewal Confirmation | 1 (provider → patient) | 0 |
| thread-4 | Question About Medication Side Effects | 3 (patient → provider, provider → patient, patient → provider) | 0 |
| (sent) | Follow-up question about diet | 1 (patient → provider) | — |

### 5. TestResult

```js
{
  id: "test-1",
  patientId: "patient-1",
  orderedBy: "Elizabeth Morrison, MD",
  orderedById: "provider-1",
  testName: "Comprehensive Metabolic Panel",
  category: "Lab", // "Lab" | "Imaging" | "Pathology"
  orderedDate: "2025-03-01",
  collectedDate: "2025-03-01T08:30:00",
  resultDate: "2025-03-02T16:00:00",
  status: "Final", // "Final" | "Pending" | "Preliminary"
  isReviewed: true, // patient has viewed it
  providerComment: "All values look normal. Great improvement in cholesterol!",
  observations: [
    {
      id: "obs-1",
      name: "Glucose",
      value: "95",
      unit: "mg/dL",
      referenceRange: "70-100",
      status: "Normal", // "Normal" | "High" | "Low" | "Critical High" | "Critical Low"
      flag: null // null | "H" | "L" | "HH" | "LL"
    },
    {
      id: "obs-2",
      name: "BUN",
      value: "15",
      unit: "mg/dL",
      referenceRange: "7-20",
      status: "Normal",
      flag: null
    },
    {
      id: "obs-3",
      name: "Creatinine",
      value: "0.9",
      unit: "mg/dL",
      referenceRange: "0.6-1.2",
      status: "Normal",
      flag: null
    },
    {
      id: "obs-4",
      name: "Sodium",
      value: "140",
      unit: "mEq/L",
      referenceRange: "136-145",
      status: "Normal",
      flag: null
    },
    {
      id: "obs-5",
      name: "Potassium",
      value: "4.2",
      unit: "mEq/L",
      referenceRange: "3.5-5.0",
      status: "Normal",
      flag: null
    }
  ]
}
```

**Seed data — 5 test results:**
| id | testName | date | status | abnormals |
|---|---|---|---|---|
| test-1 | Comprehensive Metabolic Panel | 2025-03-01 | Final | None |
| test-2 | Lipid Panel | 2025-03-01 | Final | LDL slightly high (H) |
| test-3 | Complete Blood Count (CBC) | 2025-03-01 | Final | None |
| test-4 | Hemoglobin A1c | 2025-01-15 | Final | None |
| test-5 | Thyroid Panel (TSH, T3, T4) | 2025-01-15 | Final | None |

### 6. Medication

```js
{
  id: "med-1",
  patientId: "patient-1",
  name: "Lisinopril",
  genericName: "Lisinopril",
  dosage: "10 mg",
  form: "Tablet", // "Tablet" | "Capsule" | "Injection" | "Cream" | "Inhaler" | "Liquid"
  frequency: "Once daily",
  route: "Oral",
  instructions: "Take one tablet by mouth once daily in the morning",
  prescriber: "Elizabeth Morrison, MD",
  prescriberId: "provider-1",
  pharmacy: "CVS Pharmacy #4521",
  status: "Active", // "Active" | "Discontinued" | "On Hold"
  startDate: "2024-06-15",
  endDate: null,
  lastFilledDate: "2025-02-20",
  refillsRemaining: 3,
  totalRefills: 5,
  isRefillable: true,
  daysSupply: 30,
  quantity: 30,
  reason: "Hypertension"
}
```

**Seed data — 6 medications (4 active, 2 discontinued):**
| id | name | dosage | frequency | status |
|---|---|---|---|---|
| med-1 | Lisinopril | 10 mg | Once daily | Active |
| med-2 | Atorvastatin | 20 mg | Once daily at bedtime | Active |
| med-3 | Metformin | 500 mg | Twice daily with meals | Active |
| med-4 | Vitamin D3 | 2000 IU | Once daily | Active |
| med-5 | Amoxicillin | 500 mg | Three times daily | Discontinued |
| med-6 | Prednisone | 10 mg | Taper per instructions | Discontinued |

### 7. Condition (Problem List)

```js
{
  id: "cond-1",
  patientId: "patient-1",
  name: "Essential Hypertension",
  icdCode: "I10",
  clinicalStatus: "Active", // "Active" | "Resolved" | "Inactive"
  severity: "Mild",
  onsetDate: "2024-06-01",
  diagnosedBy: "Elizabeth Morrison, MD",
  notes: "Well-controlled with medication"
}
```

**Seed data — 4 conditions:**
| id | name | status | onset |
|---|---|---|---|
| cond-1 | Essential Hypertension | Active | 2024-06-01 |
| cond-2 | Type 2 Diabetes Mellitus | Active | 2024-03-15 |
| cond-3 | Hyperlipidemia | Active | 2024-06-01 |
| cond-4 | Seasonal Allergies | Active | 2020-04-01 |

### 8. Allergy

```js
{
  id: "allergy-1",
  patientId: "patient-1",
  allergen: "Penicillin",
  type: "Medication", // "Medication" | "Food" | "Environmental"
  reaction: "Rash, Hives",
  severity: "Moderate", // "Mild" | "Moderate" | "Severe"
  status: "Active",
  onsetDate: "2015-08-00",
  notes: "Developed rash within 2 hours of first dose"
}
```

**Seed data — 3 allergies:**
| id | allergen | type | reaction | severity |
|---|---|---|---|---|
| allergy-1 | Penicillin | Medication | Rash, Hives | Moderate |
| allergy-2 | Peanuts | Food | Throat swelling | Severe |
| allergy-3 | Latex | Environmental | Contact dermatitis | Mild |

### 9. Immunization

```js
{
  id: "imm-1",
  patientId: "patient-1",
  vaccineName: "Influenza (Flu)",
  vaccineCode: "CVX-158",
  administrationDate: "2024-10-15",
  site: "Left Deltoid",
  administrator: "Springfield Health Center",
  lotNumber: "FL2024-5521",
  status: "Completed",
  nextDueDate: "2025-10-01" // null if not recurring
}
```

**Seed data — 6 immunizations:**
| id | vaccine | date | nextDue |
|---|---|---|---|
| imm-1 | Influenza (Flu) | 2024-10-15 | 2025-10-01 |
| imm-2 | COVID-19 Booster (Moderna) | 2024-09-20 | null |
| imm-3 | Tdap | 2022-05-10 | 2032-05-10 |
| imm-4 | Hepatitis B (Dose 3 of 3) | 2019-03-01 | null |
| imm-5 | MMR | 1991-07-15 | null |
| imm-6 | Varicella | 1993-02-20 | null |

### 10. Vital

```js
{
  id: "vital-1",
  patientId: "patient-1",
  date: "2025-03-01",
  readings: {
    bloodPressureSystolic: { value: 128, unit: "mmHg" },
    bloodPressureDiastolic: { value: 82, unit: "mmHg" },
    heartRate: { value: 72, unit: "bpm" },
    temperature: { value: 98.6, unit: "°F" },
    respiratoryRate: { value: 16, unit: "breaths/min" },
    weight: { value: 154, unit: "lbs" },
    height: { value: 65, unit: "in" },
    bmi: { value: 25.6, unit: "kg/m²" },
    oxygenSaturation: { value: 98, unit: "%" }
  },
  recordedBy: "Nursing Staff",
  location: "Springfield Health Center"
}
```

**Seed data — 3 vital records (recent visits):**
| id | date | BP | HR | Weight |
|---|---|---|---|---|
| vital-1 | 2025-03-01 | 128/82 | 72 | 154 lbs |
| vital-2 | 2025-01-15 | 132/85 | 75 | 156 lbs |
| vital-3 | 2024-11-20 | 135/88 | 78 | 158 lbs |

### 11. BillingStatement

```js
{
  id: "bill-1",
  patientId: "patient-1",
  statementDate: "2025-03-10",
  dueDate: "2025-04-10",
  totalAmount: 245.00,
  insurancePaid: 680.00,
  patientResponsibility: 245.00,
  amountPaid: 0,
  balanceDue: 245.00,
  status: "Due", // "Due" | "Paid" | "Overdue" | "Pending Insurance" | "Payment Plan"
  lineItems: [
    {
      id: "item-1",
      serviceDate: "2025-03-01",
      description: "Office Visit — Established Patient (Level 3)",
      cptCode: "99213",
      provider: "Elizabeth Morrison, MD",
      chargedAmount: 250.00,
      insuranceAdjustment: -95.00,
      insurancePaid: -110.00,
      patientResponsibility: 45.00
    },
    {
      id: "item-2",
      serviceDate: "2025-03-01",
      description: "Comprehensive Metabolic Panel",
      cptCode: "80053",
      provider: "Springfield Health Center Lab",
      chargedAmount: 175.00,
      insuranceAdjustment: -45.00,
      insurancePaid: -80.00,
      patientResponsibility: 50.00
    },
    {
      id: "item-3",
      serviceDate: "2025-03-01",
      description: "Lipid Panel",
      cptCode: "80061",
      provider: "Springfield Health Center Lab",
      chargedAmount: 120.00,
      insuranceAdjustment: -30.00,
      insurancePaid: -40.00,
      patientResponsibility: 50.00
    },
    {
      id: "item-4",
      serviceDate: "2025-03-01",
      description: "Complete Blood Count",
      cptCode: "85025",
      provider: "Springfield Health Center Lab",
      chargedAmount: 380.00,
      insuranceAdjustment: -30.00,
      insurancePaid: -250.00,
      patientResponsibility: 100.00
    }
  ]
}
```

**Seed data — 3 billing statements:**
| id | date | amount | status |
|---|---|---|---|
| bill-1 | 2025-03-10 | $245.00 | Due |
| bill-2 | 2025-02-01 | $75.00 | Paid |
| bill-3 | 2024-12-15 | $150.00 | Paid |

### 12. Insurance

```js
{
  id: "ins-1",
  patientId: "patient-1",
  planName: "Blue Cross Blue Shield PPO",
  planType: "PPO",
  memberId: "XYZ123456789",
  groupNumber: "GRP-98765",
  subscriberName: "Sarah Chen",
  relationship: "Self",
  effectiveDate: "2024-01-01",
  copay: {
    primaryCare: 25,
    specialist: 50,
    urgentCare: 75,
    emergency: 250
  },
  deductible: {
    individual: 1500,
    family: 3000,
    metAmount: 825
  },
  outOfPocketMax: {
    individual: 6000,
    family: 12000,
    metAmount: 1200
  },
  contactPhone: "1-800-555-BCBS",
  isActive: true
}
```

### 13. PreventiveCareItem

```js
{
  id: "prev-1",
  patientId: "patient-1",
  name: "Annual Flu Vaccination",
  category: "Immunization", // "Immunization" | "Screening" | "Exam"
  status: "Completed", // "Completed" | "Due" | "Overdue" | "Not Applicable"
  lastCompleted: "2024-10-15",
  nextDue: "2025-10-01",
  frequency: "Annually",
  notes: ""
}
```

**Seed data — 6 preventive care items:**
| id | name | status | nextDue |
|---|---|---|---|
| prev-1 | Annual Flu Vaccination | Completed | 2025-10-01 |
| prev-2 | Mammogram | Due | 2025-07-15 |
| prev-3 | Colonoscopy | Not Applicable | — |
| prev-4 | Annual Physical Exam | Due | 2025-04-15 |
| prev-5 | Eye Exam | Due | 2025-06-01 |
| prev-6 | Dental Cleaning | Overdue | 2025-01-01 |

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    currentUser: { /* Patient object */ },
    providers: [ /* 5 Provider objects */ ],
    appointments: [ /* 6 Appointment objects */ ],
    messages: [ /* 8+ Message objects across 4+ threads */ ],
    testResults: [ /* 5 TestResult objects with nested observations */ ],
    medications: [ /* 6 Medication objects */ ],
    conditions: [ /* 4 Condition objects */ ],
    allergies: [ /* 3 Allergy objects */ ],
    immunizations: [ /* 6 Immunization objects */ ],
    vitals: [ /* 3 Vital objects */ ],
    billingStatements: [ /* 3 BillingStatement objects */ ],
    insurance: [ /* 1 Insurance object */ ],
    preventiveCare: [ /* 6 PreventiveCareItem objects */ ],
    // UI state
    ui: {
      activeSection: "home",
      selectedAppointment: null,
      selectedMessage: null,
      selectedTestResult: null,
      selectedMedication: null,
      selectedBill: null,
      sideMenuOpen: false,
      messageComposerOpen: false,
      schedulingFlowStep: null, // null | "reason" | "provider" | "datetime" | "confirm"
      refillSelections: [], // medication ids selected for refill
      unreadMessageCount: 2,
      notificationBanners: [
        { id: "notif-1", type: "appointment", text: "Upcoming: Annual Physical on Apr 15 at 9:30 AM", dismissed: false },
        { id: "notif-2", type: "result", text: "New test results available from Mar 1", dismissed: false }
      ]
    }
  }
}
```

---

## Relationships Diagram

```
Patient (1)
├── has many → Appointments (N)
│   └── belongs to → Provider (1)
├── has many → Messages (N)
│   └── belongs to → Thread, from/to Provider or Patient
├── has many → TestResults (N)
│   ├── ordered by → Provider (1)
│   └── has many → Observations (N)
├── has many → Medications (N)
│   └── prescribed by → Provider (1)
├── has many → Conditions (N)
├── has many → Allergies (N)
├── has many → Immunizations (N)
├── has many → Vitals (N)
├── has many → BillingStatements (N)
│   └── has many → LineItems (N)
├── has many → Insurance (N)
└── has many → PreventiveCareItems (N)
```
