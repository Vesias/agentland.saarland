import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px',
        background: '#3a6ea5',
        color: 'white',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>AGENT_LAND.SAARLAND</h1>
        </div>
        <div>
          <button style={{
            background: 'white',
            color: '#3a6ea5',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>Anmelden</button>
        </div>
      </header>

      <main>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#3a6ea5', marginTop: 0 }}>Real-Life Agent Cockpit</h2>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Mission: Saarland-Wanderweg digitalisieren
            </div>
            <div style={{ 
              height: '8px', 
              background: '#e9ecef', 
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '5px'
            }}>
              <div style={{ 
                width: '45%', 
                height: '100%', 
                background: '#28a745'
              }}></div>
            </div>
            <div style={{ fontSize: '14px', color: '#28a745' }}>45% abgeschlossen</div>
          </div>
          <button style={{
            background: '#3a6ea5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}>Fortschritt aktualisieren</button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#3a6ea5', marginTop: 0 }}>KI-Workspace</h2>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#28a745',
                marginRight: '8px'
              }}></div>
              <span>Lokaler Llama 3.2 Agent: Aktiv</span>
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#28a745',
                marginRight: '8px'
              }}></div>
              <span>Workspace bereit</span>
            </div>
          </div>
          <button style={{
            background: '#3a6ea5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}>Workspace öffnen</button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#3a6ea5', marginTop: 0 }}>Profil erstellen</h2>
          <div style={{ marginBottom: '15px' }}>
            <p>Erstelle dein Profil, um alle Funktionen des AGENT_LAND.SAARLAND Dashboard zu nutzen.</p>
            <form>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                <input type="text" placeholder="Dein Name" style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>E-Mail</label>
                <input type="email" placeholder="deine@email.de" style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Passwort</label>
                <input type="password" placeholder="Passwort" style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} />
              </div>
              <button type="button" style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>Profil speichern</button>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ 
        marginTop: '20px', 
        padding: '15px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        &copy; {new Date().getFullYear()} AGENT_LAND.SAARLAND
      </footer>
    </div>
  );
}

export default App;