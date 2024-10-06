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

    // Initialize budget to 10 if not set
    if (user.budget === undefined) {
      await ctx.db.patch(user._id, { budget: 10 });
      user.budget = 10;
    }

    return user;
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
      const updateFields: { name: string; email: string; budget?: number } = { name, email };
      if (!('budget' in existingUser)) {
        updateFields.budget = 10;
      }
      await ctx.db.patch(existingUser._id, updateFields);
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", { 
      userId, 
      name, 
      email, 
      budget: 10, 
      score: 0 
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
      return user;
  },
});
