import { query } from "./_generated/server";
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
