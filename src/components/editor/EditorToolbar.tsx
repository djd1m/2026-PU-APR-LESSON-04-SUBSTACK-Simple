"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const buttons = [
    {
      label: "B",
      title: "Жирный",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      className: "font-bold",
    },
    {
      label: "I",
      title: "Курсив",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      className: "italic",
    },
    {
      label: "H2",
      title: "Заголовок 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      title: "Заголовок 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "•",
      title: "Маркированный список",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "1.",
      title: "Нумерованный список",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      label: "❝",
      title: "Цитата",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      label: "<>",
      title: "Код",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      label: "—",
      title: "Разделитель",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
    },
    {
      label: "🔗",
      title: "Ссылка",
      action: () => {
        const url = window.prompt("URL ссылки:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
    },
    {
      label: "🖼",
      title: "Изображение",
      action: () => {
        const url = window.prompt("URL изображения:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      isActive: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          title={btn.title}
          className={cn(
            "px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors",
            btn.isActive && "bg-gray-200 text-gray-900",
            btn.className
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
