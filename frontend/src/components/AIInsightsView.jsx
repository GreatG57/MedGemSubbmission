import React from 'react';

const AIInsightsView = ({ patient, analysis }) => {
  if (!patient) {
    return (
      <div className="view-container">
        <div className="view-placeholder">
          <svg className="view-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
          </svg>
          <h3>No Patient Selected</h3>
          <p>Please select a patient from the Dashboard to view AI insights.</p>
        </div>
      </div>
    );
  }

  const scans = analysis?.scan_insights?.map((scan, index) => ({
    id: `${patient.id}-scan-${index}`,
    type: 'Scan',
    severity: 'medium',
    bodyPart: scan.region || 'Unknown region',
    date: 'Generated now',
    finding: scan.observation,
    aiConfidence: 90,
    recommendation: scan.note,
  })) || [];
  const findings = analysis?.key_findings || [];
  const issues = analysis?.urgency_ranking?.map((issue, index) => ({
    id: `${patient.id}-issue-${index}`,
    urgency: analysis.key_findings.find((finding) => finding.finding === issue)?.urgency || 'low',
    issue,
    action: analysis.key_findings.find((finding) => finding.finding === issue)?.detail || 'Review context.',
    status: 'pending',
    dueDate: 'ASAP',
  })) || [];

  const criticalCount = findings.filter(f => f.urgency === 'critical' || f.urgency === 'high').length;
  const avgConfidence = scans.length > 0 
    ? Math.round(scans.reduce((acc, s) => acc + s.aiConfidence, 0) / scans.length) 
    : 0;

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>AI Insights</h2>
        <p>AI-powered analysis for {patient.name}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              {findings.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total Findings
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--critical-500)' }}>
              {criticalCount}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Critical/High Priority
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--low-500)' }}>
              {avgConfidence}%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Avg AI Confidence
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--high-500)' }}>
              {issues.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Active Issues
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            AI Scan Analysis
          </div>
        </div>
        <div className="card-body">
          {scans.length > 0 ? (
            <div className="scan-list">
              {scans.map(s => (
                <div key={s.id} className="scan-item">
                  <div className={`scan-icon ${s.type.toLowerCase().replace(' ', '-')}`}>
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
                        <span>AI Confidence: {s.aiConfidence}%</span>
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
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div className="empty-title">No scan data available</div>
            </div>
          )}
        </div>
      </div>

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
          {issues.length > 0 ? (
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
          ) : (
            <div className="empty-state">
              <div className="empty-title">No issues identified</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsView;
