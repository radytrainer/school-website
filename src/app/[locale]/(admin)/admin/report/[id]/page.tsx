"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown, Table2, List, AlignLeft, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createReportSection, updateReportSection, getAdminReportSectionById } from "@/actions/report";
import type { ReportBlock, ReportSubsection } from "@/lib/school-report-data";
import type { ReportSectionInput } from "@/lib/validations";

interface PageProps { params: Promise<{ id: string }>; }

function newBlock(type: ReportBlock["type"]): ReportBlock {
  if (type === "keyvalue") return { type, items: [{ label_km: "", label_en: "", value: "" }] };
  if (type === "table") return { type, headers: ["", ""], rows: [["", ""]] };
  if (type === "list") return { type, items: [""] };
  return { type: "text", paragraphs: [""] };
}

function newSubsection(): ReportSubsection {
  return { key: "", title_km: "", title_en: "", blocks: [newBlock("text")] };
}

const emptyForm: ReportSectionInput = {
  number: 1,
  title_km: "",
  title_en: "",
  is_active: true,
  subsections: [],
};

export default function ReportSectionFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [form, setForm] = useState<ReportSectionInput>(isNew ? { ...emptyForm, subsections: [newSubsection()] } : emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getAdminReportSectionById(id).then((data) => {
        if (data) {
          setForm({
            number: data.number,
            title_km: data.title_km,
            title_en: data.title_en,
            is_active: data.is_active,
            subsections: data.subsections,
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const updateSubsection = (si: number, patch: Partial<ReportSubsection>) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      subsections[si] = { ...subsections[si], ...patch };
      return { ...f, subsections };
    });
  };

  const moveSubsection = (si: number, dir: -1 | 1) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      const target = si + dir;
      if (target < 0 || target >= subsections.length) return f;
      [subsections[si], subsections[target]] = [subsections[target], subsections[si]];
      return { ...f, subsections };
    });
  };

  const removeSubsection = (si: number) => {
    if (!confirm("Remove this subsection and all its content blocks?")) return;
    setForm((f) => ({ ...f, subsections: f.subsections.filter((_, i) => i !== si) }));
  };

  const addSubsection = () => {
    setForm((f) => ({ ...f, subsections: [...f.subsections, newSubsection()] }));
  };

  const updateBlock = (si: number, bi: number, block: ReportBlock) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      const blocks = [...subsections[si].blocks];
      blocks[bi] = block;
      subsections[si] = { ...subsections[si], blocks };
      return { ...f, subsections };
    });
  };

  const moveBlock = (si: number, bi: number, dir: -1 | 1) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      const blocks = [...subsections[si].blocks];
      const target = bi + dir;
      if (target < 0 || target >= blocks.length) return f;
      [blocks[bi], blocks[target]] = [blocks[target], blocks[bi]];
      subsections[si] = { ...subsections[si], blocks };
      return { ...f, subsections };
    });
  };

  const removeBlock = (si: number, bi: number) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      subsections[si] = { ...subsections[si], blocks: subsections[si].blocks.filter((_, i) => i !== bi) };
      return { ...f, subsections };
    });
  };

  const addBlock = (si: number, type: ReportBlock["type"]) => {
    setForm((f) => {
      const subsections = [...f.subsections];
      subsections[si] = { ...subsections[si], blocks: [...subsections[si].blocks, newBlock(type)] };
      return { ...f, subsections };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = isNew ? await createReportSection(form) : await updateReportSection(id, form);
    setSubmitting(false);
    if (result.success) {
      toast.success(isNew ? "Section created!" : "Section updated!");
      router.push(`/${locale}/admin/report`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/report`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមផ្នែករបាយការណ៍" : "New Report Section") : (locale === "km" ? "កែផ្នែករបាយការណ៍" : "Edit Report Section")}
        </h1>
      </div>

      {/* Section-level fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Number</Label>
            <Input type="number" min={1} value={form.number} onChange={(e) => setForm({ ...form, number: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>ចំណងជើង (ខ្មែរ)</Label>
            <Input className="font-khmer" value={form.title_km} onChange={(e) => setForm({ ...form, title_km: e.target.value })} placeholder="ព័ត៌មានទូទៅសាលារៀន" />
          </div>
          <div className="space-y-1.5">
            <Label>Title (English)</Label>
            <Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="General School Information" />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Label>Active</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>
        </div>
      </div>

      {/* Subsections */}
      <div className="space-y-4">
        {form.subsections.map((sub, si) => (
          <div key={si} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-16 shrink-0 space-y-1.5">
                <Label className="text-xs">Key</Label>
                <Input className="text-center" value={sub.key} onChange={(e) => updateSubsection(si, { key: e.target.value })} placeholder="a" />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">ចំណងជើងផ្នែកតូច (ខ្មែរ)</Label>
                <Input className="font-khmer" value={sub.title_km} onChange={(e) => updateSubsection(si, { title_km: e.target.value })} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Subsection Title (English)</Label>
                <Input value={sub.title_en} onChange={(e) => updateSubsection(si, { title_en: e.target.value })} />
              </div>
              <div className="flex items-center gap-1 pt-6 shrink-0">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={si === 0} onClick={() => moveSubsection(si, -1)}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={si === form.subsections.length - 1} onClick={() => moveSubsection(si, 1)}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSubsection(si)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 pl-2 border-l-2" style={{ borderColor: "#eef1f7" }}>
              {sub.blocks.map((block, bi) => (
                <div key={bi} className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">{block.type}</span>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={bi === 0} onClick={() => moveBlock(si, bi, -1)}>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={bi === sub.blocks.length - 1} onClick={() => moveBlock(si, bi, 1)}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBlock(si, bi)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <BlockEditor block={block} onChange={(b) => updateBlock(si, bi, b)} />
                </div>
              ))}

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-gray-400 mr-1">Add block:</span>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock(si, "keyvalue")}><Rows3 className="w-3.5 h-3.5 mr-1" />Key-Value</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock(si, "table")}><Table2 className="w-3.5 h-3.5 mr-1" />Table</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock(si, "list")}><List className="w-3.5 h-3.5 mr-1" />List</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock(si, "text")}><AlignLeft className="w-3.5 h-3.5 mr-1" />Paragraph</Button>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addSubsection}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Subsection
        </Button>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSubmit} className="bg-school-blue-800 hover:bg-school-blue-900 shadow-lg" disabled={submitting} size="lg">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isNew ? "Create Section" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// Bilingual data cells are typically written as "ខ្មែរ / English" in one
// field (matching the site-wide convention in school-report-data.ts) rather
// than as separate km/en inputs — there are simply too many free-form
// table/list/text values for a fully split editing UI. Key-value labels are
// the exception since they're structured fields.
function BlockEditor({ block, onChange }: { block: ReportBlock; onChange: (b: ReportBlock) => void }) {
  if (block.type === "keyvalue") {
    return (
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <Input
              placeholder="ស្លាក (ខ្មែរ)"
              className="font-khmer text-sm h-9"
              value={item.label_km}
              onChange={(e) => {
                const items = block.items.map((it, idx) => (idx === i ? { ...it, label_km: e.target.value } : it));
                onChange({ ...block, items });
              }}
            />
            <Input
              placeholder="Label (English)"
              className="text-sm h-9"
              value={item.label_en}
              onChange={(e) => {
                const items = block.items.map((it, idx) => (idx === i ? { ...it, label_en: e.target.value } : it));
                onChange({ ...block, items });
              }}
            />
            <Input
              placeholder="Value — e.g. 095 85 85 45 or ខ្មែរ / English"
              className="text-sm h-9"
              value={item.value}
              onChange={(e) => {
                const items = block.items.map((it, idx) => (idx === i ? { ...it, value: e.target.value } : it));
                onChange({ ...block, items });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...block, items: [...block.items, { label_km: "", label_en: "", value: "" }] })}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
        </Button>
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea
              rows={2}
              className="flex-1 text-sm"
              placeholder="ខ្មែរ / English"
              value={item}
              onChange={(e) => {
                const items = block.items.map((it, idx) => (idx === i ? e.target.value : it));
                onChange({ ...block, items });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, ""] })}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
        </Button>
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div className="space-y-2">
        {block.paragraphs.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea
              rows={2}
              className="flex-1 text-sm"
              placeholder="ខ្មែរ / English"
              value={p}
              onChange={(e) => {
                const paragraphs = block.paragraphs.map((par, idx) => (idx === i ? e.target.value : par));
                onChange({ ...block, paragraphs });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => onChange({ ...block, paragraphs: block.paragraphs.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, paragraphs: [...block.paragraphs, ""] })}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Paragraph
        </Button>
      </div>
    );
  }

  // table
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              {block.headers.map((h, ci) => (
                <th key={ci} className="p-0 text-left font-normal">
                  <div className="flex items-center gap-1">
                    <Input
                      value={h}
                      className="text-xs font-semibold h-8 min-w-[110px]"
                      placeholder={`Col ${ci + 1}`}
                      onChange={(e) => {
                        const headers = block.headers.map((hh, idx) => (idx === ci ? e.target.value : hh));
                        onChange({ ...block, headers });
                      }}
                    />
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer"
                      title="Remove column"
                      onClick={() => {
                        const headers = block.headers.filter((_, idx) => idx !== ci);
                        const rows = block.rows.map((row) => row.filter((_, idx) => idx !== ci));
                        onChange({ ...block, headers, rows });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-0 w-8" />
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {block.headers.map((_, ci) => (
                  <td key={ci} className="p-0">
                    <Input
                      value={String(row[ci] ?? "")}
                      className="text-xs h-8 min-w-[110px]"
                      onChange={(e) => {
                        const rows = block.rows.map((r, idx) => {
                          if (idx !== ri) return r;
                          const next = [...r];
                          next[ci] = e.target.value;
                          return next;
                        });
                        onChange({ ...block, rows });
                      }}
                    />
                  </td>
                ))}
                <td className="p-0 w-8">
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-600 cursor-pointer"
                    title="Remove row"
                    onClick={() => onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== ri) })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...block, rows: [...block.rows, block.headers.map(() => "")] })}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...block, headers: [...block.headers, ""], rows: block.rows.map((r) => [...r, ""]) })}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Column
        </Button>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Note (optional footnote below the table)</Label>
        <Textarea
          rows={2}
          className="text-sm"
          value={block.note ?? ""}
          placeholder="ខ្មែរ / English"
          onChange={(e) => onChange({ ...block, note: e.target.value })}
        />
      </div>
    </div>
  );
}
