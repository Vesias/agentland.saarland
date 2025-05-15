import React, { useState } from 'react';
import '../../index.css';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!formData.password) {
      newErrors.password = 'Bitte geben Sie Ihr Passwort ein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify credentials against a backend
      // For demo purposes, we'll accept any valid email/password
      if (formData.email && formData.password) {
        const userProfile = {
          email: formData.email,
          username: formData.email.split('@')[0],
          fullName: 'Demo User',
          isLoggedIn: true,
          rememberMe: formData.rememberMe
        };
        
        if (onLogin) {
          onLogin(userProfile);
        }
      } else {
        setErrors({ general: 'Ungültige Anmeldedaten' });
      }
    } catch (error) {
      setErrors({ general: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <style>{`
        .login-form-container {
          background: rgba(18, 24, 38, 0.95);
          border: 1px solid #2563eb;
          border-radius: 8px;
          padding: 2rem;
          max-width: 420px;
          margin: 0 auto;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          color: #fff;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .form-header p {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          color: #e2e8f0;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #475569;
          color: #fff;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-input {
          width: 1rem;
          height: 1rem;
          accent-color: #3b82f6;
        }

        .checkbox-label {
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        .forgot-password {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .submit-button {
          width: 100%;
          background: #2563eb;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .submit-button:disabled {
          background: #64748b;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .general-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .switch-form {
          text-align: center;
          margin-top: 1.5rem;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .switch-form button {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
          padding: 0;
          margin-left: 0.25rem;
        }

        .switch-form button:hover {
          color: #2563eb;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid #fff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="form-header">
        <h2>Anmeldung</h2>
        <p>Willkommen zurück bei agentland.saarland</p>
      </div>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="general-error">{errors.general}</div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="ihre@email.de"
          />
          {errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Ihr Passwort"
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="checkbox-group">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="rememberMe" className="checkbox-label">
              Angemeldet bleiben
            </label>
          </div>
          <a href="/forgot-password" className="forgot-password">
            Passwort vergessen?
          </a>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading && <span className="loading-spinner"></span>}
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>

      <div className="switch-form">
        Noch kein Konto?
        <button onClick={onSwitchToRegister}>Jetzt registrieren</button>
      </div>
    </div>
  );
};

export default LoginForm;