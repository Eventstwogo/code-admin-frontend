"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TiptapEditor({ value, onChange, placeholder, disabled }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  if (!editor) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="border-b bg-gray-50 dark:bg-gray-900 p-2 h-12"></div>
        <div className="min-h-[400px] p-4 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <div className="border-t bg-gray-50 dark:bg-gray-900 px-4 py-2 h-10"></div>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-900 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={disabled || !editor.can().undo()}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={disabled || !editor.can().redo()}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Strikethrough"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Link */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('link') ? 'default' : 'ghost'}
              size="sm"
              onClick={addLink}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            {editor.isActive('link') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeLink}
                disabled={disabled}
                className="h-8 px-2 text-xs"
                title="Remove Link"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={`
            min-h-[400px] p-4 outline-none prose prose-sm max-w-none
            dark:prose-invert focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset
            ${disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : 'bg-white dark:bg-gray-950'}
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:min-h-[350px]
            [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-4
            [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-3
            [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:my-2
            [&_.ProseMirror_p]:my-2
            [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ul]:my-2
            [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_ol]:my-2
            [&_.ProseMirror_li]:my-1
            [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline hover:[&_.ProseMirror_a]:text-blue-800
            [&_.ProseMirror_strong]:font-bold
            [&_.ProseMirror_em]:italic
            [&_.ProseMirror_s]:line-through
            [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_.is-editor-empty:first-child::before]:text-gray-400
            [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0
          `}
        />
      </div>

      {/* Character/Word Count */}
      <div className="border-t bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground flex justify-between">
        <span>
          {editor.getText().length} characters
        </span>
        <span>
          {editor.getText().trim().split(/\s+/).filter(word => word.length > 0).length} words
        </span>
      </div>
    </div>
  );
}