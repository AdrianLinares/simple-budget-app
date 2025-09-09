import React from 'react';
import { BudgetState } from '../types/budget';

interface BudgetSummaryProps {
  budget: BudgetState;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budget }) => {
  const { monthlyIncome, categories } = budget;

  const totalSpent = Object.values(categories).reduce((total, category) => {
    return total + category.expenses
      .filter(expense => expense.isActive)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, 0);

  const totalPaid = Object.values(categories).reduce((total, category) => {
    return total + category.expenses
      .filter(expense => expense.isActive && expense.isPaid)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, 0);

  const totalPending = totalSpent - totalPaid;

  const totalBudget = monthlyIncome;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const paidPercentage = totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0;

  const isOverBudget = totalSpent > totalBudget;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Presupuesto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📈</span>
            <span className="text-sm font-medium text-blue-800">Ingreso Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ${monthlyIncome.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-lg p-4 ${
          isOverBudget ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{isOverBudget ? '📉' : '📊'}</span>
            <span className={`text-sm font-medium ${
              isOverBudget ? 'text-red-800' : 'text-green-800'
            }`}>
              Total Gastado
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            isOverBudget ? 'text-red-900' : 'text-green-900'
          }`}>
            ${totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <span className="text-sm font-medium text-green-800">Total Pagado</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            ${totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏳</span>
            <span className="text-sm font-medium text-orange-800">Pendiente</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            ${totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div className={`rounded-lg p-4 ${
          remaining < 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{remaining < 0 ? '⚠️' : '💵'}</span>
            <span className={`text-sm font-medium ${
              remaining < 0 ? 'text-red-800' : 'text-gray-800'
            }`}>
              {remaining < 0 ? 'Sobre Presupuesto' : 'Disponible'}
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            remaining < 0 ? 'text-red-900' : 'text-gray-900'
          }`}>
            ${Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso Total del Presupuesto
          </span>
          <span className={`text-sm font-medium ${
            isOverBudget ? 'text-red-600' : 'text-gray-600'
          }`}>
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Payment Progress */}
      {totalSpent > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pendiente por Pagar
            </span>
            <span className="text-sm font-medium text-orange-600">
              {(100 - paidPercentage).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300 bg-orange-500"
              style={{ width: `${100 - paidPercentage}%` }}
            />
          </div>
        </div>
      )}
      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-sm text-red-800">
              <strong>Advertencia:</strong> Has excedido tu presupuesto mensual por ${(totalSpent - totalBudget).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;