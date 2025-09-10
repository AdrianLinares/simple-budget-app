import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Expense } from '../types/budget';

interface ExpenseItemProps {
  expense: Expense;
  onToggleExpense: (id: string) => void;
  onTogglePayment: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, description: string, amount: number) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onToggleExpense,
  onTogglePayment,
  onDeleteExpense,
  onEditExpense,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(expense.description);
  const [editAmount, setEditAmount] = useState(expense.amount.toString());

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

  const handleSaveEdit = () => {
    const trimmedDescription = editDescription.trim();
    const newAmount = parseFloat(editAmount);

    if (trimmedDescription && newAmount > 0) {
      onEditExpense(expense.id, trimmedDescription, newAmount);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDescription(expense.description);
    setEditAmount(expense.amount.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200"
      >
        {/* Drag Handle (disabled during edit) */}
        <div className="p-1 text-gray-300 cursor-not-allowed">
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

        <div className="flex-2 flex gap-2">
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-2 px-1 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción del gasto"
            autoFocus
          />
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            onKeyDown={handleKeyPress}
            step="0.01"
            min="0.01"
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Valor"
          />
        </div>

        <div className="flex gap-1">
          <button
            onClick={handleSaveEdit}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Guardar cambios"
          >
            <span className="text-sm">✅</span>
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Cancelar edición"
          >
            <span className="text-sm">❌</span>
          </button>
        </div>
      </div>
    );
  }

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

      <div className="flex gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="Editar gasto"
        >
          <span className="text-sm">✏️</span>
        </button>
        <button
          onClick={() => onDeleteExpense(expense.id)}
          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Eliminar gasto"
        >
          <span className="text-sm">🗑️</span>
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;