"use client";

import GoalItem from "@/components/goals/GoalItem";
import Header from "@/components/Header";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect } from 'react';

const VerifierTasks: React.FC = () => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const goalsToVerify = useQuery(api.goals.getGoalsToVerify);
  const verifyGoal = useMutation(api.goals.verifyGoal);

  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("Goals to verify (client):", goalsToVerify);
    console.log("Number of goals to verify (client):", goalsToVerify?.length ?? 0);
  }, [currentUser, goalsToVerify]);

  // Fetch all goal owners' information at once
  const userIds = goalsToVerify?.map(goal => goal.userId) || [];
  const users = useQuery(api.users.getUsers, { userIds: userIds.length > 0 ? userIds : [""] });

  useEffect(() => {
    console.log("Users:", users);
  }, [users]);

  const handleVerify = async (goalId: string, status: "passed" | "failed") => {
    try {
      await verifyGoal({ goalId, status });
      console.log(`Goal ${goalId} verified as ${status}`);
    } catch (error) {
      console.error("Error verifying goal:", error);
    }
  };

  if (goalsToVerify === undefined) {
    return <div>Loading...</div>;
  }

  if (goalsToVerify.length === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Goals to Verify</h1>
          <p>No goals to verify at the moment.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Goals to Verify</h1>
        <div className="space-y-4">
          {goalsToVerify.map((goal) => {
            const goalOwner = users?.[goal.userId];
            return (
              <div key={goal._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Goal from: {goalOwner?.name || 'Loading...'}</h2>
                <GoalItem
                  goal={goal}
                  onComplete={() => handleVerify(goal._id, "passed")}
                  onNotAchieved={() => handleVerify(goal._id, "failed")}
                />
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleVerify(goal._id, "passed")}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleVerify(goal._id, "failed")}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                  >
                    Fail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VerifierTasks;