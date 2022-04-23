import { prisma } from "./prisma";

export async function getDocumentPreviews({ cursor, skip, take }) {
  return await prisma.document.findMany({ cursor, skip, take });
}
