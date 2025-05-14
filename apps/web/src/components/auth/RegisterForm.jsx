import React, { useState } from 'react';
import '../../index.css';

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
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

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Bitte geben Sie Ihren Namen ein';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Sie müssen die Nutzungsbedingungen akzeptieren';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create user profile
      const userProfile = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        region: 'Saarland',
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      // Call parent component's registration handler
      if (onRegister) {
        onRegister(userProfile);
      }

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        acceptTerms: false
      });
    } catch (error) {
      setErrors({ general: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <style jsx>{`
        .register-form-container {
          background: rgba(18, 24, 38, 0.95);
          border: 1px solid #2563eb;
          border-radius: 8px;
          padding: 2rem;
          max-width: 480px;
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
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .checkbox-input {
          margin-top: 0.25rem;
          width: 1rem;
          height: 1rem;
          accent-color: #3b82f6;
        }

        .checkbox-label {
          color: #e2e8f0;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .checkbox-label a {
          color: #3b82f6;
          text-decoration: none;
        }

        .checkbox-label a:hover {
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
        <h2>Registrierung</h2>
        <p>Erstellen Sie Ihr AGENT_LAND.SAARLAND Konto</p>
      </div>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="general-error">{errors.general}</div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Benutzername
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="Wählen Sie einen Benutzernamen"
          />
          {errors.username && (
            <div className="error-message">{errors.username}</div>
          )}
        </div>

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
          <label className="form-label" htmlFor="fullName">
            Vollständiger Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="Max Mustermann"
          />
          {errors.fullName && (
            <div className="error-message">{errors.fullName}</div>
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
            placeholder="Mindestens 8 Zeichen"
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Passwort bestätigen
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Passwort wiederholen"
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="checkbox-input"
          />
          <label htmlFor="acceptTerms" className="checkbox-label">
            Ich stimme den <a href="/terms" target="_blank">Nutzungsbedingungen</a> und 
            der <a href="/privacy" target="_blank">Datenschutzerklärung</a> zu
          </label>
        </div>
        {errors.acceptTerms && (
          <div className="error-message">{errors.acceptTerms}</div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading && <span className="loading-spinner"></span>}
          {loading ? 'Registriere...' : 'Konto erstellen'}
        </button>
      </form>

      <div className="switch-form">
        Bereits ein Konto?
        <button onClick={onSwitchToLogin}>Hier anmelden</button>
      </div>
    </div>
  );
};

export default RegisterForm;