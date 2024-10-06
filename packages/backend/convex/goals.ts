import { Auth } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

export const getGoals = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    try {
      const goalsQuery = ctx.db
        .query("goals")
        .filter((q) => q.eq(q.field("userId"), userId));

      const goals = await goalsQuery.collect();
      console.log("Goals fetched from database:", goals);
      return goals;
    } catch (error) {
      console.error("Error fetching goals:", error);
      return [];
    }
  },
});

export const getGoal = query({
  args: {
    id: v.optional(v.id("goals")),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    if (!id) return null;
    const goal = await ctx.db.get(id);
    return goal;
  },
});

export const createGoal = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    deadline: v.optional(v.string()),
    verifierId: v.optional(v.string()),
    budget: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!user) throw new Error("User not found");

    if (user.budget < args.budget) throw new Error("Insufficient budget");

    await ctx.db.patch(user._id, { budget: user.budget - args.budget });

    const newGoal = await ctx.db.insert("goals", {
      ...args,
      userId,
      status: "unfinished", // Ensure this is set correctly
      createdAt: new Date().toISOString(),
    });

    console.log("New goal created:", newGoal);
    return newGoal;
  },
});

export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const { goalId } = args;
    await ctx.db.delete(goalId);
    // Note: We're not increasing the user's budget when deleting a goal
  },
});

export const updateGoal = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    deadline: v.optional(v.string()),
    verifierId: v.optional(v.string()),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const goal = await ctx.db.get(id);
    if (!goal) throw new Error("Goal not found");

    const userId = await getUserId(ctx);
    if (goal.userId !== userId) throw new Error("Not authorized");

    if (updates.budget && updates.budget !== goal.budget) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!user) throw new Error("User not found");

      const budgetDiff = updates.budget - goal.budget;
      if (user.budget < budgetDiff) throw new Error("Insufficient budget");

      await ctx.db.patch(user._id, { budget: user.budget - budgetDiff });
    }

    return await ctx.db.patch(id, updates);
  },
});

export const completeGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const { id } = args;
    const goal = await ctx.db.get(id);
    if (!goal) throw new Error("Goal not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), goal.userId))
      .first();

    if (!user) throw new Error("User not found");

    if (goal.verifierId) {
      // If there's a verifier, set the status to pending
      await ctx.db.patch(id, { status: "pending" });
    } else {
      // If there's no verifier, complete the goal immediately
      await ctx.db.patch(id, { status: "completed" });
      
      // Update user's budget and score
      const budgetIncrease = goal.budget;
      const scoreIncrease = goal.budget; // 1x multiplier when no verifier

      await ctx.db.patch(user._id, { 
        budget: user.budget + budgetIncrease,
        score: user.score + scoreIncrease
      });
    }
  },
});

export const getGoalsToVerify = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const goalsToVerify = await ctx.db
      .query("goals")
      .filter((q) => 
        q.and(
          q.eq(q.field("verifierId"), userId),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    return goalsToVerify;
  },
});

export const verifyGoal = mutation({
  args: { goalId: v.id("goals"), status: v.string() },
  handler: async (ctx, { goalId, status }) => {
    const goal = await ctx.db.get(goalId);
    if (!goal) throw new Error("Goal not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), goal.userId))
      .first();

    if (!user) throw new Error("User not found");

    if (status === "passed") {
      await ctx.db.patch(goalId, { status: "completed" });
      
      // Update user's budget and score
      const budgetIncrease = goal.budget;
      const scoreIncrease = goal.budget * 2; // 2x multiplier when verified

      await ctx.db.patch(user._id, { 
        budget: user.budget + budgetIncrease,
        score: user.score + scoreIncrease
      });
    } else {
      await ctx.db.patch(goalId, { status: "failed" });
      // Handle failed verification (e.g., no budget or score increase)
    }
  },
});

export const getFriendGoals = query({
  args: { friendId: v.string() },
  handler: async (ctx, { friendId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const areFriends = await ctx.db
      .query("friends")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("friendId"), friendId),
          q.eq(q.field("status"), "accepted")
        )
      )
      .first();

    if (!areFriends) return null;

    const goals = await ctx.db
      .query("goals")
      .filter((q) => q.eq(q.field("userId"), friendId))
      .collect();

    return goals;
  },
});

export const updateVerifier = mutation({
  args: { id: v.id("goals"), verifierId: v.string() },
  handler: async (ctx, args) => {
    const { id, verifierId } = args;
    await ctx.db.patch(id, { verifierId });
  },
});

export const setGoalNotAchieved = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const { id } = args;
    const goal = await ctx.db.get(id);
    if (!goal) throw new Error("Goal not found");

    await ctx.db.patch(id, { status: "failed" });
  },
});

export const addBudget = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { budget: user.budget + 10 });
  },
});