"use client";

import Header from "@/components/Header";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import React from 'react';

const IncreaseBudget: React.FC = () => {
  const addBudget = useMutation(api.goals.addBudget);

  const handleIncreaseBudget = async () => {
    await addBudget();
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Increase Budget</h1>
        <button
          onClick={handleIncreaseBudget}
          className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 text-lg font-semibold"
        >
          Add 10 to Budget (Pay Next Week)
        </button>
      </div>
    </>
  );
};

export default IncreaseBudget;