import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  goals: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    deadline: v.optional(v.string()),
    verifierId: v.optional(v.string()),
    status: v.optional(v.string()), // "pending", "passed", "failed"
  }),
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  }),
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
