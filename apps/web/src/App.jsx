import React, { useState } from 'react';
import './index.css';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    alert('Erfolgreich angemeldet!');
  };

  const handleSaveProfile = () => {
    if (!name || !email || !password) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }
    alert(`Profil gespeichert für ${name}!`);
  };

  return (
    <div className="container" style={{padding: 'var(--spacing-6)'}}>
      <header className="flex items-center justify-between mb-4" style={{
        padding: 'var(--spacing-4)',
        background: 'var(--primary-color)',
        color: 'white',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div className="flex items-center">
          <h1 style={{margin: 0, fontSize: 'var(--text-2xl)'}}>AGENT_LAND.SAARLAND</h1>
        </div>
        <div>
          <button 
            className="btn"
            style={{
              background: 'white',
              color: 'var(--primary-color)',
              fontWeight: 'bold'
            }}
            onClick={handleLogin}
          >
            {isLoggedIn ? 'Abmelden' : 'Anmelden'}
          </button>
        </div>
      </header>

      <main className="dashboard-grid" style={{gridTemplateColumns: '1fr'}}>
        <div className="card">
          <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>Real-Life Agent Cockpit</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="badge badge-primary">Aktive Mission</div>
              <div className="text-muted">Agent Level: 3</div>
            </div>
            <div style={{fontWeight: 'bold', marginBottom: 'var(--spacing-2)'}}>
              Mission: Saarland-Wanderweg digitalisieren
            </div>
            <div style={{
              height: '8px',
              background: 'var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginBottom: 'var(--spacing-2)'
            }}>
              <div style={{
                width: '45%',
                height: '100%',
                background: 'var(--success-color)'
              }}></div>
            </div>
            <div style={{fontSize: 'var(--text-sm)', color: 'var(--success-color)'}}>45% abgeschlossen</div>
          </div>
          <button className="btn btn-primary" style={{width: '100%'}}>
            Fortschritt aktualisieren
          </button>
        </div>

        <div className="card">
          <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>KI-Workspace</h2>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--success-color)',
                marginRight: 'var(--spacing-2)'
              }}></div>
              <span>Lokaler Llama 3.2 Agent: Aktiv</span>
            </div>
            <div className="flex items-center mb-2">
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--success-color)',
                marginRight: 'var(--spacing-2)'
              }}></div>
              <span>Workspace bereit</span>
            </div>
            <div className="badge badge-secondary mb-2">AI-Schmiede Saar</div>
          </div>
          <button className="btn btn-primary" style={{width: '100%'}}>
            Workspace öffnen
          </button>
        </div>

        <div className="card">
          <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>Profil erstellen</h2>
          <div className="mb-4">
            <p>Erstelle dein Profil, um alle Funktionen des AGENT_LAND.SAARLAND Dashboard zu nutzen.</p>
            <form>
              <div className="mb-4">
                <label style={{display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold'}}>Name</label>
                <input 
                  type="text" 
                  placeholder="Dein Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)'
                  }} 
                />
              </div>
              <div className="mb-4">
                <label style={{display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold'}}>E-Mail</label>
                <input 
                  type="email" 
                  placeholder="deine@email.de" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)'
                  }} 
                />
              </div>
              <div className="mb-4">
                <label style={{display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold'}}>Passwort</label>
                <input 
                  type="password" 
                  placeholder="Passwort" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)'
                  }} 
                />
              </div>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleSaveProfile}
              >
                Profil speichern
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="text-center mt-4" style={{
        padding: 'var(--spacing-4)',
        color: 'var(--text-secondary-color)',
        fontSize: 'var(--text-sm)'
      }}>
        <div className="mb-2">KI-Schmiede Saar | Real-Life Agenten | Digitale Innovation</div>
        <div>&copy; {new Date().getFullYear()} AGENT_LAND.SAARLAND</div>
      </footer>
    </div>
  );
}

export default App;