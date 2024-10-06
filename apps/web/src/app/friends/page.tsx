"use client";

import Header from "@/components/Header";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useState } from 'react';
import { FaTrophy, FaUserPlus, FaWallet } from 'react-icons/fa';

const FriendsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const friends = useQuery(api.friends.getFriends) || [];
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
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Friends</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded text-lg"
          />
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
          {friends.map((friend) => (
            <div key={friend._id} className={`bg-white rounded-lg shadow-md p-4 mb-4 transition duration-300 hover:shadow-lg ${friend.status === "accepted" ? "cursor-pointer" : "cursor-default"}`}>
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">{friend.friendName}</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <FaTrophy className="text-yellow-500 mr-1" />
                    <span>{friend.score || 0}</span>
                  </span>
                  <span className="flex items-center">
                    <FaWallet className="text-green-500 mr-1" />
                    <span>{friend.budget || 0}</span>
                  </span>
                  {friend.status === "accepted" && (
                    <Link href={`/friends/${friend.friendId}`}>
                      <span className="text-blue-500 hover:underline">View Profile</span>
                    </Link>
                  )}
                  {friend.status === "pending" && friend.isSender && (
                    <span className="text-yellow-500">Pending</span>
                  )}
                  {friend.status === "pending" && !friend.isSender && (
                    <div>
                      <button
                        onClick={() => handleAcceptRequest(friend.friendId)}
                        className="p-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(friend.friendId)}
                        className="p-2 bg-red-400 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {searchUsers && searchUsers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Other Users</h2>
            {searchUsers.map((user) => (
              <div key={user.userId} className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
                <span className="text-xl font-semibold">{user.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <FaTrophy className="text-yellow-500 mr-1" />
                    <span>{user.score || 0}</span>
                  </span>
                  <span className="flex items-center">
                    <FaWallet className="text-green-500 mr-1" />
                    <span>{user.budget || 0}</span>
                  </span>
                  <button
                    onClick={() => handleAddFriend(user.userId)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  >
                    <FaUserPlus className="mr-2" />
                    Add Friend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FriendsList;