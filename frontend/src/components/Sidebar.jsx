import React, { useEffect, useState } from 'react';

const Sidebar = ({ currentView, onViewChange, isMobileViewport, onNewConsultation }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = isMobileViewport;

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const canCollapse = !isMobile;
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'patients', label: 'Patients', icon: 'users' },
    { id: 'records', label: 'Records', icon: 'folder' },
    { id: 'ai-insights', label: 'AI Insights', icon: 'sparkle' },
    { id: 'messages', label: 'Messages', icon: 'mail' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  ];

  const renderIcon = (iconName) => {
    const icons = {
      home: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      folder: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      sparkle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
        </svg>
      ),
      mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.home;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {canCollapse && (
          <button 
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <polyline points="9 18 15 12 9 6"/>
              ) : (
                <polyline points="15 18 9 12 15 6"/>
              )}
            </svg>
          </button>
        )}
        <div className={`sidebar-logo ${isCollapsed ? 'hidden' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <div className="logo-text">
            <h1>MedGem</h1>
            <span>AI Assistant</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Main Menu</div>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              {renderIcon(item.icon)}
              <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Quick Actions</div>
          <div className="nav-item" title="New Consultation" onClick={onNewConsultation}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className={isCollapsed ? 'hidden' : ''}>New Consultation</span>
          </div>
          <div className="nav-item" title="Upload Records">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className={isCollapsed ? 'hidden' : ''}>Upload Records</span>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="doctor-profile">
          <div className="doctor-avatar">MC</div>
          <div className={`doctor-info ${isCollapsed ? 'hidden' : ''}`}>
            <div className="doctor-name">Dr. Michael Chen</div>
            <div className="doctor-role">Internal Medicine</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
