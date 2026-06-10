import { useState, useEffect } from 'react';
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
  const [status, setStatus] = useState<MarketStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'market_status');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStatus({ ...DEFAULT_STATUS, ...(docSnap.data() as Partial<MarketStatus>) });
      } else {
        // Initialize if not exists
        setDoc(docRef, DEFAULT_STATUS).catch(console.error);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching market status:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (key: keyof MarketStatus, value: boolean) => {
    // Optimistic update for instant UI feedback
    const previousStatus = { ...status };
    setStatus({ ...status, [key]: value });

    const docRef = doc(db, 'settings', 'market_status');
    try {
      await setDoc(docRef, { [key]: value }, { merge: true });
    } catch (error: any) {
      console.error("Error updating market status:", error);
      // Revert if error occurs
      setStatus(previousStatus);
      
      if (error.code === 'permission-denied') {
        alert("Permission Denied: Ensure you are logged in and your Firebase rules allow writes. Check Firebase Console -> Firestore -> Rules.");
      } else {
        alert("Database update failed: " + error.message);
      }
    }
  };

  return { status, loading, updateStatus };
}
