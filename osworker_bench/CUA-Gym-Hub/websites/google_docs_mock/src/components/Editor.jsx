import React, { useEffect, useCallback } from 'react';
import { EditorContent, BubbleMenu } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon,
  MessageSquare, Table as TableIcon, Columns, Rows, Trash2
} from 'lucide-react';
import { clsx } from 'clsx';

const Editor = ({ editor, editable = true, onAddComment, zoom = 100 }) => {
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = previousUrl || 'https://example.com';
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fa]">
      <div
        className="max-w-[816px] min-h-[1056px] mx-auto my-6 bg-white shadow-md px-[96px] py-[72px] origin-top"
        style={zoom !== 100 ? { transform: `scale(${zoom / 100})`, transformOrigin: 'top center' } : undefined}
      >
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden flex divide-x divide-gray-200">
              {!editor.isActive('table') && (
                <>
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={clsx("p-2 hover:bg-gray-100", editor.isActive('bold') && "text-blue-600 bg-blue-50")}
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={clsx("p-2 hover:bg-gray-100", editor.isActive('italic') && "text-blue-600 bg-blue-50")}
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={clsx("p-2 hover:bg-gray-100", editor.isActive('underline') && "text-blue-600 bg-blue-50")}
                    title="Underline"
                  >
                    <Underline size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={clsx("p-2 hover:bg-gray-100", editor.isActive('strike') && "text-blue-600 bg-blue-50")}
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </button>
                  <button
                    onClick={addLink}
                    className={clsx("p-2 hover:bg-gray-100", editor.isActive('link') && "text-blue-600 bg-blue-50")}
                    title="Link"
                  >
                    <LinkIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const { from, to } = editor.state.selection;
                      const quotedText = editor.state.doc.textBetween(from, to, ' ');
                      const comment = 'New comment';
                      if (comment && onAddComment) {
                        onAddComment(comment, quotedText);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 text-gray-700"
                    title="Add Comment"
                  >
                    <MessageSquare size={16} />
                  </button>
                </>
              )}
              {editor.isActive('table') && (
                <>
                  <button
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="p-2 hover:bg-gray-100 text-gray-700"
                    title="Add Column"
                  >
                    <Columns size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="p-2 hover:bg-gray-100 text-gray-700"
                    title="Add Row"
                  >
                    <Rows size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="p-2 hover:bg-gray-100 text-red-600"
                    title="Delete Column"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="p-2 hover:bg-gray-100 text-red-600"
                    title="Delete Row"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="p-2 hover:bg-gray-100 text-red-600"
                    title="Delete Table"
                  >
                    <TableIcon size={16} />
                  </button>
                </>
              )}
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="docs-editor" />
      </div>
    </div>
  );
};

export default Editor;
