import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface MarketStatus {
  soccer: boolean;
  tennis: boolean;
  cricket: boolean;
  liveCasino: boolean;
  intCasino: boolean;
}

const DEFAULT_STATUS: MarketStatus = {
  soccer: true,
  tennis: true,
  cricket: true,
  liveCasino: true,
  intCasino: true,
};

export function useMarketStatus() {
  const [status, setStatus] = useState<MarketStatus>(() => {
    // Try to load from localStorage first for immediate display
    const saved = localStorage.getItem('market_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STATUS;
      }
    }
    return DEFAULT_STATUS;
  });
  const [loading, setLoading] = useState(true);
  const useLocalOnlyRef = useRef(false);

  useEffect(() => {
    const handleLocalUpdate = () => {
      const saved = localStorage.getItem('market_status');
      if (saved) {
        try {
          setStatus(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    };
    
    // Listen for custom event from other instances
    window.addEventListener('market_status_updated', handleLocalUpdate);

    if (useLocalOnlyRef.current) {
       setLoading(false);
       return () => window.removeEventListener('market_status_updated', handleLocalUpdate);
    }

    const docRef = doc(db, 'settings', 'market_status');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      // If we've switched to local only, completely ignore remote snapshots
      if (useLocalOnlyRef.current) return;

      if (docSnap.exists()) {
        const newData = { ...DEFAULT_STATUS, ...(docSnap.data() as Partial<MarketStatus>) };
        setStatus(newData);
        localStorage.setItem('market_status', JSON.stringify(newData));
        window.dispatchEvent(new Event('market_status_updated'));
      } else {
        // Initialize if not exists
        setDoc(docRef, DEFAULT_STATUS).catch(console.error);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Falling back to local storage due to Firebase error:", error.message);
      useLocalOnlyRef.current = true;
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('market_status_updated', handleLocalUpdate);
    };
  }, []);

  const updateStatus = async (key: keyof MarketStatus, value: boolean) => {
    // Optimistic update for instant UI feedback
    const newStatus = { ...status, [key]: value };
    setStatus(newStatus);
    
    // Always update local storage and notify other components
    localStorage.setItem('market_status', JSON.stringify(newStatus));
    window.dispatchEvent(new Event('market_status_updated'));

    if (useLocalOnlyRef.current) {
       return; // Already using local fallback
    }

    const docRef = doc(db, 'settings', 'market_status');
    try {
      await setDoc(docRef, { [key]: value }, { merge: true });
    } catch (error: any) {
      console.warn("Falling back to local storage for updates due to error:", error.message);
      useLocalOnlyRef.current = true;
      
      // Force rewrite to ensure snapshot's rollback didn't break our state
      setStatus(newStatus); 
      localStorage.setItem('market_status', JSON.stringify(newStatus));
      window.dispatchEvent(new Event('market_status_updated'));
    }
  };

  return { status, loading, updateStatus };
}
