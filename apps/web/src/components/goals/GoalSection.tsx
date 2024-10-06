import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import GoalItem, { GoalProps } from './GoalItem';

interface GoalSectionProps {
  title: string;
  goals: GoalProps['goal'][];
  onComplete?: (id: string) => void;
  onNotAchieved?: (id: string) => void;
}

const GoalSection: React.FC<GoalSectionProps> = ({ title, goals, onComplete, onNotAchieved }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-8">
      <div
        className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-2xl font-bold text-gray-800">{title} ({goals.length})</h2>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {isOpen && (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalItem
              key={goal._id}
              goal={goal}
              onComplete={onComplete ? () => onComplete(goal._id) : undefined}
              onNotAchieved={onNotAchieved ? () => onNotAchieved(goal._id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalSection;