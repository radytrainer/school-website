import {
  ClipboardCheck,
  NotebookPen,
  Users2,
  FileSignature,
  Vote,
  LineChart,
  CalendarDays,
  Smartphone,
  Handshake,
  MessageCircleQuestion,
  FlaskConical,
  Presentation,
  ShieldCheck,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Star,
  Building2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// The curated set of icons selectable in the admin governance form. Keep the
// keys stable — they're stored as plain strings in the `icon` column.
export const GOVERNANCE_ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "ClipboardCheck", label: "Clipboard Check", Icon: ClipboardCheck },
  { value: "NotebookPen", label: "Notebook / Planning", Icon: NotebookPen },
  { value: "Users2", label: "Committee / Group", Icon: Users2 },
  { value: "FileSignature", label: "Agreement / Signature", Icon: FileSignature },
  { value: "Vote", label: "Council / Vote", Icon: Vote },
  { value: "LineChart", label: "Monitoring / Chart", Icon: LineChart },
  { value: "CalendarDays", label: "Schedule / Calendar", Icon: CalendarDays },
  { value: "Smartphone", label: "App / Technology", Icon: Smartphone },
  { value: "Handshake", label: "Collaboration", Icon: Handshake },
  { value: "MessageCircleQuestion", label: "Q&A / Discussion", Icon: MessageCircleQuestion },
  { value: "FlaskConical", label: "Research / Science", Icon: FlaskConical },
  { value: "Presentation", label: "Presentation", Icon: Presentation },
  { value: "ShieldCheck", label: "Governance / Trust", Icon: ShieldCheck },
  { value: "BookOpen", label: "Curriculum / Learning", Icon: BookOpen },
  { value: "Award", label: "Award / Achievement", Icon: Award },
  { value: "Target", label: "Goal / Target", Icon: Target },
  { value: "TrendingUp", label: "Growth", Icon: TrendingUp },
  { value: "Star", label: "Star / Excellence", Icon: Star },
  { value: "Building2", label: "Institution", Icon: Building2 },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  GOVERNANCE_ICON_OPTIONS.map((o) => [o.value, o.Icon])
);

export function getGovernanceIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
