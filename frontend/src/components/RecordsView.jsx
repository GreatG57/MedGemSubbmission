import React, { useState } from 'react';

const RecordsView = ({ patient, recordsData = { history: [], labs: [], imaging: [], prescriptions: [] } }) => {
  const [activeTab, setActiveTab] = useState('history');

  if (!patient) {
    return (
      <div className="view-container">
        <div className="view-placeholder">
          <svg className="view-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <h3>No Patient Selected</h3>
          <p>Please select a patient from the Dashboard to view their records.</p>
        </div>
      </div>
    );
  }

  const data = recordsData;

  const tabs = [
    { id: 'history', label: 'Medical History', count: data.history.length },
    { id: 'labs', label: 'Lab Results', count: data.labs.length },
    { id: 'imaging', label: 'Imaging', count: data.imaging.length },
    { id: 'prescriptions', label: 'Prescriptions', count: data.prescriptions.length },
  ];

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Medical Records</h2>
        <p>Viewing records for {patient.name}</p>
      </div>

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
    </div>
  );
};

export default RecordsView;
