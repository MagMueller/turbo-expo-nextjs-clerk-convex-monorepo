"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FaCheck, FaTimes } from 'react-icons/fa';

const VerifierTasks = () => {
  const goalsToVerify = useQuery(api.goals.getGoalsToVerify);
  const verifyGoal = useMutation(api.goals.verifyGoal);
  const handleVerify = async (goalId: Id<"goals">, status: "passed" | "failed") => {
    await verifyGoal({ goalId, status });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Goals to Verify</h1>
      <div className="space-y-4">
        {goalsToVerify?.map((goal) => (
          <div key={goal._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{goal.title}</h3>
              <p>Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Not set'}</p>
              <p>Budget: {goal.budget}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleVerify(goal._id, "passed")}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => handleVerify(goal._id, "failed")}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifierTasks;