import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export const SAMPLE_IMAGES = {
  scaffold: {
    name: 'Scaffolding Deck Hazard (Demo)',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=1000&auto=format&fit=crop',
    type: 'Scaffolding & Working at Heights',
    suggestedNotes: 'Scaffold working platform at Level 18 perimeter. Check guardrails and worker tie-off anchors.'
  },
  excavation: {
    name: 'Basement Trench Cave-in Risk (Demo)',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000&auto=format&fit=crop',
    type: 'Excavation & Trenching',
    suggestedNotes: 'Deep pipeline trench in Sector 4. Inspect shoring box and soil surcharge setback.'
  },
  beamCrack: {
    name: 'Diagonal Beam Shear Crack (Demo)',
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1000&auto=format&fit=crop',
    structure: 'Reinforced Concrete Beam',
    element: 'Transfer Beam B-4 Near Support',
    suggestedNotes: 'Diagonal crack observed 40cm from column face after formwork de-shoring.'
  },
  retainingWall: {
    name: 'Retaining Wall Seepage Crack (Demo)',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
    structure: 'Basement Retaining Wall',
    element: 'North Basement Stem Wall',
    suggestedNotes: 'Horizontal efflorescence fissure with moisture marks on basement boundary.'
  }
};

export const AppProvider = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    aiConfigured: false,
    provider: 'Demo Mode',
    mode: 'demo',
    loading: true,
  });
  const [toasts, setToasts] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [activeWeather, setActiveWeather] = useState(null);

  // Check backend health periodically
  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setBackendStatus({
        connected: true,
        aiConfigured: data.ai_configured,
        provider: data.ai_provider,
        mode: data.mode,
        loading: false,
      });
    } catch (err) {
      setBackendStatus({
        connected: false,
        aiConfigured: false,
        provider: 'Offline / Client Demo',
        mode: 'demo',
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30 sec ping
    return () => clearInterval(interval);
  }, []);

  // Fetch initial weather
  useEffect(() => {
    api.getWeather('Metro City')
      .then(setActiveWeather)
      .catch(() => {});
  }, []);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        backendStatus,
        checkHealth,
        toasts,
        addToast,
        removeToast,
        selectedProjectId,
        setSelectedProjectId,
        activeWeather,
        setActiveWeather,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
