"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaSort, FaUserCheck, FaWallet } from 'react-icons/fa';
import DatePicker from "./DatePicker";
import GoalItem from "./GoalItem";

type SortField = "title" | "createdAt" | "deadline" | "budget" | "status";

const Goals: React.FC = () => {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalVerifier, setNewGoalVerifier] = useState("");
  const [newGoalBudget, setNewGoalBudget] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [insufficientBudget, setInsufficientBudget] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const budgetInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const allGoals = useQuery(api.goals.getGoals) || [];

  const createGoal = useMutation(api.goals.createGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const completeGoal = useMutation(api.goals.completeGoal);
  const friends = useQuery(api.friends.getFriends);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (allGoals === undefined) {
    return <div>Loading goals...</div>;
  }

  const unfinishedGoals = allGoals.filter(goal => goal.status === "unfinished");
  const finishedGoals = allGoals.filter(goal => goal.status === "completed" || goal.status === "pending");

  console.log("Unfinished goals:", unfinishedGoals);
  console.log("Finished goals:", finishedGoals);

  const handleCreateGoal = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if ((e.type === 'keypress' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'click') {
      if (newGoalTitle.trim()) {
        try {
          await createGoal({
            title: newGoalTitle,
            content: "",
            deadline: newGoalDeadline || undefined,
            verifierId: newGoalVerifier || undefined,
            budget: newGoalBudget,
          });
          setNewGoalTitle("");
          setNewGoalDeadline("");
          setNewGoalVerifier("");
          setNewGoalBudget(0);
          setInsufficientBudget(false);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes("Insufficient budget")) {
            setInsufficientBudget(true);
          }
        }
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const goals = unfinishedGoals;
      const currentIndex = goals.findIndex(goal => goal._id === document.activeElement?.id);
      let newIndex;
      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : goals.length - 1;
      } else {
        newIndex = currentIndex < goals.length - 1 ? currentIndex + 1 : 0;
      }
      const nextGoalId = goals[newIndex]._id;
      document.getElementById(nextGoalId.toString())?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]" onKeyDown={handleKeyDown}>
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
            <input
              ref={budgetInputRef}
              type="number"
              placeholder="Budget"
              value={newGoalBudget}
              onChange={(e) => setNewGoalBudget(Number(e.target.value))}
              onKeyPress={handleCreateGoal}
              className="p-2 border rounded w-24"
            />
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FaCalendarAlt />
              </button>
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-2 left-0">
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
                <FaUserCheck />
              </button>
              {isVerifierSelectOpen && (
                <div className="absolute z-10 mt-2 left-0 bg-white border rounded shadow-lg p-4">
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
            <button
              onClick={handleCreateGoal}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Goal
            </button>
          </div>
          {insufficientBudget && (
            <p className="text-yellow-600 mb-2">Warning: Insufficient budget. Available: {currentUser?.budget}</p>
          )}
          {newGoalDeadline && (
            <p className="text-sm text-gray-600 mb-2">Deadline set: {new Date(newGoalDeadline).toLocaleDateString()}</p>
          )}
          {newGoalVerifier && (
            <p className="text-sm text-gray-600 mb-2">Verifier set: {friends?.find(f => f.friendId === newGoalVerifier)?.friendName}</p>
          )}
          <div className="flex justify-end space-x-2 mb-4">
            <button onClick={() => handleSort("budget")} className="flex items-center">
              <FaWallet className="mr-1" /> Budget <FaSort />
            </button>
            <button onClick={() => handleSort("deadline")} className="flex items-center">
              <FaCalendarAlt className="mr-1" /> Deadline <FaSort />
            </button>
            <button onClick={() => handleSort("createdAt")} className="flex items-center">
              Created At <FaSort />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Unfinished Goals</h2>
          <div className="space-y-4">
            {unfinishedGoals.map((goal) => (
              <GoalItem
                key={goal._id}
                goal={goal}
                onUpdate={updateGoal}
                onDelete={() => deleteGoal({ goalId: goal._id })}
                onComplete={() => completeGoal({ id: goal._id })}
                isCompleted={false}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Finished Goals</h2>
          <div className="space-y-4">
            {finishedGoals.map((goal) => (
              <GoalItem
                key={goal._id}
                goal={goal}
                onUpdate={updateGoal}
                onDelete={() => deleteGoal({ goalId: goal._id })}
                onComplete={() => {}}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;