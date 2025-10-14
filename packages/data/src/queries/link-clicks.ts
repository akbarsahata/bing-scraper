import { Db } from "@/db/database";
import { linkClicks } from "@/drizzle-out/schema";
import { LinkClickMessageType } from "@/zod/queue";

export async function addLinkClick(args: {
  db: Db;
  info: LinkClickMessageType["data"];
}) {
  const { db, info } = args;
  await db.insert(linkClicks).values({
    id: info.id,
    accountId: info.accountId,
    destination: info.destination,
    country: info.country,
    clickedTime: info.timestamp,
    latitude: info.latitude,
    longitude: info.longitude,
  });
}
