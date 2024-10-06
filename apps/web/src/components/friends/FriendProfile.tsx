"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import ScoreBudgetDisplay from "../common/ScoreBudgetDisplay";

const FriendProfile = () => {
  const params = useParams();
  const friendId = params.friendId as string;

  const friend = useQuery(api.users.getUser, { userId: friendId });
  const friendGoals = useQuery(api.goals.getFriendGoals, { friendId });
  const friends = useQuery(api.friends.getFriends);

  if (!friend) return <div>Loading...</div>;

  const isFriend = friends?.some(f => f.friendId === friendId && f.status === "accepted");

  if (!isFriend) return <div>You are not friends with this user.</div>;

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4 sm:mb-10">
        {friend.name}'s Profile
      </h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">{friend.name}'s Profile</h2>
        <ScoreBudgetDisplay score={friend.score || 0} budget={friend.budget || 0} darkMode={false} />
        <h3 className="text-lg font-semibold mt-4 mb-2">{friend.name}'s Goals</h3>
        {friendGoals?.map((goal) => (
          <div key={goal._id} className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">{goal.title}</h3>
            <p>{goal.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendProfile;