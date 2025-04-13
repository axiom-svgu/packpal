import { sql } from "drizzle-orm";
import { db } from "..";

export async function addNotificationsTable() {
  console.log("Creating notification_type enum if not exists...");
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('assignment', 'item_update', 'list_update', 'group_update', 'system');
      END IF;
    END $$;
  `);

  console.log("Creating notification table if not exists...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "notification" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "title" VARCHAR(255) NOT NULL,
      "message" TEXT NOT NULL,
      "type" notification_type NOT NULL DEFAULT 'system',
      "is_read" BOOLEAN NOT NULL DEFAULT false,
      "related_item_id" UUID REFERENCES "item"("id") ON DELETE SET NULL,
      "related_list_id" UUID REFERENCES "list"("id") ON DELETE SET NULL,
      "related_group_id" UUID REFERENCES "group"("id") ON DELETE SET NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  console.log("Creating notification indexes...");
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "notification_user_id_idx" ON "notification"("user_id");
    CREATE INDEX IF NOT EXISTS "notification_type_idx" ON "notification"("type");
    CREATE INDEX IF NOT EXISTS "notification_is_read_idx" ON "notification"("is_read");
  `);

  console.log("Notification table migration completed.");
}
