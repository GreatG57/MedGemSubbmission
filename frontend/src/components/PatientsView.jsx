import React, { useState } from 'react';

const initialForm = {
  mrn: '',
  name: '',
  age: '',
  gender: '',
  dob: '',
  bloodType: '',
  primaryPhysician: '',
  allergiesCsv: '',
  conditionsCsv: '',
};

const PatientsView = ({ patients, onSelectPatient, onViewPatient, onCreatePatient, createState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formState, setFormState] = useState(initialForm);

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreatePatient = async (event) => {
    event.preventDefault();
    if (!onCreatePatient) return;

    await onCreatePatient({
      mrn: formState.mrn,
      name: formState.name,
      age: Number(formState.age),
      gender: formState.gender,
      dob: formState.dob,
      bloodType: formState.bloodType || 'Unknown',
      primaryPhysician: formState.primaryPhysician || 'Unassigned',
      allergies: formState.allergiesCsv
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      conditions: formState.conditionsCsv
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    });

    if (!createState?.error) {
      setFormState(initialForm);
      setShowAddForm(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Patients</h2>
        <p>Manage and view all patient records</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="patient-search" style={{ flex: 1, minWidth: '250px' }}>
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  className="search-input"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddForm((value) => !value)}>
              {showAddForm ? 'Close Form' : 'Add Patient'}
            </button>
          </div>
          {showAddForm && (
            <form onSubmit={handleCreatePatient} style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
              <input className="input" placeholder="MRN" required value={formState.mrn} onChange={(e) => setFormState((s) => ({ ...s, mrn: e.target.value }))} />
              <input className="input" placeholder="Name" required value={formState.name} onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))} />
              <input className="input" type="number" min="0" placeholder="Age" required value={formState.age} onChange={(e) => setFormState((s) => ({ ...s, age: e.target.value }))} />
              <input className="input" placeholder="Gender" required value={formState.gender} onChange={(e) => setFormState((s) => ({ ...s, gender: e.target.value }))} />
              <input className="input" type="date" placeholder="DOB" required value={formState.dob} onChange={(e) => setFormState((s) => ({ ...s, dob: e.target.value }))} />
              <input className="input" placeholder="Blood Type (optional)" value={formState.bloodType} onChange={(e) => setFormState((s) => ({ ...s, bloodType: e.target.value }))} />
              <input className="input" placeholder="Primary Physician (optional)" value={formState.primaryPhysician} onChange={(e) => setFormState((s) => ({ ...s, primaryPhysician: e.target.value }))} />
              <input className="input" placeholder="Allergies (comma-separated)" value={formState.allergiesCsv} onChange={(e) => setFormState((s) => ({ ...s, allergiesCsv: e.target.value }))} />
              <input className="input" placeholder="Conditions (comma-separated)" value={formState.conditionsCsv} onChange={(e) => setFormState((s) => ({ ...s, conditionsCsv: e.target.value }))} />
              <button className="btn btn-primary" type="submit" disabled={createState?.loading}>
                {createState?.loading ? 'Saving...' : 'Save Patient'}
              </button>
              {createState?.error && <p className="api-error">{createState.error}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>MRN</th>
                <th>Age/Gender</th>
                <th>Primary Physician</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="patient-avatar-small">{p.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.mrn}</td>
                  <td>{p.age}y - {p.gender}</td>
                  <td>{p.primaryPhysician}</td>
                  <td>{new Date(p.lastVisit).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-low">Active</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSelectPatient?.(p);
                        onViewPatient?.(p);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Showing {filtered.length} of {patients.length} patients
      </div>
    </div>
  );
};

export default PatientsView;
