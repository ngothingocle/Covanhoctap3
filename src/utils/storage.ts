import { AppState, UserSession } from '../types';
import { initialAppState } from '../data/initialData';

const STORAGE_KEY = 'covan_hoc_tap_ngoc_le_v1';
const SESSION_KEY = 'covan_session_user_v1';

export function loadAppState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialAppState,
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Error loading app state from localStorage:', err);
  }
  return initialAppState;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving app state to localStorage:', err);
  }
}

export function loadUserSession(): UserSession | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error loading user session:', err);
  }
  // Default to advisor for instant demonstration if not logged in, or null if strict
  return {
    role: 'advisor',
    username: initialAppState.advisorAccount.username,
    displayName: initialAppState.advisorAccount.fullName,
  };
}

export function saveUserSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.error('Error saving user session:', err);
  }
}

export function resetToDefaultData(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return initialAppState;
}
