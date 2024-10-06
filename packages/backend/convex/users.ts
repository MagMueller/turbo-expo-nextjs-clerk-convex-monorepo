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

    // Ensure budget and score are always returned
    return {
      ...user,
      budget: user.budget ?? 100,
      score: user.score ?? 0,
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
      const updatedUser = await ctx.db.patch(existingUser._id, {
        name,
        email,
        budget: existingUser.budget ?? 100,
        score: existingUser.score ?? 0,
      });
      return updatedUser._id;
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

export const getUser = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      
      if (user && user.budget === undefined) {
        const updatedUser = await ctx.db.patch(user._id, { budget: 100, score: 0 });
        return updatedUser;
      }
      
      return user;
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
