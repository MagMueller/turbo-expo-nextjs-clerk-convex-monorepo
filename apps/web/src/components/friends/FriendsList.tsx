"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

const FriendsList = () => {
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const friends = useQuery(api.friends.getFriends);
  const searchUsers = useQuery(api.friends.searchUsers, { query: searchQuery });
  const addFriend = useMutation(api.friends.addFriend);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const inviteUser = useMutation(api.friends.inviteUser);

  const handleAddFriend = async (email: string) => {
    try {
      await addFriend({ friendEmail: email });
      setNewFriendEmail("");
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleInviteUser = async (email: string) => {
    try {
      await inviteUser({ email });
      setNewFriendEmail("");
      setSearchQuery("");
    } catch (error) {
      console.error("Error inviting user:", error);
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
          placeholder="Search users or enter email to invite"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-2 p-2 border rounded w-full"
        />
      </div>

      {searchUsers && searchUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          {searchUsers.map((user) => (
            <div key={user.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2">
              <span>{user.name} ({user.email})</span>
              <button
                onClick={() => handleAddFriend(user.email)}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !searchUsers?.some(user => user.email === searchQuery) && (
        <div className="mb-6">
          <button
            onClick={() => handleInviteUser(searchQuery)}
            className="p-2 bg-green-500 text-white rounded"
          >
            Invite {searchQuery}
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        {friends?.map((friend) => (
          <div key={friend._id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
            <span>{friend.friendId}</span>
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