import { Auth } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all goals for a specific user
export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const goals = await ctx.db
      .query("goals")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return goals;
  },
});

// Get goal for a specific goal
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

// Create a new goal for a user
export const createGoal = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    isSummary: v.boolean(),
    deadline: v.optional(v.string()),
    verifierId: v.optional(v.string()),
    budget: v.number(),
  },
  handler: async (ctx, { title, content, isSummary, deadline, verifierId, budget }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    
    if (!user || (budget > 0 && user.budget < budget)) {
      throw new Error("Not enough budget");
    }

    // Deduct budget from user only if budget is greater than 0
    if (budget > 0) {
      await ctx.db.patch(user._id, { budget: user.budget - budget });
    }

    const goalId = await ctx.db.insert("goals", { 
      userId, 
      title, 
      content, 
      deadline,
      verifierId,
      status: "unfinished",
      budget
    });

    if (isSummary) {
      await ctx.scheduler.runAfter(0, internal.openai.summary, {
        id: goalId,
        title,
        content,
      });
    }

    return goalId;
  },
});

export const deleteGoal = mutation({
  args: {
    goalId: v.id("goals"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.goalId);
  },
});

export const updateGoal = mutation({
  args: { 
    id: v.id("goals"), 
    deadline: v.optional(v.string()),
    budget: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { id, deadline, budget } = args;
    const goal = await ctx.db.get(id);
    if (!goal) throw new Error("Goal not found");

    const updateFields: { deadline?: string; budget?: number } = {};
    if (deadline !== undefined) updateFields.deadline = deadline;
    if (budget !== undefined && budget > (goal.budget || 0)) {
      updateFields.budget = budget;
      
      // Deduct additional budget from user
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), goal.userId))
        .first();
      
      if (!user || user.budget < (budget - (goal.budget || 0))) {
        throw new Error("Not enough budget");
      }

      await ctx.db.patch(user._id, { budget: user.budget - (budget - (goal.budget || 0)) });
    }
    await ctx.db.patch(id, updateFields);
  },
});

// Add these new mutations and queries

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

    const newStatus = goal.verifierId ? "pending" : "completed";
    await ctx.db.patch(id, { status: newStatus });

    if (newStatus === "completed") {
      await ctx.db.patch(user._id, { 
        budget: user.budget + goal.budget,
        score: user.score + goal.budget
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
      await ctx.db.patch(user._id, { 
        budget: user.budget + goal.budget,
        score: user.score + goal.budget
      });
    } else {
      await ctx.db.patch(goalId, { status: "unfinished" });
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