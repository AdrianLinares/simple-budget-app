import { useState, useEffect } from 'react';
import { BudgetState } from '../types/budget';

const STORAGE_KEY = 'budget-app-data';

// Estado inicial por defecto
const getInitialBudgetState = (): BudgetState => ({
  monthlyIncome: 0,
  categories: {
    needs: {
      name: 'Necesidades',
      percentage: 50,
      expenses: [],
      color: '#10B981',
      icon: 'home'
    },
    wants: {
      name: 'Deudas/Otros gastos',
      percentage: 30,
      expenses: [],
      color: '#3B82F6',
      icon: 'shopping-bag'
    },
    savings: {
      name: 'Ahorros',
      percentage: 20,
      expenses: [],
      color: '#F59E0B',
      icon: 'piggy-bank'
    }
  }
});

// Función para cargar datos del localStorage
const loadFromStorage = (): BudgetState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      
      // Validar que los datos tienen la estructura correcta
      if (parsedData && 
          typeof parsedData.monthlyIncome === 'number' &&
          parsedData.categories &&
          parsedData.categories.needs &&
          parsedData.categories.wants &&
          parsedData.categories.savings) {
        
        // Asegurar que las categorías tienen todas las propiedades necesarias
        const defaultState = getInitialBudgetState();
        return {
          monthlyIncome: parsedData.monthlyIncome,
          categories: {
            needs: { ...defaultState.categories.needs, ...parsedData.categories.needs },
            wants: { ...defaultState.categories.wants, ...parsedData.categories.wants },
            savings: { ...defaultState.categories.savings, ...parsedData.categories.savings }
          }
        };
      }
    }
  } catch (error) {
    console.warn('Error al cargar datos del almacenamiento:', error);
  }
  
  return getInitialBudgetState();
};

// Función para guardar datos en localStorage
const saveToStorage = (data: BudgetState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar datos:', error);
    // Aquí podrías mostrar una notificación al usuario
  }
};

// Hook personalizado para manejar la persistencia
export const useBudgetPersistence = () => {
  const [budget, setBudget] = useState<BudgetState>(() => loadFromStorage());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al inicializar
  useEffect(() => {
    const loadedData = loadFromStorage();
    setBudget(loadedData);
    setIsLoading(false);
  }, []);

  // Guardar datos cada vez que el estado cambie
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(budget);
    }
  }, [budget, isLoading]);

  // Función para actualizar el presupuesto
  const updateBudget = (updater: (prev: BudgetState) => BudgetState) => {
    setBudget(updater);
  };

  // Función para limpiar datos
  const clearBudget = () => {
    const initialState = getInitialBudgetState();
    setBudget(initialState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  };

  // Función para exportar datos
  const exportData = (): string => {
    return JSON.stringify(budget, null, 2);
  };

  // Función para importar datos
  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validar estructura básica
      if (parsedData && 
          typeof parsedData.monthlyIncome === 'number' &&
          parsedData.categories) {
        
        const defaultState = getInitialBudgetState();
        const newState: BudgetState = {
          monthlyIncome: parsedData.monthlyIncome,
          categories: {
            needs: { ...defaultState.categories.needs, ...parsedData.categories.needs },
            wants: { ...defaultState.categories.wants, ...parsedData.categories.wants },
            savings: { ...defaultState.categories.savings, ...parsedData.categories.savings }
          }
        };
        
        setBudget(newState);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  };

  return {
    budget,
    updateBudget,
    clearBudget,
    exportData,
    importData,
    isLoading
  };
};