"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("אין הרשאת מנהל");
  }
  return session.user.id;
}

export async function addFamilyRelation(
  parentId: string,
  childId: string,
  relationshipType: "parent-child" | "spouse" | "sibling"
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const [parent, child] = await Promise.all([
      prisma.user.findUnique({ where: { id: parentId } }),
      prisma.user.findUnique({ where: { id: childId } }),
    ]);

    if (!parent || !child) {
      return { ok: false, error: "משתמש לא נמצא" };
    }

    if (parentId === childId) {
      return { ok: false, error: "לא ניתן ליצור קשר עם עצמך" };
    }

    // Handle sibling relationship (bidirectional)
    if (relationshipType === "sibling") {
      await Promise.all([
        prisma.familyRelation.upsert({
          where: {
            parentId_childId_relationshipType: {
              parentId,
              childId,
              relationshipType: "sibling",
            },
          },
          create: {
            parentId,
            childId,
            relationshipType,
          },
          update: {},
        }),
        prisma.familyRelation.upsert({
          where: {
            parentId_childId_relationshipType: {
              parentId: childId,
              childId: parentId,
              relationshipType: "sibling",
            },
          },
          create: {
            parentId: childId,
            childId: parentId,
            relationshipType,
          },
          update: {},
        }),
      ]);
    } else {
      await prisma.familyRelation.upsert({
        where: {
          parentId_childId_relationshipType: {
            parentId,
            childId,
            relationshipType,
          },
        },
        create: {
          parentId,
          childId,
          relationshipType,
        },
        update: {},
      });
    }

    revalidatePath("/family-tree");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function removeFamilyRelation(
  parentId: string,
  childId: string,
  relationshipType: "parent-child" | "spouse" | "sibling"
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (relationshipType === "sibling") {
      await Promise.all([
        prisma.familyRelation.deleteMany({
          where: {
            OR: [
              { parentId, childId, relationshipType },
              { parentId: childId, childId: parentId, relationshipType },
            ],
          },
        }),
      ]);
    } else {
      await prisma.familyRelation.delete({
        where: {
          parentId_childId_relationshipType: {
            parentId,
            childId,
            relationshipType,
          },
        },
      });
    }

    revalidatePath("/family-tree");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}
