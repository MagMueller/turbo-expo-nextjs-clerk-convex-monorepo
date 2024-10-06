import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./goals";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Ensure budget and score are always returned as numbers
    return {
      ...user,
      budget: typeof user.budget === 'number' ? user.budget : 100,
      score: typeof user.score === 'number' ? user.score : 0,
    };
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
      const updateFields: { name: string; email: string; budget?: number; score?: number } = { name, email };
      if (!('budget' in existingUser)) {
        updateFields.budget = 100;
      }
      if (!('score' in existingUser)) {
        updateFields.score = 0;
      }
      await ctx.db.patch(existingUser._id, updateFields);
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      userId,
      name,
      email,
      budget: 100,
      score: 0,
    });
    return newUserId;
  },
});

// Query function for reading user data
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    
    return user;
  },
});

// Mutation function for updating user with default values
export const ensureUserDefaults = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    
    if (user) {
      if (user.budget === undefined || user.score === undefined) {
        const updatedUser = await ctx.db.patch(user._id, {
          budget: user.budget ?? 100,
          score: user.score ?? 0,
        });
        return updatedUser;
      }
      return user;
    }
    return null;
  },
});

export const updateAllUsersWithDefaultValues = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (user.budget === undefined || user.score === undefined) {
        await ctx.db.patch(user._id, {
          budget: user.budget ?? 100,
          score: user.score ?? 0,
        });
      }
    }
  },
});

export const forceSetAllUsersWithDefaultValues = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.patch(user._id, {
        budget: typeof user.budget === 'number' ? user.budget : 100,
        score: typeof user.score === 'number' ? user.score : 0,
      });
    }
  },
});

export const getUsers = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, { userIds }) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => 
        userIds.reduce((acc, userId) => 
          q.or(acc, q.eq(q.field("userId"), userId)), 
          q.eq(q.field("userId"), "") // Initial false condition
        )
      )
      .collect();

    // Convert array to object with userId as key
    return Object.fromEntries(users.map(user => [user.userId, user]));
  },
});
