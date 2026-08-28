const BASE_KEY = 'epicHealthState'
const BASE_INITIAL_KEY = 'epicHealthInitialState'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) sessionStorage.setItem('epicHealthSid', sid)
  return sid || sessionStorage.getItem('epicHealthSid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state'
    const resp = await fetch(url)
    if (!resp.ok) return null
    const data = await resp.json()
    return data.has_custom_state ? data.stored_state : null
  } catch (e) {
    return null
  }
}

export function createInitialData() {
  return {
    currentUser: {
      id: 'patient-1',
      firstName: 'Sarah',
      lastName: 'Chen',
      fullName: 'Sarah Chen',
      dateOfBirth: '1989-07-15',
      age: 35,
      gender: 'Female',
      email: 'sarah.chen@email.com',
      phone: '(555) 234-5678',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        zip: '62704'
      },
      emergencyContact: {
        name: 'David Chen',
        relationship: 'Spouse',
        phone: '(555) 234-5679'
      },
      preferredLanguage: 'English',
      preferredPharmacy: {
        name: 'CVS Pharmacy #4521',
        address: '100 Main St, Springfield, IL 62701',
        phone: '(555) 100-2000'
      },
      avatarInitials: 'SC',
      avatarColor: '#0075BC'
    },
    providers: [
      {
        id: 'provider-1',
        firstName: 'Elizabeth',
        lastName: 'Morrison',
        fullName: 'Elizabeth Morrison, MD',
        title: 'MD',
        specialty: 'Family Medicine',
        role: 'Primary Care Provider',
        department: 'Family Medicine',
        phone: '(555) 800-1234',
        email: 'e.morrison@springfieldhealth.org',
        location: 'Springfield Health Center — Main Campus',
        address: '500 Medical Dr, Springfield, IL 62704',
        avatarInitials: 'EM',
        avatarColor: '#4CAF50',
        imageUrl: null
      },
      {
        id: 'provider-2',
        firstName: 'James',
        lastName: 'Park',
        fullName: 'James Park, MD',
        title: 'MD',
        specialty: 'Cardiology',
        role: 'Referring Physician',
        department: 'Cardiology',
        phone: '(555) 800-5678',
        email: 'j.park@springfieldhealth.org',
        location: 'Springfield Heart Institute',
        address: '600 Cardiac Way, Springfield, IL 62704',
        avatarInitials: 'JP',
        avatarColor: '#E91E63',
        imageUrl: null
      },
      {
        id: 'provider-3',
        firstName: 'Priya',
        lastName: 'Sharma',
        fullName: 'Priya Sharma, MD',
        title: 'MD',
        specialty: 'Dermatology',
        role: 'Specialist',
        department: 'Dermatology',
        phone: '(555) 800-9012',
        email: 'p.sharma@springfieldhealth.org',
        location: 'Springfield Dermatology Center',
        address: '700 Skin Care Blvd, Springfield, IL 62704',
        avatarInitials: 'PS',
        avatarColor: '#9C27B0',
        imageUrl: null
      },
      {
        id: 'provider-4',
        firstName: 'Michael',
        lastName: 'Torres',
        fullName: 'Michael Torres, DDS',
        title: 'DDS',
        specialty: 'Dentistry',
        role: 'Dentist',
        department: 'Dental',
        phone: '(555) 800-3456',
        email: 'm.torres@springfieldhealth.org',
        location: 'Springfield Dental Associates',
        address: '800 Smile Ave, Springfield, IL 62704',
        avatarInitials: 'MT',
        avatarColor: '#FF9800',
        imageUrl: null
      },
      {
        id: 'provider-5',
        firstName: 'Nursing',
        lastName: 'Staff',
        fullName: 'Nursing Staff',
        title: '',
        specialty: 'Family Medicine',
        role: 'Care Team',
        department: 'Family Medicine',
        phone: '(555) 800-1234',
        email: 'nursing@springfieldhealth.org',
        location: 'Springfield Health Center — Main Campus',
        address: '500 Medical Dr, Springfield, IL 62704',
        avatarInitials: 'NS',
        avatarColor: '#607D8B',
        imageUrl: null
      }
    ],
    appointments: [
      {
        id: 'appt-1',
        patientId: 'patient-1',
        providerId: 'provider-1',
        providerName: 'Elizabeth Morrison, MD',
        type: 'Annual Physical',
        status: 'Scheduled',
        dateTime: '2025-04-15T09:30:00',
        duration: 60,
        location: 'Springfield Health Center — Main Campus',
        address: '500 Medical Dr, Springfield, IL 62704',
        department: 'Family Medicine',
        reason: 'Annual Physical Exam',
        instructions: 'Please fast for 12 hours before your appointment. Bring current medication list. Arrive 15 minutes early to complete paperwork.',
        isUpcoming: true,
        canCheckIn: true,
        canCancel: true,
        canReschedule: true,
        afterVisitSummary: null,
        questionnairesRequired: ['pre-visit-1'],
        notes: ''
      },
      {
        id: 'appt-2',
        patientId: 'patient-1',
        providerId: 'provider-2',
        providerName: 'James Park, MD',
        type: 'Follow Up',
        status: 'Scheduled',
        dateTime: '2025-04-28T14:00:00',
        duration: 30,
        location: 'Springfield Heart Institute',
        address: '600 Cardiac Way, Springfield, IL 62704',
        department: 'Cardiology',
        reason: 'Cardiology Follow-Up — Blood pressure monitoring',
        instructions: 'Please bring your home blood pressure log if you have been tracking readings.',
        isUpcoming: true,
        canCheckIn: false,
        canCancel: true,
        canReschedule: true,
        afterVisitSummary: null,
        questionnairesRequired: [],
        notes: ''
      },
      {
        id: 'appt-3',
        patientId: 'patient-1',
        providerId: 'provider-3',
        providerName: 'Priya Sharma, MD',
        type: 'Office Visit',
        status: 'Scheduled',
        dateTime: '2025-05-10T10:00:00',
        duration: 30,
        location: 'Springfield Dermatology Center',
        address: '700 Skin Care Blvd, Springfield, IL 62704',
        department: 'Dermatology',
        reason: 'Skin check — annual mole mapping',
        instructions: 'Remove nail polish before the appointment. Wear loose comfortable clothing.',
        isUpcoming: true,
        canCheckIn: false,
        canCancel: true,
        canReschedule: true,
        afterVisitSummary: null,
        questionnairesRequired: [],
        notes: ''
      },
      {
        id: 'appt-4',
        patientId: 'patient-1',
        providerId: 'provider-1',
        providerName: 'Elizabeth Morrison, MD',
        type: 'Office Visit',
        status: 'Completed',
        dateTime: '2025-03-01T11:00:00',
        duration: 30,
        location: 'Springfield Health Center — Main Campus',
        address: '500 Medical Dr, Springfield, IL 62704',
        department: 'Family Medicine',
        reason: 'Blood pressure check and lab results review',
        instructions: '',
        isUpcoming: false,
        canCheckIn: false,
        canCancel: false,
        canReschedule: false,
        afterVisitSummary: {
          diagnoses: ['Essential Hypertension (I10)', 'Type 2 Diabetes Mellitus (E11)'],
          medications: ['Lisinopril 10mg - continued', 'Metformin 500mg - continued'],
          followUp: 'Return in 6 weeks for BP recheck. Labs ordered.',
          providerNotes: 'BP well-controlled on current regimen. A1c improved from 7.2 to 6.8. Continue current medications and lifestyle modifications.'
        },
        questionnairesRequired: [],
        notes: 'BP well-controlled. Labs reviewed. Continue current medications.'
      },
      {
        id: 'appt-5',
        patientId: 'patient-1',
        providerId: 'provider-2',
        providerName: 'James Park, MD',
        type: 'Follow Up',
        status: 'Completed',
        dateTime: '2025-01-15T09:00:00',
        duration: 30,
        location: 'Springfield Heart Institute',
        address: '600 Cardiac Way, Springfield, IL 62704',
        department: 'Cardiology',
        reason: 'Cardiology follow-up — hypertension management',
        instructions: '',
        isUpcoming: false,
        canCheckIn: false,
        canCancel: false,
        canReschedule: false,
        afterVisitSummary: {
          diagnoses: ['Essential Hypertension (I10)', 'Hyperlipidemia (E78.5)'],
          medications: ['Lisinopril 10mg - continued', 'Atorvastatin 20mg - continued'],
          followUp: 'Follow up in 3 months. Continue home BP monitoring.',
          providerNotes: 'Patient doing well. BP trending down. Lipid panel shows improvement. Stress test negative.'
        },
        questionnairesRequired: [],
        notes: 'Cardiology follow-up complete. Continue current regimen.'
      },
      {
        id: 'appt-6',
        patientId: 'patient-1',
        providerId: 'provider-1',
        providerName: 'Elizabeth Morrison, MD',
        type: 'Annual Physical',
        status: 'Completed',
        dateTime: '2024-11-20T15:30:00',
        duration: 60,
        location: 'Springfield Health Center — Main Campus',
        address: '500 Medical Dr, Springfield, IL 62704',
        department: 'Family Medicine',
        reason: 'Annual Physical Examination',
        instructions: '',
        isUpcoming: false,
        canCheckIn: false,
        canCancel: false,
        canReschedule: false,
        afterVisitSummary: {
          diagnoses: ['Essential Hypertension (I10)', 'Type 2 Diabetes Mellitus (E11)', 'Hyperlipidemia (E78.5)'],
          medications: ['Lisinopril 10mg - started', 'Atorvastatin 20mg - started', 'Metformin 500mg - started'],
          followUp: 'Follow up in 6 weeks. Labs in 3 months.',
          providerNotes: 'Annual physical complete. New diagnoses of hypertension, diabetes, and hyperlipidemia. Started on appropriate medications. Patient counseled on lifestyle modifications.'
        },
        questionnairesRequired: [],
        notes: 'Annual physical. New diagnoses and medications started.'
      }
    ],
    messages: [
      {
        id: 'msg-1',
        threadId: 'thread-1',
        parentId: null,
        from: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        to: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        subject: 'Your Recent Lab Results',
        body: "Hi Sarah,\n\nI've reviewed your recent lab work from March 1st and I'm pleased to report that everything looks great overall. Your cholesterol levels have improved significantly since your last visit — your LDL is slightly elevated at 132 mg/dL (normal is under 100), but this is an improvement from last year.\n\nYour blood sugar (A1c) has also improved from 7.2% to 6.8%, which shows your diet and medication changes are working well.\n\nPlease continue with your current medications and schedule a follow-up in 6 months.\n\nBest regards,\nDr. Elizabeth Morrison",
        date: '2025-03-08T14:23:00',
        isRead: false,
        isStarred: false,
        folder: 'inbox',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-2',
        threadId: 'thread-1',
        parentId: 'msg-1',
        from: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        to: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        subject: 'Re: Your Recent Lab Results',
        body: "Thank you, Dr. Morrison!\n\nI'm glad to hear the numbers are improving. Should I make any additional dietary changes to help bring the LDL down further? I've been trying to reduce saturated fat intake.\n\nAlso, should I continue taking Vitamin D3 at the current dose?\n\nThank you,\nSarah",
        date: '2025-03-09T10:15:00',
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-3',
        threadId: 'thread-2',
        parentId: null,
        from: { id: 'provider-5', name: 'Nursing Staff', type: 'care-team' },
        to: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        subject: 'Appointment Reminder — April 15 Annual Physical',
        body: "Dear Sarah Chen,\n\nThis is a reminder that you have an upcoming appointment:\n\nDate: Tuesday, April 15, 2025\nTime: 9:30 AM EDT\nProvider: Elizabeth Morrison, MD\nType: Annual Physical Exam\nLocation: Springfield Health Center — Main Campus\n500 Medical Dr, Springfield, IL 62704\n\nPlease remember to:\n• Fast for 12 hours before your appointment\n• Bring your current medication list\n• Arrive 15 minutes early to complete paperwork\n• Bring your insurance card and photo ID\n\nIf you need to cancel or reschedule, please contact us at least 24 hours in advance.\n\nSpringfield Health Care Team",
        date: '2025-04-08T09:00:00',
        isRead: false,
        isStarred: false,
        folder: 'inbox',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-4',
        threadId: 'thread-3',
        parentId: null,
        from: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        to: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        subject: 'Prescription Renewal Confirmation',
        body: "Hi Sarah,\n\nI've renewed your prescription for Metformin 500mg (twice daily). Your refill request has been sent to CVS Pharmacy #4521.\n\nThe prescription should be ready for pickup within 24 hours. You have 3 refills remaining after this one.\n\nPlease remember to take Metformin with meals to minimize stomach upset.\n\nBest,\nDr. Morrison",
        date: '2025-02-25T11:45:00',
        isRead: true,
        isStarred: false,
        folder: 'inbox',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-5',
        threadId: 'thread-4',
        parentId: null,
        from: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        to: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        subject: 'Question About Medication Side Effects',
        body: "Dear Dr. Morrison,\n\nI started taking Lisinopril about 3 weeks ago and I've noticed a dry cough that seems to be getting worse. Is this a common side effect? Should I be concerned?\n\nAlso, I've been feeling slightly dizzy when I stand up quickly. Is this related to the medication?\n\nThank you for your help.\n\nSarah Chen",
        date: '2025-01-20T16:30:00',
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-6',
        threadId: 'thread-4',
        parentId: 'msg-5',
        from: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        to: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        subject: 'Re: Question About Medication Side Effects',
        body: "Hi Sarah,\n\nYes, dry cough is a well-known side effect of ACE inhibitors like Lisinopril and affects about 10-15% of patients. It's not dangerous but can be bothersome.\n\nThe dizziness when standing (called orthostatic hypotension) can also occur as your blood pressure adjusts to the medication.\n\nIf the cough becomes severe or you have difficulty breathing, please call us immediately. Otherwise, let's monitor it — if it continues at your next visit we can discuss switching to a different class of blood pressure medication.\n\nFor the dizziness, try rising slowly from sitting or lying positions.\n\nBest,\nDr. Morrison",
        date: '2025-01-21T10:00:00',
        isRead: true,
        isStarred: false,
        folder: 'inbox',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-7',
        threadId: 'thread-4',
        parentId: 'msg-6',
        from: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        to: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        subject: 'Re: Question About Medication Side Effects',
        body: "Thank you, Dr. Morrison. That's very helpful. The cough has been persistent but manageable. I'll bring it up at my next appointment.\n\nI'll try rising slowly for the dizziness. \n\nSarah",
        date: '2025-01-21T14:20:00',
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      },
      {
        id: 'msg-8',
        threadId: 'thread-5',
        parentId: null,
        from: { id: 'patient-1', name: 'Sarah Chen', type: 'patient' },
        to: { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
        subject: 'Follow-up question about diet',
        body: "Hi Dr. Morrison,\n\nI had a follow-up question about the dietary changes we discussed at my last visit. Should I be limiting sodium to 1500mg or 2000mg per day for my blood pressure? \n\nAlso, I read that grapefruit can interact with statins — is it OK to eat grapefruit since I'm on Atorvastatin?\n\nThank you,\nSarah",
        date: '2025-03-10T09:30:00',
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: false,
        attachments: [],
        isUrgent: false
      }
    ],
    testResults: [
      {
        id: 'test-1',
        patientId: 'patient-1',
        orderedBy: 'Elizabeth Morrison, MD',
        orderedById: 'provider-1',
        testName: 'Comprehensive Metabolic Panel',
        category: 'Lab',
        orderedDate: '2025-03-01',
        collectedDate: '2025-03-01T08:30:00',
        resultDate: '2025-03-02T16:00:00',
        status: 'Final',
        isReviewed: true,
        providerComment: 'All values look normal. Great improvement overall! Continue current medications and lifestyle modifications.',
        observations: [
          { id: 'obs-1-1', name: 'Glucose', value: '95', unit: 'mg/dL', referenceRange: '70-100', status: 'Normal', flag: null },
          { id: 'obs-1-2', name: 'BUN', value: '15', unit: 'mg/dL', referenceRange: '7-20', status: 'Normal', flag: null },
          { id: 'obs-1-3', name: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'Normal', flag: null },
          { id: 'obs-1-4', name: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '136-145', status: 'Normal', flag: null },
          { id: 'obs-1-5', name: 'Potassium', value: '4.2', unit: 'mEq/L', referenceRange: '3.5-5.0', status: 'Normal', flag: null },
          { id: 'obs-1-6', name: 'Chloride', value: '102', unit: 'mEq/L', referenceRange: '98-107', status: 'Normal', flag: null },
          { id: 'obs-1-7', name: 'CO2', value: '24', unit: 'mEq/L', referenceRange: '21-32', status: 'Normal', flag: null },
          { id: 'obs-1-8', name: 'Calcium', value: '9.4', unit: 'mg/dL', referenceRange: '8.5-10.5', status: 'Normal', flag: null },
          { id: 'obs-1-9', name: 'Total Protein', value: '7.2', unit: 'g/dL', referenceRange: '6.3-8.2', status: 'Normal', flag: null },
          { id: 'obs-1-10', name: 'Albumin', value: '4.1', unit: 'g/dL', referenceRange: '3.5-5.0', status: 'Normal', flag: null },
          { id: 'obs-1-11', name: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', referenceRange: '0.1-1.2', status: 'Normal', flag: null },
          { id: 'obs-1-12', name: 'ALT', value: '22', unit: 'U/L', referenceRange: '7-40', status: 'Normal', flag: null },
          { id: 'obs-1-13', name: 'AST', value: '19', unit: 'U/L', referenceRange: '10-40', status: 'Normal', flag: null },
          { id: 'obs-1-14', name: 'Alkaline Phosphatase', value: '68', unit: 'U/L', referenceRange: '44-147', status: 'Normal', flag: null }
        ]
      },
      {
        id: 'test-2',
        patientId: 'patient-1',
        orderedBy: 'Elizabeth Morrison, MD',
        orderedById: 'provider-1',
        testName: 'Lipid Panel',
        category: 'Lab',
        orderedDate: '2025-03-01',
        collectedDate: '2025-03-01T08:30:00',
        resultDate: '2025-03-02T16:00:00',
        status: 'Final',
        isReviewed: false,
        providerComment: 'LDL is slightly elevated. Continue Atorvastatin and heart-healthy diet. Recheck in 6 months.',
        observations: [
          { id: 'obs-2-1', name: 'Total Cholesterol', value: '198', unit: 'mg/dL', referenceRange: '<200', status: 'Normal', flag: null },
          { id: 'obs-2-2', name: 'LDL Cholesterol', value: '132', unit: 'mg/dL', referenceRange: '<100', status: 'High', flag: 'H' },
          { id: 'obs-2-3', name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '>40', status: 'Normal', flag: null },
          { id: 'obs-2-4', name: 'Triglycerides', value: '148', unit: 'mg/dL', referenceRange: '<150', status: 'Normal', flag: null },
          { id: 'obs-2-5', name: 'VLDL Cholesterol', value: '14', unit: 'mg/dL', referenceRange: '5-40', status: 'Normal', flag: null }
        ]
      },
      {
        id: 'test-3',
        patientId: 'patient-1',
        orderedBy: 'Elizabeth Morrison, MD',
        orderedById: 'provider-1',
        testName: 'Complete Blood Count (CBC)',
        category: 'Lab',
        orderedDate: '2025-03-01',
        collectedDate: '2025-03-01T08:30:00',
        resultDate: '2025-03-02T16:00:00',
        status: 'Final',
        isReviewed: true,
        providerComment: 'CBC within normal limits. No concerns.',
        observations: [
          { id: 'obs-3-1', name: 'WBC', value: '6.8', unit: 'K/uL', referenceRange: '4.5-11.0', status: 'Normal', flag: null },
          { id: 'obs-3-2', name: 'RBC', value: '4.6', unit: 'M/uL', referenceRange: '4.1-5.1', status: 'Normal', flag: null },
          { id: 'obs-3-3', name: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '12.0-16.0', status: 'Normal', flag: null },
          { id: 'obs-3-4', name: 'Hematocrit', value: '41.2', unit: '%', referenceRange: '36-46', status: 'Normal', flag: null },
          { id: 'obs-3-5', name: 'MCV', value: '88', unit: 'fL', referenceRange: '80-100', status: 'Normal', flag: null },
          { id: 'obs-3-6', name: 'Platelets', value: '245', unit: 'K/uL', referenceRange: '150-400', status: 'Normal', flag: null }
        ]
      },
      {
        id: 'test-4',
        patientId: 'patient-1',
        orderedBy: 'Elizabeth Morrison, MD',
        orderedById: 'provider-1',
        testName: 'Hemoglobin A1c',
        category: 'Lab',
        orderedDate: '2025-01-15',
        collectedDate: '2025-01-15T08:30:00',
        resultDate: '2025-01-16T14:00:00',
        status: 'Final',
        isReviewed: true,
        providerComment: 'A1c improved from 7.2% to 6.8%. Continue current diabetes management. Goal is below 7.0%.',
        observations: [
          { id: 'obs-4-1', name: 'Hemoglobin A1c', value: '6.8', unit: '%', referenceRange: '<7.0', status: 'Normal', flag: null },
          { id: 'obs-4-2', name: 'Est. Average Glucose', value: '148', unit: 'mg/dL', referenceRange: '<154', status: 'Normal', flag: null }
        ]
      },
      {
        id: 'test-5',
        patientId: 'patient-1',
        orderedBy: 'Elizabeth Morrison, MD',
        orderedById: 'provider-1',
        testName: 'Thyroid Panel (TSH, T3, T4)',
        category: 'Lab',
        orderedDate: '2025-01-15',
        collectedDate: '2025-01-15T08:30:00',
        resultDate: '2025-01-16T14:00:00',
        status: 'Final',
        isReviewed: true,
        providerComment: 'Thyroid function normal. No thyroid medication changes needed.',
        observations: [
          { id: 'obs-5-1', name: 'TSH', value: '2.1', unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'Normal', flag: null },
          { id: 'obs-5-2', name: 'Free T4', value: '1.1', unit: 'ng/dL', referenceRange: '0.8-1.8', status: 'Normal', flag: null },
          { id: 'obs-5-3', name: 'Free T3', value: '3.2', unit: 'pg/mL', referenceRange: '2.3-4.2', status: 'Normal', flag: null }
        ]
      }
    ],
    medications: [
      {
        id: 'med-1',
        patientId: 'patient-1',
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10 mg',
        form: 'Tablet',
        frequency: 'Once daily',
        route: 'Oral',
        instructions: 'Take one tablet by mouth once daily in the morning. May be taken with or without food.',
        prescriber: 'Elizabeth Morrison, MD',
        prescriberId: 'provider-1',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Active',
        startDate: '2024-06-15',
        endDate: null,
        lastFilledDate: '2025-02-20',
        refillsRemaining: 3,
        totalRefills: 5,
        isRefillable: true,
        daysSupply: 30,
        quantity: 30,
        reason: 'Hypertension'
      },
      {
        id: 'med-2',
        patientId: 'patient-1',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '20 mg',
        form: 'Tablet',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        instructions: 'Take one tablet by mouth once daily at bedtime. Avoid grapefruit and grapefruit juice while taking this medication.',
        prescriber: 'Elizabeth Morrison, MD',
        prescriberId: 'provider-1',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Active',
        startDate: '2024-06-15',
        endDate: null,
        lastFilledDate: '2025-02-20',
        refillsRemaining: 4,
        totalRefills: 5,
        isRefillable: true,
        daysSupply: 30,
        quantity: 30,
        reason: 'Hyperlipidemia'
      },
      {
        id: 'med-3',
        patientId: 'patient-1',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500 mg',
        form: 'Tablet',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        instructions: 'Take one tablet by mouth twice daily with meals (breakfast and dinner). Swallow whole.',
        prescriber: 'Elizabeth Morrison, MD',
        prescriberId: 'provider-1',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Active',
        startDate: '2024-06-15',
        endDate: null,
        lastFilledDate: '2025-03-01',
        refillsRemaining: 2,
        totalRefills: 5,
        isRefillable: true,
        daysSupply: 30,
        quantity: 60,
        reason: 'Type 2 Diabetes Mellitus'
      },
      {
        id: 'med-4',
        patientId: 'patient-1',
        name: 'Vitamin D3',
        genericName: 'Cholecalciferol',
        dosage: '2000 IU',
        form: 'Tablet',
        frequency: 'Once daily',
        route: 'Oral',
        instructions: 'Take one tablet by mouth once daily with food for best absorption.',
        prescriber: 'Elizabeth Morrison, MD',
        prescriberId: 'provider-1',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Active',
        startDate: '2024-11-20',
        endDate: null,
        lastFilledDate: '2025-01-15',
        refillsRemaining: 5,
        totalRefills: 6,
        isRefillable: true,
        daysSupply: 90,
        quantity: 90,
        reason: 'Vitamin D Deficiency'
      },
      {
        id: 'med-5',
        patientId: 'patient-1',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin Trihydrate',
        dosage: '500 mg',
        form: 'Capsule',
        frequency: 'Three times daily',
        route: 'Oral',
        instructions: 'Take one capsule three times daily for 10 days. Complete the full course.',
        prescriber: 'Elizabeth Morrison, MD',
        prescriberId: 'provider-1',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Discontinued',
        startDate: '2024-08-10',
        endDate: '2024-08-20',
        lastFilledDate: '2024-08-10',
        refillsRemaining: 0,
        totalRefills: 0,
        isRefillable: false,
        daysSupply: 10,
        quantity: 30,
        reason: 'Respiratory Infection'
      },
      {
        id: 'med-6',
        patientId: 'patient-1',
        name: 'Prednisone',
        genericName: 'Prednisone',
        dosage: '10 mg',
        form: 'Tablet',
        frequency: 'Taper per instructions',
        route: 'Oral',
        instructions: 'Day 1-2: Take 4 tablets once daily. Day 3-4: Take 3 tablets once daily. Day 5-6: Take 2 tablets once daily. Day 7: Take 1 tablet once daily. Take with food.',
        prescriber: 'Priya Sharma, MD',
        prescriberId: 'provider-3',
        pharmacy: 'CVS Pharmacy #4521',
        status: 'Discontinued',
        startDate: '2024-09-05',
        endDate: '2024-09-12',
        lastFilledDate: '2024-09-05',
        refillsRemaining: 0,
        totalRefills: 0,
        isRefillable: false,
        daysSupply: 7,
        quantity: 20,
        reason: 'Severe Allergic Reaction'
      }
    ],
    conditions: [
      {
        id: 'cond-1',
        patientId: 'patient-1',
        name: 'Essential Hypertension',
        icdCode: 'I10',
        clinicalStatus: 'Active',
        severity: 'Mild',
        onsetDate: '2024-06-01',
        diagnosedBy: 'Elizabeth Morrison, MD',
        notes: 'Well-controlled with Lisinopril 10mg. Home BP monitoring recommended.'
      },
      {
        id: 'cond-2',
        patientId: 'patient-1',
        name: 'Type 2 Diabetes Mellitus',
        icdCode: 'E11',
        clinicalStatus: 'Active',
        severity: 'Mild',
        onsetDate: '2024-03-15',
        diagnosedBy: 'Elizabeth Morrison, MD',
        notes: 'A1c improved to 6.8%. Continue Metformin and dietary modifications.'
      },
      {
        id: 'cond-3',
        patientId: 'patient-1',
        name: 'Hyperlipidemia',
        icdCode: 'E78.5',
        clinicalStatus: 'Active',
        severity: 'Mild',
        onsetDate: '2024-06-01',
        diagnosedBy: 'Elizabeth Morrison, MD',
        notes: 'LDL slightly elevated at 132 mg/dL. On Atorvastatin. Heart-healthy diet advised.'
      },
      {
        id: 'cond-4',
        patientId: 'patient-1',
        name: 'Seasonal Allergies',
        icdCode: 'J30.1',
        clinicalStatus: 'Active',
        severity: 'Mild',
        onsetDate: '2020-04-01',
        diagnosedBy: 'Elizabeth Morrison, MD',
        notes: 'Spring/Fall seasonal allergies. Managed with OTC antihistamines as needed.'
      }
    ],
    allergies: [
      {
        id: 'allergy-1',
        patientId: 'patient-1',
        allergen: 'Penicillin',
        type: 'Medication',
        reaction: 'Rash, Hives',
        severity: 'Moderate',
        status: 'Active',
        onsetDate: '2015-08-01',
        notes: 'Developed rash within 2 hours of first dose. Documented allergy — avoid all penicillin-class antibiotics.'
      },
      {
        id: 'allergy-2',
        patientId: 'patient-1',
        allergen: 'Peanuts',
        type: 'Food',
        reaction: 'Throat swelling, difficulty breathing',
        severity: 'Severe',
        status: 'Active',
        onsetDate: '2010-05-01',
        notes: 'Anaphylactic reaction. Patient carries EpiPen. Strict avoidance required.'
      },
      {
        id: 'allergy-3',
        patientId: 'patient-1',
        allergen: 'Latex',
        type: 'Environmental',
        reaction: 'Contact dermatitis, skin irritation',
        severity: 'Mild',
        status: 'Active',
        onsetDate: '2019-03-01',
        notes: 'Mild skin reaction to latex gloves. Alert staff for procedures.'
      }
    ],
    immunizations: [
      {
        id: 'imm-1',
        patientId: 'patient-1',
        vaccineName: 'Influenza (Flu)',
        vaccineCode: 'CVX-158',
        administrationDate: '2024-10-15',
        site: 'Left Deltoid',
        administrator: 'Springfield Health Center',
        lotNumber: 'FL2024-5521',
        status: 'Completed',
        nextDueDate: '2025-10-01'
      },
      {
        id: 'imm-2',
        patientId: 'patient-1',
        vaccineName: 'COVID-19 Booster (Moderna)',
        vaccineCode: 'CVX-228',
        administrationDate: '2024-09-20',
        site: 'Right Deltoid',
        administrator: 'Springfield Health Center',
        lotNumber: 'COVID-2024-M882',
        status: 'Completed',
        nextDueDate: null
      },
      {
        id: 'imm-3',
        patientId: 'patient-1',
        vaccineName: 'Tdap',
        vaccineCode: 'CVX-115',
        administrationDate: '2022-05-10',
        site: 'Right Deltoid',
        administrator: 'Springfield Health Center',
        lotNumber: 'TDAP-2022-441',
        status: 'Completed',
        nextDueDate: '2032-05-10'
      },
      {
        id: 'imm-4',
        patientId: 'patient-1',
        vaccineName: 'Hepatitis B (Dose 3 of 3)',
        vaccineCode: 'CVX-08',
        administrationDate: '2019-03-01',
        site: 'Left Deltoid',
        administrator: 'Springfield Health Center',
        lotNumber: 'HEP-B-2019-112',
        status: 'Completed',
        nextDueDate: null
      },
      {
        id: 'imm-5',
        patientId: 'patient-1',
        vaccineName: 'MMR',
        vaccineCode: 'CVX-03',
        administrationDate: '1991-07-15',
        site: 'Right Deltoid',
        administrator: 'Springfield Pediatrics',
        lotNumber: 'MMR-1991-77',
        status: 'Completed',
        nextDueDate: null
      },
      {
        id: 'imm-6',
        patientId: 'patient-1',
        vaccineName: 'Varicella',
        vaccineCode: 'CVX-21',
        administrationDate: '1993-02-20',
        site: 'Left Upper Arm',
        administrator: 'Springfield Pediatrics',
        lotNumber: 'VAR-1993-33',
        status: 'Completed',
        nextDueDate: null
      }
    ],
    vitals: [
      {
        id: 'vital-1',
        patientId: 'patient-1',
        date: '2025-03-01',
        readings: {
          bloodPressureSystolic: { value: 128, unit: 'mmHg' },
          bloodPressureDiastolic: { value: 82, unit: 'mmHg' },
          heartRate: { value: 72, unit: 'bpm' },
          temperature: { value: 98.6, unit: '°F' },
          respiratoryRate: { value: 16, unit: 'breaths/min' },
          weight: { value: 154, unit: 'lbs' },
          height: { value: 65, unit: 'in' },
          bmi: { value: 25.6, unit: 'kg/m²' },
          oxygenSaturation: { value: 98, unit: '%' }
        },
        recordedBy: 'Nursing Staff',
        location: 'Springfield Health Center'
      },
      {
        id: 'vital-2',
        patientId: 'patient-1',
        date: '2025-01-15',
        readings: {
          bloodPressureSystolic: { value: 132, unit: 'mmHg' },
          bloodPressureDiastolic: { value: 85, unit: 'mmHg' },
          heartRate: { value: 75, unit: 'bpm' },
          temperature: { value: 98.4, unit: '°F' },
          respiratoryRate: { value: 16, unit: 'breaths/min' },
          weight: { value: 156, unit: 'lbs' },
          height: { value: 65, unit: 'in' },
          bmi: { value: 25.9, unit: 'kg/m²' },
          oxygenSaturation: { value: 98, unit: '%' }
        },
        recordedBy: 'Nursing Staff',
        location: 'Springfield Health Center'
      },
      {
        id: 'vital-3',
        patientId: 'patient-1',
        date: '2024-11-20',
        readings: {
          bloodPressureSystolic: { value: 135, unit: 'mmHg' },
          bloodPressureDiastolic: { value: 88, unit: 'mmHg' },
          heartRate: { value: 78, unit: 'bpm' },
          temperature: { value: 98.8, unit: '°F' },
          respiratoryRate: { value: 18, unit: 'breaths/min' },
          weight: { value: 158, unit: 'lbs' },
          height: { value: 65, unit: 'in' },
          bmi: { value: 26.3, unit: 'kg/m²' },
          oxygenSaturation: { value: 97, unit: '%' }
        },
        recordedBy: 'Nursing Staff',
        location: 'Springfield Health Center'
      }
    ],
    billingStatements: [
      {
        id: 'bill-1',
        patientId: 'patient-1',
        statementDate: '2025-03-10',
        dueDate: '2025-04-10',
        totalAmount: 245.00,
        insurancePaid: 680.00,
        patientResponsibility: 245.00,
        amountPaid: 0,
        balanceDue: 245.00,
        status: 'Due',
        lineItems: [
          {
            id: 'item-1-1',
            serviceDate: '2025-03-01',
            description: 'Office Visit — Established Patient (Level 3)',
            cptCode: '99213',
            provider: 'Elizabeth Morrison, MD',
            chargedAmount: 250.00,
            insuranceAdjustment: -95.00,
            insurancePaid: -110.00,
            patientResponsibility: 45.00
          },
          {
            id: 'item-1-2',
            serviceDate: '2025-03-01',
            description: 'Comprehensive Metabolic Panel',
            cptCode: '80053',
            provider: 'Springfield Health Center Lab',
            chargedAmount: 175.00,
            insuranceAdjustment: -45.00,
            insurancePaid: -80.00,
            patientResponsibility: 50.00
          },
          {
            id: 'item-1-3',
            serviceDate: '2025-03-01',
            description: 'Lipid Panel',
            cptCode: '80061',
            provider: 'Springfield Health Center Lab',
            chargedAmount: 120.00,
            insuranceAdjustment: -30.00,
            insurancePaid: -40.00,
            patientResponsibility: 50.00
          },
          {
            id: 'item-1-4',
            serviceDate: '2025-03-01',
            description: 'Complete Blood Count',
            cptCode: '85025',
            provider: 'Springfield Health Center Lab',
            chargedAmount: 380.00,
            insuranceAdjustment: -30.00,
            insurancePaid: -250.00,
            patientResponsibility: 100.00
          }
        ]
      },
      {
        id: 'bill-2',
        patientId: 'patient-1',
        statementDate: '2025-02-01',
        dueDate: '2025-03-01',
        totalAmount: 75.00,
        insurancePaid: 180.00,
        patientResponsibility: 75.00,
        amountPaid: 75.00,
        balanceDue: 0,
        status: 'Paid',
        lineItems: [
          {
            id: 'item-2-1',
            serviceDate: '2025-01-15',
            description: 'Office Visit — Follow Up (Level 2)',
            cptCode: '99212',
            provider: 'James Park, MD',
            chargedAmount: 180.00,
            insuranceAdjustment: -55.00,
            insurancePaid: -50.00,
            patientResponsibility: 75.00
          }
        ]
      },
      {
        id: 'bill-3',
        patientId: 'patient-1',
        statementDate: '2024-12-15',
        dueDate: '2025-01-15',
        totalAmount: 150.00,
        insurancePaid: 420.00,
        patientResponsibility: 150.00,
        amountPaid: 150.00,
        balanceDue: 0,
        status: 'Paid',
        lineItems: [
          {
            id: 'item-3-1',
            serviceDate: '2024-11-20',
            description: 'Annual Physical Exam',
            cptCode: '99395',
            provider: 'Elizabeth Morrison, MD',
            chargedAmount: 350.00,
            insuranceAdjustment: -120.00,
            insurancePaid: -80.00,
            patientResponsibility: 150.00
          },
          {
            id: 'item-3-2',
            serviceDate: '2024-11-20',
            description: 'Influenza Vaccine Administration',
            cptCode: '90471',
            provider: 'Springfield Health Center',
            chargedAmount: 50.00,
            insuranceAdjustment: -15.00,
            insurancePaid: -35.00,
            patientResponsibility: 0
          }
        ]
      }
    ],
    insurance: [
      {
        id: 'ins-1',
        patientId: 'patient-1',
        planName: 'Blue Cross Blue Shield PPO',
        planType: 'PPO',
        memberId: 'XYZ123456789',
        groupNumber: 'GRP-98765',
        subscriberName: 'Sarah Chen',
        relationship: 'Self',
        effectiveDate: '2024-01-01',
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
        contactPhone: '1-800-555-BCBS',
        isActive: true
      }
    ],
    preventiveCare: [
      {
        id: 'prev-1',
        patientId: 'patient-1',
        name: 'Annual Flu Vaccination',
        category: 'Immunization',
        status: 'Completed',
        lastCompleted: '2024-10-15',
        nextDue: '2025-10-01',
        frequency: 'Annually',
        notes: 'Completed at annual flu clinic'
      },
      {
        id: 'prev-2',
        patientId: 'patient-1',
        name: 'Mammogram',
        category: 'Screening',
        status: 'Due',
        lastCompleted: '2024-07-15',
        nextDue: '2025-07-15',
        frequency: 'Annually',
        notes: 'Annual screening mammogram recommended for women 40+'
      },
      {
        id: 'prev-3',
        patientId: 'patient-1',
        name: 'Colonoscopy',
        category: 'Screening',
        status: 'Not Applicable',
        lastCompleted: null,
        nextDue: null,
        frequency: 'Every 10 years (starting at 45)',
        notes: 'Not yet due — recommended starting at age 45'
      },
      {
        id: 'prev-4',
        patientId: 'patient-1',
        name: 'Annual Physical Exam',
        category: 'Exam',
        status: 'Due',
        lastCompleted: '2024-11-20',
        nextDue: '2025-04-15',
        frequency: 'Annually',
        notes: 'Upcoming annual physical scheduled for April 15, 2025'
      },
      {
        id: 'prev-5',
        patientId: 'patient-1',
        name: 'Eye Exam',
        category: 'Exam',
        status: 'Due',
        lastCompleted: '2024-06-01',
        nextDue: '2025-06-01',
        frequency: 'Annually',
        notes: 'Annual eye exam for diabetic patients'
      },
      {
        id: 'prev-6',
        patientId: 'patient-1',
        name: 'Dental Cleaning',
        category: 'Exam',
        status: 'Overdue',
        lastCompleted: '2024-07-01',
        nextDue: '2025-01-01',
        frequency: 'Every 6 months',
        notes: 'Overdue — please schedule a dental cleaning'
      }
    ],
    drafts: [],
    letters: [],
    familyHistory: [],
    medicalHistory: [],
    ui: {
      activeSection: 'home',
      selectedAppointment: null,
      selectedMessage: null,
      selectedTestResult: null,
      selectedMedication: null,
      selectedBill: null,
      sideMenuOpen: false,
      messageComposerOpen: false,
      schedulingFlowStep: null,
      refillSelections: [],
      unreadMessageCount: 2,
      communicationPrefs: {
        apptReminderEmail: true,
        apptReminderText: true,
        testResultEmail: true,
        testResultText: false,
        billingEmail: true,
        billingText: false,
        marketing: false
      },
      notificationBanners: [
        { id: 'notif-1', type: 'appointment', text: 'Upcoming: Annual Physical on Apr 15 at 9:30 AM', dismissed: false },
        { id: 'notif-2', type: 'result', text: 'New test results available from Mar 1', dismissed: false }
      ]
    }
  }
}

function deepMerge(target, source) {
  if (!source) return target
  const result = { ...target }
  for (const key in source) {
    if (source[key] !== null && source[key] !== undefined && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else if (source[key] !== null && source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid)
  const iKey = initialKey(sid)
  const defaultData = createInitialData()

  if (customState) {
    const merged = { ...defaultData, ...customState }
    localStorage.setItem(sKey, JSON.stringify(merged))
    if (!localStorage.getItem(iKey)) {
      localStorage.setItem(iKey, JSON.stringify(merged))
    }
    return merged
  }

  const saved = localStorage.getItem(sKey)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      // fall through to default
    }
  }

  localStorage.setItem(sKey, JSON.stringify(defaultData))
  if (!localStorage.getItem(iKey)) {
    localStorage.setItem(iKey, JSON.stringify(defaultData))
  }
  return defaultData
}

export const INITIAL_STATE = createInitialData()
