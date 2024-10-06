"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaWallet } from 'react-icons/fa';
import DatePicker from "./DatePicker";
import GoalItem from "./Goaltem";

export interface GoalProps {
  goal: {
    title: string;
    _id: string;
    _creationTime: number;
    deadline?: string;
  };
  deleteGoal: any;
  updateGoal: (id: string, deadline: string) => void;
}

const Goals: React.FC = () => {
  const [search, setSearch] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const newGoalInputRef = useRef<HTMLInputElement>(null);
  const [newGoalBudget, setNewGoalBudget] = useState<number>(0);

  const allGoals = useQuery(api.goals.getGoals);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const updateVerifier = useMutation(api.goals.updateVerifier);
  const completeGoal = useMutation(api.goals.completeGoal);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (newGoalInputRef.current) {
      newGoalInputRef.current.focus();
    }
  }, []);

  const handleInputBlur = () => {
    setTimeout(() => {
      if (newGoalInputRef.current) {
        newGoalInputRef.current.focus();
      }
    }, 0);
  };

  const handleCreateGoal = async () => {
    if (newGoalTitle.trim() !== '') {
      await createGoal({ 
        title: newGoalTitle, 
        content: '', 
        isSummary: false,
        deadline: newGoalDeadline || undefined,
        budget: newGoalBudget
      });
      setNewGoalTitle('');
      setNewGoalDeadline('');
      setNewGoalBudget(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const budgetInput = document.getElementById('newGoalBudget');
      if (budgetInput) {
        (budgetInput as HTMLInputElement).focus();
      }
    }
  };

  const finalGoals = search && allGoals
    ? allGoals.filter(
        (goal) =>
          goal.title.toLowerCase().includes(search.toLowerCase()) ||
          (goal.content && goal.content.toLowerCase().includes(search.toLowerCase())),
      )
    : allGoals;

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4 sm:mb-10">
        Your Goals
      </h1>
      
      <div className="px-5 sm:px-0 mb-6">
        <div className="bg-white flex items-center h-[39px] sm:h-[55px] rounded border border-solid gap-2 sm:gap-5 border-[rgba(0,0,0,0.40)] px-3 sm:px-11">
          <input
            ref={newGoalInputRef}
            type="text"
            placeholder="Type a new goal and press Enter"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGoal()}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            className="flex-1 text-[#2D2D2D] text-[17px] sm:text-2xl not-italic font-light leading-[114.3%] tracking-[-0.6px] focus:outline-0 focus:ring-0 focus:border-0 border-0"
          />
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <FaCalendarAlt className="mr-2" />
            {newGoalDeadline ? new Date(newGoalDeadline).toLocaleDateString() : "Set Deadline"}
          </button>
          <input
            id="newGoalBudget"
            type="number"
            placeholder="Budget"
            value={newGoalBudget}
            onChange={(e) => setNewGoalBudget(Math.max(0, Math.min(Number(e.target.value), currentUser?.budget || 0)))}
            className="w-20 text-center border-b border-gray-300 focus:outline-none focus:border-blue-500"
            min="0"
            max={currentUser?.budget || 0}
          />
          <FaWallet className="text-green-500" />
          {isDatePickerOpen && (
            <div className="absolute z-10 right-0 mt-2">
              <DatePicker
                value={newGoalDeadline}
                onChange={(value) => {
                  setNewGoalDeadline(value);
                  setIsDatePickerOpen(false);
                }}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </div>
          )}
          <button
            onClick={handleCreateGoal}
            className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="border-[0.5px] mb-20 divide-y-[0.5px] divide-[#00000096] border-[#00000096]">
        {finalGoals &&
          finalGoals.map((goal, index) => (
            <GoalItem key={index} goal={goal} deleteGoal={deleteGoal} updateGoal={(id, deadline) => updateGoal({ id, deadline })} updateVerifier={(id, verifierId) => updateVerifier({ id, verifierId })} completeGoal={(id) => completeGoal({ id })} />
          ))}
      </div>
    </div>
  );
};

export default Goals;