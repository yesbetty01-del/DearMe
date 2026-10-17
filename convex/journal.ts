import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  contentBlocksValidator,
  deleteStoredContentBlocks,
  validateContentBlockPositions,
} from "./contentBlocks";
import schema from "./schema";

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

const journalContentArgs = {
  content: v.string(),
  contentBlocks: contentBlocksValidator,
};

const getOwnedEntry = async (
  ctx: QueryCtx | MutationCtx,
  entryId: Id<"journalEntries">,
  ownerId: Id<"profiles">,
) => {
  const entry = await ctx.db.get(entryId);
  if (!entry || entry.ownerId !== ownerId || entry.source !== "user") {
    return null;
  }
  return entry;
};

export const createJournalEntry = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    title: v.string(),
    date: v.optional(v.number()),
    mood: v.optional(mood),
    moodName: v.optional(moodName),
    moodColor: v.optional(v.string()),
    ...journalContentArgs,
  },
  returns: v.id("journalEntries"),
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) throw new Error("Profile not found.");
    validateContentBlockPositions(args.contentBlocks);
    const now = Date.now();
    return await ctx.db.insert("journalEntries", {
      ownerId: args.ownerId,
      source: "user",
      title: args.title,
      date: args.date ?? now,
      mood: args.mood,
      moodName: args.moodName,
      moodColor: args.moodColor,
      content: args.content,
      contentBlocks: args.contentBlocks,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listJournalEntries = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("journalEntries")),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("journalEntries")
      .withIndex("by_ownerId_and_date", (q) =>
        q.eq("ownerId", args.ownerId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const readJournalEntry = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
  },
  returns: v.union(schema.doc("journalEntries"), v.null()),
  handler: async (ctx, args) => {
    return await getOwnedEntry(ctx, args.entryId, args.ownerId);
  },
});

export const editJournalEntry = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
    updates: v.object({
      title: v.optional(v.string()),
      date: v.optional(v.number()),
      mood: v.optional(mood),
      moodName: v.optional(moodName),
      moodColor: v.optional(v.string()),
      content: v.optional(v.string()),
      contentBlocks: v.optional(contentBlocksValidator),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    if (!entry) throw new Error("Journal entry not found.");
    if (args.updates.contentBlocks) {
      validateContentBlockPositions(args.updates.contentBlocks);
    }
    await ctx.db.patch(args.entryId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteJournalEntry = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    if (!entry) throw new Error("Journal entry not found.");

    for await (const reflection of ctx.db
      .query("reflections")
      .withIndex("by_entryId", (q) => q.eq("entryId", args.entryId))) {
      await deleteStoredContentBlocks(ctx, reflection.contentBlocks);
      for await (const attachment of ctx.db
        .query("attachments")
        .withIndex("by_parentType_and_parentId", (q) =>
          q.eq("parentType", "reflection").eq("parentId", reflection._id),
        )) {
        if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
        await ctx.db.delete(attachment._id);
      }
      await ctx.db.delete(reflection._id);
    }

    await deleteStoredContentBlocks(ctx, entry.contentBlocks);
    for await (const attachment of ctx.db
      .query("attachments")
      .withIndex("by_parentType_and_parentId", (q) =>
        q.eq("parentType", "journalEntry").eq("parentId", args.entryId),
      )) {
      if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
      await ctx.db.delete(attachment._id);
    }

    await ctx.db.delete(args.entryId);
    return null;
  },
});

export const createReflection = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
    ...journalContentArgs,
  },
  returns: v.id("reflections"),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    if (!entry) throw new Error("Journal entry not found.");
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) throw new Error("Profile not found.");
    validateContentBlockPositions(args.contentBlocks);

    const now = Date.now();
    return await ctx.db.insert("reflections", {
      ownerId: args.ownerId,
      entryId: args.entryId,
      source: "user",
      content: args.content,
      contentBlocks: args.contentBlocks,
      writtenDate: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listReflections = internalQuery({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("reflections")),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    if (!entry) throw new Error("Journal entry not found.");
    return await ctx.db
      .query("reflections")
      .withIndex("by_ownerId_and_entryId_and_writtenDate", (q) =>
        q.eq("ownerId", args.ownerId).eq("entryId", args.entryId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const editReflection = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
    reflectionId: v.id("reflections"),
    updates: v.object({
      content: v.optional(v.string()),
      contentBlocks: v.optional(contentBlocksValidator),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    const reflection = await ctx.db.get(args.reflectionId);
    if (
      !entry ||
      !reflection ||
      reflection.ownerId !== args.ownerId ||
      reflection.entryId !== args.entryId ||
      reflection.source !== "user"
    ) {
      throw new Error("Reflection not found.");
    }
    if (args.updates.contentBlocks) {
      validateContentBlockPositions(args.updates.contentBlocks);
    }
    await ctx.db.patch(args.reflectionId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteReflection = internalMutation({
  args: {
    ownerId: v.id("profiles"),
    entryId: v.id("journalEntries"),
    reflectionId: v.id("reflections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await getOwnedEntry(ctx, args.entryId, args.ownerId);
    const reflection = await ctx.db.get(args.reflectionId);
    if (
      !entry ||
      !reflection ||
      reflection.ownerId !== args.ownerId ||
      reflection.entryId !== args.entryId ||
      reflection.source !== "user"
    ) {
      throw new Error("Reflection not found.");
    }

    for await (const attachment of ctx.db
      .query("attachments")
      .withIndex("by_parentType_and_parentId", (q) =>
        q.eq("parentType", "reflection").eq("parentId", args.reflectionId),
      )) {
      if (attachment.storageId) await ctx.storage.delete(attachment.storageId);
      await ctx.db.delete(attachment._id);
    }
    await deleteStoredContentBlocks(ctx, reflection.contentBlocks);
    await ctx.db.delete(args.reflectionId);
    return null;
  },
});
