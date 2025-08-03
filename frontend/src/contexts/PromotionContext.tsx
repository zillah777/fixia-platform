import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PromotionData {
  remainingSpots: {
    as_providers: number;
    exploradores: number;
  };
  totalRegistered: number;
  isActive: boolean;
  endDate: Date;
  lastUpdated: Date;
}

interface PromotionContextType {
  promotionData: PromotionData;
  updatePromotionData: (data: Partial<PromotionData>) => void;
  isEligibleForPromotion: (userType?: 'provider' | 'customer') => boolean;
  getTotalRemainingSpots: () => number;
  getProgressPercentage: () => number;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export function usePromotion() {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
}

interface PromotionProviderProps {
  children: ReactNode;
}

export function PromotionProvider({ children }: PromotionProviderProps) {
  const [promotionData, setPromotionData] = useState<PromotionData>({
    remainingSpots: {
      as_providers: 156, // remaining from 200
      exploradores: 183  // remaining from 200
    },
    totalRegistered: 61, // 44 AS + 17 Exploradores registered
    isActive: true,
    endDate: new Date('2025-12-31'), // Promotion end date
    lastUpdated: new Date()
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPromotionData(prevData => {
        // Randomly decrease spots to simulate real registrations
        const shouldUpdate = Math.random() < 0.3; // 30% chance of update every interval
        
        if (!shouldUpdate || prevData.remainingSpots.as_providers <= 0 && prevData.remainingSpots.exploradores <= 0) {
          return prevData;
        }

        const updateType = Math.random() < 0.6 ? 'as_providers' : 'exploradores';
        const decreaseAmount = Math.floor(Math.random() * 2) + 1; // Decrease by 1-2

        const newRemainingSpots = {
          ...prevData.remainingSpots,
          [updateType]: Math.max(0, prevData.remainingSpots[updateType] - decreaseAmount)
        };

        const totalRemaining = newRemainingSpots.as_providers + newRemainingSpots.exploradores;
        const newTotalRegistered = 400 - totalRemaining;

        return {
          ...prevData,
          remainingSpots: newRemainingSpots,
          totalRegistered: newTotalRegistered,
          isActive: totalRemaining > 0,
          lastUpdated: new Date()
        };
      });
    }, 45000); // Update every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const updatePromotionData = (data: Partial<PromotionData>) => {
    setPromotionData(prevData => ({
      ...prevData,
      ...data,
      lastUpdated: new Date()
    }));
  };

  const isEligibleForPromotion = (userType?: 'provider' | 'customer'): boolean => {
    if (!promotionData.isActive) return false;
    
    if (userType === 'provider') {
      return promotionData.remainingSpots.as_providers > 0;
    } else if (userType === 'customer') {
      return promotionData.remainingSpots.exploradores > 0;
    }
    
    // If no user type specified, check if any spots are available
    return getTotalRemainingSpots() > 0;
  };

  const getTotalRemainingSpots = (): number => {
    return promotionData.remainingSpots.as_providers + promotionData.remainingSpots.exploradores;
  };

  const getProgressPercentage = (): number => {
    const totalSpots = 400;
    const remaining = getTotalRemainingSpots();
    return ((totalSpots - remaining) / totalSpots) * 100;
  };

  const value: PromotionContextType = {
    promotionData,
    updatePromotionData,
    isEligibleForPromotion,
    getTotalRemainingSpots,
    getProgressPercentage
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
}

export default PromotionProvider;