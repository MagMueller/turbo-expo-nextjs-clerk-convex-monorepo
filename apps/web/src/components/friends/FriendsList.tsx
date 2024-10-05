"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";

const FriendsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const friends = useQuery(api.friends.getFriends);
  const searchUsers = useQuery(api.friends.searchUsers, { query: searchQuery });
  const addFriend = useMutation(api.friends.addFriend);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend({ friendId });
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4 sm:mb-10">
        Your Friends
      </h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-2 p-2 border rounded w-full"
        />
      </div>

      {searchUsers && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          {searchUsers.map((user) => (
            <div key={user.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2">
              <Link href={`/friends/${user.userId}`}>
                <span>{user.name}</span>
              </Link>
              <button
                onClick={() => handleAddFriend(user.userId)}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        {friends?.map((friend) => (
          <div key={friend._id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
            <Link href={`/friends/${friend.friendId}`}>
              <span>{friend.friendName}</span>
            </Link>
            {friend.status === "pending" && (
              <button
                onClick={() => acceptFriendRequest({ friendId: friend.friendId })}
                className="p-2 bg-green-500 text-white rounded"
              >
                Accept Request
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;