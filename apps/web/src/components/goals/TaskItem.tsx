import { differenceInDays } from 'date-fns';
import React, { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TaskItemProps {
  task: {
    _id: string;
    title: string;
    completed: boolean;
    deadline?: string;
    budget: number;
  };
  onUpdate: (updatedTask: any) => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(task.budget.toString());
  const datePickerRef = useRef<HTMLDivElement>(null);

  const handleDateClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDatePickerOpen(true);
  };

  const getDaysLeft = (deadline: Date) => {
    const today = new Date();
    const daysLeft = differenceInDays(deadline, today);
    return daysLeft > 0 ? `${daysLeft} days left` : 'Overdue';
  };

  const handleBudgetClick = () => {
    setIsEditingBudget(true);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempBudget(e.target.value);
  };

  const handleBudgetBlur = () => {
    const newBudget = parseFloat(tempBudget);
    if (!isNaN(newBudget) && newBudget >= 0) {
      onUpdate({ ...task, budget: newBudget });
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onUpdate({ ...task, completed: !task.completed })}
          className="mr-2"
        />
        <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
      </div>
      <div className="flex items-center">
        <button onClick={handleDateClick} className="text-sm text-blue-500 mr-2">
          {task.deadline ? getDaysLeft(new Date(task.deadline)) : 'Set deadline'}
        </button>
        {isEditingBudget ? (
          <input
            type="number"
            value={tempBudget}
            onChange={handleBudgetChange}
            onBlur={handleBudgetBlur}
            className="w-20 text-sm border rounded px-1"
          />
        ) : (
          <button onClick={handleBudgetClick} className="text-sm text-green-500">
            Budget: ${task.budget}
          </button>
        )}
        <button onClick={onDelete} className="ml-2 text-sm text-red-500">Delete</button>
      </div>
      {isDatePickerOpen && (
        <div ref={datePickerRef} className="absolute z-10">
          <DatePicker
            selected={task.deadline ? new Date(task.deadline) : null}
            onChange={(date: Date) => {
              onUpdate({ ...task, deadline: date.toISOString() });
              setIsDatePickerOpen(false);
            }}
            onClickOutside={() => setIsDatePickerOpen(false)}
            inline
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;