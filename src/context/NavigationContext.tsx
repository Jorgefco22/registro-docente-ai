/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ViewType = 
  | 'dashboard'
  | 'groups'
  | 'group-detail'
  | 'attendance'
  | 'planning'
  | 'ai-planner'
  | 'messages'
  | 'settings';

interface NavigationContextProps {
  currentView: ViewType;
  activeGroupId: string | null;
  activePlanId: string | null;
  navigateTo: (view: ViewType, options?: { groupId?: string; planId?: string }) => void;
  goBack: () => void;
  history: { view: ViewType; groupId: string | null; planId: string | null }[];
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ view: ViewType; groupId: string | null; planId: string | null }[]>([
    { view: 'dashboard', groupId: null, planId: null }
  ]);

  const navigateTo = (view: ViewType, options?: { groupId?: string; planId?: string }) => {
    const groupId = options?.groupId || null;
    const planId = options?.planId || null;

    setCurrentView(view);
    if (groupId) setActiveGroupId(groupId);
    if (planId) setActivePlanId(planId);

    setHistory(prev => [...prev, { view, groupId, planId }]);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    
    setCurrentView(previous.view);
    setActiveGroupId(previous.groupId);
    setActivePlanId(previous.planId);
    setHistory(newHistory);
  };

  return (
    <NavigationContext.Provider value={{ 
      currentView, 
      activeGroupId, 
      activePlanId, 
      navigateTo, 
      goBack, 
      history 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
