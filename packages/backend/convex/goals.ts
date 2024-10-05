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
  },
  handler: async (ctx, { title, content, isSummary, deadline }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    const goalId = await ctx.db.insert("goals", { userId, title, content, deadline });

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
  args: { id: v.id("goals"), deadline: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { id, deadline } = args;
    await ctx.db.patch(id, { deadline });
  },
});
