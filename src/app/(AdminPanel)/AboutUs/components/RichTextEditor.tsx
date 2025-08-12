"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const wrapSelectedText = useCallback((startTag: string, endTag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = `${startTag}${selectedText}${endTag}`;
      range.deleteContents();
      range.insertNode(wrapper);
      
      // Clear selection
      selection.removeAllRanges();
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  }, [onChange]);

  const insertAtCursor = useCallback((html: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const wrapper = document.createElement('span');
    wrapper.innerHTML = html;
    
    range.deleteContents();
    range.insertNode(wrapper);
    
    // Move cursor after inserted content
    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const formatText = useCallback((format: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    switch (format) {
      case 'bold':
        wrapSelectedText('<strong>', '</strong>');
        break;
      case 'italic':
        wrapSelectedText('<em>', '</em>');
        break;
      case 'underline':
        wrapSelectedText('<u>', '</u>');
        break;
      case 'h1':
        wrapSelectedText('<h1>', '</h1>');
        break;
      case 'h2':
        wrapSelectedText('<h2>', '</h2>');
        break;
      case 'h3':
        wrapSelectedText('<h3>', '</h3>');
        break;
    }
  }, [wrapSelectedText]);

  const insertList = useCallback((ordered: boolean = false) => {
    const listTag = ordered ? 'ol' : 'ul';
    insertAtCursor(`<${listTag}><li>List item</li></${listTag}>`);
  }, [insertAtCursor]);

  const setAlignment = useCallback((alignment: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    if (selectedText) {
      wrapSelectedText(`<div style="text-align: ${alignment}">`, '</div>');
    }
  }, [wrapSelectedText]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:') || url;
    if (url && text) {
      insertAtCursor(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    }
  }, [insertAtCursor]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    insertAtCursor(text.replace(/\n/g, '<br>'));
  }, [insertAtCursor]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
      }
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      insertAtCursor('<br>');
    }
  }, [formatText, insertAtCursor]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-900 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('underline')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('h1')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('h2')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('h3')}
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
              variant="ghost"
              size="sm"
              onClick={() => insertList(false)}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertList(true)}
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
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('left')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('center')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('right')}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertLink}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          className={`
            min-h-[400px] p-4 outline-none prose prose-sm max-w-none
            dark:prose-invert focus:ring-2 focus:ring-blue-500 focus:ring-inset
            ${disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : 'bg-white dark:bg-gray-950'}
            ${isEditorFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
          `}
          suppressContentEditableWarning={true}
        />
        {/* Placeholder */}
        {!value && !isEditorFocused && placeholder && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Character/Word Count */}
      <div className="border-t bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground flex justify-between">
        <span>
          {editorRef.current?.textContent?.length || 0} characters
        </span>
        <span>
          {editorRef.current?.textContent?.trim().split(/\s+/).filter(word => word.length > 0).length || 0} words
        </span>
      </div>
    </div>
  );
}