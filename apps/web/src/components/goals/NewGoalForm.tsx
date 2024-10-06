import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from 'react';
import { FaCalendarAlt, FaUserCheck } from 'react-icons/fa';
import DatePicker from "./DatePicker";

interface NewGoalFormProps {
  onClose: () => void;
}

const NewGoalForm: React.FC<NewGoalFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [verifierId, setVerifierId] = useState("");
  const [budget, setBudget] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);

  const createGoal = useMutation(api.goals.createGoal);
  const friends = useQuery(api.friends.getFriends);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal({
      title,
      content,
      deadline: deadline || undefined,
      verifierId: verifierId || undefined,
      budget,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="mt-2 text-left">
            <input
              type="text"
              placeholder="Goal Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 p-2 w-full border rounded"
              required
            />
            <textarea
              placeholder="Goal Description"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 p-2 w-full border rounded"
            />
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FaCalendarAlt className="inline mr-2" />
                Set Deadline
              </button>
              <button
                type="button"
                onClick={() => setIsVerifierSelectOpen(!isVerifierSelectOpen)}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <FaUserCheck className="inline mr-2" />
                Set Verifier
              </button>
            </div>
            {isDatePickerOpen && (
              <DatePicker
                value={deadline}
                onChange={(date) => {
                  setDeadline(date);
                  setIsDatePickerOpen(false);
                }}
                onClose={() => setIsDatePickerOpen(false)}
              />
            )}
            {isVerifierSelectOpen && (
              <select
                value={verifierId}
                onChange={(e) => setVerifierId(e.target.value)}
                className="mt-2 p-2 w-full border rounded"
              >
                <option value="">Select a verifier</option>
                {friends?.map((friend) => (
                  <option key={friend.friendId} value={friend.friendId}>
                    {friend.friendName}
                  </option>
                ))}
              </select>
            )}
            <input
              type="number"
              placeholder="Budget"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 p-2 w-full border rounded"
            />
            <div className="items-center px-4 py-3">
              <button
                id="ok-btn"
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewGoalForm;