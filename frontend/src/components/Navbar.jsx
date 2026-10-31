import React, { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'screening', label: 'General Information' },
    { id: 'ultrasound', label: 'Ultrasound Analysis' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <div 
          className="navbar-brand" 
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon">
            <Activity size={20} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <span className="brand-title">PCOSense</span>
            <span className="brand-tag">Risk Screening</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={`nav-link ${activePage === link.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.id)}
                  aria-current={activePage === link.id ? 'page' : undefined}
                >
                  {link.label}
                  {link.id === 'ultrasound' && (
                    <span className="badge badge-coming-soon nav-badge">Preview</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Button */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleNavClick('screening')}
          >
            Start Screening
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="container">
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    className={`mobile-nav-link ${activePage === link.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(link.id)}
                  >
                    <span>{link.label}</span>
                    {link.id === 'ultrasound' && (
                      <span className="badge badge-coming-soon">Preview</span>
                    )}
                  </button>
                </li>
              ))}
              <li className="mobile-cta-item">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleNavClick('screening')}
                >
                  Start Screening
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #ffffff;
          border-bottom: 1px solid var(--color-border);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-primary-light);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .brand-tag {
          font-size: 0.72rem;
          color: var(--color-text-subtle);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 0.92rem;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          color: var(--color-primary);
          background: var(--color-surface-subtle);
        }

        .nav-link.active {
          color: var(--color-primary);
          background: var(--color-primary-light);
          font-weight: 600;
        }

        .nav-badge {
          font-size: 0.68rem;
          padding: 1px 5px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
        }

        .btn-sm {
          padding: 0.45rem 0.95rem;
          font-size: 0.88rem;
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          padding: 6px;
          cursor: pointer;
        }

        .mobile-nav-drawer {
          display: none;
          background: #ffffff;
          border-bottom: 1px solid var(--color-border);
          padding: 16px 0 20px 0;
        }

        .mobile-nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mobile-nav-link {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 10px 14px;
          font-size: 0.98rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-radius: var(--radius-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .mobile-nav-link.active {
          color: var(--color-primary);
          background: var(--color-primary-light);
          font-weight: 600;
        }

        .mobile-cta-item {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--color-border-subtle);
        }

        @media (max-width: 840px) {
          .desktop-nav, .navbar-actions {
            display: none;
          }
          .mobile-menu-toggle {
            display: block;
          }
          .mobile-nav-drawer {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
