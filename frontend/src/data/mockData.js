// =============================================================================
// API INTEGRATION: Replace with fetch calls to backend
// Base URL: ${import.meta.env.VITE_API_URL || '/api'}
// =============================================================================
// Replace with:
// fetch('/api/patients')
//   .then(response => response.json())
//   .then(data => setPatients(data))
//   .catch(error => console.error('Error fetching patients:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "string",
//       "mrn": "string",
//       "name": "string",
//       "age": "number",
//       "gender": "string",
//       "dob": "string (YYYY-MM-DD)",
//       "bloodType": "string",
//       "weight": "string",
//       "height": "string",
//       "phone": "string",
//       "email": "string",
//       "address": "string",
//       "emergencyContact": "string",
//       "insurance": "string",
//       "primaryPhysician": "string",
//       "allergies": ["string"],
//       "conditions": ["string"],
//       "lastVisit": "string (YYYY-MM-DD)",
//       "nextAppointment": "string (YYYY-MM-DD)",
//       "avatar": "string|null"
//     }
//   ],
//   "meta": {
//     "total": "number",
//     "page": "number",
//     "limit": "number"
//   }
// }
// =============================================================================

// Mock patient data for demonstration
export const patients = [
  {
    id: 'P001',
    mrn: 'MRN-2024-001',
    name: 'Sarah Johnson',
    age: 67,
    gender: 'Female',
    dob: '1957-03-15',
    bloodType: 'A+',
    weight: '165 lbs',
    height: '5\'6"',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    address: '123 Oak Street, Boston, MA 02115',
    emergencyContact: 'John Johnson - Son - (555) 123-4568',
    insurance: 'BlueCross BlueShield - PPO',
    primaryPhysician: 'Dr. Michael Chen',
    allergies: ['Penicillin', 'Sulfa drugs'],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-20',
    avatar: null
  },
  {
    id: 'P002',
    mrn: 'MRN-2024-002',
    name: 'Robert Martinez',
    age: 52,
    gender: 'Male',
    dob: '1972-08-22',
    bloodType: 'O-',
    weight: '198 lbs',
    height: '5\'10"',
    phone: '(555) 234-5678',
    email: 'robert.martinez@email.com',
    address: '456 Maple Ave, Cambridge, MA 02139',
    emergencyContact: 'Maria Martinez - Wife - (555) 234-5679',
    insurance: 'Aetna - HMO',
    primaryPhysician: 'Dr. Emily Watson',
    allergies: ['Latex', 'Aspirin'],
    conditions: ['Coronary Artery Disease', 'COPD', 'Obesity'],
    lastVisit: '2024-01-10',
    nextAppointment: '2024-02-25',
    avatar: null
  },
  {
    id: 'P003',
    mrn: 'MRN-2024-003',
    name: 'Emily Chen',
    age: 34,
    gender: 'Female',
    dob: '1990-05-08',
    bloodType: 'B+',
    weight: '128 lbs',
    height: '5\'4"',
    phone: '(555) 345-6789',
    email: 'emily.chen@email.com',
    address: '789 Pine Road, Brookline, MA 02445',
    emergencyContact: 'David Chen - Brother - (555) 345-6780',
    insurance: 'United Healthcare - PPO',
    primaryPhysician: 'Dr. Michael Chen',
    allergies: [],
    conditions: ['Asthma', 'Anxiety Disorder'],
    lastVisit: '2024-01-20',
    nextAppointment: '2024-03-01',
    avatar: null
  },
  {
    id: 'P004',
    mrn: 'MRN-2024-004',
    name: 'James Wilson',
    age: 71,
    gender: 'Male',
    dob: '1953-11-30',
    bloodType: 'AB+',
    weight: '175 lbs',
    height: '5\'8"',
    phone: '(555) 456-7890',
    email: 'james.wilson@email.com',
    address: '321 Elm Street, Newton, MA 02458',
    emergencyContact: 'Susan Wilson - Daughter - (555) 456-7891',
    insurance: 'Medicare - Part B',
    primaryPhysician: 'Dr. Emily Watson',
    allergies: ['Codeine', 'Iodine contrast'],
    conditions: ['Atrial Fibrillation', 'Stage 3 CKD', 'Osteoarthritis'],
    lastVisit: '2024-01-05',
    nextAppointment: '2024-02-15',
    avatar: null
  }
];

// =============================================================================
// API INTEGRATION: Clinical Summaries
// Endpoint: GET /api/patients/:patientId/clinical-summary
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/clinical-summary`)
//   .then(response => response.json())
//   .then(data => setClinicalSummary(data))
//   .catch(error => console.error('Error fetching clinical summary:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": {
//     "generatedAt": "string (ISO 8601)",
//     "summary": "string (markdown)",
//     "keyFindings": ["string"],
//     "recommendations": ["string"]
//   }
// }
// =============================================================================

export const clinicalSummaries = {
  'P001': {
    generatedAt: '2024-01-25T10:30:00Z',
    summary: `## Clinical Summary for Sarah Johnson

### Chief Complaint
Patient presents for routine diabetes management follow-up. Reports increased fatigue over past 2 weeks and occasional dizziness when standing.

### History of Present Illness
67-year-old female with 15-year history of Type 2 Diabetes Mellitus, Hypertension, and Hyperlipidemia. Reports adherence to metformin 1000mg twice daily and lisinopril 10mg daily. Recent blood glucose readings show increased variability with fasting glucose ranging 140-180 mg/dL. Denies hypoglycemia episodes. Dizziness described as lightheadedness on standing, no syncope.

### Physical Examination
- BP: 138/85 mmHg (sitting), 125/80 mmHg (standing) - orthostatic drop noted
- HR: 78 bpm, regular
- Weight: 165 lbs (stable from last visit)
- Foot exam: intact sensation, no lesions
- Cardiac: Regular rate and rhythm, no murmurs

### Assessment & Plan
1. **Type 2 Diabetes** - HbA1c 7.8% (up from 7.2% 3 months ago). Consider adding SGLT2 inhibitor for better glycemic control and cardiovascular protection.
2. **Hypertension** - BP controlled but orthostatic changes noted. Continue current regimen, advise slow position changes.
3. **Hyperlipidemia** - LDL 82 mg/dL on rosuvastatin. Goal met, continue current dose.
4. **Fatigue** - Could be related to diabetes control or anemia. Order CBC and TSH.`,
    keyFindings: [
      'HbA1c elevated at 7.8% (target <7%)',
      'Orthostatic hypotension noted',
      'LDL cholesterol at goal (82 mg/dL)',
      'Foot exam normal, no diabetic complications',
      'Weight stable'
    ],
    recommendations: [
      'Add empagliflozin 10mg daily for glycemic control',
      'Repeat CBC and TSH to evaluate fatigue',
      'Patient education on slow position changes',
      'Follow-up in 6 weeks with lab results'
    ]
  },
  'P002': {
    generatedAt: '2024-01-25T14:15:00Z',
    summary: `## Clinical Summary for Robert Martinez

### Chief Complaint
52-year-old male post-cardiac cath 2 weeks ago presenting for follow-up and medication adjustment. Reports mild chest discomfort with exertion.

### History of Present Illness
Patient underwent elective coronary angiography on 1/11/2024 revealing 70% stenosis in LAD. Medical management recommended. Currently on dual antiplatelet therapy with aspirin 81mg and clopidogrel 75mg daily. Beta-blocker titrated to metoprolol 50mg twice daily. Statin initiated at high intensity (atorvastatin 80mg).

### Physical Examination
- BP: 132/84 mmHg
- HR: 68 bpm
- Weight: 198 lbs (down 3 lbs from last visit)
- BMI: 28.4 (overweight)
- Cardiac: Regular rate and rhythm, no S3 or murmurs
- Lungs: Clear to auscultation bilaterally
- Extremities: No edema

### Assessment & Plan
1. **Coronary Artery Disease** - Single vessel disease, medically managed. Encourage cardiac rehabilitation referral.
2. **COPD** - Mild disease, currently stable. Continue fluticasone/salmeterol inhaler.
3. **Obesity** - BMI 28.4. Discuss weight loss goals of 10-15 lbs. Referral to nutrition.
4. **Medication Adjustments** - Clopidogrel to continue for 12 months total from procedure date.

**Important**: Instructed to report any chest pain, shortness of breath, or bleeding immediately.`,
    keyFindings: [
      'Post-cath follow-up - medically managed CAD',
      'Mild chest discomfort with exertion persists',
      'Weight loss of 3 lbs achieved',
      'Blood pressure and heart rate controlled',
      'No signs of heart failure'
    ],
    recommendations: [
      'Cardiac rehabilitation referral',
      'Nutrition consultation for weight management',
      'Continue dual antiplatelet therapy',
      'Stress test in 6 weeks if symptoms persist',
      'Annual flu vaccine up to date'
    ]
  }
};

// =============================================================================
// API INTEGRATION: Abnormal Findings
// Endpoint: GET /api/patients/:patientId/abnormal-findings
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/abnormal-findings`)
//   .then(response => response.json())
//   .then(data => setAbnormalFindings(data))
//   .catch(error => console.error('Error fetching abnormal findings:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "type": "string (Lab|Vital|Symptom|Imaging)",
//       "category": "string",
//       "finding": "string",
//       "normal": "string",
//       "severity": "string (low|medium|high|critical)",
//       "trend": "string (new|up|stable|down)",
//       "date": "string (YYYY-MM-DD)"
//     }
//   ]
// }
// =============================================================================

export const abnormalFindings = {
  'P001': [
    {
      id: 1,
      type: 'Lab',
      category: 'Glycemic Control',
      finding: 'HbA1c: 7.8%',
      normal: '< 7.0%',
      severity: 'high',
      trend: 'up',
      date: '2024-01-20'
    },
    {
      id: 2,
      type: 'Vital',
      category: 'Blood Pressure',
      finding: 'BP: 138/85 mmHg',
      normal: '< 130/80 mmHg',
      severity: 'medium',
      trend: 'stable',
      date: '2024-01-25'
    },
    {
      id: 3,
      type: 'Vital',
      category: 'Orthostatic BP',
      finding: '13 mmHg drop on standing',
      normal: '< 10 mmHg drop',
      severity: 'medium',
      trend: 'new',
      date: '2024-01-25'
    },
    {
      id: 4,
      type: 'Lab',
      category: 'Lipid Panel',
      finding: 'LDL: 82 mg/dL',
      normal: '< 100 mg/dL',
      severity: 'low',
      trend: 'stable',
      date: '2024-01-20'
    }
  ],
  'P002': [
    {
      id: 1,
      type: 'Imaging',
      category: 'Cardiac',
      finding: '70% LAD stenosis',
      normal: '< 50% stenosis',
      severity: 'critical',
      trend: 'new',
      date: '2024-01-11'
    },
    {
      id: 2,
      type: 'Symptom',
      category: 'Chest Pain',
      finding: 'Mild discomfort with exertion',
      normal: 'None',
      severity: 'high',
      trend: 'stable',
      date: '2024-01-25'
    },
    {
      id: 3,
      type: 'Lab',
      category: 'Weight',
      finding: 'BMI: 28.4',
      normal: '18.5 - 24.9',
      severity: 'medium',
      trend: 'down',
      date: '2024-01-25'
    },
    {
      id: 4,
      type: 'Lab',
      category: 'Lipid Panel',
      finding: 'LDL: 118 mg/dL (on treatment)',
      normal: '< 70 mg/dL (high risk)',
      severity: 'medium',
      trend: 'down',
      date: '2024-01-12'
    }
  ]
};

// =============================================================================
// API INTEGRATION: Issues Ranking
// Endpoint: GET /api/patients/:patientId/issues
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/issues`)
//   .then(response => response.json())
//   .then(data => setIssuesRanking(data))
//   .catch(error => console.error('Error fetching issues:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "issue": "string",
//       "urgency": "string (low|medium|high|critical)",
//       "action": "string",
//       "dueDate": "string (YYYY-MM-DD)",
//       "status": "string (pending|in-progress|completed|urgent)"
//     }
//   ]
// }
// =============================================================================

export const issuesRanking = {
  'P001': [
    {
      id: 1,
      issue: 'Poor glycemic control (HbA1c 7.8%)',
      urgency: 'high',
      action: 'Medication adjustment needed',
      dueDate: '2024-02-01',
      status: 'pending'
    },
    {
      id: 2,
      issue: 'Orthostatic hypotension',
      urgency: 'high',
      action: 'Monitor, patient education',
      dueDate: '2024-01-30',
      status: 'in-progress'
    },
    {
      id: 3,
      issue: 'Elevated BP despite treatment',
      urgency: 'medium',
      action: 'Continue monitoring',
      dueDate: '2024-02-15',
      status: 'pending'
    },
    {
      id: 4,
      issue: 'Fatigue workup pending',
      urgency: 'medium',
      action: 'Review CBC and TSH results',
      dueDate: '2024-02-05',
      status: 'pending'
    },
    {
      id: 5,
      issue: 'Lipid management at goal',
      urgency: 'low',
      action: 'Continue current statin',
      dueDate: '2024-06-01',
      status: 'completed'
    }
  ],
  'P002': [
    {
      id: 1,
      issue: 'Post-PCI chest discomfort',
      urgency: 'critical',
      action: 'Evaluate for re-occlusion',
      dueDate: '2024-01-26',
      status: 'urgent'
    },
    {
      id: 2,
      issue: 'LAD stenosis requiring monitoring',
      urgency: 'high',
      action: 'Cardiac rehab, lifestyle changes',
      dueDate: '2024-02-01',
      status: 'in-progress'
    },
    {
      id: 3,
      issue: 'Dual antiplatelet therapy compliance',
      urgency: 'high',
      action: 'Patient education on importance',
      dueDate: '2024-01-30',
      status: 'pending'
    },
    {
      id: 4,
      issue: 'Weight management',
      urgency: 'medium',
      action: 'Nutrition referral, exercise',
      dueDate: '2024-03-01',
      status: 'pending'
    },
    {
      id: 5,
      issue: 'COPD stable',
      urgency: 'low',
      action: 'Continue current inhalers',
      dueDate: '2024-06-01',
      status: 'completed'
    }
  ]
};

// =============================================================================
// API INTEGRATION: AI Scan Insights
// Endpoint: GET /api/patients/:patientId/scan-insights
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/scan-insights`)
//   .then(response => response.json())
//   .then(data => setScanInsights(data))
//   .catch(error => console.error('Error fetching scan insights:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "type": "string (CT|X-Ray|Echo|Cath|MRI)",
//       "bodyPart": "string",
//       "date": "string (YYYY-MM-DD)",
//       "finding": "string",
//       "aiConfidence": "number (0-100)",
//       "recommendation": "string",
//       "severity": "string (low|medium|high|critical)"
//     }
//   ]
// }
// =============================================================================

export const scanInsights = {
  'P001': [
    {
      id: 1,
      type: 'CT',
      bodyPart: 'Chest CT',
      date: '2024-01-18',
      finding: 'Small 4mm nodule in right lower lobe',
      aiConfidence: 85,
      recommendation: 'Follow-up CT in 6 months',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'X-Ray',
      bodyPart: 'Chest X-Ray',
      date: '2024-01-18',
      finding: 'No acute cardiopulmonary abnormality',
      aiConfidence: 98,
      recommendation: 'No further imaging needed',
      severity: 'low'
    }
  ],
  'P002': [
    {
      id: 1,
      type: 'Cath',
      bodyPart: 'Coronary Angiography',
      date: '2024-01-11',
      finding: '70% stenosis in proximal LAD, other vessels <50%',
      aiConfidence: 95,
      recommendation: 'Medical management recommended given single vessel disease',
      severity: 'critical'
    },
    {
      id: 2,
      type: 'Echo',
      bodyPart: 'Transthoracic Echo',
      date: '2024-01-10',
      finding: 'EF 55%, normal wall motion, mild mitral regurgitation',
      aiConfidence: 92,
      recommendation: 'Routine echo in 1 year',
      severity: 'low'
    }
  ]
};

// =============================================================================
// API INTEGRATION: Records History
// Endpoint: GET /api/patients/:patientId/records
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/records`)
//   .then(response => response.json())
//   .then(data => setRecordsHistory(data))
//   .catch(error => console.error('Error fetching records:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "date": "string (YYYY-MM-DD)",
//       "type": "string (Visit Note|Lab Results|Imaging|Prescription)",
//       "title": "string",
//       "provider": "string",
//       "status": "string (pending|final)"
//     }
//   ]
// }
// =============================================================================

export const recordsHistory = {
  'P001': [
    { id: 1, date: '2024-01-25', type: 'Visit Note', title: 'Diabetes Follow-up', provider: 'Dr. Michael Chen', status: 'final' },
    { id: 2, date: '2024-01-20', type: 'Lab Results', title: 'HbA1c, Lipid Panel, CBC', provider: 'Lab Services', status: 'final' },
    { id: 3, date: '2024-01-18', type: 'Imaging', title: 'Chest CT', provider: 'Radiology Dept', status: 'final' },
    { id: 4, date: '2024-01-15', type: 'Visit Note', title: 'Annual Physical', provider: 'Dr. Michael Chen', status: 'final' },
    { id: 5, date: '2024-01-10', type: 'Prescription', title: 'Metformin refill', provider: 'Dr. Michael Chen', status: 'final' }
  ],
  'P002': [
    { id: 1, date: '2024-01-25', type: 'Visit Note', title: 'Post-Cath Follow-up', provider: 'Dr. Emily Watson', status: 'final' },
    { id: 2, date: '2024-01-12', type: 'Lab Results', title: 'Comprehensive Metabolic Panel', provider: 'Lab Services', status: 'final' },
    { id: 3, date: '2024-01-11', type: 'Imaging', title: 'Coronary Angiography', provider: 'Interventional Cardiology', status: 'final' },
    { id: 4, date: '2024-01-10', type: 'Imaging', title: 'Transthoracic Echo', provider: 'Cardiology', status: 'final' },
    { id: 5, date: '2024-01-05', type: 'Visit Note', title: 'Cardiology Consult', provider: 'Dr. Emily Watson', status: 'final' }
  ]
};

// =============================================================================
// API INTEGRATION: Lab Results
// Endpoint: GET /api/patients/:patientId/lab-results
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/lab-results`)
//   .then(response => response.json())
//   .then(data => setLabResults(data))
//   .catch(error => console.error('Error fetching lab results:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "date": "string (YYYY-MM-DD)",
//       "test": "string",
//       "result": "string",
//       "unit": "string",
//       "range": "string",
//       "status": "string (low|normal|high)"
//     }
//   ]
// }
// =============================================================================

export const labResults = {
  'P001': [
    { id: 1, date: '2024-01-20', test: 'Hemoglobin A1c', result: '7.8%', unit: '%', range: '4.0-5.6', status: 'high' },
    { id: 2, date: '2024-01-20', test: 'Total Cholesterol', result: '185', unit: 'mg/dL', range: '<200', status: 'normal' },
    { id: 3, date: '2024-01-20', test: 'LDL Cholesterol', result: '82', unit: 'mg/dL', range: '<100', status: 'normal' },
    { id: 4, date: '2024-01-20', test: 'HDL Cholesterol', result: '58', unit: 'mg/dL', range: '>40', status: 'normal' },
    { id: 5, date: '2024-01-20', test: 'Triglycerides', result: '125', unit: 'mg/dL', range: '<150', status: 'normal' },
    { id: 6, date: '2024-01-20', test: 'Creatinine', result: '0.9', unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
    { id: 7, date: '2024-01-20', test: 'eGFR', result: '85', unit: 'mL/min/1.73m²', range: '>60', status: 'normal' }
  ],
  'P002': [
    { id: 1, date: '2024-01-12', test: 'Total Cholesterol', result: '195', unit: 'mg/dL', range: '<200', status: 'normal' },
    { id: 2, date: '2024-01-12', test: 'LDL Cholesterol', result: '118', unit: 'mg/dL', range: '<70', status: 'high' },
    { id: 3, date: '2024-01-12', test: 'HDL Cholesterol', result: '42', unit: 'mg/dL', range: '>40', status: 'normal' },
    { id: 4, date: '2024-01-12', test: 'Triglycerides', result: '175', unit: 'mg/dL', range: '<150', status: 'high' },
    { id: 5, date: '2024-01-12', test: 'Creatinine', result: '1.1', unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
    { id: 6, date: '2024-01-12', test: 'Troponin I', result: '0.02', unit: 'ng/mL', range: '<0.04', status: 'normal' },
    { id: 7, date: '2024-01-12', test: 'BNP', result: '85', unit: 'pg/mL', range: '<100', status: 'normal' }
  ]
};

// =============================================================================
// API INTEGRATION: Imaging Studies
// Endpoint: GET /api/patients/:patientId/imaging
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/imaging`)
//   .then(response => response.json())
//   .then(data => setImagingStudies(data))
//   .catch(error => console.error('Error fetching imaging studies:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "date": "string (YYYY-MM-DD)",
//       "type": "string (CT|X-Ray|Echo|Cath|MRI)",
//       "bodyPart": "string",
//       "result": "string",
//       "status": "string (pending|final)"
//     }
//   ]
// }
// =============================================================================

export const imagingStudies = {
  'P001': [
    { id: 1, date: '2024-01-18', type: 'CT', bodyPart: 'Chest', result: 'Small pulmonary nodule', status: 'pending' },
    { id: 2, date: '2023-07-15', type: 'X-Ray', bodyPart: 'Chest', result: 'No acute findings', status: 'final' },
    { id: 3, date: '2023-01-10', type: 'CT', bodyPart: 'Abdomen', result: 'Cholecystectomy status post', status: 'final' }
  ],
  'P002': [
    { id: 1, date: '2024-01-11', type: 'Cath', bodyPart: 'Coronary', result: '70% LAD stenosis', status: 'final' },
    { id: 2, date: '2024-01-10', type: 'Echo', bodyPart: 'Heart', result: 'EF 55%, mild MR', status: 'final' },
    { id: 3, date: '2023-06-20', type: 'X-Ray', bodyPart: 'Chest', result: 'COPD changes', status: 'final' }
  ]
};

// =============================================================================
// API INTEGRATION: Prescriptions
// Endpoint: GET /api/patients/:patientId/prescriptions
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/prescriptions`)
//   .then(response => response.json())
//   .then(data => setPrescriptions(data))
//   .catch(error => console.error('Error fetching prescriptions:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "medication": "string",
//       "dose": "string",
//       "frequency": "string",
//       "prescriber": "string",
//       "startDate": "string (YYYY-MM-DD)",
//       "status": "string (active|discontinued)"
//     }
//   ]
// }
// =============================================================================

export const prescriptions = {
  'P001': [
    { id: 1, medication: 'Metformin', dose: '1000mg', frequency: 'Twice daily', prescriber: 'Dr. Michael Chen', startDate: '2019-05-15', status: 'active' },
    { id: 2, medication: 'Lisinopril', dose: '10mg', frequency: 'Once daily', prescriber: 'Dr. Michael Chen', startDate: '2018-03-20', status: 'active' },
    { id: 3, medication: 'Rosuvastatin', dose: '20mg', frequency: 'Once daily at bedtime', prescriber: 'Dr. Michael Chen', startDate: '2020-01-10', status: 'active' },
    { id: 4, medication: 'Aspirin', dose: '81mg', frequency: 'Once daily', prescriber: 'Dr. Michael Chen', startDate: '2020-01-10', status: 'active' }
  ],
  'P002': [
    { id: 1, medication: 'Metoprolol Succinate', dose: '50mg', frequency: 'Twice daily', prescriber: 'Dr. Emily Watson', startDate: '2024-01-11', status: 'active' },
    { id: 2, medication: 'Atorvastatin', dose: '80mg', frequency: 'Once daily at bedtime', prescriber: 'Dr. Emily Watson', startDate: '2024-01-11', status: 'active' },
    { id: 3, medication: 'Aspirin', dose: '81mg', frequency: 'Once daily', prescriber: 'Dr. Emily Watson', startDate: '2024-01-11', status: 'active' },
    { id: 4, medication: 'Clopidogrel', dose: '75mg', frequency: 'Once daily', prescriber: 'Dr. Emily Watson', startDate: '2024-01-11', status: 'active' },
    { id: 5, medication: 'Fluticasone/Salmeterol', dose: '250/50mcg', frequency: 'Twice daily', prescriber: 'Dr. Emily Watson', startDate: '2022-06-15', status: 'active' },
    { id: 6, medication: 'Albuterol', dose: '90mcg', frequency: 'As needed', prescriber: 'Dr. Emily Watson', startDate: '2022-06-15', status: 'active' }
  ]
};

// =============================================================================
// API INTEGRATION: Upload Queue
// Endpoint: GET /api/patients/:patientId/uploads
// =============================================================================
// Replace with:
// fetch(`/api/patients/${patientId}/uploads`)
//   .then(response => response.json())
//   .then(data => setUploadQueue(data))
//   .catch(error => console.error('Error fetching upload queue:', error))
//
// Expected API Response Format:
// {
//   "status": "success",
//   "data": [
//     {
//       "id": "number",
//       "fileName": "string",
//       "fileType": "string (Lab Report|Imaging|Prescription)",
//       "size": "string",
//       "status": "string (pending|completed|failed)",
//       "uploadDate": "string (YYYY-MM-DD)|null"
//     }
//   ]
// }
// =============================================================================

export const uploadQueue = {
  'P001': [
    { id: 1, fileName: 'Lab_Results_Jan2024.pdf', fileType: 'Lab Report', size: '245 KB', status: 'completed', uploadDate: '2024-01-20' },
    { id: 2, fileName: 'Chest_CT_Scan.pdf', fileType: 'Imaging', size: '2.3 MB', status: 'completed', uploadDate: '2024-01-18' },
    { id: 3, fileName: 'Prescription_Renewal.pdf', fileType: 'Prescription', size: '128 KB', status: 'pending', uploadDate: null }
  ],
  'P002': [
    { id: 1, fileName: 'Angiography_Report.pdf', fileType: 'Imaging', size: '1.8 MB', status: 'completed', uploadDate: '2024-01-11' },
    { id: 2, fileName: 'Echo_Results.pdf', fileType: 'Imaging', size: '890 KB', status: 'completed', uploadDate: '2024-01-10' }
  ]
};

