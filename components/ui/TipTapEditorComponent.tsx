// components/ui/TipTapEditorComponent.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Undo,
  Unlink,
} from 'lucide-react'

import { Button } from './button'

interface TipTapEditorComponentProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TipTapEditorComponent({
  value,
  onChange,
  placeholder = 'Start typing your description...',
}: TipTapEditorComponentProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3',
      },
    },
    immediatelyRender: false, // This is the key fix
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  const addLink = () => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const removeLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run()
    }
  }

  if (!editor) {
    return (
      <textarea
        className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
      />
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          }
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={editor.isActive('link') ? 'bg-gray-200' : ''}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-64">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={addLink}
                  className="flex-1"
                >
                  Add Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeLink}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[150px]">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        {editor.isEmpty ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <span>
            {editor.storage.characterCount?.characters() || 0} characters
          </span>
        )}
      </div>
    </div>
  )
}
