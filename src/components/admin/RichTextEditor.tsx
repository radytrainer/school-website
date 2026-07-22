"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  TableIcon,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Rows3,
  Columns3,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  khmer?: boolean;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
        active ? "bg-school-blue-800 text-white" : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, khmer, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose max-w-none prose-sm focus:outline-none min-h-[220px] px-3 py-2",
          khmer && "font-khmer prose-khmer"
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. loading an existing article) into the
  // editor, since Tiptap only treats `content` as the initial value.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const setLink = () => {
    const url = window.prompt("URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const inTable = editor.isActive("table");

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-gray-50 px-2 py-1.5">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Insert table" onClick={addTable}>
          <TableIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        {inTable && (
          <>
            <ToolbarButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <Rows3 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <Columns3 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </ToolbarButton>
          </>
        )}

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
