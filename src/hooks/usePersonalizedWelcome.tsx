import { useState, useEffect } from 'react';

interface PersonalizedWelcomeState {
  isFirstTime: boolean | null;
  showWelcomeModal: boolean;
  userPreference: string | null;
}

export const usePersonalizedWelcome = () => {
  const [state, setState] = useState<PersonalizedWelcomeState>({
    isFirstTime: null,
    showWelcomeModal: false,
    userPreference: null,
  });

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('kerigma-has-visited');
    const userPref = localStorage.getItem('kerigma-user-preference');
    
    if (!hasVisited) {
      setState(prev => ({
        ...prev,
        showWelcomeModal: true,
        isFirstTime: true,
        userPreference: userPref,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isFirstTime: false,
        userPreference: userPref,
      }));
    }
  }, []);

  const handleWelcomeResponse = (isFirstTime: boolean) => {
    localStorage.setItem('kerigma-has-visited', 'true');
    localStorage.setItem('kerigma-user-preference', isFirstTime ? 'first-time' : 'returning');
    
    setState(prev => ({
      ...prev,
      isFirstTime,
      showWelcomeModal: false,
      userPreference: isFirstTime ? 'first-time' : 'returning',
    }));
  };

  const closeWelcomeModal = () => {
    setState(prev => ({
      ...prev,
      showWelcomeModal: false,
    }));
  };

  return {
    isFirstTime: state.isFirstTime,
    showWelcomeModal: state.showWelcomeModal,
    userPreference: state.userPreference,
    handleWelcomeResponse,
    closeWelcomeModal,
  };
};