import React, { useState } from 'react';
import CategoryCard from './components/CategoryCard';
import BudgetSummary from './components/BudgetSummary';
import DataManager from './components/DataManager';
import { Expense } from './types/budget';
import { useBudgetPersistence } from './hooks/useBudgetPersistence';

function App() {
  const { 
    budget, 
    updateBudget, 
    clearBudget, 
    exportData, 
    importData, 
    isLoading 
  } = useBudgetPersistence();
  
  const [showDataManager, setShowDataManager] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleIncomeChange = (income: number) => {
    updateBudget(prev => ({
      ...prev,
      monthlyIncome: income
    }));
  };

  const addExpense = (categoryKey: keyof typeof budget.categories, description: string, amount: number) => {
    const newExpense: Expense = {
      id: generateId(),
      description,
      amount,
      isActive: true,
      isPaid: false
    };

    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: [...prev.categories[categoryKey].expenses, newExpense]
        }
      }
    }));
  };

  const editExpense = (categoryKey: keyof typeof budget.categories, expenseId: string, description: string, amount: number) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: prev.categories[categoryKey].expenses.map(expense =>
            expense.id === expenseId
              ? { ...expense, description, amount }
              : expense
          )
        }
      }
    }));
  };

  const toggleExpense = (categoryKey: keyof typeof budget.categories, expenseId: string) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: prev.categories[categoryKey].expenses.map(expense =>
            expense.id === expenseId
              ? { ...expense, isActive: !expense.isActive }
              : expense
          )
        }
      }
    }));
  };

  const togglePayment = (categoryKey: keyof typeof budget.categories, expenseId: string) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: prev.categories[categoryKey].expenses.map(expense =>
            expense.id === expenseId
              ? { ...expense, isPaid: !expense.isPaid }
              : expense
          )
        }
      }
    }));
  };

  const deleteExpense = (categoryKey: keyof typeof budget.categories, expenseId: string) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: prev.categories[categoryKey].expenses.filter(expense =>
            expense.id !== expenseId
          )
        }
      }
    }));
  };

  const editExpense = (categoryKey: keyof typeof budget.categories, expenseId: string, description: string, amount: number) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: prev.categories[categoryKey].expenses.map(expense =>
            expense.id === expenseId
              ? { ...expense, description, amount }
              : expense
          )
        }
      }
    }));
  };

  const reorderExpenses = (categoryKey: keyof typeof budget.categories, reorderedExpenses: Expense[]) => {
    updateBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          expenses: reorderedExpenses
        }
      }
    }));
  };

  // Mostrar loading si está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-lg text-gray-600">Cargando tu presupuesto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Presupuesto 50/30/20</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Gestiona tus finanzas personales siguiendo la regla del 50% necesidades, 30% gustos y 20% ahorros
          </p>
          
          {/* Data Management Button */}
          <button
            onClick={() => setShowDataManager(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>⚙️</span>
            Gestionar Datos
          </button>
        </div>

        {/* Income Input */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="max-w-md mx-auto">
            <label htmlFor="income" className="block text-lg font-semibold text-gray-700 mb-3">
              Ingreso Mensual Total
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                id="income"
                type="number"
                value={budget.monthlyIncome || ''}
                onChange={(e) => handleIncomeChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {budget.monthlyIncome > 0 && (
          <>
            {/* Budget Summary */}
            <div className="mb-8">
              <BudgetSummary budget={budget} />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(budget.categories).map(([key, category]) => {
                const categoryKey = key as keyof typeof budget.categories;
                const limit = (budget.monthlyIncome * category.percentage) / 100;
                
                return (
                  <CategoryCard
                    key={key}
                    category={category}
                    limit={limit}
                    onAddExpense={(description, amount) => addExpense(categoryKey, description, amount)}
                    onReorderExpenses={(expenses) => reorderExpenses(categoryKey, expenses)}
                    onToggleExpense={(id) => toggleExpense(categoryKey, id)}
                    onTogglePayment={(id) => togglePayment(categoryKey, id)}
                    onDeleteExpense={(id) => deleteExpense(categoryKey, id)}
                    onEditExpense={(id, description, amount) => editExpense(categoryKey, id, description, amount)}
                  />
                );
              })}
            </div>
          </>
        )}

        {budget.monthlyIncome === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ingresa tu ingreso mensual para comenzar
            </h3>
            <p className="text-gray-500">
              Una vez que ingreses tu ingreso, podrás comenzar a planificar tu presupuesto
            </p>
          </div>
        )}

        {/* Data Manager Modal */}
        {showDataManager && (
          <DataManager
            onClose={() => setShowDataManager(false)}
            onClearData={clearBudget}
            onExportData={exportData}
            onImportData={importData}
          />
        )}
      </div>
    </div>
  );
}

export default App;