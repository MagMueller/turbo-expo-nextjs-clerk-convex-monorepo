"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaSort, FaTimes, FaUserCheck } from 'react-icons/fa';
import DatePicker from "./DatePicker";
import GoalSection from "./GoalSection";
import SortButton from "./SortButton";

type SortField = "title" | "createdAt" | "deadline" | "budget" | "status";

const Goals: React.FC = () => {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalVerifier, setNewGoalVerifier] = useState("");
  const [newGoalBudget, setNewGoalBudget] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [insufficientBudget, setInsufficientBudget] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const inputRef = useRef<HTMLInputElement>(null);
  const budgetInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const verifierSelectRef = useRef<HTMLDivElement>(null);

  const allGoals = useQuery(api.goals.getGoals) || [];
  const createGoal = useMutation(api.goals.createGoal);
  const completeGoal = useMutation(api.goals.completeGoal);
  const setGoalNotAchieved = useMutation(api.goals.setGoalNotAchieved);
  const addBudget = useMutation(api.goals.addBudget);
  const friends = useQuery(api.friends.getFriends);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (verifierSelectRef.current && !verifierSelectRef.current.contains(event.target as Node)) {
        setIsVerifierSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (allGoals === undefined) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  const sortedGoals = [...allGoals].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    } else if (sortBy === "createdAt") {
      return sortOrder === "asc" ? a._creationTime - b._creationTime : b._creationTime - a._creationTime;
    } else if (sortBy === "deadline") {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return sortOrder === "asc" ? aDeadline - bDeadline : bDeadline - aDeadline;
    } else if (sortBy === "budget") {
      return sortOrder === "asc" ? (a.budget || 0) - (b.budget || 0) : (b.budget || 0) - (a.budget || 0);
    }
    return 0;
  });

  const unfinishedGoals = sortedGoals.filter(goal => goal.status === "unfinished");
  const pendingGoals = sortedGoals.filter(goal => goal.status === "pending");
  const achievedGoals = sortedGoals.filter(goal => goal.status === "completed");
  const notAchievedGoals = sortedGoals.filter(goal => goal.status === "failed");

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

  const handleAddBudget = async () => {
    await addBudget();
  };

  const handleCompleteGoal = (goalId: string) => {
    completeGoal({ id: goalId });
  };

  const handleNotAchievedGoal = (goalId: string) => {
    setGoalNotAchieved({ id: goalId });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'd. MMM yyyy');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Goals</h1>
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="New goal - create with enter"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyPress={handleCreateGoal}
            className="flex-grow p-2 border rounded text-lg"
          />
          <input
            ref={budgetInputRef}
            type="number"
            placeholder="Budget"
            value={newGoalBudget}
            onChange={(e) => setNewGoalBudget(Number(e.target.value))}
            onKeyPress={handleCreateGoal}
            className="p-2 border rounded w-20 text-lg"
          />
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="p-3 bg-gray-500 text-white rounded hover:bg-gray-800 text-lg"
            >
              <FaCalendarAlt className="text-xl" />
            </button>
            {isDatePickerOpen && (
              <div ref={datePickerRef} className="absolute z-10 right-0 mt-1">
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
              className="p-3 bg-pink-400 text-white rounded hover:bg-pink-800 text-lg"
            >
              <FaUserCheck className="text-xl" />
            </button>
            {isVerifierSelectOpen && (
              <div ref={verifierSelectRef} className="absolute z-10 right-0 mt-1 bg-white border rounded shadow-lg p-4">
                <ul className="max-h-40 overflow-y-auto">
                  {friends?.map((friend) => (
                    <li
                      key={friend.friendId}
                      onClick={() => {
                        setNewGoalVerifier(friend.friendId);
                        setIsVerifierSelectOpen(false);
                      }}
                      className="cursor-pointer hover:bg-gray-100 p-2 text-lg"
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
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-lg"
          >
            Create Goal
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {newGoalDeadline && (
            <div className="flex items-center bg-gray-100 p-2 rounded">
              <span className="text-sm text-gray-600 mr-2">Deadline: {formatDate(newGoalDeadline)}</span>
              <button onClick={() => setNewGoalDeadline("")} className="text-red-500 hover:text-red-700">
                <FaTimes />
              </button>
            </div>
          )}
          {newGoalVerifier && (
            <div className="flex items-center bg-gray-100 p-2 rounded">
              <span className="text-sm text-gray-600 mr-2">
                Verifier: {friends?.find(f => f.friendId === newGoalVerifier)?.friendName}
              </span>
              <button onClick={() => setNewGoalVerifier("")} className="text-red-500 hover:text-red-700">
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {insufficientBudget && (
        <p className="text-yellow-600 mb-2">Warning: Insufficient budget. Available: {currentUser?.budget}</p>
      )}

      <div className="flex justify-end space-x-2 mb-4">
        <SortButton field="budget" currentSort={sortBy} onSort={handleSort} icon={FaSort} />
        <SortButton field="deadline" currentSort={sortBy} onSort={handleSort} icon={FaSort} />
        <SortButton field="createdAt" currentSort={sortBy} onSort={handleSort} icon={FaSort} />
        <SortButton field="title" currentSort={sortBy} onSort={handleSort} icon={FaSort} />
      </div>
      
      <GoalSection 
        title="Active" 
        goals={unfinishedGoals} 
        onComplete={handleCompleteGoal} 
        onNotAchieved={handleNotAchievedGoal} 
      />
      <GoalSection 
        title="Pending" 
        goals={pendingGoals} 
        onComplete={handleCompleteGoal} 
        onNotAchieved={handleNotAchievedGoal} 
      />
      <GoalSection title="Achieved" goals={achievedGoals} />
      <GoalSection title="Failed" goals={notAchievedGoals} />

      {currentUser && currentUser.budget < 20 && (
        <button
          onClick={handleAddBudget}
          className="mt-8 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 text-lg font-semibold w-full"
        >
          Add 10 Budget (Pay Next Week)
        </button>
      )}
    </div>
  );
};

export default Goals;