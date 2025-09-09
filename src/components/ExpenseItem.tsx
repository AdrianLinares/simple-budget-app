import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Expense } from '../types/budget';

interface ExpenseItemProps {
  expense: Expense;
  onToggleExpense: (id: string) => void;
  onTogglePayment: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onToggleExpense,
  onTogglePayment,
  onDeleteExpense,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: expense.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        expense.isActive
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-100 opacity-60'
      } ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Arrastrar para reordenar"
      >
        <span className="text-sm">⋮⋮</span>
      </div>

      <input
        type="checkbox"
        checked={expense.isActive}
        onChange={() => onToggleExpense(expense.id)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="checkbox"
        checked={expense.isPaid}
        onChange={() => onTogglePayment(expense.id)}
        disabled={!expense.isActive}
        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        title="Marcar como pagado"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          expense.isActive 
            ? expense.isPaid 
              ? 'text-green-700 line-through' 
              : 'text-gray-900'
            : 'text-gray-500'
        }`}>
          {expense.description}
        </p>
        {expense.isPaid && expense.isActive && (
          <p className="text-xs text-green-600">✓ Pagado</p>
        )}
      </div>
      <span className={`text-sm font-semibold ${
        expense.isActive 
          ? expense.isPaid 
            ? 'text-green-700 line-through' 
            : 'text-gray-900'
          : 'text-gray-500'
      }`}>
        ${expense.amount.toLocaleString()}
      </span>
      <button
        onClick={() => onDeleteExpense(expense.id)}
        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <span className="text-sm">🗑️</span>
      </button>
    </div>
  );
};

export default ExpenseItem;