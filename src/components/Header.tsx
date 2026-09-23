import React, { useState } from 'react';
import {
  Wrench,
  Menu,
  Plus,
  Server,
  Sparkles,
  X,
} from 'lucide-react';
import { ChatSession } from '../types/mechanic';

interface HeaderProps {
  currentSession: ChatSession | null;
  onNewSession: () => void;
  onOpenVehicleModal: () => void;
  onOpenApiSimulator: () => void;
  onOpenPresetsModal: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  onNewSession,
  onOpenVehicleModal,
  onOpenApiSimulator,
  onOpenPresetsModal,
  onToggleSidebar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <a className="brand-mark" href="#home" onClick={closeMenu}>
        <span><Wrench size={18} /></span>
        <strong>AI Car Mechanic</strong>
      </a>
      <nav className={`primary-nav ${isMenuOpen ? 'is-open' : ''}`}>
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#diagnose" onClick={closeMenu}>Diagnose</a>
      </nav>
      <div className="header-actions">
        <button className="header-tool" onClick={onOpenPresetsModal} title="Open demo scenarios"><Sparkles size={15} /> <span>Scenarios</span></button>
        <button className="header-tool" onClick={onOpenApiSimulator} title="Open API settings"><Server size={15} /> <span>API</span></button>
        <button className="header-cta" onClick={() => document.getElementById('diagnose')?.scrollIntoView({ behavior: 'smooth' })}>Start Diagnosis</button>
        <button className="mobile-menu-button" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Toggle navigation">{isMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      <div className="header-context">
        <button onClick={onOpenVehicleModal}>{currentSession?.vehicle.year} {currentSession?.vehicle.make} {currentSession?.vehicle.model}</button>
        <button onClick={onToggleSidebar} className="context-new"><Plus size={14} /> New</button>
      </div>
    </header>
  );
};
