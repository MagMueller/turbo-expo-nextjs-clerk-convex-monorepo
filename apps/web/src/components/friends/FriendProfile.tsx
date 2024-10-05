"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

const FriendProfile = () => {
  const params = useParams();
  const friendId = params.friendId as string;

  const friend = useQuery(api.users.getUser, { userId: friendId });
  const friendGoals = useQuery(api.goals.getFriendGoals, { friendId });

  if (!friend) return <div>Loading...</div>;

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4 sm:mb-10">
        {friend.name}'s Profile
      </h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">{friend.name}'s Goals</h2>
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