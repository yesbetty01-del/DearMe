import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const contentBlocksValidator = v.array(
  v.union(
    v.object({
      id: v.string(),
      type: v.literal("text"),
      position: v.number(),
      value: v.string(),
    }),
    v.object({
      id: v.string(),
      type: v.literal("image"),
      position: v.number(),
      storageId: v.id("_storage"),
      name: v.optional(v.string()),
    }),
    v.object({
      id: v.string(),
      type: v.literal("audio"),
      position: v.number(),
      storageId: v.id("_storage"),
      name: v.optional(v.string()),
      reviewed: v.optional(v.boolean()),
    }),
  ),
);

export const validateContentBlockPositions = (
  blocks: Array<{ position: number }>,
) => {
  if (blocks.some((block, index) => block.position !== index)) {
    throw new Error("Content block positions must be contiguous and ordered.");
  }
};

export const deleteStoredContentBlocks = async (
  ctx: MutationCtx,
  blocks: Array<{ type: string; storageId?: Id<"_storage"> }>,
) => {
  for (const block of blocks) {
    if ((block.type === "image" || block.type === "audio") && block.storageId) {
      await ctx.storage.delete(block.storageId);
    }
  }
};
