"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import ComplexToggle from "../home/ComplexToggle";
import DatePicker from "./DatePicker";

interface GoalDetailsProps {
  goalId: Id<"goals">;
}

const GoalDetails = ({ goalId }: GoalDetailsProps) => {
  const [isSummary, setIsSummary] = useState(false);
  const currentGoal = useQuery(api.goals.getGoal, { id: goalId });
  const updateGoal = useMutation(api.goals.updateGoal);

  const handleDeadlineChange = (newDeadline: string) => {
    if (currentGoal) {
      updateGoal({ id: goalId, deadline: newDeadline });
    }
  };

  return (
    <div className="container space-y-6 sm:space-y-9 py-20 px-[26px] sm:px-0">
      <div className="flex justify-center items-center">
        <ComplexToggle isSummary={isSummary} setIsSummary={setIsSummary} />
      </div>
      <h3 className="text-black text-center pb-5 text-xl sm:text-[32px] not-italic font-semibold leading-[90.3%] tracking-[-0.8px]">
        {currentGoal?.title}
      </h3>
      <p className="text-black text-xl sm:text-[28px] not-italic font-normal leading-[130.3%] tracking-[-0.7px]">
        {!isSummary
          ? currentGoal?.content
          : currentGoal?.summary
            ? currentGoal?.summary
            : "No Summary available"}
      </p>
      <div className="flex justify-center items-center space-x-4">
        <p className="text-[#2D2D2D] text-center text-xl not-italic font-extralight leading-[114.3%] tracking-[-0.5px]">
          Deadline:
        </p>
        <DatePicker
          value={currentGoal?.deadline || ""}
          onChange={handleDeadlineChange}
        />
      </div>
      <p className="text-[#2D2D2D] text-center text-xl not-italic font-extralight leading-[114.3%] tracking-[-0.5px]">
        Created on: {new Date(Number(currentGoal?._creationTime)).toLocaleDateString()}
      </p>
    </div>
  );
};

export default GoalDetails;