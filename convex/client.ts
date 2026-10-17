import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { anyApi } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { contentBlocksValidator } from "./contentBlocks";
import { isLetterReleased } from "./letterRelease";

const internal: any = anyApi;

const ownerKeyValidator = v.string();
const mood = v.optional(v.union(
  v.literal("smile"), v.literal("sun"), v.literal("cloud"), v.literal("moon"), v.literal("flame"),
));
const moodName = v.optional(v.union(
  v.literal("CALM"), v.literal("WARM"), v.literal("CLOUDY"), v.literal("QUIET"), v.literal("ALIVE"),
));

const getIdentity = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in to sync your DearMe data.");
  return identity;
};

const findOwner = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db.query("profiles")
    .withIndex("by_ownerKey", (q) => q.eq("ownerKey", identity.subject))
    .unique();
};

const ensureOwner = async (ctx: MutationCtx) => {
  const identity = await getIdentity(ctx);
  const existing = await findOwner(ctx);
  if (existing) return existing._id;
  return await ctx.db.insert("profiles", {
    ownerKey: identity.subject,
    createdAt: Date.now(),
    source: "local",
  });
};

export const ensureProfile = mutation({
  args: { ownerKey: ownerKeyValidator },
  returns: v.id("profiles"),
  handler: async (ctx) => await ensureOwner(ctx),
});

export const listJournalEntries = query({
  args: { ownerKey: ownerKeyValidator, paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(schema.doc("journalEntries")),
  handler: async (ctx, { paginationOpts }) => {
    const owner = await findOwner(ctx);
    if (!owner) return { page: [], isDone: true, continueCursor: "" };
    return await ctx.runQuery(internal.journal.listJournalEntries, {
      ownerId: owner._id,
      paginationOpts,
    });
  },
});

export const saveJournalEntry = mutation({
  args: {
    ownerKey: ownerKeyValidator,
    localKey: v.string(),
    title: v.string(),
    date: v.number(),
    mood,
    moodName,
    moodColor: v.optional(v.string()),
    content: v.string(),
    contentBlocks: contentBlocksValidator,
  },
  returns: v.id("journalEntries"),
  handler: async (ctx, args) => {
    if (!args.localKey) throw new Error("A local record key is required.");
    const ownerId = await ensureOwner(ctx);
    const existing = await ctx.db.query("journalEntries")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.localKey))
      .unique();
    const fields = {
      title: args.title,
      date: args.date,
      mood: args.mood,
      moodName: args.moodName,
      moodColor: args.moodColor,
      content: args.content,
      contentBlocks: args.contentBlocks,
    };
    if (existing) {
      await ctx.runMutation(internal.journal.editJournalEntry, {
        ownerId,
        entryId: existing._id,
        updates: fields,
      });
      return existing._id;
    }
    const entryId: Id<"journalEntries"> = await ctx.runMutation(internal.journal.createJournalEntry, { ownerId, ...fields });
    await ctx.db.patch(entryId, { localKey: args.localKey });
    return entryId;
  },
});

export const deleteJournalEntry = mutation({
  args: { ownerKey: ownerKeyValidator, localKey: v.string() },
  returns: v.null(),
  handler: async (ctx, { localKey }) => {
    const owner = await findOwner(ctx);
    if (!owner) return null;
    const entry = await ctx.db.query("journalEntries")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", localKey))
      .unique();
    if (entry) await ctx.runMutation(internal.journal.deleteJournalEntry, { ownerId: owner._id, entryId: entry._id });
    return null;
  },
});

export const saveReflection = mutation({
  args: {
    ownerKey: ownerKeyValidator,
    parentLocalKey: v.string(),
    localKey: v.string(),
    content: v.string(),
    contentBlocks: contentBlocksValidator,
  },
  returns: v.id("reflections"),
  handler: async (ctx, args) => {
    const ownerId = await ensureOwner(ctx);
    const entry = await ctx.db.query("journalEntries")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.parentLocalKey))
      .unique();
    if (!entry) throw new Error("Journal entry not found.");
    const existing = await ctx.db.query("reflections")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.localKey))
      .unique();
    if (existing) {
      await ctx.runMutation(internal.journal.editReflection, {
        ownerId, entryId: entry._id, reflectionId: existing._id,
        updates: { content: args.content, contentBlocks: args.contentBlocks },
      });
      return existing._id;
    }
    const reflectionId: Id<"reflections"> = await ctx.runMutation(internal.journal.createReflection, {
      ownerId, entryId: entry._id, content: args.content, contentBlocks: args.contentBlocks,
    });
    await ctx.db.patch(reflectionId, { localKey: args.localKey });
    return reflectionId;
  },
});

export const listReflections = query({
  args: {
    ownerKey: ownerKeyValidator,
    parentLocalKey: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("reflections")),
  handler: async (ctx, { parentLocalKey, paginationOpts }) => {
    const owner = await findOwner(ctx);
    if (!owner) return { page: [], isDone: true, continueCursor: "" };
    const entry = await ctx.db.query("journalEntries")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", parentLocalKey))
      .unique();
    if (!entry) return { page: [], isDone: true, continueCursor: "" };
    return await ctx.runQuery(internal.journal.listReflections, {
      ownerId: owner._id, entryId: entry._id, paginationOpts,
    });
  },
});

export const deleteReflection = mutation({
  args: { ownerKey: ownerKeyValidator, parentLocalKey: v.string(), localKey: v.string() },
  returns: v.null(),
  handler: async (ctx, { parentLocalKey, localKey }) => {
    const owner = await findOwner(ctx);
    if (!owner) return null;
    const entry = await ctx.db.query("journalEntries")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", parentLocalKey))
      .unique();
    const reflection = await ctx.db.query("reflections")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", localKey))
      .unique();
    if (entry && reflection) await ctx.runMutation(internal.journal.deleteReflection, {
      ownerId: owner._id, entryId: entry._id, reflectionId: reflection._id,
    });
    return null;
  },
});

export const listLetters = query({
  args: { ownerKey: ownerKeyValidator, paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(schema.doc("letters")),
  handler: async (ctx, { paginationOpts }) => {
    const owner = await findOwner(ctx);
    if (!owner) return { page: [], isDone: true, continueCursor: "" };
    return await ctx.runQuery(internal.letters.listLetters, { ownerId: owner._id, paginationOpts });
  },
});

export const saveLetter = mutation({
  args: {
    ownerKey: ownerKeyValidator,
    localKey: v.string(),
    title: v.string(),
    content: v.string(),
    contentBlocks: contentBlocksValidator,
    mood,
    moodName,
    moodColor: v.optional(v.string()),
    writtenDate: v.number(),
    deliveryDate: v.string(),
    deliveryTime: v.optional(v.string()),
    deliveryTimezone: v.string(),
  },
  returns: v.object({ letterId: v.id("letters"), released: v.boolean() }),
  handler: async (ctx, args) => {
    const ownerId = await ensureOwner(ctx);
    const existing = await ctx.db.query("letters")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.localKey))
      .unique();
    const fields = {
      title: args.title, content: args.content, contentBlocks: args.contentBlocks,
      mood: args.mood, moodName: args.moodName, moodColor: args.moodColor,
      writtenDate: args.writtenDate, deliveryDate: args.deliveryDate,
      deliveryTime: args.deliveryTime, deliveryTimezone: args.deliveryTimezone,
    };
    if (existing) {
      await ctx.runMutation(internal.letters.editLetter, {
        ownerId, letterId: existing._id, updates: fields,
      });
      const saved = await ctx.db.get(existing._id);
      return { letterId: existing._id, released: !!saved && isLetterReleased(saved, Date.now()) };
    }
    const letterId: Id<"letters"> = await ctx.runMutation(internal.letters.createLetter, { ownerId, ...fields });
    await ctx.db.patch(letterId, { localKey: args.localKey });
    const saved = await ctx.db.get(letterId);
    return { letterId, released: !!saved && isLetterReleased(saved, Date.now()) };
  },
});

export const deleteLetter = mutation({
  args: { ownerKey: ownerKeyValidator, localKey: v.string() },
  returns: v.null(),
  handler: async (ctx, { localKey }) => {
    const owner = await findOwner(ctx);
    if (!owner) return null;
    const letter = await ctx.db.query("letters")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", localKey))
      .unique();
    if (letter) await ctx.runMutation(internal.letters.deleteLetter, { ownerId: owner._id, letterId: letter._id });
    return null;
  },
});

export const saveReply = mutation({
  args: {
    ownerKey: ownerKeyValidator,
    parentLocalKey: v.string(),
    localKey: v.string(),
    content: v.string(),
    contentBlocks: contentBlocksValidator,
  },
  returns: v.id("replies"),
  handler: async (ctx, args) => {
    const ownerId = await ensureOwner(ctx);
    const letter = await ctx.db.query("letters")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.parentLocalKey))
      .unique();
    if (!letter) throw new Error("Letter not found.");
    const existing = await ctx.db.query("replies")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", ownerId).eq("localKey", args.localKey))
      .unique();
    if (existing) {
      await ctx.runMutation(internal.letters.editReply, {
        ownerId, letterId: letter._id, replyId: existing._id,
        updates: { content: args.content, contentBlocks: args.contentBlocks },
      });
      return existing._id;
    }
    const replyId: Id<"replies"> = await ctx.runMutation(internal.letters.createReply, {
      ownerId, letterId: letter._id, content: args.content, contentBlocks: args.contentBlocks,
    });
    await ctx.db.patch(replyId, { localKey: args.localKey });
    return replyId;
  },
});

export const listReplies = query({
  args: {
    ownerKey: ownerKeyValidator,
    parentLocalKey: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("replies")),
  handler: async (ctx, { parentLocalKey, paginationOpts }) => {
    const owner = await findOwner(ctx);
    if (!owner) return { page: [], isDone: true, continueCursor: "" };
    const letter = await ctx.db.query("letters")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", parentLocalKey))
      .unique();
    if (!letter) return { page: [], isDone: true, continueCursor: "" };
    if (letter.status !== "delivered") {
      return { page: [], isDone: true, continueCursor: "" };
    }
    return await ctx.runQuery(internal.letters.listReplies, {
      ownerId: owner._id, letterId: letter._id, paginationOpts,
    });
  },
});

export const deleteReply = mutation({
  args: { ownerKey: ownerKeyValidator, parentLocalKey: v.string(), localKey: v.string() },
  returns: v.null(),
  handler: async (ctx, { parentLocalKey, localKey }) => {
    const owner = await findOwner(ctx);
    if (!owner) return null;
    const letter = await ctx.db.query("letters")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", parentLocalKey))
      .unique();
    const reply = await ctx.db.query("replies")
      .withIndex("by_ownerId_and_localKey", (q) => q.eq("ownerId", owner._id).eq("localKey", localKey))
      .unique();
    if (letter && reply) await ctx.runMutation(internal.letters.deleteReply, {
      ownerId: owner._id, letterId: letter._id, replyId: reply._id,
    });
    return null;
  },
});
