"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import {
  ShieldCheck,
  Users,
  UserCog,
  GraduationCap,
  Wrench,
  BookOpen,
  UserCheck,
  Calculator,
  Briefcase,
  Award,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = "root" | "lead" | "head" | "member";

interface OrgNodeData {
  km: string;
  en: string;
  icon: LucideIcon;
  tier: Tier;
  children?: OrgNodeData[];
}

const TIER_STYLES: Record<Tier, { box: string; iconWrap: string; icon: string }> = {
  root: {
    box: "bg-school-blue-800 text-white border-transparent shadow-lg",
    iconWrap: "bg-white/15",
    icon: "text-school-gold-400",
  },
  lead: {
    box: "bg-white text-school-blue-800 border-2 border-school-blue-800 border-dashed shadow-sm",
    iconWrap: "bg-school-blue-50",
    icon: "text-school-blue-800",
  },
  head: {
    box: "bg-school-gold-500 text-white border-transparent shadow-md",
    iconWrap: "bg-white/20",
    icon: "text-white",
  },
  member: {
    box: "bg-white text-[#0d1c2f] border border-[#e6eeff] shadow-sm",
    iconWrap: "bg-[#eff4ff]",
    icon: "text-school-blue-800",
  },
};

function OrgNode({ data, km }: { data: OrgNodeData; km: boolean }) {
  const Icon = data.icon;
  const style = TIER_STYLES[data.tier];
  return (
    <div
      className={cn(
        "mx-auto flex items-center gap-2 rounded-xl px-2.5 py-2 w-[152px] transition-transform duration-200 hover:-translate-y-0.5",
        style.box
      )}
    >
      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", style.iconWrap)}>
        <Icon className={cn("w-3 h-3", style.icon)} />
      </div>
      <span className={cn("text-[11px] font-semibold text-left leading-snug", km && "font-khmer")}>
        {km ? data.km : data.en}
      </span>
    </div>
  );
}

const CHART: OrgNodeData = {
  km: "នាយកសាលា",
  en: "School Principal",
  icon: ShieldCheck,
  tier: "root",
  children: [
    {
      km: "នាយករងផ្នែកសិក្សា",
      en: "Vice Principal (Academic Affairs)",
      icon: GraduationCap,
      tier: "head",
      children: [
        {
          km: "ប្រធានមធ្យមសិក្សាបឋមភូមិ (ថ្នាក់ទី៧–៩)",
          en: "Head of Lower Secondary (Grades 7–9)",
          icon: BookOpen,
          tier: "head",
          children: [
            { km: "គ្រូបង្រៀនថ្នាក់ទី៧", en: "Grade 7 Teachers", icon: Users, tier: "member" },
            { km: "គ្រូបង្រៀនថ្នាក់ទី៨", en: "Grade 8 Teachers", icon: Users, tier: "member" },
            { km: "គ្រូបង្រៀនថ្នាក់ទី៩", en: "Grade 9 Teachers", icon: Users, tier: "member" },
          ],
        },
        {
          km: "ប្រធានមធ្យមសិក្សាទុតិយភូមិ (ថ្នាក់ទី១០–១២)",
          en: "Head of Upper Secondary (Grades 10–12)",
          icon: Award,
          tier: "head",
          children: [
            { km: "គ្រូបង្រៀនថ្នាក់ទី១០", en: "Grade 10 Teachers", icon: Users, tier: "member" },
            { km: "គ្រូបង្រៀនថ្នាក់ទី១១", en: "Grade 11 Teachers", icon: Users, tier: "member" },
            { km: "គ្រូបង្រៀនថ្នាក់ទី១២", en: "Grade 12 Teachers", icon: Users, tier: "member" },
          ],
        },
      ],
    },
    {
      km: "នាយករងផ្នែករដ្ឋបាល និងកិច្ចការសិស្ស",
      en: "Vice Principal (Administration & Student Affairs)",
      icon: UserCog,
      tier: "head",
      children: [
        { km: "ការិយាល័យរដ្ឋបាល", en: "Administration Office", icon: Briefcase, tier: "member" },
        { km: "កិច្ចការសិស្ស និងវិន័យ", en: "Student Affairs & Discipline", icon: UserCheck, tier: "member" },
        { km: "ហេដ្ឋារចនាសម្ព័ន្ធ និងថែទាំ", en: "Facilities & Maintenance", icon: Wrench, tier: "member" },
      ],
    },
    {
      km: "គណនេយ្យករសាលា",
      en: "School Accountant",
      icon: Calculator,
      tier: "head",
    },
  ],
};

function renderNodes(nodes: OrgNodeData[], km: boolean) {
  return nodes.map((node) => (
    <TreeNode key={node.en} label={<OrgNode data={node} km={km} />}>
      {node.children ? renderNodes(node.children, km) : null}
    </TreeNode>
  ));
}

export default function OrgChart({ km }: { km: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ scale: 1, width: 0, height: 0 });

  // Scales the whole diagram down to fit the available width so it never
  // needs a horizontal scrollbar, instead of clipping or overflowing. The
  // content keeps its natural (max-content) size and is scaled from its
  // top-left corner; the wrapper around it is sized to the post-scale
  // footprint so `mx-auto` centers it correctly (auto-margins can't center
  // a box that's still wider than its container).
  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const recalc = () => {
      const naturalWidth = content.scrollWidth;
      const naturalHeight = content.scrollHeight;
      const available = container.clientWidth;
      const nextScale = naturalWidth > available ? available / naturalWidth : 1;
      setDims({ scale: nextScale, width: naturalWidth * nextScale, height: naturalHeight * nextScale });
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [km]);

  return (
    <div ref={containerRef} className="overflow-hidden py-4">
      <div className="mx-auto" style={{ width: dims.width || undefined, height: dims.height || undefined }}>
        <div
          ref={contentRef}
          style={{ width: "max-content", transform: `scale(${dims.scale})`, transformOrigin: "top left" }}
        >
          <Tree
            label={<OrgNode data={CHART} km={km} />}
            lineWidth="2px"
            lineColor="#c3d0e8"
            lineBorderRadius="8px"
            nodePadding="6px"
          >
            {renderNodes(CHART.children ?? [], km)}
          </Tree>
        </div>
      </div>
    </div>
  );
}
