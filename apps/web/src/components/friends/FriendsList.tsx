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
  const rejectFriendRequest = useMutation(api.friends.rejectFriendRequest);
  
  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend({ friendId });
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await acceptFriendRequest({ friendId });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      await rejectFriendRequest({ friendId });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
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

      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        {friends?.map((friend) => (
          <div key={friend._id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
            <Link href={`/friends/${friend.friendId}`}>
              <span>{friend.friendName}</span>
            </Link>
            {friend.status === "accepted" && <span>{friend.friendEmail}</span>}
            {friend.status === "pending" && friend.isSender && (
              <span className="text-yellow-500">Pending</span>
            )}
            {friend.status === "pending" && !friend.isSender && (
              <div>
                <button
                  onClick={() => handleAcceptRequest(friend.friendId)}
                  className="p-2 bg-green-500 text-white rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(friend.friendId)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {searchUsers && searchUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Other Users</h2>
          {searchUsers.map((user) => (
            <div key={user.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2">
              <span>{user.name}</span>
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
    </div>
  );
};

export default FriendsList;