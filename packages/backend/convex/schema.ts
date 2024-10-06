import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    budget: v.number(),
    score: v.number(),
  }).index("by_userId", ["userId"]),

  goals: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    status: v.string(), // "unfinished", "pending", "completed"
    deadline: v.optional(v.string()),
    verifierId: v.optional(v.string()),
    budget: v.number(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  friends: defineTable({
    userId: v.string(),
    friendId: v.string(),
    status: v.string(), // "pending", "accepted"
  }),
  invitations: defineTable({
    inviterId: v.string(),
    inviteeEmail: v.string(),
    status: v.string(), // "pending", "accepted", "rejected"
  }),
});