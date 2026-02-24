import React from 'react';

const PatientOverview = ({ patient }) => {
  if (!patient) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="patient-overview">
          <div className="patient-avatar">{getInitials(patient.name)}</div>
          
          <div className="patient-details">
            <div className="patient-name">{patient.name}</div>
            <div className="patient-demographics">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {patient.age} years old
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {patient.gender}
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                DOB: {formatDate(patient.dob)}
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {patient.bloodType}
              </span>
            </div>
            
            <div className="patient-tags">
              {patient.allergies.length > 0 && (
                <>
                  {patient.allergies.map((allergy, idx) => (
                    <span key={idx} className="patient-tag allergy">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {allergy}
                    </span>
                  ))}
                </>
              )}
              {patient.conditions.map((condition, idx) => (
                <span key={idx} className="patient-tag condition">
                  {condition}
                </span>
              ))}
            </div>
          </div>
          
          <div className="patient-meta">
            <div className="visit-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Next: {formatDate(patient.nextAppointment)}
            </div>
            <div className="last-visit">Last Visit: {formatDate(patient.lastVisit)}</div>
            <div className="last-visit">{patient.primaryPhysician}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;

