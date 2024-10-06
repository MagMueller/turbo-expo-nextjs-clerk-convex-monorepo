"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "./DatePicker";
import GoalItem from "./GoalItem";

const Goals: React.FC = () => {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalVerifier, setNewGoalVerifier] = useState("");
  const [newGoalBudget, setNewGoalBudget] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allGoals = useQuery(api.goals.getGoals);
  const createGoal = useMutation(api.goals.createGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const completeGoal = useMutation(api.goals.completeGoal);
  const friends = useQuery(api.friends.getFriends);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCreateGoal = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newGoalTitle.trim()) {
      await createGoal({
        title: newGoalTitle,
        content: "",
        isSummary: false,
        deadline: newGoalDeadline || undefined,
        verifierId: newGoalVerifier || undefined,
        budget: newGoalBudget,
      });
      setNewGoalTitle("");
      setNewGoalDeadline("");
      setNewGoalVerifier("");
      setNewGoalBudget(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      <div className="flex-grow overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Goals</h1>
          <div className="mb-6 flex items-center space-x-2 bg-white p-4 rounded-lg shadow">
            <input
              ref={inputRef}
              type="text"
              placeholder="New goal title..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyPress={handleCreateGoal}
              className="flex-grow p-2 border rounded"
            />
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set Deadline
              </button>
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-2 right-0">
                  <DatePicker
                    value={newGoalDeadline}
                    onChange={(date) => {
                      setNewGoalDeadline(date);
                      setIsDatePickerOpen(false);
                    }}
                    onClose={() => setIsDatePickerOpen(false)}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsVerifierSelectOpen(!isVerifierSelectOpen)}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Set Verifier
              </button>
              {isVerifierSelectOpen && (
                <div className="absolute z-10 mt-2 right-0 bg-white border rounded shadow-lg p-4">
                  <ul className="max-h-40 overflow-y-auto">
                    {friends?.map((friend) => (
                      <li
                        key={friend.friendId}
                        onClick={() => {
                          setNewGoalVerifier(friend.friendId);
                          setIsVerifierSelectOpen(false);
                        }}
                        className="cursor-pointer hover:bg-gray-100 p-2"
                      >
                        {friend.friendName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="Budget"
              value={newGoalBudget}
              onChange={(e) => setNewGoalBudget(Number(e.target.value))}
              className="p-2 border rounded w-24"
            />
          </div>
          <div className="space-y-4 mt-6">
            {allGoals?.map((goal) => (
              <GoalItem
                key={goal._id}
                goal={goal}
                onUpdate={updateGoal}
                onDelete={() => deleteGoal({ goalId: goal._id })}
                onComplete={() => completeGoal({ id: goal._id })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;