import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  contentBlocksValidator,
  deleteStoredContentBlocks,
  validateContentBlockPositions,
} from "./contentBlocks";
import schema from "./schema";
import { getLetterReleaseAt } from "./letterRelease";

const mood = v.union(
  v.literal("smile"),
  v.literal("sun"),
  v.literal("cloud"),
  v.literal("moon"),
  v.literal("flame"),
);

const moodName = v.union(
  v.literal("CALM"),
  v.literal("WARM"),
  v.literal("CLOUDY"),
  v.literal("QUIET"),
  v.literal("ALIVE"),
);

const contentArgs = {
  content: v.string(),
  contentBlocks: contentBlocksValidator,
};

const isValidDeliveryDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const isValidDeliveryTime = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const [, hours, minutes] = match.map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const getOwnedLetter = async (
  ctx: QueryCtx | MutationCtx,
  letterId: Id<"letters">,
  ownerId: Id<"profiles">,
) => {
  const letter = await ctx.db.get(letterId);
  if (!letter || letter.ownerId !== ownerId || letter.source !== "user") {
    return null;
  }
  return letter;
};

const getOwnedReply = async (
  ctx: QueryCtx | MutationCtx,
  replyId: Id<"replies">,
  letterId: Id<"letters">,
  ownerId: Id<"profiles">,
) => {
  const reply = await ctx.db.get(replyId);
  if (
    !reply ||
    reply.letterId !== letterId ||
    reply.ownerId !== ownerId ||
    reply.source !== "user"
  ) {
    return null;
  }
  return reply;
};

export const createLetter = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    title: v.string(),
    ...contentArgs,
    mood: v.optional(mood),
    moodName: v.optional(moodName),
    moodColor: v.optional(v.string()),
    writtenDate: v.optional(v.number()),
    deliveryDate: v.string(),
    deliveryTime: v.optional(v.string()),
    deliveryTimezone: v.optional(v.string()),
  },
  returns: v.id("letters"),
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) throw new Error("Profile not found.");
    if (!isValidDeliveryDate(args.deliveryDate)) {
      throw new Error("Delivery date must be a valid YYYY-MM-DD date.");
    }
    if (args.deliveryTime && !isValidDeliveryTime(args.deliveryTime)) {
      throw new Error("Delivery time must be a valid HH:mm time.");
    }
    validateContentBlockPositions(args.contentBlocks);

    const now = Date.now();
    const deliveryTimezone = args.deliveryTimezone ?? "UTC";
    const releaseAt = getLetterReleaseAt(
      args.deliveryDate,
      args.deliveryTime,
      deliveryTimezone,
    );
    const letterId = await ctx.db.insert("letters", {
      ownerId: args.ownerId,
      source: "user",
      title: args.title,
      content: args.content,
      contentBlocks: args.contentBlocks,
      mood: args.mood,
      moodName: args.moodName,
      moodColor: args.moodColor,
      writtenDate: args.writtenDate ?? now,
      deliveryDate: args.deliveryDate,
      deliveryTime: args.deliveryTime,
      deliveryTimezone,
      releaseAt,
      status: releaseAt <= now ? "delivered" : "scheduled",
      createdAt: now,
      updatedAt: now,
    });
    if (releaseAt > now) {
      const releaseJobId = await ctx.scheduler.runAt(
        releaseAt,
        internal.letters.markDelivered,
        { letterId, expectedReleaseAt: releaseAt },
      );
      await ctx.db.patch(letterId, { releaseJobId });
    }
    return letterId;
  },
});

export const listLetters = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("letters")),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("letters")
      .withIndex("by_ownerId_and_source_and_writtenDate", (q) =>
        q.eq("ownerId", args.ownerId).eq("source", "user"),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...result,
      page: result.page.map((letter) =>
        letter.status === "delivered"
          ? letter
          : { ...letter, title: "", content: "", contentBlocks: [] },
      ),
    };
  },
});

export const readLetter = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
  },
  returns: v.union(schema.doc("letters"), v.null()),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter) return null;
    if (letter.status === "delivered") return letter;
    return { ...letter, title: "", content: "", contentBlocks: [] };
  },
});

export const editLetter = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      contentBlocks: v.optional(contentBlocksValidator),
      mood: v.optional(mood),
      moodName: v.optional(moodName),
      moodColor: v.optional(v.string()),
      writtenDate: v.optional(v.number()),
      deliveryDate: v.optional(v.string()),
      deliveryTime: v.optional(v.string()),
      deliveryTimezone: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter) throw new Error("Letter not found.");
    if (
      args.updates.deliveryDate !== undefined &&
      !isValidDeliveryDate(args.updates.deliveryDate)
    ) {
      throw new Error("Delivery date must be a valid YYYY-MM-DD date.");
    }
    if (
      args.updates.deliveryTime !== undefined &&
      !isValidDeliveryTime(args.updates.deliveryTime)
    ) {
      throw new Error("Delivery time must be a valid HH:mm time.");
    }
    if (
      args.updates.deliveryTimezone !== undefined &&
      args.updates.deliveryTimezone.length > 128
    ) {
      throw new Error("Delivery timezone must be a valid IANA timezone.");
    }
    if (args.updates.contentBlocks) {
      validateContentBlockPositions(args.updates.contentBlocks);
    }

    const scheduleChanged =
      args.updates.deliveryDate !== undefined ||
      args.updates.deliveryTime !== undefined ||
      args.updates.deliveryTimezone !== undefined;
    const nextDate = args.updates.deliveryDate ?? letter.deliveryDate;
    const nextTime = args.updates.deliveryTime ?? letter.deliveryTime;
    const nextTimezone = args.updates.deliveryTimezone ?? letter.deliveryTimezone ?? "UTC";
    const nextReleaseAt = scheduleChanged
      ? getLetterReleaseAt(nextDate, nextTime, nextTimezone)
      : letter.releaseAt;

    if (scheduleChanged && letter.releaseJobId) {
      await ctx.scheduler.cancel(letter.releaseJobId);
    }

    await ctx.db.patch(args.letterId, {
      ...args.updates,
      ...(scheduleChanged
        ? {
            deliveryTimezone: nextTimezone,
            releaseAt: nextReleaseAt,
            releaseJobId: undefined,
            status: nextReleaseAt !== undefined && nextReleaseAt <= Date.now()
              ? "delivered" as const
              : "scheduled" as const,
          }
        : {}),
      updatedAt: Date.now(),
    });

    if (scheduleChanged && nextReleaseAt !== undefined && nextReleaseAt > Date.now()) {
      const releaseJobId = await ctx.scheduler.runAt(
        nextReleaseAt,
        internal.letters.markDelivered,
        { letterId: args.letterId, expectedReleaseAt: nextReleaseAt },
      );
      await ctx.db.patch(args.letterId, { releaseJobId });
    }
    return null;
  },
});

export const markDelivered = internalMutation({
  args: {
    letterId: v.id("letters"),
    expectedReleaseAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { letterId, expectedReleaseAt }) => {
    const letter = await ctx.db.get(letterId);
    if (!letter || letter.releaseAt !== expectedReleaseAt) return null;
    if (Date.now() < expectedReleaseAt) {
      const releaseJobId = await ctx.scheduler.runAt(
        expectedReleaseAt,
        internal.letters.markDelivered,
        { letterId, expectedReleaseAt },
      );
      await ctx.db.patch(letterId, { releaseJobId });
      return null;
    }
    await ctx.db.patch(letterId, {
      status: "delivered",
      releaseJobId: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteLetter = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter) throw new Error("Letter not found.");

    for await (const reply of ctx.db
      .query("replies")
      .withIndex("by_letterId", (q) => q.eq("letterId", args.letterId))) {
      await deleteStoredContentBlocks(ctx, reply.contentBlocks);
      for await (const attachment of ctx.db
        .query("attachments")
        .withIndex("by_parentType_and_parentId", (q) =>
          q.eq("parentType", "reply").eq("parentId", reply._id),
        )) {
        if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
        await ctx.db.delete(attachment._id);
      }
      await ctx.db.delete(reply._id);
    }

    await deleteStoredContentBlocks(ctx, letter.contentBlocks);
    for await (const attachment of ctx.db
      .query("attachments")
      .withIndex("by_parentType_and_parentId", (q) =>
        q.eq("parentType", "letter").eq("parentId", args.letterId),
      )) {
      if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
      await ctx.db.delete(attachment._id);
    }

    await ctx.db.delete(args.letterId);
    return null;
  },
});

export const createReply = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    ...contentArgs,
  },
  returns: v.id("replies"),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter || letter.status !== "delivered") {
      throw new Error("Letter not found or not yet released.");
    }
    validateContentBlockPositions(args.contentBlocks);

    const now = Date.now();
    return await ctx.db.insert("replies", {
      ownerId: args.ownerId,
      letterId: args.letterId,
      source: "user",
      content: args.content,
      contentBlocks: args.contentBlocks,
      writtenDate: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listReplies = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("replies")),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter) throw new Error("Letter not found.");
    if (letter.status !== "delivered") {
      throw new Error("Replies are available after the letter is released.");
    }
    return await ctx.db
      .query("replies")
      .withIndex("by_ownerId_and_source_and_letterId_and_writtenDate", (q) =>
        q
          .eq("ownerId", args.ownerId)
          .eq("source", "user")
          .eq("letterId", args.letterId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const readReply = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    replyId: v.id("replies"),
  },
  returns: v.union(schema.doc("replies"), v.null()),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    if (!letter || letter.status !== "delivered") return null;
    return await getOwnedReply(
      ctx,
      args.replyId,
      args.letterId,
      args.ownerId,
    );
  },
});

export const editReply = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    replyId: v.id("replies"),
    updates: v.object({
      content: v.optional(v.string()),
      contentBlocks: v.optional(contentBlocksValidator),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    const reply = await getOwnedReply(
      ctx,
      args.replyId,
      args.letterId,
      args.ownerId,
    );
    if (!letter || letter.status !== "delivered" || !reply) {
      throw new Error("Reply not found or not yet available.");
    }
    if (args.updates.contentBlocks) {
      validateContentBlockPositions(args.updates.contentBlocks);
    }
    await ctx.db.patch(args.replyId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteReply = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    letterId: v.id("letters"),
    replyId: v.id("replies"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const letter = await getOwnedLetter(ctx, args.letterId, args.ownerId);
    const reply = await getOwnedReply(
      ctx,
      args.replyId,
      args.letterId,
      args.ownerId,
    );
    if (!letter || !reply) throw new Error("Reply not found.");

    for await (const attachment of ctx.db
      .query("attachments")
      .withIndex("by_parentType_and_parentId", (q) =>
        q.eq("parentType", "reply").eq("parentId", args.replyId),
      )) {
      if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
      await ctx.db.delete(attachment._id);
    }
    await deleteStoredContentBlocks(ctx, reply.contentBlocks);
    await ctx.db.delete(args.replyId);
    return null;
  },
});
