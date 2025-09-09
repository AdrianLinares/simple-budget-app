import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { BudgetCategory, Expense } from '../types/budget';
import ExpenseItem from './ExpenseItem';

interface CategoryCardProps {
  category: BudgetCategory;
  limit: number;
  onAddExpense: (description: string, amount: number) => void;
  onReorderExpenses: (expenses: Expense[]) => void;
  onToggleExpense: (id: string) => void;
  onTogglePayment: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  limit,
  onAddExpense,
  onReorderExpenses,
  onToggleExpense,
  onTogglePayment,
  onDeleteExpense,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTotal = category.expenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const paidTotal = category.expenses
    .filter(expense => expense.isActive && expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const pendingTotal = activeTotal - paidTotal;

  const percentage = limit > 0 ? (activeTotal / limit) * 100 : 0;
  const paidPercentage = activeTotal > 0 ? (paidTotal / activeTotal) * 100 : 0;
  const isOverBudget = activeTotal > limit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && amount && parseFloat(amount) > 0) {
      onAddExpense(description.trim(), parseFloat(amount));
      setDescription('');
      setAmount('');
      setShowForm(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = category.expenses.findIndex(expense => expense.id === active.id);
      const newIndex = category.expenses.findIndex(expense => expense.id === over.id);
      
      const reorderedExpenses = arrayMove(category.expenses, oldIndex, newIndex);
      onReorderExpenses(reorderedExpenses);
    }
  };

  const getIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Necesidades': return '🏠';
      case 'Opcionales': return '🛍️';
      case 'Ahorros': return '💰';
      default: return '💵';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: category.color + '20' }}
          >
            <span className="text-xl">{getIcon(category.name)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.percentage}% del ingreso</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-xl">➕</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            ${activeTotal.toLocaleString()} / ${limit.toLocaleString()}
          </span>
          <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : ''
            }`}
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: !isOverBudget ? category.color : undefined,
            }}
          />
        </div>
      </div>

      {/* Pending Payment Progress Bar */}
      {activeTotal > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pendiente por pagar: ${pendingTotal.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-orange-600">
              {((pendingTotal / activeTotal) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-orange-500"
              style={{
                width: `${100 - paidPercentage}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Descripción del gasto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              placeholder="Valor ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        {category.expenses.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center py-4">
            No hay gastos agregados
          </p>
        ) : (
          <SortableContext 
            items={category.expenses.map(expense => expense.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {category.expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onToggleExpense={onToggleExpense}
                  onTogglePayment={onTogglePayment}
                  onDeleteExpense={onDeleteExpense}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </DndContext>
    </div>
  );
};

export default CategoryCard;