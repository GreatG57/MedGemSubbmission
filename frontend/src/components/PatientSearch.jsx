import React, { useState } from 'react';

const PatientSearch = ({ patients = [], onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-search">
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          className="search-input" 
          placeholder="Search patients by name, MRN..." 
          value={searchTerm} 
          onChange={(e) => { 
            setSearchTerm(e.target.value); 
            setIsOpen(true); 
          }} 
          onFocus={() => setIsOpen(true)} 
        />
      </div>
      {isOpen && searchTerm && (
        <div className="search-results">
          {filtered.length > 0 ? (
            filtered.map(p => (
              <div 
                key={p.id} 
                className="search-result-item" 
                onClick={() => { 
                  onSelectPatient(p); 
                  setSearchTerm(p.name); 
                  setIsOpen(false); 
                }}
              >
                <div className="patient-avatar-small">
                  {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="patient-info-minimal">
                  <div className="patient-name-minimal">{p.name}</div>
                  <div className="patient-mrn-minimal">{p.mrn} - {p.age}y - {p.gender}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="search-no-results">
              No patients found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
