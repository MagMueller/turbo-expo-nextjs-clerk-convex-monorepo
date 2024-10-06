"use client";

import ScoreBudgetDisplay from "@/components/common/ScoreBudgetDisplay";
import Header from "@/components/Header";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from 'react';

const FriendProfile: React.FC = () => {
  const params = useParams();
  const friendId = params.friendId as string;

  const friend = useQuery(api.users.getUser, { userId: friendId });

  if (!friend) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{friend.name}'s Profile</h1>
          <ScoreBudgetDisplay 
            score={friend.score ?? 0} 
            budget={friend.budget ?? 0} 
            darkMode={false} 
          />
        </div>
      </div>
    </>
  );
};

export default FriendProfile;