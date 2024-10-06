"use client";

import GoalItem from "@/components/goals/GoalItem";
import Header from "@/components/Header";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React from 'react';

const VerifierTasks: React.FC = () => {
  const goalsToVerify = useQuery(api.goals.getGoalsToVerify) || [];
  const verifyGoal = useMutation(api.goals.verifyGoal);

  const handleVerify = async (goalId: string, status: "passed" | "failed") => {
    await verifyGoal({ goalId, status });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Goals to Verify</h1>
        <div className="space-y-4">
          {goalsToVerify.map((goal) => (
            <div key={goal._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">Goal from: {goal.userName}</h2>
              <GoalItem
                goal={goal}
                onComplete={() => handleVerify(goal._id, "passed")}
                onNotAchieved={() => handleVerify(goal._id, "failed")}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VerifierTasks;