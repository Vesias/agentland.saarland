import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaLandmark, FaTree, FaIndustry, FaUniversity } from 'react-icons/fa';

/**
 * RegionalIdentityWidget Component
 * 
 * A dashboard widget that incorporates regional identity elements
 * specific to the Saarland region, showcasing local landmarks,
 * tech initiatives, and cultural elements
 */
const RegionalIdentityWidget = ({ className = '' }) => {
  const [featuredLocation, setFeaturedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Example locations in Saarland
  const saarlandLocations = [
    {
      id: 'saarschleife',
      name: 'Saarschleife',
      description: 'Beeindruckende Flussschleife der Saar - ein Wahrzeichen des Saarlandes',
      type: 'nature',
      image: 'https://placeholder-url.com/saarschleife.jpg', // This would be a real image in production
      coordinates: { lat: 49.5, lng: 6.54 },
      icon: <FaTree />
    },
    {
      id: 'voelklinger-huette',
      name: 'Völklinger Hütte',
      description: 'UNESCO-Weltkulturerbe und beeindruckendes Industriedenkmal',
      type: 'industrial',
      image: 'https://placeholder-url.com/voelklinger-huette.jpg', // This would be a real image in production
      coordinates: { lat: 49.25, lng: 6.85 },
      icon: <FaIndustry />
    },
    {
      id: 'saarbruecken-schloss',
      name: 'Saarbrücker Schloss',
      description: 'Historisches Barockschloss im Herzen der Landeshauptstadt',
      type: 'landmark',
      image: 'https://placeholder-url.com/saarbruecken-schloss.jpg', // This would be a real image in production
      coordinates: { lat: 49.23, lng: 7.0 },
      icon: <FaLandmark />
    },
    {
      id: 'uni-saarland',
      name: 'Universität des Saarlandes',
      description: 'Forschungsstarke Universität mit Fokus auf Informatik und KI',
      type: 'education',
      image: 'https://placeholder-url.com/uni-saarland.jpg', // This would be a real image in production
      coordinates: { lat: 49.26, lng: 7.04 },
      icon: <FaUniversity />
    },
    {
      id: 'dfki',
      name: 'Deutsches Forschungszentrum für Künstliche Intelligenz',
      description: 'Eines der weltweit größten Forschungszentren für KI',
      type: 'technology',
      image: 'https://placeholder-url.com/dfki.jpg', // This would be a real image in production
      coordinates: { lat: 49.26, lng: 7.05 },
      icon: <FaUniversity />
    }
  ];
  
  // Select a random location on mount
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, this would be an API call to get curated regional content
    // Simulate API delay
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * saarlandLocations.length);
      setFeaturedLocation(saarlandLocations[randomIndex]);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Generate the stylized Saarland map silhouette as SVG
  const SaarlandMapSilhouette = () => (
    <svg 
      viewBox="0 0 100 100" 
      className="saarland-silhouette"
      aria-label="Silhouette des Saarlandes"
    >
      <path 
        d="M25,60 C20,50 15,45 20,40 C25,35 35,38 40,30 C45,22 55,20 60,15 C65,10 75,15 80,25 C85,35 82,45 85,55 C88,65 80,75 75,80 C70,85 60,82 50,85 C40,88 35,80 30,75 C25,70 30,65 25,60 Z" 
        fill="currentColor"
      />
    </svg>
  );
  
  // Generate different fact types for variety
  const SaarlandFacts = () => {
    const facts = [
      {
        title: "Wussten Sie?",
        content: "Das Saarland ist mit seiner Fläche das kleinste Flächenland Deutschlands, hat aber eine hohe Dichte an Forschungseinrichtungen.",
        icon: <FaUniversity />
      },
      {
        title: "KI-Forschung",
        content: "Mit dem DFKI und CISPA ist das Saarland ein führender Standort für KI- und Cybersicherheitsforschung in Europa.",
        icon: <FaUniversity />
      },
      {
        title: "Grenzregion",
        content: "Das Saarland grenzt an Frankreich und Luxemburg und hat eine lange Geschichte als Grenzregion mit wechselnder Zugehörigkeit.",
        icon: <FaMapMarkedAlt />
      },
      {
        title: "Industriegeschichte",
        content: "Die Montanindustrie hat das Saarland über Jahrhunderte geprägt. Heute wandelt sich die Region zum Technologie- und KI-Standort.",
        icon: <FaIndustry />
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * facts.length);
    const fact = facts[randomIndex];
    
    return (
      <div className="saarland-fact">
        <div className="fact-icon">{fact.icon}</div>
        <div className="fact-content">
          <h4 className="fact-title">{fact.title}</h4>
          <p className="fact-text">{fact.content}</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`regional-identity-widget ${className}`}>
      <div className="widget-header">
        <h3 className="widget-title">Saarland Entdecken</h3>
        <div className="widget-subtitle">Heimat der KI-Schmiede</div>
      </div>
      
      <div className="widget-content">
        {isLoading ? (
          <div className="loading-state">Lade regionale Highlights...</div>
        ) : (
          <>
            <div className="featured-location">
              <div className="location-header">
                <div className="location-icon">{featuredLocation.icon}</div>
                <h4 className="location-name">{featuredLocation.name}</h4>
              </div>
              
              <div className="location-description">
                {featuredLocation.description}
              </div>
              
              <div className="location-placeholder">
                <div className="image-placeholder">
                  <FaMapMarkedAlt className="placeholder-icon" />
                </div>
              </div>
            </div>
            
            <div className="region-info">
              <div className="map-container">
                <SaarlandMapSilhouette />
              </div>
              
              <SaarlandFacts />
            </div>
            
            <div className="local-tech-initiatives">
              <h4 className="initiatives-title">KI-Initiativen im Saarland</h4>
              <div className="initiatives-list">
                <div className="initiative-item">
                  <FaUniversity className="initiative-icon" />
                  <span className="initiative-name">DFKI</span>
                </div>
                <div className="initiative-item">
                  <FaUniversity className="initiative-icon" />
                  <span className="initiative-name">CISPA</span>
                </div>
                <div className="initiative-item">
                  <FaUniversity className="initiative-icon" />
                  <span className="initiative-name">Uni Saarland</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="widget-footer">
        <a href="#discover-more" className="discover-link">
          Mehr entdecken
        </a>
      </div>
      
      <style jsx>{`
        .regional-identity-widget {
          background-color: var(--surface-color, #fff);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color, rgba(0, 0, 0, 0.1));
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .widget-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color, #eee);
          position: relative;
          background: linear-gradient(135deg, 
            var(--background-color, #f8f9fa) 0%, 
            var(--background-color, #f8f9fa) 80%,
            var(--accent-color, #cf6679) 80%, 
            var(--accent-color, #cf6679) 100%
          );
        }
        
        .widget-title {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-color, #333);
          display: flex;
          align-items: center;
        }
        
        .widget-title::after {
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          background-color: var(--primary-color, #3a6ea5);
          border-radius: 50%;
          margin-left: 0.5rem;
        }
        
        .widget-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary-color, #666);
          margin-top: 0.25rem;
        }
        
        .widget-content {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .loading-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary-color, #666);
          font-style: italic;
        }
        
        .featured-location {
          margin-bottom: 1rem;
        }
        
        .location-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .location-icon {
          font-size: 1.25rem;
          color: var(--primary-color, #3a6ea5);
          margin-right: 0.5rem;
        }
        
        .location-name {
          margin: 0;
          font-size: 1rem;
          color: var(--text-color, #333);
        }
        
        .location-description {
          font-size: 0.875rem;
          color: var(--text-secondary-color, #666);
          margin-bottom: 0.75rem;
        }
        
        .location-placeholder {
          border-radius: 6px;
          overflow: hidden;
          background-color: var(--background-color, #f8f9fa);
          position: relative;
        }
        
        .image-placeholder {
          padding-top: 56.25%; /* 16:9 aspect ratio */
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .placeholder-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          color: var(--border-color, #ddd);
        }
        
        .region-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .map-container {
          width: 80px;
          flex-shrink: 0;
        }
        
        .saarland-silhouette {
          color: var(--primary-color, #3a6ea5);
          opacity: 0.2;
          width: 100%;
          height: auto;
        }
        
        .saarland-fact {
          flex: 1;
          display: flex;
          gap: 0.75rem;
        }
        
        .fact-icon {
          font-size: 1.25rem;
          color: var(--accent-color, #cf6679);
          flex-shrink: 0;
        }
        
        .fact-content {
          flex: 1;
        }
        
        .fact-title {
          margin: 0 0 0.25rem;
          font-size: 0.875rem;
          color: var(--text-color, #333);
        }
        
        .fact-text {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-secondary-color, #666);
          line-height: 1.4;
        }
        
        .local-tech-initiatives {
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color, #eee);
        }
        
        .initiatives-title {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          color: var(--text-color, #333);
        }
        
        .initiatives-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .initiative-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--background-color, #f8f9fa);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        
        .initiative-icon {
          color: var(--primary-color, #3a6ea5);
          font-size: 0.875rem;
        }
        
        .initiative-name {
          font-weight: 500;
        }
        
        .widget-footer {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid var(--border-color, #eee);
        }
        
        .discover-link {
          color: var(--primary-color, #3a6ea5);
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .discover-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .widget-content {
            padding: 1rem;
          }
          
          .region-info {
            flex-direction: column;
          }
          
          .map-container {
            width: 60px;
            margin: 0 auto;
          }
          
          .saarland-fact {
            text-align: center;
          }
          
          .fact-icon {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default RegionalIdentityWidget;