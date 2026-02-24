import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const emptyForm = {
  patient: '',
  time: '',
  type: 'Follow-up',
  duration: '30 min',
  status: 'confirmed',
};

const ScheduleView = ({ apiBaseUrl, openComposerSignal = 0 }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('day');
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setFetchError('');
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/appointments`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Failed to load appointments.');
        }
        setAppointments(result.appointments || []);
      } catch (error) {
        setFetchError(error.message || 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (openComposerSignal > 0) {
      openNewAppointment();
    }
  }, [openComposerSignal]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const confirmedCount = appointments.filter((apt) => apt.status === 'confirmed').length;
  const pendingCount = appointments.filter((apt) => apt.status === 'pending').length;

  const openNewAppointment = () => {
    setEditingAppointment(null);
    setFormState(emptyForm);
    setSaveError('');
    setIsModalOpen(true);
  };

  const openEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormState({
      patient: appointment.patient,
      time: appointment.time,
      type: appointment.type,
      duration: appointment.duration,
      status: appointment.status,
    });
    setSaveError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formState.patient || !formState.time) return;

    if (editingAppointment) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === editingAppointment.id ? { ...apt, ...formState } : apt)),
      );
      closeModal();
      return;
    }

    try {
      setSaveError('');
      const response = await fetch(`${apiBaseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to save appointment.');
      }
      setAppointments((prev) => [...prev, result]);
      closeModal();
    } catch (error) {
      setSaveError(error.message || 'Failed to save appointment.');
    }
  };

  return (
    <div className="view-container">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Schedule</h2>
          <p>{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('day')}>Day</button>
          <button className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('week')}>Week</button>
          <button className="btn btn-primary" onClick={openNewAppointment}>New Appointment</button>
        </div>
      </div>

      {fetchError && <p className="api-error">{fetchError}</p>}

      <div className="schedule-layout">
        <div className="card schedule-calendar">
          <div className="card-header">
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>◀</button>
            <div style={{ fontWeight: 600 }}>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>▶</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textAlign: 'center' }}>{day}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {days.map((day, index) => (
                <div key={`${day || 'empty'}-${index}`} style={{ minHeight: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: day ? 'var(--bg-secondary)' : 'transparent', color: day ? 'var(--text-primary)' : 'transparent' }}>
                  {day || '-'}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Appointments</div>
            <span>{appointments.length} appointments</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="empty-state"><div className="empty-title">Loading appointments...</div></div>
            ) : appointments.length === 0 ? (
              <div className="empty-state"><div className="empty-title">No appointments</div></div>
            ) : (
              <div className="messages-list">
                {appointments.map((apt) => (
                  <div key={apt.id} className="message-item" onClick={() => openEditAppointment(apt)} style={{ cursor: 'pointer' }}>
                    <div className="message-header">
                      <span className="message-sender">{apt.patient}</span>
                      <span className={`badge badge-${apt.status === 'confirmed' ? 'low' : 'medium'}`}>{apt.status}</span>
                    </div>
                    <div className="message-preview">{apt.type} · {apt.time} · {apt.duration}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '16px' }}>
        <div className="card"><div className="card-body"><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>{appointments.length}</div></div></div>
        <div className="card"><div className="card-body"><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirmed</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>{confirmedCount}</div></div></div>
        <div className="card"><div className="card-body"><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-600)' }}>{pendingCount}</div></div></div>
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <label className="api-label">Patient
                <input className="input" value={formState.patient} onChange={(event) => handleFormChange('patient', event.target.value)} placeholder="Patient name" required />
              </label>
              <label className="api-label">Time
                <input className="input" value={formState.time} onChange={(event) => handleFormChange('time', event.target.value)} placeholder="e.g. 10:30 AM" required />
              </label>
              <label className="api-label">Type
                <select className="input" value={formState.type} onChange={(event) => handleFormChange('type', event.target.value)}>
                  <option>Follow-up</option><option>New Patient</option><option>Consultation</option><option>Lab Review</option><option>Procedure</option>
                </select>
              </label>
              <label className="api-label">Duration
                <select className="input" value={formState.duration} onChange={(event) => handleFormChange('duration', event.target.value)}>
                  <option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option>
                </select>
              </label>
              <label className="api-label">Status
                <select className="input" value={formState.status} onChange={(event) => handleFormChange('status', event.target.value)}>
                  <option value="confirmed">Confirmed</option><option value="pending">Pending</option>
                </select>
              </label>
              {saveError && <p className="api-error">{saveError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAppointment ? 'Save Changes' : 'Create Appointment'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default ScheduleView;
