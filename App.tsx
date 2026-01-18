
import React, { useState, useEffect } from 'react';
import { ViewState, Ingredient, NeuralProtocol, UserPreferences } from './types';
import Landing from './components/Landing';
import Analyzer from './components/Analyzer';
import Dashboard from './components/Dashboard';
import Synthesis from './components/Synthesis';
import ExecutionMode from './components/ExecutionMode';
import Settings from './components/Settings';
import Header from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { db } from './utils/database';
import { logger } from './utils/logger';
import { performanceMonitor } from './utils/performance';
import { prefetchCommonData } from './services/enhancedGeminiService';
import { setRuntimeApiKey } from './services/geminiService';
import { setImageGenApiKey } from './services/imageGenerationService';
import { setSubstitutionApiKey } from './services/substitutionService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [currentProtocol, setCurrentProtocol] = useState<NeuralProtocol | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('culinary_lens_prefs');
    return saved ? JSON.parse(saved) : {
      dietary: 'None',
      allergies: [],
      cuisinePreference: '',
      instamartSync: true,
      highFidelityVisuals: true,
      apiKey: ''
    };
  });

  // Initialize database and prefetch on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Set runtime API key from saved preferences (sync across all services)
        setRuntimeApiKey(preferences.apiKey || null);
        setImageGenApiKey(preferences.apiKey || null);
        setSubstitutionApiKey(preferences.apiKey || null);
        
        await db.initialize();
        logger.info('[App] Database initialized');
        
        // Load persisted inventory
        const savedIngredients = await db.getIngredients();
        if (savedIngredients.length > 0) {
          setInventory(savedIngredients.slice(0, 50)); // Limit to recent
          logger.info('[App] Loaded persisted ingredients', { count: savedIngredients.length });
        }

        // Prefetch common data (only if API key is configured)
        if (preferences.apiKey || process.env.API_KEY) {
          await prefetchCommonData();
        }
      } catch (error) {
        logger.error('[App] Initialization failed', { error }, error as Error);
      }
    };

    initialize();
    performanceMonitor.trackUserAction('app_mounted', 'lifecycle');
  }, []);

  useEffect(() => {
    localStorage.setItem('culinary_lens_prefs', JSON.stringify(preferences));
    
    // Set runtime API key whenever preferences change (sync across all services)
    setRuntimeApiKey(preferences.apiKey || null);
    setImageGenApiKey(preferences.apiKey || null);
    setSubstitutionApiKey(preferences.apiKey || null);
    
    logger.debug('[App] Preferences updated', { preferences: { ...preferences, apiKey: preferences.apiKey ? '***' : undefined } });
  }, [preferences]);

  const handleStart = () => setViewState(ViewState.UPLOAD);
  
  const handleAnalysisComplete = async (newIngredients: Ingredient[]) => {
    setInventory(prev => [...prev, ...newIngredients]);
    setViewState(ViewState.DASHBOARD);
    
    // Persist to IndexedDB
    try {
      await Promise.all(newIngredients.map(ing => db.saveIngredient(ing)));
      logger.info('[App] Ingredients persisted to database', { count: newIngredients.length });
    } catch (error) {
      logger.warn('[App] Failed to persist ingredients', { error });
    }

    performanceMonitor.trackUserAction('analysis_complete', 'ingredient', undefined, newIngredients.length);
  };

  const handleSynthesize = () => setViewState(ViewState.SYNTHESIS);
  
  const handleProtocolReady = (protocol: NeuralProtocol) => {
    setCurrentProtocol(protocol);
  };

  const handleStartExecution = () => setViewState(ViewState.EXECUTION);
  const handleFinishExecution = () => {
    setViewState(ViewState.DASHBOARD);
    setCurrentProtocol(null);
  };

  const renderView = () => {
    switch (viewState) {
      case ViewState.LANDING:
        return <Landing onStart={handleStart} />;
      case ViewState.UPLOAD:
      case ViewState.ANALYSIS:
        return <Analyzer onComplete={handleAnalysisComplete} />;
      case ViewState.DASHBOARD:
        return (
          <Dashboard 
            inventory={inventory} 
            protocol={currentProtocol}
            onSynthesize={handleSynthesize} 
            onAddMore={() => setViewState(ViewState.UPLOAD)}
          />
        );
      case ViewState.SYNTHESIS:
        return (
          <Synthesis 
            inventory={inventory}
            onProtocolReady={handleProtocolReady}
            onExecute={handleStartExecution} 
            onBack={() => setViewState(ViewState.DASHBOARD)} 
          />
        );
      case ViewState.SETTINGS:
        return (
          <Settings 
            preferences={preferences}
            onUpdate={setPreferences}
            onBack={() => setViewState(ViewState.DASHBOARD)}
          />
        );
      case ViewState.EXECUTION:
        return currentProtocol ? (
          <ExecutionMode protocol={currentProtocol} onComplete={handleFinishExecution} />
        ) : null;
      default:
        return <Landing onStart={handleStart} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen selection:bg-[#D4AF37]/20 selection:text-[#1A1A1D]">
        {viewState !== ViewState.LANDING && viewState !== ViewState.EXECUTION && (
          <Header viewState={viewState} onOpenSettings={() => setViewState(ViewState.SETTINGS)} />
        )}
        <main className="transition-all duration-1000 ease-in-out">
          {renderView()}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;