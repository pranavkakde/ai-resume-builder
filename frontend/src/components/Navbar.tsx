import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLLM } from '../contexts/LLMContext';
import ThemeSwitcher from './ThemeSwitcher';
import SettingsModal from './SettingsModal';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isConfigured } = useLLM();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__brand">
            <span className="navbar__brand-icon">📄</span>
            <span className="navbar__brand-text">ResumeAI</span>
          </NavLink>

          <div className="navbar__center">
            <NavLink
              to="/analyzer"
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              Analyzer
            </NavLink>
            <NavLink
              to="/tracker"
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              Tracker
            </NavLink>
          </div>

          <div className="navbar__right">
            <ThemeSwitcher />
            <button
              className="navbar__settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="LLM Settings"
              data-tooltip="Settings"
            >
              ⚙
              {!isConfigured && <span className="navbar__settings-dot" />}
            </button>
          </div>
        </div>
      </nav>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
