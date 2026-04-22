"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";

interface PostEditorProps {
  content?: any;
  onChange?: (json: any, html: string) => void;
}

export function PostEditor({ content, onChange }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Начните писать...",
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose-article outline-none min-h-[300px] py-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON(), editor.getHTML());
    },
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="px-6 pb-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
