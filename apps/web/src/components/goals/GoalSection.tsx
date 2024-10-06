import { Id } from "@packages/backend/convex/_generated/dataModel";
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import GoalItem, { GoalProps } from './GoalItem';

interface GoalSectionProps {
  title: string;
  goals: GoalProps['goal'][];
  onComplete?: (id: Id<"goals">) => void;
  onNotAchieved?: (id: Id<"goals">) => void;
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
              onComplete={onComplete ? () => onComplete(goal._id as Id<"goals">) : undefined}
              onNotAchieved={onNotAchieved ? () => onNotAchieved(goal._id as Id<"goals">) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalSection;