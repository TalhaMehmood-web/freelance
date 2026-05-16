"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Undo, Redo, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Separator } from "./separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "rounded-md",
              active && "bg-brand-50 text-brand-700 hover:bg-brand-100"
            )}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value?:       string
  onChange?:    (html: string) => void
  placeholder?: string
  minHeight?:   number
  maxLength?:   number
  className?:   string
  disabled?:    boolean
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  minHeight = 220,
  maxLength,
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList:  { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const charCount = editor.storage?.characterCount?.characters?.() ?? editor.getText().length

  const tools = [
    {
      group: [
        {
          label: "Heading 2",
          icon: <Heading2 className="w-3.5 h-3.5" />,
          active: editor.isActive("heading", { level: 2 }),
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          label: "Heading 3",
          icon: <Heading3 className="w-3.5 h-3.5" />,
          active: editor.isActive("heading", { level: 3 }),
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ],
    },
    {
      group: [
        {
          label: "Bold",
          icon: <Bold className="w-3.5 h-3.5" />,
          active: editor.isActive("bold"),
          action: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: "Italic",
          icon: <Italic className="w-3.5 h-3.5" />,
          active: editor.isActive("italic"),
          action: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          label: "Strikethrough",
          icon: <Strikethrough className="w-3.5 h-3.5" />,
          active: editor.isActive("strike"),
          action: () => editor.chain().focus().toggleStrike().run(),
        },
      ],
    },
    {
      group: [
        {
          label: "Bullet List",
          icon: <List className="w-3.5 h-3.5" />,
          active: editor.isActive("bulletList"),
          action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          label: "Numbered List",
          icon: <ListOrdered className="w-3.5 h-3.5" />,
          active: editor.isActive("orderedList"),
          action: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          label: "Blockquote",
          icon: <Quote className="w-3.5 h-3.5" />,
          active: editor.isActive("blockquote"),
          action: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          label: "Divider",
          icon: <Minus className="w-3.5 h-3.5" />,
          active: false,
          action: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
    {
      group: [
        {
          label: "Undo",
          icon: <Undo className="w-3.5 h-3.5" />,
          active: false,
          action: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
        },
        {
          label: "Redo",
          icon: <Redo className="w-3.5 h-3.5" />,
          active: false,
          action: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
        },
      ],
    },
  ]

  return (
    <div
      className={cn(
        "rounded-xl border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-input bg-surface-subtle rounded-t-xl">
        {tools.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <Separator orientation="vertical" className="h-4 mx-1" />}
            {group.group.map(tool => (
              <ToolbarButton
                key={tool.label}
                label={tool.label}
                active={tool.active}
                disabled={"disabled" in tool ? tool.disabled : false}
                onClick={tool.action}
              >
                {tool.icon}
              </ToolbarButton>
            ))}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className={cn(
          "px-4 py-3 text-sm text-text-primary",
          "[&_.tiptap]:outline-none",
          "[&_.tiptap]:min-h-(--rte-min-height)",
          "[&_.tiptap_p]:my-1 [&_.tiptap_p:first-child]:mt-0",
          "[&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:text-text-primary [&_.tiptap_h2]:mt-4 [&_.tiptap_h2]:mb-1 [&_.tiptap_h2:first-child]:mt-0",
          "[&_.tiptap_h3]:text-sm [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:text-text-primary [&_.tiptap_h3]:mt-3 [&_.tiptap_h3]:mb-1 [&_.tiptap_h3:first-child]:mt-0",
          "[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:my-1",
          "[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:my-1",
          "[&_.tiptap_li]:my-0.5",
          "[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-brand-300 [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-text-secondary [&_.tiptap_blockquote]:my-2",
          "[&_.tiptap_hr]:border-border [&_.tiptap_hr]:my-3",
          "[&_.tiptap_strong]:font-semibold",
          "[&_.tiptap_em]:italic",
          "[&_.tiptap_s]:line-through",
          "[&_.tiptap_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_.is-editor-empty:first-child::before]:text-text-tertiary [&_.tiptap_.is-editor-empty:first-child::before]:float-left [&_.tiptap_.is-editor-empty:first-child::before]:h-0 [&_.tiptap_.is-editor-empty:first-child::before]:pointer-events-none",
        )}
        style={{ "--rte-min-height": `${minHeight}px` } as React.CSSProperties}
      />

      {/* Footer — char count */}
      {maxLength && (
        <div className="flex items-center justify-end px-3 py-1.5 border-t border-input bg-surface-subtle rounded-b-xl">
          <span className={cn(
            "text-xs tabular-nums",
            charCount < 120 ? "text-warning-500" : "text-text-tertiary"
          )}>
            {charCount.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
