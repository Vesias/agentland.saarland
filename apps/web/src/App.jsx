import React, { useState } from 'react';
import './index.css';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleLogin = (profile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
    setShowLogin(false);
    setName(profile.fullName);
    setEmail(profile.email);
    alert(`Willkommen zurück, ${profile.fullName}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setName('');
    setEmail('');
    setPassword('');
    alert('Erfolgreich abgemeldet!');
  };

  const handleRegister = (profile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
    setShowRegister(false);
    setName(profile.fullName);
    setEmail(profile.email);
    alert(`Willkommen ${profile.fullName}! Ihr Konto wurde erfolgreich erstellt.`);
  };

  const handleSaveProfile = () => {
    if (!name || !email) {
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }
    alert(`Profil aktualisiert für ${name}!`);
  };

  // Show registration form
  if (showRegister) {
    return (
      <div className="container" style={{padding: 'var(--spacing-6)', minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      </div>
    );
  }

  // Show login form
  if (showLogin) {
    return (
      <div className="container" style={{padding: 'var(--spacing-6)', minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      </div>
    );
  }

  // Main dashboard
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
        <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
          {!isLoggedIn && (
            <button 
              className="btn"
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid white',
                fontWeight: 'bold'
              }}
              onClick={() => setShowRegister(true)}
            >
              Registrieren
            </button>
          )}
          <button 
            className="btn"
            style={{
              background: 'white',
              color: 'var(--primary-color)',
              fontWeight: 'bold'
            }}
            onClick={() => isLoggedIn ? handleLogout() : setShowLogin(true)}
          >
            {isLoggedIn ? 'Abmelden' : 'Anmelden'}
          </button>
        </div>
      </header>

      {userProfile && (
        <div className="mb-4" style={{
          padding: 'var(--spacing-4)',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1))',
          border: '1px solid #3b82f6',
          borderRadius: 'var(--radius-md)',
          color: '#fff'
        }}>
          <div style={{fontWeight: 'bold', marginBottom: 'var(--spacing-2)'}}>
            Willkommen, {userProfile.fullName}!
          </div>
          <div style={{fontSize: 'var(--text-sm)', opacity: 0.9}}>
            Sie sind jetzt als {userProfile.username} angemeldet. E-Mail: {userProfile.email}
          </div>
        </div>
      )}

      <main className="dashboard-grid" style={{gridTemplateColumns: '1fr'}}>
        <div className="card">
          <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>Real-Life Agent Cockpit</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="badge badge-primary">Aktive Mission</div>
              <div className="text-muted">Agent Level: {userProfile ? 3 : 1}</div>
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
                width: isLoggedIn ? '45%' : '0%',
                height: '100%',
                background: 'var(--success-color)',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
            <div style={{fontSize: 'var(--text-sm)', color: 'var(--success-color)'}}>
              {isLoggedIn ? '45% abgeschlossen' : 'Anmelden zum Starten'}
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={!isLoggedIn}
          >
            {isLoggedIn ? 'Fortschritt aktualisieren' : 'Anmelden erforderlich'}
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
                background: isLoggedIn ? 'var(--success-color)' : 'var(--warning-color)',
                marginRight: 'var(--spacing-2)'
              }}></div>
              <span>Lokaler Llama 3.2 Agent: {isLoggedIn ? 'Aktiv' : 'Wartend'}</span>
            </div>
            <div className="flex items-center mb-2">
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isLoggedIn ? 'var(--success-color)' : 'var(--error-color)',
                marginRight: 'var(--spacing-2)'
              }}></div>
              <span>Workspace {isLoggedIn ? 'bereit' : 'gesperrt'}</span>
            </div>
            <div className="badge badge-secondary mb-2">AI-Schmiede Saar</div>
          </div>
          <button 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={!isLoggedIn}
          >
            {isLoggedIn ? 'Workspace öffnen' : 'Anmeldung erforderlich'}
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="card">
            <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>Konto erstellen</h2>
            <div className="mb-4">
              <p>Erstelle ein Konto, um alle Funktionen des AGENT_LAND.SAARLAND Dashboard zu nutzen.</p>
              <ul style={{paddingLeft: '1.5rem', margin: '1rem 0'}}>
                <li>Zugriff auf KI-Agenten</li>
                <li>Personalisierte Missionen</li>
                <li>Fortschrittsverfolgung</li>
                <li>Team-Kollaboration</li>
              </ul>
              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: 'var(--spacing-4)'}}
                onClick={() => setShowRegister(true)}
              >
                Jetzt registrieren
              </button>
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-3)',
                color: 'var(--text-secondary-color)',
                fontSize: 'var(--text-sm)'
              }}>
                Bereits ein Konto? 
                <button 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: 'var(--spacing-1)'
                  }}
                  onClick={() => setShowLogin(true)}
                >
                  Hier anmelden
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2 className="widget-title" style={{color: 'var(--primary-color)', marginTop: 0}}>Profil bearbeiten</h2>
            <div className="mb-4">
              <p>Aktualisiere deine Profildaten.</p>
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
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: '#fff'
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
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: '#fff'
                    }} 
                  />
                </div>
                <div className="mb-4">
                  <label style={{display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'bold'}}>Neues Passwort</label>
                  <input 
                    type="password" 
                    placeholder="Leer lassen um beizubehalten" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: '#fff'
                    }} 
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleSaveProfile}
                >
                  Profil aktualisieren
                </button>
              </form>
            </div>
          </div>
        )}
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