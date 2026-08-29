import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  Table as TableIcon, Code, Quote, CheckSquare, Undo, Redo,
  Plus, Info, AlertCircle, CheckCircle, Paperclip, MessageSquare,
  Columns, Rows, Trash2, ArrowRight, ArrowDown
} from 'lucide-react';
import { clsx } from 'clsx';

const MenuBar = ({ editor }) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  if (!editor) {
    return null;
  }

  const addImage = () => {
    setImageUrl('');
    setImageDialogOpen(true);
    setShowInsertMenu(false);
  };

  const submitImage = (e) => {
    e.preventDefault();
    const url = imageUrl.trim();
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
    setImageDialogOpen(false);
  };

  const submitAttachment = (e) => {
    e.preventDefault();
    const name = attachmentName.trim() || 'Attached file';
    editor.chain().focus().insertContent(`<p><strong>Attachment:</strong> ${name}</p>`).run();
    setAttachmentName('');
    setAttachmentDialogOpen(false);
  };

  const insertInfoPanel = (type) => {
    editor.chain().focus().setBlockquote().run();
    setShowInsertMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="relative">
        <button 
          onClick={() => setShowInsertMenu(!showInsertMenu)}
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
        >
          <Plus size={16} /> Insert
        </button>
        
        {showInsertMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Macros</div>
            <button onClick={() => insertInfoPanel('info')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
              <Info size={14} className="text-blue-500" /> Info Panel
            </button>
            <button onClick={() => insertInfoPanel('success')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" /> Success Status
            </button>
            <button onClick={() => insertInfoPanel('warning')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
              <AlertCircle size={14} className="text-yellow-500" /> Warning Note
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Media</div>
            <button onClick={addImage} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
              <ImageIcon size={14} /> Image
            </button>
            <button
              onClick={() => {
                setAttachmentName('');
                setAttachmentDialogOpen(true);
                setShowInsertMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Paperclip size={14} /> Files & Images
            </button>
          </div>
        )}
      </div>

      {imageDialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <form onSubmit={submitImage} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Insert image</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              autoFocus
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.png"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setImageDialogOpen(false)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={!imageUrl.trim()} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Insert</button>
            </div>
          </form>
        </div>
      )}

      {attachmentDialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <form onSubmit={submitAttachment} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Attach file</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">File name</label>
            <input
              autoFocus
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="decision-log.pdf"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAttachmentDialogOpen(false)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Attach</button>
            </div>
          </form>
        </div>
      )}

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('bold') && "bg-blue-100 text-blue-600")}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('italic') && "bg-blue-100 text-blue-600")}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('bulletList') && "bg-blue-100 text-blue-600")}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('orderedList') && "bg-blue-100 text-blue-600")}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('taskList') && "bg-blue-100 text-blue-600")}
        title="Task List"
      >
        <CheckSquare size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('blockquote') && "bg-blue-100 text-blue-600")}
        title="Quote"
      >
        <Quote size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={clsx("p-1.5 rounded hover:bg-gray-100", editor.isActive('codeBlock') && "bg-blue-100 text-blue-600")}
        title="Code Block"
      >
        <Code size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button 
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-gray-100" 
        title="Insert Table"
      >
        <TableIcon size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-gray-100">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-gray-100">
        <Redo size={18} />
      </button>
    </div>
  );
};

export const Editor = ({ content, onChange, editable = true }) => {
  const [inlineCommentOpen, setInlineCommentOpen] = useState(false);
  const [inlineComment, setInlineComment] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Write something amazing...' })
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden min-h-[500px] flex flex-col relative">
      {editable && <MenuBar editor={editor} />}
      
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden flex divide-x divide-gray-200">
            {/* Text Selection Menu */}
            {!editor.isActive('table') && (
              <>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={clsx("p-2 hover:bg-gray-100", editor.isActive('bold') && "text-blue-600 bg-blue-50")}
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={clsx("p-2 hover:bg-gray-100", editor.isActive('italic') && "text-blue-600 bg-blue-50")}
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => {
                    setInlineComment('');
                    setInlineCommentOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 text-gray-700"
                  title="Add Comment"
                >
                  <MessageSquare size={16} />
                </button>
              </>
            )}

            {/* Table Menu */}
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
                  onClick={() => editor.chain().focus().deleteColumn().run()} 
                  className="p-2 hover:bg-gray-100 text-red-600"
                  title="Delete Column"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => editor.chain().focus().addRowAfter().run()} 
                  className="p-2 hover:bg-gray-100 text-gray-700"
                  title="Add Row"
                >
                  <Rows size={16} />
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
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </BubbleMenu>
      )}

      {inlineCommentOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const comment = inlineComment.trim();
              if (!comment || !editor) return;
              editor.chain().focus().insertContent(`<blockquote><p>Inline comment: ${comment}</p></blockquote>`).run();
              setInlineCommentOpen(false);
            }}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5"
          >
            <h2 className="font-bold text-gray-900 mb-3">Add inline comment</h2>
            <textarea
              autoFocus
              value={inlineComment}
              onChange={(e) => setInlineComment(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave a note on the selected text"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setInlineCommentOpen(false)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={!inlineComment.trim()} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </form>
        </div>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
};
