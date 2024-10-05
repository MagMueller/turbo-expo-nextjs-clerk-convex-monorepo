import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./goals";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

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
      await ctx.db.patch(existingUser._id, { name, email });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", { userId, name, email });
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
    