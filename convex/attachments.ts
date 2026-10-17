import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const recordType = v.union(
  v.literal("journalEntry"),
  v.literal("reflection"),
  v.literal("letter"),
  v.literal("reply"),
);

const attachmentType = v.union(v.literal("image"), v.literal("audio"));

const getOwnerKey = async (ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Sign in to sync attachments.');
  return identity.subject;
};

export const generateUploadUrl = mutation({
  args: { ownerKey: v.string() },
  returns: v.string(),
  handler: async (ctx) => {
    await getOwnerKey(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMetadata = mutation({
  args: {
    ownerKey: v.string(),
    recordType,
    recordKey: v.string(),
    blockId: v.string(),
    storageId: v.id("_storage"),
    type: attachmentType,
    name: v.optional(v.string()),
    position: v.number(),
    reviewed: v.optional(v.boolean()),
  },
  returns: v.id("attachments"),
  handler: async (ctx, args) => {
    const ownerKey = await getOwnerKey(ctx);
    if (!args.recordKey || !args.blockId || !Number.isInteger(args.position) || args.position < 0) {
      throw new Error("Invalid attachment record metadata.");
    }
    const storedFile = await ctx.db.system.get("_storage", args.storageId);
    if (!storedFile) throw new Error("Uploaded file was not found.");

    const existing = await ctx.db
      .query("attachments")
      .withIndex("by_ownerKey_and_storageId", (q) =>
        q.eq("ownerKey", ownerKey).eq("storageId", args.storageId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        recordType: args.recordType,
        recordKey: args.recordKey,
        blockId: args.blockId,
        type: args.type,
        position: args.position,
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.reviewed !== undefined ? { reviewed: args.reviewed } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("attachments", {
      ownerKey,
      recordType: args.recordType,
      recordKey: args.recordKey,
      blockId: args.blockId,
      storageId: args.storageId,
      type: args.type,
      position: args.position,
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.reviewed !== undefined ? { reviewed: args.reviewed } : {}),
      createdAt: Date.now(),
      source: "user",
    });
  },
});

export const getFileUrl = query({
  args: {
    ownerKey: v.string(),
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const ownerKey = await getOwnerKey(ctx);
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_ownerKey_and_storageId", (q) =>
        q.eq("ownerKey", ownerKey).eq("storageId", args.storageId),
      )
      .unique();
    if (!attachment) return null;

    if (attachment.recordType === "letter" || attachment.recordType === "reply") {
      const owner = await ctx.db
        .query("profiles")
          .withIndex("by_ownerKey", (q) => q.eq("ownerKey", ownerKey))
        .unique();
      if (!owner) return null;

      const letter = attachment.recordType === "letter"
        ? await ctx.db
            .query("letters")
            .withIndex("by_ownerId_and_localKey", (q) =>
              q.eq("ownerId", owner._id).eq("localKey", attachment.recordKey),
            )
            .unique()
        : await (async () => {
            const reply = await ctx.db
              .query("replies")
              .withIndex("by_ownerId_and_localKey", (q) =>
                q.eq("ownerId", owner._id).eq("localKey", attachment.recordKey),
              )
              .unique();
            return reply ? await ctx.db.get(reply.letterId) : null;
          })();

      if (!letter || letter.status !== "delivered") return null;
    }
    return await ctx.storage.getUrl(args.storageId);
  },
});
