import { useState, useEffect } from 'react';

/**
 * MCP-integrated game state hook
 * 
 * This hook provides game state management with MCP persistence,
 * replacing the previous GameStateContext implementation.
 */
export function useMcpGameState() {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load game state on mount
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from MCP memory
        const response = await fetch('/api/mcp/memory/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key: 'game_state' })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.value) {
            setGameState(data.value);
          } else {
            // Initialize default state if no saved state exists
            setGameState({
              level: 3,
              xp: 450,
              nextLevelXp: 1000,
              totalXp: 2450,
              currentMission: {
                id: "mission-123",
                name: "Mission: Saarland-Wanderweg digitalisieren",
                description: "Erstelle eine digitale Karte des Saarland-Wanderwegs",
                progress: 45,
                steps: [
                  "Daten sammeln",
                  "GPS-Koordinaten extrahieren",
                  "Karte erstellen"
                ],
                rewards: {
                  xp: 250,
                  badges: ["Kartograph", "Wanderer"]
                }
              },
              completedMissions: [
                {
                  id: "mission-101",
                  name: "Setup: KI-Arbeitsumgebung einrichten",
                  progress: 100,
                  completed: "2025-05-01T10:15:00Z"
                },
                {
                  id: "mission-102",
                  name: "Erste Schritte mit Llama 3.2",
                  progress: 100,
                  completed: "2025-05-05T14:30:00Z"
                }
              ],
              availableMissions: [
                {
                  id: "mission-124",
                  name: "KI-Chatbot für Tourismus",
                  description: "Erstelle einen Chatbot für Tourismusinformationen",
                  difficulty: "medium",
                  rewards: {
                    xp: 350,
                    badges: ["KI-Entwickler", "Tourismus-Experte"]
                  }
                },
                {
                  id: "mission-125",
                  name: "Saarbrücker Sehenswürdigkeiten",
                  description: "Erstelle eine KI-App für Sehenswürdigkeiten",
                  difficulty: "hard",
                  rewards: {
                    xp: 500,
                    badges: ["App-Entwickler", "Stadtkenner"]
                  }
                }
              ],
              badges: [
                "Einsteiger",
                "KI-Enthusiast",
                "Setpper",
                "Kartograph"
              ],
              streakDays: 5,
              lastActive: new Date().toISOString()
            });
          }
        } else {
          throw new Error('Failed to load game state');
        }
      } catch (err) {
        console.error('Error loading game state:', err);
        setError('Failed to load game state');
        
        // Fallback to default state
        setGameState({
          level: 3,
          xp: 450,
          nextLevelXp: 1000,
          totalXp: 2450,
          currentMission: {
            id: "mission-123",
            name: "Mission: Saarland-Wanderweg digitalisieren",
            description: "Erstelle eine digitale Karte des Saarland-Wanderwegs",
            progress: 45,
            steps: [
              "Daten sammeln",
              "GPS-Koordinaten extrahieren",
              "Karte erstellen"
            ],
            rewards: {
              xp: 250,
              badges: ["Kartograph", "Wanderer"]
            }
          },
          completedMissions: [
            {
              id: "mission-101",
              name: "Setup: KI-Arbeitsumgebung einrichten",
              progress: 100,
              completed: "2025-05-01T10:15:00Z"
            },
            {
              id: "mission-102",
              name: "Erste Schritte mit Llama 3.2",
              progress: 100,
              completed: "2025-05-05T14:30:00Z"
            }
          ],
          availableMissions: [
            {
              id: "mission-124",
              name: "KI-Chatbot für Tourismus",
              description: "Erstelle einen Chatbot für Tourismusinformationen",
              difficulty: "medium",
              rewards: {
                xp: 350,
                badges: ["KI-Entwickler", "Tourismus-Experte"]
              }
            },
            {
              id: "mission-125",
              name: "Saarbrücker Sehenswürdigkeiten",
              description: "Erstelle eine KI-App für Sehenswürdigkeiten",
              difficulty: "hard",
              rewards: {
                xp: 500,
                badges: ["App-Entwickler", "Stadtkenner"]
              }
            }
          ],
          badges: [
            "Einsteiger",
            "KI-Enthusiast",
            "Setpper",
            "Kartograph"
          ],
          streakDays: 5,
          lastActive: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGameState();
  }, []);

  // Save game state
  const saveGameState = async (newState) => {
    try {
      const updatedState = {
        ...newState,
        lastUpdated: new Date().toISOString()
      };
      
      // Update local state
      setGameState(updatedState);
      
      // Save to MCP memory
      const response = await fetch('/api/mcp/memory/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          key: 'game_state',
          value: updatedState,
          ttl: 86400 * 30 // 30 days
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save game state');
      }
      
      return true;
    } catch (err) {
      console.error('Error saving game state:', err);
      setError('Failed to save game state');
      return false;
    }
  };

  // Update score
  const updateScore = async (points) => {
    if (!gameState) return false;
    
    const newScore = gameState.score + points;
    const newState = { ...gameState, score: newScore };
    
    return await saveGameState(newState);
  };

  // Level up
  const levelUp = async () => {
    if (!gameState) return false;
    
    const newLevel = gameState.level + 1;
    const newState = { ...gameState, level: newLevel };
    
    return await saveGameState(newState);
  };

  // Update mission progress
  const updateMissionProgress = async (missionId, progress) => {
    if (!gameState || !gameState.currentMission) return false;
    
    // Only update if this is the current mission
    if (gameState.currentMission.id !== missionId) return false;
    
    const updatedMission = {
      ...gameState.currentMission,
      progress: Math.min(100, Math.max(0, progress)) // Ensure progress is between 0-100
    };
    
    const newState = {
      ...gameState,
      currentMission: updatedMission
    };
    
    return await saveGameState(newState);
  };
  
  // Start a new mission
  const startMission = async (missionId) => {
    if (!gameState) return false;
    
    // Find mission in available missions
    const missionToStart = gameState.availableMissions.find(m => m.id === missionId);
    if (!missionToStart) return false;
    
    // Move current mission to available if not completed
    let updatedAvailableMissions = [...gameState.availableMissions];
    if (gameState.currentMission) {
      const currentMission = gameState.currentMission;
      if (currentMission.progress < 100) {
        updatedAvailableMissions = [
          ...updatedAvailableMissions.filter(m => m.id !== missionId),
          {
            ...currentMission,
            progress: Math.min(currentMission.progress, 99) // Cap at 99% if in progress
          }
        ];
      }
    }
    
    // Set new current mission
    const newCurrentMission = {
      ...missionToStart,
      progress: 0,
      steps: missionToStart.steps || ['Mission starten', 'Weitere Schritte folgen'],
      startedAt: new Date().toISOString()
    };
    
    const newState = {
      ...gameState,
      currentMission: newCurrentMission,
      availableMissions: updatedAvailableMissions.filter(m => m.id !== missionId)
    };
    
    return await saveGameState(newState);
  };
  
  // Complete mission
  const completeMission = async (missionId) => {
    if (!gameState || !gameState.currentMission) return false;
    
    // Only complete the current mission
    if (gameState.currentMission.id !== missionId) return false;
    
    const completedMission = {
      ...gameState.currentMission,
      progress: 100,
      completed: new Date().toISOString()
    };
    
    // Add XP reward
    const xpReward = completedMission.rewards?.xp || 0;
    const newXp = gameState.xp + xpReward;
    const newTotalXp = gameState.totalXp + xpReward;
    
    // Check for level up
    let newLevel = gameState.level;
    let newNextLevelXp = gameState.nextLevelXp;
    
    if (newXp >= gameState.nextLevelXp) {
      newLevel++;
      newNextLevelXp = Math.round(gameState.nextLevelXp * 1.5); // Increase XP requirement
    }
    
    // Add badges
    const newBadges = [...gameState.badges];
    if (completedMission.rewards?.badges) {
      completedMission.rewards.badges.forEach(badge => {
        if (!newBadges.includes(badge)) {
          newBadges.push(badge);
        }
      });
    }
    
    // Move completed mission to completedMissions
    const newCompletedMissions = [...gameState.completedMissions, completedMission];
    
    // Choose next available mission if any
    let newCurrentMission = null;
    if (gameState.availableMissions.length > 0) {
      // Just take the first available mission
      newCurrentMission = {
        ...gameState.availableMissions[0],
        progress: 0,
        startedAt: new Date().toISOString()
      };
    }
    
    const newState = {
      ...gameState,
      xp: newXp,
      totalXp: newTotalXp,
      level: newLevel,
      nextLevelXp: newNextLevelXp,
      badges: newBadges,
      currentMission: newCurrentMission,
      completedMissions: newCompletedMissions,
      availableMissions: newCurrentMission 
        ? gameState.availableMissions.slice(1) 
        : gameState.availableMissions,
      lastActive: new Date().toISOString()
    };
    
    return await saveGameState(newState);
  };

  // Reset game state
  const resetGameState = async () => {
    const defaultState = {
      level: 1,
      xp: 0,
      nextLevelXp: 500,
      totalXp: 0,
      currentMission: null,
      completedMissions: [],
      availableMissions: [
        {
          id: "mission-101",
          name: "Setup: KI-Arbeitsumgebung einrichten",
          description: "Richte deine lokale KI-Entwicklungsumgebung ein",
          difficulty: "easy",
          rewards: {
            xp: 150,
            badges: ["Einsteiger"]
          }
        }
      ],
      badges: [],
      streakDays: 0,
      lastActive: new Date().toISOString()
    };
    
    return await saveGameState(defaultState);
  };

  return {
    gameState,
    isLoading,
    error,
    updateScore,
    levelUp,
    updateMissionProgress,
    startMission,
    completeMission,
    resetGameState,
    saveGameState
  };
}

export default useMcpGameState;