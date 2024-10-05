import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./goals";

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const friends = await ctx.db
      .query("friends")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("friendId"), userId)
        )
      )
      .collect();

    const friendsWithDetails = await Promise.all(
      friends.map(async (friend) => {
        const isSender = friend.userId === userId;
        const friendId = isSender ? friend.friendId : friend.userId;
        const friendUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), friendId))
          .first();
        return { 
          ...friend, 
          friendId,
          friendName: friendUser?.name || "Unknown",
          friendEmail: friend.status === "accepted" ? friendUser?.email : null,
          isSender
        };
      })
    );

    return friendsWithDetails;
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const currentUserId = await getUserId(ctx);
    if (!currentUserId) return [];

    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("userId"), currentUserId))
      .collect();

    const friends = await ctx.db
      .query("friends")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId"), currentUserId),
          q.eq(q.field("friendId"), currentUserId)
        )
      )
      .collect();

    const friendIds = new Set(friends.map(f => f.userId === currentUserId ? f.friendId : f.userId));

    const filteredUsers = allUsers.filter(user => !friendIds.has(user.userId));

    if (query.trim() === "") {
      return filteredUsers;
    }

    return filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
  },
});

export const addFriend = mutation({
  args: { friendId: v.string() },
  handler: async (ctx, { friendId }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    await ctx.db.insert("friends", {
      userId,
      friendId,
      status: "pending",
    });
  },
});

export const acceptFriendRequest = mutation({
  args: { friendId: v.string() },
  handler: async (ctx, { friendId }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const friendRequest = await ctx.db
      .query("friends")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), friendId),
          q.eq(q.field("friendId"), userId)
        )
      )
      .first();

    if (!friendRequest) throw new Error("Friend request not found");

    await ctx.db.patch(friendRequest._id, { status: "accepted" });
  },
});

export const inviteUser = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const inviterId = await getUserId(ctx);
    if (!inviterId) throw new Error("User not found");

    await ctx.db.insert("invitations", {
      inviterId,
      inviteeEmail: email,
      status: "pending",
    });

    // Here you would typically send an email invitation
    // For now, we'll just log it
    console.log(`Invitation sent to ${email}`);
  },
});

export const createOrUpdateUser = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, { name, email }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { name, email });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", { userId, name, email });
    return newUserId;
  },
});

export const rejectFriendRequest = mutation({
  args: { friendId: v.string() },
  handler: async (ctx, { friendId }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    await ctx.db
      .query("friends")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), friendId),
          q.eq(q.field("friendId"), userId)
        )
      )
      .delete();
  },
});