"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from 'react';
import CreateGoal from "./CreateGoal";
import GoalItem from "./GoalItem";

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
  const allGoals = useQuery(api.goals.getGoals);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const updateGoal = useMutation(api.goals.updateGoal);

  const finalGoals = search && allGoals
    ? allGoals.filter(goal =>
        goal.title.toLowerCase().includes(search.toLowerCase()) ||
        goal.content.toLowerCase().includes(search.toLowerCase())
      )
    : allGoals;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Goals</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <CreateGoal />
      <div className="space-y-6 mt-6">
        {finalGoals?.map((goal) => (
          <GoalItem
            key={goal._id}
            goal={goal}
            onUpdate={(updatedGoal) => updateGoal(updatedGoal)}
            onDelete={() => deleteGoal({ goalId: goal._id })}
          />
        ))}
      </div>
    </div>
  );
};

export default Goals;