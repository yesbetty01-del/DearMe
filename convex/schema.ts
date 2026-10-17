import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

const source = v.union(v.literal("user"), v.literal("fixture"));

const textBlock = v.object({
  id: v.string(),
  type: v.literal("text"),
  position: v.number(),
  value: v.string(),
});

const imageBlock = v.object({
  id: v.string(),
  type: v.literal("image"),
  position: v.number(),
  storageId: v.id("_storage"),
  name: v.optional(v.string()),
});

const audioBlock = v.object({
  id: v.string(),
  type: v.literal("audio"),
  position: v.number(),
  storageId: v.id("_storage"),
  name: v.optional(v.string()),
  reviewed: v.optional(v.boolean()),
});

const contentBlocks = v.array(v.union(textBlock, imageBlock, audioBlock));

// Convex validators enforce these field shapes. Mutations must also enforce
// cross-field rules that validators cannot express: non-empty IDs/URIs,
// integer contiguous block positions, valid YYYY-MM-DD / HH:mm values,
// owner and parent consistency, and content being the ordered text projection.

const contentFields = {
  content: v.string(),
  contentBlocks,
  createdAt: v.number(),
  updatedAt: v.number(),
  // Fixtures omit ownerId; mutations must require it for source === "user".
  ownerId: v.optional(v.id("profiles")),
  source,
};

export default defineSchema({
  profiles: defineTable({
    createdAt: v.number(),
    ownerKey: v.optional(v.string()),
    displayName: v.optional(v.string()),
    source: v.literal("local"),
  })
    .index("by_source", ["source"])
    .index("by_ownerKey", ["ownerKey"]),

  // Settings intentionally stay in device-local storage and are not a Convex
  // table, because a Convex table would sync them to the backend.
  journalEntries: defineTable({
    ...contentFields,
    title: v.string(),
    date: v.number(),
    mood: v.optional(mood),
    moodName: v.optional(moodName),
    moodColor: v.optional(v.string()),
    localKey: v.optional(v.string()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_date", ["ownerId", "date"])
    .index("by_ownerId_and_localKey", ["ownerId", "localKey"]),

  reflections: defineTable({
    ...contentFields,
    entryId: v.id("journalEntries"),
    writtenDate: v.number(),
    localKey: v.optional(v.string()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_entryId", ["entryId"])
    .index("by_ownerId_and_entryId_and_writtenDate", [
      "ownerId",
      "entryId",
      "writtenDate",
    ])
    .index("by_ownerId_and_localKey", ["ownerId", "localKey"]),

  letters: defineTable({
    ...contentFields,
    title: v.string(),
    mood: v.optional(mood),
    moodName: v.optional(moodName),
    moodColor: v.optional(v.string()),
    writtenDate: v.number(),
    deliveryDate: v.string(),
    deliveryTime: v.optional(v.string()),
    deliveryTimezone: v.optional(v.string()),
    releaseAt: v.optional(v.number()),
    releaseJobId: v.optional(v.id("_scheduled_functions")),
    status: v.union(v.literal("scheduled"), v.literal("delivered")),
    localKey: v.optional(v.string()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_writtenDate", ["ownerId", "writtenDate"])
    .index("by_ownerId_and_source_and_writtenDate", [
      "ownerId",
      "source",
      "writtenDate",
    ])
    .index("by_ownerId_and_localKey", ["ownerId", "localKey"])
    .index("by_ownerId_and_deliveryDate", ["ownerId", "deliveryDate"]),

  replies: defineTable({
    ...contentFields,
    letterId: v.id("letters"),
    writtenDate: v.number(),
    localKey: v.optional(v.string()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_letterId", ["letterId"])
    .index("by_ownerId_and_letterId_and_writtenDate", [
      "ownerId",
      "letterId",
      "writtenDate",
    ])
    .index("by_ownerId_and_localKey", ["ownerId", "localKey"])
    .index("by_ownerId_and_source_and_letterId_and_writtenDate", [
      "ownerId",
      "source",
      "letterId",
      "writtenDate",
    ]),

  attachments: defineTable({
    ownerId: v.optional(v.id("profiles")),
    ownerKey: v.optional(v.string()),
    recordType: v.optional(
      v.union(
        v.literal("journalEntry"),
        v.literal("reflection"),
        v.literal("letter"),
        v.literal("reply"),
      ),
    ),
    recordKey: v.optional(v.string()),
    blockId: v.optional(v.string()),
    parentType: v.optional(v.union(
      v.literal("journalEntry"),
      v.literal("reflection"),
      v.literal("letter"),
      v.literal("reply"),
    )),
    // Convex validates that the parent ID exists in one supported table.
    // Mutations must additionally ensure its table matches parentType.
    parentId: v.optional(v.union(
      v.id("journalEntries"),
      v.id("reflections"),
      v.id("letters"),
      v.id("replies"),
    )),
    storageId: v.optional(v.id("_storage")),
    type: v.union(v.literal("image"), v.literal("audio")),
    // `uri` remains optional only for legacy metadata; new uploads use storageId.
    uri: v.optional(v.string()),
    name: v.optional(v.string()),
    position: v.optional(v.number()),
    reviewed: v.optional(v.boolean()),
    createdAt: v.number(),
    source,
  })
    .index("by_parentType_and_parentId", ["parentType", "parentId"])
    .index("by_ownerId_and_parentType_and_parentId", [
      "ownerId",
      "parentType",
      "parentId",
    ])
    .index("by_ownerKey_and_storageId", ["ownerKey", "storageId"])
    .index("by_ownerKey_and_recordType_and_recordKey_and_blockId", [
      "ownerKey",
      "recordType",
      "recordKey",
      "blockId",
    ])
    .index("by_ownerId", ["ownerId"]),
});
