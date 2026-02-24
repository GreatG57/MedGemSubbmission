/**
 * API Response Templates
 * 
 * This file contains detailed templates for all API responses.
 * Use these templates when building the backend to ensure consistency
 * with the frontend expectations.
 * 
 * Base URL: /api
 * All responses follow a standard format with status, data, and optional meta/error fields.
 */

// =============================================================================
// COMMON RESPONSE STRUCTURE
// =============================================================================
// All API responses should follow this structure:
// {
//   "status": "success" | "error",
//   "data": { ... } | [ ... ],
//   "message": "Optional human-readable message",
//   "meta": {
//     "timestamp": "ISO 8601 timestamp",
//     "requestId": "unique request identifier"
//   }
// }
// =============================================================================

// =============================================================================
// PATIENTS API
// =============================================================================
// Base Endpoint: /api/patients
// 
// GET /api/patients
// - Lists all patients with pagination and filtering
// - Query params: page, limit, search, status
// 
// GET /api/patients/:id
// - Get single patient by ID
// =============================================================================

export const GET_PATIENTS_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": "P001",
      "mrn": "MRN-2024-001",
      "name": "Sarah Johnson",
      "age": 67,
      "gender": "Female",
      "dob": "1957-03-15",
      "bloodType": "A+",
      "weight": "165 lbs",
      "height": "5'6\"",
      "phone": "(555) 123-4567",
      "email": "sarah.johnson@email.com",
      "address": "123 Oak Street, Boston, MA 02115",
      "emergencyContact": {
        "name": "John Johnson",
        "relationship": "Son",
        "phone": "(555) 123-4568"
      },
      "insurance": {
        "provider": "BlueCross BlueShield",
        "plan": "PPO",
        "memberId": "XYZ123456"
      },
      "primaryPhysician": "Dr. Michael Chen",
      "allergies": ["Penicillin", "Sulfa drugs"],
      "conditions": ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"],
      "lastVisit": "2024-01-15",
      "nextAppointment": "2024-02-20",
      "avatar": "https://api.example.com/avatars/P001.jpg"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
};

export const GET_PATIENT_BY_ID_RESPONSE = {
  "status": "success",
  "data": {
    "id": "P001",
    "mrn": "MRN-2024-001",
    "name": "Sarah Johnson",
    "age": 67,
    "gender": "Female",
    "dob": "1957-03-15",
    "bloodType": "A+",
    "weight": "165 lbs",
    "height": "5'6\"",
    "phone": "(555) 123-4567",
    "email": "sarah.johnson@email.com",
    "address": {
      "street": "123 Oak Street",
      "city": "Boston",
      "state": "MA",
      "zip": "02115"
    },
    "emergencyContact": {
      "name": "John Johnson",
      "relationship": "Son",
      "phone": "(555) 123-4568"
    },
    "insurance": {
      "provider": "BlueCross BlueShield",
      "plan": "PPO",
      "memberId": "XYZ123456",
      "groupNumber": "GRP-001"
    },
    "primaryPhysician": {
      "id": "DR001",
      "name": "Dr. Michael Chen",
      "specialty": "Internal Medicine"
    },
    "allergies": [
      {
        "id": "A001",
        "name": "Penicillin",
        "severity": "high",
        "reaction": "Anaphylaxis"
      },
      {
        "id": "A002",
        "name": "Sulfa drugs",
        "severity": "medium",
        "reaction": "Rash"
      }
    ],
    "conditions": [
      {
        "id": "C001",
        "name": "Type 2 Diabetes",
        "diagnosedDate": "2009-01-01",
        "status": "active",
        "icd10": "E11.9"
      },
      {
        "id": "C002",
        "name": "Hypertension",
        "diagnosedDate": "2015-03-15",
        "status": "active",
        "icd10": "I10"
      }
    ],
    "lastVisit": "2024-01-15",
    "nextAppointment": "2024-02-20",
    "avatar": "https://api.example.com/avatars/P001.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-25T10:30:00Z"
  }
};

// =============================================================================
// CLINICAL SUMMARY API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/clinical-summary
// =============================================================================

export const GET_CLINICAL_SUMMARY_RESPONSE = {
  "status": "success",
  "data": {
    "generatedAt": "2024-01-25T10:30:00Z",
    "generatedBy": "AI-Clinical-Engine v2.1",
    "patientId": "P001",
    "summary": `## Clinical Summary for Sarah Johnson

### Chief Complaint
Patient presents for routine diabetes management follow-up. Reports increased fatigue over past 2 weeks and occasional dizziness when standing.

### History of Present Illness
67-year-old female with 15-year history of Type 2 Diabetes Mellitus, Hypertension, and Hyperlipidemia...

### Physical Examination
- BP: 138/85 mmHg (sitting), 125/80 mmHg (standing) - orthostatic drop noted
- HR: 78 bpm, regular
- Weight: 165 lbs (stable from last visit)

### Assessment & Plan
1. **Type 2 Diabetes** - HbA1c 7.8% (up from 7.2% 3 months ago)...
2. **Hypertension** - BP controlled but orthostatic changes noted...`,
    "keyFindings": [
      {
        "finding": "HbA1c elevated at 7.8% (target <7%)",
        "category": "Lab",
        "significance": "high"
      },
      {
        "finding": "Orthostatic hypotension noted",
        "category": "Vital",
        "significance": "medium"
      }
    ],
    "recommendations": [
      {
        "recommendation": "Add empagliflozin 10mg daily for glycemic control",
        "priority": "high",
        "rationale": "SGLT2 inhibitors provide cardiovascular and renal protection"
      },
      {
        "recommendation": "Repeat CBC and TSH to evaluate fatigue",
        "priority": "medium",
        "rationale": "Rule out anemia and thyroid dysfunction"
      }
    ],
    "vitals": {
      "bloodPressure": {
        "sitting": "138/85",
        "standing": "125/80",
        "unit": "mmHg"
      },
      "heartRate": 78,
      "unit": "bpm",
      "weight": 165,
      "unit": "lbs"
    }
  }
};

// =============================================================================
// ABNORMAL FINDINGS API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/abnormal-findings
// =============================================================================

export const GET_ABNORMAL_FINDINGS_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "Lab",
      "category": "Glycemic Control",
      "finding": "HbA1c: 7.8%",
      "normal": "< 7.0%",
      "actualValue": 7.8,
      "unit": "%",
      "severity": "high",
      "trend": "up",
      "trendData": [
        { "date": "2023-10-15", "value": 7.2 },
        { "date": "2024-01-20", "value": 7.8 }
      ],
      "date": "2024-01-20",
      "notes": "Requires medication adjustment"
    },
    {
      "id": 2,
      "type": "Vital",
      "category": "Blood Pressure",
      "finding": "BP: 138/85 mmHg",
      "normal": "< 130/80 mmHg",
      "severity": "medium",
      "trend": "stable",
      "date": "2024-01-25"
    },
    {
      "id": 3,
      "type": "Vital",
      "category": "Orthostatic BP",
      "finding": "13 mmHg drop on standing",
      "normal": "< 10 mmHg drop",
      "severity": "medium",
      "trend": "new",
      "date": "2024-01-25"
    }
  ],
  "meta": {
    "totalCount": 3,
    "highSeverityCount": 1,
    "mediumSeverityCount": 2,
    "lowSeverityCount": 0
  }
};

// =============================================================================
// ISSUES RANKING API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/issues
// =============================================================================

export const GET_ISSUES_RANKING_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "issue": "Poor glycemic control (HbA1c 7.8%)",
      "category": "Diabetes Management",
      "urgency": "high",
      "action": "Medication adjustment needed",
      "dueDate": "2024-02-01",
      "status": "pending",
      "assignedTo": "Dr. Michael Chen",
      "createdAt": "2024-01-25T10:30:00Z"
    },
    {
      "id": 2,
      "issue": "Orthostatic hypotension",
      "category": "Cardiovascular",
      "urgency": "high",
      "action": "Monitor, patient education",
      "dueDate": "2024-01-30",
      "status": "in-progress",
      "assignedTo": "Dr. Michael Chen",
      "createdAt": "2024-01-25T10:30:00Z"
    }
  ],
  "meta": {
    "totalIssues": 5,
    "byUrgency": {
      "critical": 0,
      "high": 2,
      "medium": 2,
      "low": 1
    },
    "byStatus": {
      "pending": 3,
      "in-progress": 1,
      "completed": 1
    }
  }
};

// =============================================================================
// AI SCAN INSIGHTS API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/scan-insights
// =============================================================================

export const GET_SCAN_INSIGHTS_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "CT",
      "bodyPart": "Chest",
      "studyDate": "2024-01-18",
      "reportDate": "2024-01-19",
      "finding": "Small 4mm nodule in right lower lobe",
      "aiAnalysis": {
        "confidence": 85,
        "modelVersion": "Radiology-AI-v3.2",
        "recommendation": "Follow-up CT in 6 months",
        "differential": [
          { "diagnosis": "Benign granuloma", "probability": 45 },
          { "diagnosis": "Primary lung malignancy", "probability": 15 },
          { "diagnosis": "Metastatic lesion", "probability": 10 }
        ]
      },
      "severity": "medium",
      "radiologistNotes": "Nodule stable compared to prior exam from 2023",
      "status": "pending_review"
    },
    {
      "id": 2,
      "type": "X-Ray",
      "bodyPart": "Chest",
      "studyDate": "2024-01-18",
      "finding": "No acute cardiopulmonary abnormality",
      "aiAnalysis": {
        "confidence": 98,
        "modelVersion": "Radiology-AI-v3.2",
        "recommendation": "No further imaging needed"
      },
      "severity": "low",
      "status": "final"
    }
  ]
};

// =============================================================================
// RECORDS HISTORY API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/records
// =============================================================================

export const GET_RECORDS_HISTORY_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "date": "2024-01-25",
      "type": "Visit Note",
      "title": "Diabetes Follow-up",
      "provider": {
        "id": "DR001",
        "name": "Dr. Michael Chen",
        "specialty": "Internal Medicine"
      },
      "department": "Primary Care",
      "status": "final",
      "encounterId": "ENC-2024-0125-001",
      "documentUrl": "/api/documents/ENC-2024-0125-001"
    },
    {
      "id": 2,
      "date": "2024-01-20",
      "type": "Lab Results",
      "title": "HbA1c, Lipid Panel, CBC",
      "provider": "Lab Services",
      "status": "final",
      "orderId": "LAB-2024-0120-001",
      "resultsSummary": {
        "abnormalCount": 1,
        "criticalCount": 0
      }
    },
    {
      "id": 3,
      "date": "2024-01-18",
      "type": "Imaging",
      "title": "Chest CT",
      "provider": "Radiology Dept",
      "status": "final",
      "imagingId": "IMG-2024-0118-001"
    }
  ],
  "meta": {
    "total": 25,
    "byType": {
      "Visit Note": 10,
      "Lab Results": 8,
      "Imaging": 5,
      "Prescription": 2
    }
  }
};

// =============================================================================
// LAB RESULTS API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/lab-results
// =============================================================================

export const GET_LAB_RESULTS_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "orderDate": "2024-01-20",
      "resultDate": "2024-01-20",
      "test": {
        "code": "HBA1C",
        "name": "Hemoglobin A1c",
        "category": "Glycemic Control"
      },
      "result": 7.8,
      "unit": "%",
      "referenceRange": {
        "min": 4.0,
        "max": 5.6,
        "text": "4.0-5.6"
      },
      "status": "high",
      "interpretation": "Above target for diabetic patients",
      "previousResult": {
        "value": 7.2,
        "date": "2023-10-15",
        "trend": "up"
      }
    },
    {
      "id": 2,
      "orderDate": "2024-01-20",
      "resultDate": "2024-01-20",
      "test": {
        "code": "LDL",
        "name": "LDL Cholesterol",
        "category": "Lipid Panel"
      },
      "result": 82,
      "unit": "mg/dL",
      "referenceRange": {
        "max": 100,
        "text": "< 100"
      },
      "status": "normal",
      "previousResult": {
        "value": 95,
        "date": "2023-10-15",
        "trend": "down"
      }
    }
  ],
  "meta": {
    "orderId": "LAB-2024-0120-001",
    "orderingProvider": "Dr. Michael Chen",
    "collectedAt": "2024-01-20T08:00:00Z"
  }
};

// =============================================================================
// IMAGING STUDIES API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/imaging
// =============================================================================

export const GET_IMAGING_STUDIES_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "studyDate": "2024-01-18",
      "type": "CT",
      "bodyPart": "Chest",
      "reason": "Routine diabetes screening",
      "result": "Small pulmonary nodule",
      "impression": "4mm nodule in right lower lobe, likely benign",
      "status": "pending",
      "radiologist": "Dr. Jane Smith",
      "accessionNumber": "ACC-2024-0118-001",
      "imagesAvailable": true,
      "dicomUrl": "/api/dicom/ACC-2024-0118-001"
    },
    {
      "id": 2,
      "studyDate": "2023-07-15",
      "type": "X-Ray",
      "bodyPart": "Chest",
      "reason": "Annual screening",
      "result": "No acute cardiopulmonary abnormality",
      "status": "final",
      "radiologist": "Dr. Jane Smith"
    }
  ]
};

// =============================================================================
// PRESCRIPTIONS API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/prescriptions
// =============================================================================

export const GET_PRESCRIPTIONS_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "medication": {
        "rxNormCode": "861007",
        "name": "Metformin",
        "genericName": "Metformin Hydrochloride",
        "form": "Tablet",
        "strength": "1000mg"
      },
      "dose": "1000mg",
      "frequency": "Twice daily",
      "route": "Oral",
      "prescriber": {
        "id": "DR001",
        "name": "Dr. Michael Chen"
      },
      "prescribedDate": "2019-05-15",
      "startDate": "2019-05-15",
      "status": "active",
      "refillsRemaining": 3,
      "lastFilled": "2024-01-10",
      "pharmacy": {
        "name": "CVS Pharmacy",
        "phone": "(555) 999-0000"
      },
      "instructions": "Take one tablet twice daily with meals"
    },
    {
      "id": 2,
      "medication": {
        "rxNormCode": "314076",
        "name": "Lisinopril",
        "genericName": "Lisinopril",
        "form": "Tablet",
        "strength": "10mg"
      },
      "dose": "10mg",
      "frequency": "Once daily",
      "route": "Oral",
      "prescriber": {
        "id": "DR001",
        "name": "Dr. Michael Chen"
      },
      "prescribedDate": "2018-03-20",
      "startDate": "2018-03-20",
      "status": "active",
      "refillsRemaining": 5,
      "lastFilled": "2024-01-05"
    }
  ],
  "meta": {
    "activeCount": 4,
    "discontinuedCount": 2
  }
};

// =============================================================================
// UPLOAD QUEUE API
// =============================================================================
// Endpoint: GET /api/patients/:patientId/uploads
// 
// POST /api/patients/:patientId/uploads
// - Upload new document
// - Body: multipart/form-data with file
// =============================================================================

export const GET_UPLOAD_QUEUE_RESPONSE = {
  "status": "success",
  "data": [
    {
      "id": 1,
      "fileName": "Lab_Results_Jan2024.pdf",
      "originalName": "Lab_Results_Jan2024.pdf",
      "fileType": "Lab Report",
      "mimeType": "application/pdf",
      "size": 245000,
      "sizeFormatted": "245 KB",
      "status": "completed",
      "uploadDate": "2024-01-20T10:30:00Z",
      "uploadedBy": "Dr. Michael Chen",
      "documentId": "DOC-2024-0120-001",
      "downloadUrl": "/api/documents/DOC-2024-0120-001"
    },
    {
      "id": 2,
      "fileName": "Chest_CT_Scan.pdf",
      "originalName": "Chest_CT_Scan.pdf",
      "fileType": "Imaging",
      "mimeType": "application/pdf",
      "size": 2300000,
      "sizeFormatted": "2.3 MB",
      "status": "completed",
      "uploadDate": "2024-01-18T14:00:00Z",
      "uploadedBy": "Radiology Dept",
      "documentId": "DOC-2024-0118-001"
    },
    {
      "id": 3,
      "fileName": "Prescription_Renewal.pdf",
      "originalName": "Prescription_Renewal.pdf",
      "fileType": "Prescription",
      "mimeType": "application/pdf",
      "size": 128000,
      "sizeFormatted": "128 KB",
      "status": "pending",
      "uploadDate": null,
      "progress": 65
    }
  ],
  "meta": {
    "totalUploads": 3,
    "completed": 2,
    "pending": 1,
    "failed": 0,
    "totalStorageUsed": 2673000
  }
};

export const POST_UPLOAD_RESPONSE = {
  "status": "success",
  "message": "File uploaded successfully",
  "data": {
    "id": 4,
    "fileName": "New_Document.pdf",
    "documentId": "DOC-2024-0126-001",
    "uploadDate": "2024-01-26T10Z",
    "status": "processing:00:00",
    "processingProgress": 0
  }
};

// =============================================================================
// ERROR RESPONSE TEMPLATES
// =============================================================================

export const ERROR_RESPONSES = {
  NOT_FOUND: {
    "status": "error",
    "error": {
      "code": "NOT_FOUND",
      "message": "Resource not found",
      "details": "Patient with ID 'P999' was not found"
    },
    "meta": {
      "timestamp": "2024-01-26T10:00:00Z"
    }
  },
  
  UNAUTHORIZED: {
    "status": "error",
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required",
      "details": "Please provide a valid API key or authentication token"
    },
    "meta": {
      "timestamp": "2024-01-26T10:00:00Z"
    }
  },
  
  VALIDATION_ERROR: {
    "status": "error",
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid request parameters",
      "details": [
        {
          "field": "patientId",
          "message": "Patient ID must be a valid format (e.g., P001)"
        },
        {
          "field": "page",
          "message": "Page must be a positive integer"
        }
      ]
    },
    "meta": {
      "timestamp": "2024-01-26T10:00:00Z"
    }
  },
  
  SERVER_ERROR: {
    "status": "error",
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred",
      "requestId": "req-abc123-xyz789"
    },
    "meta": {
      "timestamp": "2024-01-26T10:00:00Z"
    }
  }
};

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

export const PAGINATION_LINKS = (baseUrl, page, limit, totalPages) => ({
  "first": `${baseUrl}?page=1&limit=${limit}`,
  "last": `${baseUrl}?page=${totalPages}&limit=${limit}`,
  "prev": page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
  "next": page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
});

