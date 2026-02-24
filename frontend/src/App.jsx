import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import PatientSearch from './components/PatientSearch';
import PatientOverview from './components/PatientOverview';
import PatientsView from './components/PatientsView';
import RecordsView from './components/RecordsView';
import AIInsightsView from './components/AIInsightsView';
import MessagesView from './components/MessagesView';
import ScheduleView from './components/ScheduleView';
import './styles/Dashboard.css';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

const ClinicalSummary = ({ analysis }) => {
  const summary = analysis ? { summary: analysis.patient_summary } : null;
  if (!summary) return (
    <div className="card">
      <div className="card-body">
        <div className="empty-state">
          <div className="empty-title">No summary available</div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
          </svg>
          AI Clinical Summary
          <span className="ai-badge">AI Generated</span>
        </div>
      </div>
      <div className="card-body">
        <div className="clinical-summary">
          {summary.summary.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h3 key={i}>{line.replace('## ', '')}</h3>;
            if (line.startsWith('### ')) return <h4 key={i}>{line.replace('### ', '')}</h4>;
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

const AbnormalFindings = ({ patient, analysis }) => {
  const findings = analysis
    ? analysis.key_findings.map((finding, index) => ({
        id: `${patient?.id || 'patient'}-finding-${index}`,
        type: finding.source,
        severity: finding.urgency,
        category: 'AI Finding',
        finding: finding.finding,
        normal: finding.detail || 'N/A',
        date: 'Generated now',
        trend: 'stable',
      }))
    : null;
  if (!findings) return null;
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Key Abnormal Findings
        </div>
      </div>
      <div className="card-body">
        <div className="findings-grid">
          {findings.map(f => (
            <div key={f.id} className="finding-card">
              <div className="finding-header">
                <span className="finding-type">{f.type}</span>
                <span className={`badge badge-${f.severity}`}>{f.severity.toUpperCase()}</span>
              </div>
              <div className="finding-category">{f.category}</div>
              <div className="finding-value">{f.finding}</div>
              <div className="finding-normal">Normal: {f.normal}</div>
              <div className="finding-footer">
                <span className="finding-date">{f.date}</span>
                <span className={`finding-trend ${f.trend}`}>
                  {f.trend === 'up' ? '↑ Increasing' : f.trend === 'down' ? '↓ Decreasing' : '→ Stable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const IssuesRanking = ({ patient, analysis }) => {
  const issues = analysis
    ? analysis.urgency_ranking.map((issue, index) => {
        const mappedFinding = analysis.key_findings.find((finding) => finding.finding === issue);
        return {
          id: `${patient?.id || 'patient'}-issue-${index}`,
          urgency: mappedFinding?.urgency || 'low',
          issue,
          action: mappedFinding?.detail || 'Review with complete patient context.',
          status: 'pending',
          dueDate: 'ASAP',
        };
      })
    : null;
  if (!issues) return null;
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Issues by Urgency
        </div>
      </div>
      <div className="card-body">
        <div className="issues-list">
          {issues.map(i => (
            <div key={i.id} className={`issue-item ${i.urgency}`}>
              <div className="issue-severity">
                <span className={`badge badge-${i.urgency}`}>{i.urgency.toUpperCase()}</span>
              </div>
              <div className="issue-content">
                <div className="issue-title">{i.issue}</div>
                <div className="issue-action">{i.action}</div>
                <div className="issue-meta">
                  <span className={`issue-status ${i.status}`}>{i.status}</span>
                  <span>Due: {i.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScanInsights = ({ analysis }) => {
  const scans = analysis
    ? analysis.scan_insights.map((scan, index) => ({
        id: `scan-${index}`,
        type: 'Scan',
        severity: 'medium',
        bodyPart: scan.region || 'Unknown region',
        date: 'Generated now',
        finding: scan.observation,
        aiConfidence: 90,
        recommendation: scan.note,
      }))
    : null;
  if (!scans) return null;
  
  const typeIcons = { CT: 'ct', 'X-Ray': 'xray', Cath: 'cath', Echo: 'echo' };
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Scan Insights
        </div>
      </div>
      <div className="card-body">
        <div className="scan-list">
          {scans.map(s => (
            <div key={s.id} className="scan-item">
              <div className={`scan-icon ${typeIcons[s.type]}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="scan-content">
                <div className="scan-header">
                  <span className="scan-type">{s.type}</span>
                  <span className={`badge badge-${s.severity}`}>{s.severity.toUpperCase()}</span>
                </div>
                <div className="scan-body-part">{s.bodyPart} - {s.date}</div>
                <div className="scan-finding">{s.finding}</div>
                <div className="scan-footer">
                  <div className="scan-confidence">
                    <span>AI: {s.aiConfidence}%</span>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{width: `${s.aiConfidence}%`}}></div>
                    </div>
                  </div>
                  <span className="scan-recommendation">{s.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MedicalRecordsUpload = ({ onAnalyze, onExplain, doctorState, patientState }) => {
  const uploads = [];
  const [patientHistoryText, setPatientHistoryText] = useState('');
  const [prescriptionsText, setPrescriptionsText] = useState('');
  const [labReportsText, setLabReportsText] = useState('');
  const [patientHistoryFile, setPatientHistoryFile] = useState(null);
  const [prescriptionsFile, setPrescriptionsFile] = useState(null);
  const [labReportsFile, setLabReportsFile] = useState(null);
  const [scanImage, setScanImage] = useState(null);
  const [reportText, setReportText] = useState('');
  const [reportFile, setReportFile] = useState(null);

  const handleAnalyzeSubmit = async (event) => {
    event.preventDefault();
    await onAnalyze({
      patient_history_text: patientHistoryText,
      prescriptions_text: prescriptionsText,
      lab_reports_text: labReportsText,
      patient_history_file: patientHistoryFile,
      prescriptions_file: prescriptionsFile,
      lab_reports_file: labReportsFile,
      scan_image: scanImage,
    });
  };

  const handleExplainSubmit = async (event) => {
    event.preventDefault();
    await onExplain({ report_text: reportText, report_file: reportFile });
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Records
        </div>
        <button className="btn btn-primary btn-sm">Upload New</button>
      </div>
      <div className="card-body">
        <form className="api-form" onSubmit={handleAnalyzeSubmit}>
          <div className="upload-text"><strong>AI Doctor Analysis</strong></div>
          <textarea
            className="input"
            rows={3}
            value={patientHistoryText}
            onChange={(event) => setPatientHistoryText(event.target.value)}
            placeholder="Patient history text"
          />
          <input
            className="input"
            type="file"
            accept=".txt,.pdf"
            onChange={(event) => setPatientHistoryFile(event.target.files?.[0] || null)}
          />
          <textarea
            className="input"
            rows={3}
            value={prescriptionsText}
            onChange={(event) => setPrescriptionsText(event.target.value)}
            placeholder="Prescriptions text"
          />
          <input
            className="input"
            type="file"
            accept=".txt,.pdf"
            onChange={(event) => setPrescriptionsFile(event.target.files?.[0] || null)}
          />
          <textarea
            className="input"
            rows={3}
            value={labReportsText}
            onChange={(event) => setLabReportsText(event.target.value)}
            placeholder="Lab reports text"
          />
          <input
            className="input"
            type="file"
            accept=".txt,.pdf"
            onChange={(event) => setLabReportsFile(event.target.files?.[0] || null)}
          />
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(event) => setScanImage(event.target.files?.[0] || null)}
          />
          <button className="btn btn-primary btn-sm" disabled={doctorState.loading} type="submit">
            {doctorState.loading ? 'Analyzing…' : 'Analyze Records'}
          </button>
          {doctorState.error && <p className="api-error">{doctorState.error}</p>}
        </form>

        <form className="api-form" onSubmit={handleExplainSubmit}>
          <div className="upload-text"><strong>Patient-friendly Explanation</strong></div>
          <textarea
            className="input"
            rows={3}
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            placeholder="Medical report text for patient explanation"
          />
          <input
            className="input"
            type="file"
            accept=".txt,.pdf"
            onChange={(event) => setReportFile(event.target.files?.[0] || null)}
          />
          <button className="btn btn-primary btn-sm" disabled={patientState.loading} type="submit">
            {patientState.loading ? 'Explaining…' : 'Generate Explanation'}
          </button>
          {patientState.error && <p className="api-error">{patientState.error}</p>}
          {patientState.result && <p className="api-success">{patientState.result.simplified_explanation}</p>}
        </form>

        <div className="upload-area">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div className="upload-text"><strong>Click to upload</strong> or drag and drop</div>
          <div className="upload-formats">PDF, Lab Reports, Prescriptions, Scans (MAX 50MB)</div>
        </div>
        {uploads.length > 0 && (
          <div className="upload-queue">
            <div className="upload-queue-header">
              <span className="upload-queue-title">Recent Uploads</span>
            </div>
            <div className="upload-list">
              {uploads.map(u => (
                <div key={u.id} className="upload-item">
                  <div className="upload-file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="upload-file-info">
                    <div className="upload-file-name">{u.fileName}</div>
                    <div className="upload-file-meta">{u.fileType} - {u.size}</div>
                    <div className="upload-status">
                      <svg className={`upload-status-icon ${u.status}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {u.status === 'completed' ? (
                          <polyline points="20 6 9 17 4 12"/>
                        ) : (
                          <circle cx="12" cy="12" r="10"/>
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowStatus = ({ patient }) => {
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(false);

  const checklistItems = [
    { id: 1, title: 'Confirm allergies & anticoagulants', meta: 'Last verified 3 days ago', badge: 'high', status: 'Review' },
    { id: 2, title: 'Validate triage vitals', meta: 'BP trending up in last 8 hours', badge: 'medium', status: 'Watch' },
    { id: 3, title: 'Review consult notes', meta: '2 notes pending signature', badge: 'low', status: 'Queue' },
  ];

  const contextHighlights = [
    { id: 1, label: 'Chief complaint', value: 'Chest tightness with exertion' },
    { id: 2, label: 'Recent meds', value: 'Metoprolol adjusted to 50mg' },
    { id: 3, label: 'Care gap', value: 'Follow-up echocardiogram overdue' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          Pre-Consultation Workflow
        </div>
        <span className="badge badge-low">On Track</span>
      </div>
      <div className="card-body">
        <div className="status-grid">
          <div className="status-tile">
            <div className="status-header">
              <span className="status-label">Record Ingestion</span>
              <span className="badge badge-medium">Processing</span>
            </div>
            <div className="loading-spinner compact">
              <div className="spinner"></div>
              <div className="loading-text">Parsing labs & PDFs</div>
            </div>
          </div>
          <div className="status-tile">
            <div className="status-header">
              <span className="status-label">AI Summary</span>
              <span className="badge badge-low">Ready</span>
            </div>
            <div className="status-note">Last refreshed 8 min ago · Owner: {patient?.primaryPhysician}</div>
            <ul className="status-list">
              <li>2 new abnormal lab flags</li>
              <li>1 medication reconciliation pending</li>
              <li>Vitals trend summarized</li>
            </ul>
          </div>
          <div className="status-tile">
            <div className="status-header">
              <span className="status-label">Imaging Sync</span>
              <span className="badge badge-critical">Error</span>
            </div>
            <div className="error-state compact">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <div className="error-title">PACS connection failed</div>
                <div className="error-message">Retry in 2 minutes or open the imaging viewer.</div>
              </div>
            </div>
            <div className="error-actions">
              <button className="btn btn-secondary btn-sm">Retry</button>
              <button className="btn btn-primary btn-sm">Open PACS</button>
            </div>
          </div>
        </div>

        <div className={`collapsible ${checklistOpen ? 'open' : ''}`} style={{marginTop: '20px'}}>
          <div className="collapsible-header" onClick={() => setChecklistOpen(!checklistOpen)}>
            <div className="collapsible-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Pre-Consult Checklist
            </div>
            <svg className="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div className="collapsible-body">
            <ul className="checklist">
              {checklistItems.map(item => (
                <li key={item.id} className="checklist-item">
                  <span className="checklist-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </span>
                  <div className="checklist-text">
                    <div className="checklist-title">{item.title}</div>
                    <div className="checklist-meta">{item.meta}</div>
                  </div>
                  <span className={`badge badge-${item.badge}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`collapsible ${contextOpen ? 'open' : ''}`} style={{marginTop: '12px'}}>
          <div className="collapsible-header" onClick={() => setContextOpen(!contextOpen)}>
            <div className="collapsible-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
              </svg>
              Context Highlights
            </div>
            <svg className="collapsible-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div className="collapsible-body">
            <div className="context-grid">
              {contextHighlights.map(item => (
                <div key={item.id} className="context-card">
                  <div className="context-label">{item.label}</div>
                  <div className="context-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecordsTabs = ({ recordsData }) => {
  const [activeTab, setActiveTab] = useState('history');
  
  const tabs = [
    { id: 'history', label: 'History', count: recordsData.history.length },
    { id: 'labs', label: 'Labs', count: recordsData.labs.length },
    { id: 'imaging', label: 'Imaging', count: recordsData.imaging.length },
    { id: 'prescriptions', label: 'Prescriptions', count: recordsData.prescriptions.length },
  ];

  const data = recordsData;
  
  return (
    <div className="card">
      <div className="tabs">
        {tabs.map(t => (
          <div 
            key={t.id} 
            className={`tab ${activeTab === t.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className="tab-count">{t.count}</span>
          </div>
        ))}
      </div>
      <div className="card-body">
        <div className="tab-content">
          {activeTab === 'history' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Provider</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map(r => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.type}</td>
                      <td>{r.title}</td>
                      <td>{r.provider}</td>
                      <td><span className={`table-status ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'labs' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Range</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.labs.map(r => (
                    <tr key={r.id}>
                      <td>{r.test}</td>
                      <td>{r.result} {r.unit}</td>
                      <td>{r.range}</td>
                      <td>{r.date}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'imaging' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Body Part</th>
                    <th>Result</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.imaging.map(r => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.type}</td>
                      <td>{r.bodyPart}</td>
                      <td>{r.result}</td>
                      <td><span className={`table-status ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'prescriptions' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Frequency</th>
                    <th>Prescriber</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.prescriptions.map(r => (
                    <tr key={r.id}>
                      <td>{r.medication}</td>
                      <td>{r.dose}</td>
                      <td>{r.frequency}</td>
                      <td>{r.prescriber}</td>
                      <td><span className={`badge badge-${r.status === 'active' ? 'low' : 'neutral'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [doctorAnalysisByPatientId, setDoctorAnalysisByPatientId] = useState({});
  const [scheduleComposerSignal, setScheduleComposerSignal] = useState(0);
  const [recordsByPatientId, setRecordsByPatientId] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [doctorState, setDoctorState] = useState({ loading: false, error: '' });
  const [patientState, setPatientState] = useState({ loading: false, error: '', result: null });
  const [createPatientState, setCreatePatientState] = useState({ loading: false, error: '' });

  const selectedAnalysis = selectedPatient ? doctorAnalysisByPatientId[selectedPatient.id] : null;
  const selectedRecords = selectedPatient
    ? (recordsByPatientId[selectedPatient.id] || { history: [], labs: [], imaging: [], prescriptions: [] })
    : { history: [], labs: [], imaging: [], prescriptions: [] };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setGlobalError('');
        const response = await fetch(`${API_BASE_URL}/patients`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Failed to load patients.');
        }
        setPatients(result.patients || []);
        setSelectedPatient(result.patients?.[0] || null);
      } catch (error) {
        setGlobalError(error.message || 'Failed to load patients.');
      }
    };

    loadPatients();
  }, []);

  useEffect(() => {
    const loadRecords = async () => {
      if (!selectedPatient) return;
      try {
        const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/records`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Failed to load records.');
        }
        setRecordsByPatientId((current) => ({ ...current, [selectedPatient.id]: result }));
      } catch (error) {
        setGlobalError(error.message || 'Failed to load records.');
      }
    };
    loadRecords();
  }, [selectedPatient]);

  useEffect(() => {
    const loadInsights = async () => {
      if (!selectedPatient) return;

      try {
        const response = await fetch(`${API_BASE_URL}/patients/${selectedPatient.id}/ai-insights`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Failed to load AI insights.');
        }

        if (result.analysis) {
          setDoctorAnalysisByPatientId((current) => ({
            ...current,
            [selectedPatient.id]: result.analysis,
          }));
        }
      } catch (error) {
        setGlobalError(error.message || 'Failed to load AI insights.');
      }
    };

    loadInsights();
  }, [selectedPatient]);

  const analyzeRecords = async (payload) => {
    try {
      setDoctorState({ loading: true, error: '' });
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      if (selectedPatient?.id) {
        formData.append('patient_id', selectedPatient.id);
      }

      const response = await fetch(`${API_BASE_URL}/doctor/analyze`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Doctor analysis request failed.');
      }

      setDoctorAnalysisByPatientId((current) => ({
        ...current,
        [selectedPatient.id]: result,
      }));
      setDoctorState({ loading: false, error: '' });
    } catch (error) {
      setDoctorState({ loading: false, error: error.message || 'Request failed.' });
    }
  };


  const createPatient = async (payload) => {
    try {
      setCreatePatientState({ loading: true, error: '' });
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to create patient.');
      }

      setPatients((current) => [...current, result]);
      setSelectedPatient(result);
      setCreatePatientState({ loading: false, error: '' });
      setCurrentView('dashboard');
    } catch (error) {
      setCreatePatientState({ loading: false, error: error.message || 'Failed to create patient.' });
    }
  };

  const explainReport = async (payload) => {
    try {
      setPatientState({ loading: true, error: '', result: null });
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/patient/explain`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Patient explanation request failed.');
      }

      setPatientState({ loading: false, error: '', result });
    } catch (error) {
      setPatientState({ loading: false, error: error.message || 'Request failed.', result: null });
    }
  };
  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth <= 768);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);


  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <div className="dashboard-header">
              <div className="header-title">
                <h2>Patient Dashboard</h2>
                <p>Select a patient to view their clinical information</p>
              </div>
              <div className="header-actions">
                <PatientSearch patients={patients} onSelectPatient={setSelectedPatient} />
              </div>
            </div>
            {globalError && <p className="api-error">{globalError}</p>}
            
            <PatientOverview patient={selectedPatient} />
            
            <div className="grid-2" style={{marginTop: '24px'}}>
              <ClinicalSummary analysis={selectedAnalysis} />
              <div>
                <AbnormalFindings patient={selectedPatient} analysis={selectedAnalysis} />
                <IssuesRanking patient={selectedPatient} analysis={selectedAnalysis} />
              </div>
            </div>

            <div className="section" style={{marginTop: '24px'}}>
              <WorkflowStatus patient={selectedPatient} />
            </div>
            
            <div className="grid-2" style={{marginTop: '24px'}}>
              <ScanInsights analysis={selectedAnalysis} />
              <MedicalRecordsUpload
                onAnalyze={analyzeRecords}
                onExplain={explainReport}
                doctorState={doctorState}
                patientState={patientState}
              />
            </div>
            
            <div className="section" style={{marginTop: '24px'}}>
              <RecordsTabs recordsData={selectedRecords} />
            </div>
          </>
        );
      case 'patients':
        return (
          <PatientsView
            patients={patients}
            onSelectPatient={setSelectedPatient}
            onCreatePatient={createPatient}
            createState={createPatientState}
            onViewPatient={(patient) => {
              setSelectedPatient(patient);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'records':
        return <RecordsView patient={selectedPatient} recordsData={selectedRecords} />;
      case 'ai-insights':
        return <AIInsightsView patient={selectedPatient} analysis={selectedAnalysis} />;
      case 'messages':
        return <MessagesView />;
      case 'schedule':
        return <ScheduleView apiBaseUrl={API_BASE_URL} openComposerSignal={scheduleComposerSignal} />;
      default:
        return renderView('dashboard');
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isMobileViewport={isMobileViewport}
        onNewConsultation={() => {
          setCurrentView('schedule');
          setScheduleComposerSignal((value) => value + 1);
        }}
      />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
