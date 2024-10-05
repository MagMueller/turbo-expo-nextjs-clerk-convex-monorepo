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
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return friends;
  },
});

export const addFriend = mutation({
  args: { friendEmail: v.string() },
  handler: async (ctx, { friendEmail }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const friend = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), friendEmail))
      .first();

    if (!friend) throw new Error("Friend not found");

    await ctx.db.insert("friends", {
      userId,
      friendId: friend.userId,
      status: "pending",
    });
  },
});

// Add this mutation
export const updateVerifier = mutation({
  args: { id: v.id("goals"), verifierId: v.string() },
  handler: async (ctx, args) => {
    const { id, verifierId } = args;
    await ctx.db.patch(id, { verifierId });
  },
});
export const acceptFriendRequest = mutation({
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
      .patch({ status: "accepted" });
  },
});

// Add these new mutations and queries

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), query),
          q.eq(q.field("email"), query),
          
        )
      )
      .collect();

    return users;
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