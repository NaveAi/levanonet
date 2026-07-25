import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FamilyTree } from "@/components/family-tree";
import { redirect } from "next/navigation";

export default async function FamilyTreePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get all family members
  const allMembers = await prisma.user.findMany({
    where: { role: { not: "BOT" } },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
    orderBy: { displayName: "asc" },
  });

  // Get family relationships
  const relationships = await prisma.familyRelation.findMany({
    include: {
      parent: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      child: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  // Build tree structure
  const memberMap = new Map(
    allMembers.map((m) => [
      m.id,
      {
        ...m,
        children: [] as any[],
        spouse: null as any,
        siblings: [] as any[],
      },
    ])
  );

  // Process relationships
  relationships.forEach((rel) => {
    const parentMember = memberMap.get(rel.parent.id);
    const childMember = memberMap.get(rel.child.id);

    if (!parentMember || !childMember) return;

    if (rel.relationshipType === "parent-child") {
      parentMember.children.push(childMember);
    } else if (rel.relationshipType === "spouse") {
      parentMember.spouse = childMember;
    } else if (rel.relationshipType === "sibling") {
      parentMember.siblings.push(childMember);
    }
  });

  // Find root members (those without parents)
  const rootMembers = allMembers.filter((m) => {
    const hasParent = relationships.some((rel) => rel.child.id === m.id && rel.relationshipType === "parent-child");
    return !hasParent;
  });

  const rootsWithTree = rootMembers.map((root) => memberMap.get(root.id)!).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">👨‍👩‍👧‍👦 אילן היוחסין של המשפחה</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          היכל כל חברי המשפחה וקשריהם. בחר משתמש כדי לראות את עצו המשפחה שלו.
        </p>
      </div>

      <FamilyTree members={rootsWithTree.length > 0 ? rootsWithTree : allMembers.map((m) => memberMap.get(m.id)!).filter(Boolean)} highlightedUserId={session.user.id} />
    </div>
  );
}
