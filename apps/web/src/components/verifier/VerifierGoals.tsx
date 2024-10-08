import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

const VerifierGoals = () => {
  const goals = useQuery(api.goals.getGoalsToVerify);
  const verifyGoal = useMutation(api.goals.verifyGoal);

  const handleVerify = async (goalId: Id<"goals">, status: "passed" | "failed") => {
    await verifyGoal({ goalId, status });
  };

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4 sm:mb-10">
        Goals to Verify
      </h1>
      
      <div className="space-y-4">
        {goals?.map((goal) => (
          <div key={goal._id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
            <span>{goal.title}</span>
            <span>Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Not set'}</span>
            <div>
              <button
                onClick={() => handleVerify(goal._id, "passed")}
                className="mr-2 p-2 bg-green-500 text-white rounded"
              >
                Pass
              </button>
              <button
                onClick={() => handleVerify(goal._id, "failed")}
                className="p-2 bg-red-500 text-white rounded"
              >
                Fail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifierGoals;