/**
 * Rewrites MongoDB fields that store R2 object URLs from the S3 API endpoint
 * (r2.cloudflarestorage.com/{bucket}/...) to CLOUDFARE_R2_PUBLIC_URL.
 *
 * Usage:
 *   npx ts-node src/scripts/migrate-r2-public-urls.ts
 *   DRY_RUN=1 npx ts-node src/scripts/migrate-r2-public-urls.ts
 */
import mongoose, { Model } from "mongoose";
import config from "../config";
import { rewriteR2UrlToPublic } from "../config/cloudefare.config";
import { User } from "../app/modules/user/user.model";
import { Posts } from "../app/modules/posts/posts.model";
import { PrivateAlbum } from "../app/modules/private_album/private_album.model";
import { Blogs } from "../app/modules/blogs/blogs.model";
import { Message } from "../app/modules/message/message.model";
import { Feedback } from "../app/modules/feedback/feedback.model";
import { SuccessStory } from "../app/modules/success_story/success_story.model";
import { FirstDateIdeas } from "../app/modules/first_date_ideas/first_date_ideas.model";
import { PostReport } from "../app/modules/post_report/post_report.model";

const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

type StringField = { kind: "string"; path: string };
type StringArrayField = { kind: "string[]"; path: string };
type FieldSpec = StringField | StringArrayField;

type CollectionMigration = {
  name: string;
  model: Model<any>;
  fields: FieldSpec[];
};

const MIGRATIONS: CollectionMigration[] = [
  {
    name: "User",
    model: User,
    fields: [
      { kind: "string", path: "profile" },
      { kind: "string", path: "protectedImages" },
      { kind: "string", path: "documentVerified" },
    ],
  },
  {
    name: "Posts",
    model: Posts,
    fields: [{ kind: "string[]", path: "content" }],
  },
  {
    name: "PrivateAlbum",
    model: PrivateAlbum,
    fields: [
      { kind: "string[]", path: "images" },
      { kind: "string[]", path: "media" },
      { kind: "string[]", path: "protectedImages" },
    ],
  },
  {
    name: "Blogs",
    model: Blogs,
    fields: [{ kind: "string", path: "imageUrl" }],
  },
  {
    name: "Message",
    model: Message,
    fields: [{ kind: "string[]", path: "image" }],
  },
  {
    name: "Feedback",
    model: Feedback,
    fields: [
      { kind: "string[]", path: "media" },
      { kind: "string", path: "voiceMessage" },
    ],
  },
  {
    name: "SuccessStory",
    model: SuccessStory,
    fields: [{ kind: "string[]", path: "media" }],
  },
  {
    name: "FirstDateIdeas",
    model: FirstDateIdeas,
    fields: [{ kind: "string[]", path: "media" }],
  },
  {
    name: "PostReport",
    model: PostReport,
    fields: [{ kind: "string[]", path: "image" }],
  },
];

const rewriteString = (value: unknown): { next: string; changed: boolean } => {
  if (typeof value !== "string" || !value.startsWith("http")) {
    return { next: value as string, changed: false };
  }
  const next = rewriteR2UrlToPublic(value);
  return { next, changed: next !== value };
};

const rewriteStringArray = (
  value: unknown,
): { next: string[]; changed: boolean } => {
  if (!Array.isArray(value)) {
    return { next: [], changed: false };
  }
  let changed = false;
  const next = value.map((item) => {
    if (typeof item !== "string") return item;
    const rewritten = rewriteR2UrlToPublic(item);
    if (rewritten !== item) changed = true;
    return rewritten;
  });
  return { next, changed };
};

const getByPath = (doc: Record<string, unknown>, path: string) => doc[path];

async function migrateCollection(spec: CollectionMigration) {
  const cursor = spec.model.find({}).cursor();
  let scanned = 0;
  let updated = 0;

  for await (const doc of cursor) {
    scanned += 1;
    const plain = doc.toObject() as Record<string, unknown>;
    const $set: Record<string, unknown> = {};

    for (const field of spec.fields) {
      const current = getByPath(plain, field.path);
      if (current === undefined || current === null || current === "") continue;

      if (field.kind === "string") {
        const { next, changed } = rewriteString(current);
        if (changed) $set[field.path] = next;
      } else {
        const { next, changed } = rewriteStringArray(current);
        if (changed) $set[field.path] = next;
      }
    }

    if (Object.keys($set).length === 0) continue;

    updated += 1;
    if (dryRun) {
      console.log(
        `[dry-run] ${spec.name} ${String(doc._id)} would update:`,
        $set,
      );
      continue;
    }

    await spec.model.updateOne({ _id: doc._id }, { $set });
  }

  console.log(
    `${spec.name}: scanned=${scanned} updated=${updated}${dryRun ? " (dry-run)" : ""}`,
  );
  return { scanned, updated };
}

async function main() {
  if (!process.env.CLOUDFARE_R2_PUBLIC_URL?.trim()) {
    console.error(
      "CLOUDFARE_R2_PUBLIC_URL must be set before running this migration.",
    );
    process.exit(1);
  }

  await mongoose.connect(config.database_url as string, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `Connected to MongoDB. Public base: ${process.env.CLOUDFARE_R2_PUBLIC_URL}${dryRun ? " [DRY_RUN]" : ""}`,
  );

  let totalUpdated = 0;
  for (const spec of MIGRATIONS) {
    const { updated } = await migrateCollection(spec);
    totalUpdated += updated;
  }

  console.log(`Done. Documents updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
