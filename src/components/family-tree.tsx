"use client";

import React, { useState } from "react";
import { User, ChevronDown, ChevronUp } from "lucide-react";

interface FamilyMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  children?: FamilyMember[];
  spouse?: FamilyMember;
  siblings?: FamilyMember[];
}

interface FamilyTreeProps {
  members: FamilyMember[];
  highlightedUserId: string;
}

export function FamilyTree({ members, highlightedUserId }: FamilyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([highlightedUserId]));

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderMember = (member: FamilyMember, depth: number = 0) => {
    const isHighlighted = member.id === highlightedUserId;
    const isExpanded = expandedIds.has(member.id);
    const hasChildren = member.children && member.children.length > 0;
    const hasSpouse = !!member.spouse;

    return (
      <div key={member.id} className="mb-4">
        {/* Member Card */}
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
            ${
              isHighlighted
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950 shadow-lg ring-2 ring-violet-300 dark:ring-violet-600"
                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
            }
          `}
          onClick={() => toggleExpanded(member.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button className="flex-shrink-0 text-zinc-600 dark:text-zinc-400">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.displayName}
                className={`w-10 h-10 rounded-full object-cover ${
                  isHighlighted ? "ring-2 ring-violet-500" : ""
                }`}
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white ${
                  isHighlighted ? "ring-2 ring-violet-500" : ""
                }`}
              >
                <User size={20} />
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold truncate ${
                isHighlighted ? "text-violet-700 dark:text-violet-300" : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {member.displayName}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">@{member.username}</p>
          </div>

          {/* Highlighted Indicator */}
          {isHighlighted && (
            <div className="flex-shrink-0 text-violet-500 font-bold text-lg">★</div>
          )}
        </div>

        {/* Spouse Info */}
        {hasSpouse && isExpanded && (
          <div className="ml-8 mt-2 p-2 bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800 rounded-lg text-sm">
            <p className="text-pink-700 dark:text-pink-300 font-medium">💕 Partner: {member.spouse.displayName}</p>
          </div>
        )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-8 mt-3 pt-3 border-l-2 border-zinc-300 dark:border-zinc-600 pl-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">👶 ילדים</p>
            {member.children!.map((child) => renderMember(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 לחץ על חברי משפחה כדי להרחיב/צמצם את העץ. ⭐ מודגש = אתה עכשיו
        </p>
      </div>

      <div className="space-y-4">
        {members.map((member) => renderMember(member))}
      </div>
    </div>
  );
}
