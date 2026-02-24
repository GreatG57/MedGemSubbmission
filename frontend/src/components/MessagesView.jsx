import React, { useState } from 'react';

const mockMessages = [
  { id: 1, from: 'Dr. Sarah Johnson', subject: 'Patient Update - John Smith', time: '10:30 AM', unread: true },
  { id: 2, from: 'Lab Results System', subject: 'New lab results available', time: '9:15 AM', unread: true },
  { id: 3, from: 'Nurse Station', subject: 'Discharge summary ready', time: 'Yesterday', unread: false },
  { id: 4, from: 'Dr. Michael Chen', subject: 'Consultation request', time: 'Yesterday', unread: false },
  { id: 5, from: 'Appointment Desk', subject: 'Schedule confirmation', time: '2 days ago', unread: false },
];

const MessagesView = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Messages</h2>
        <p>Secure messaging and communications</p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div className="card">
            <div className="card-body" style={{ padding: '8px' }}>
              <div 
                className={`nav-item ${activeFolder === 'inbox' ? 'active' : ''}`}
                onClick={() => setActiveFolder('inbox')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                </svg>
                <span>Inbox</span>
              </div>
              <div 
                className={`nav-item ${activeFolder === 'sent' ? 'active' : ''}`}
                onClick={() => setActiveFolder('sent')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>Sent</span>
              </div>
              <div 
                className={`nav-item ${activeFolder === 'drafts' ? 'active' : ''}`}
                onClick={() => setActiveFolder('drafts')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>Drafts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Inbox</div>
              <button className="btn btn-primary btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Message
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <tbody>
                  {mockMessages.map(msg => (
                    <tr 
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: msg.unread ? 'var(--primary-50)' : undefined 
                      }}
                    >
                      <td style={{ width: '40px' }}>
                        {msg.unread && (
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: 'var(--primary-600)' 
                          }}></div>
                        )}
                      </td>
                      <td style={{ fontWeight: msg.unread ? 600 : 400 }}>{msg.from}</td>
                      <td style={{ fontWeight: msg.unread ? 600 : 400 }}>{msg.subject}</td>
                      <td style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>{msg.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div style={{ width: '350px', flexShrink: 0 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Message</div>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>From</div>
                  <div style={{ fontWeight: 500 }}>{selectedMessage.from}</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Subject</div>
                  <div style={{ fontWeight: 500 }}>{selectedMessage.subject}</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Time</div>
                  <div>{selectedMessage.time}</div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  This is a preview of the message content. In a real application, 
                  the full message content would be displayed here with all the 
                  details and any attachments.
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm">Reply</button>
                  <button className="btn btn-secondary btn-sm">Forward</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;

