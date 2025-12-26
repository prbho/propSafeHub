// components/ui/SafeRichTextEditor.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Type,
} from 'lucide-react'

import { Button } from './button'

interface SafeRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Helper functions for safe formatting
const formatCommands = {
  bold: { start: '<strong>', end: '</strong>' },
  italic: { start: '<em>', end: '</em>' },
  h2: { start: '<h2>', end: '</h2>' },
  h3: { start: '<h3>', end: '</h3>' },
  paragraph: { start: '<p>', end: '</p>' },
}

const insertCommands = {
  bullet: '<ul class="list-disc pl-5 my-2"><li>List item</li></ul>',
  numbered: '<ol class="list-decimal pl-5 my-2"><li>List item</li></ol>',
  quote:
    '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">Quote text</blockquote>',
  line: '<hr class="my-4 border-gray-300" />',
}

export function SafeRichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
}: SafeRichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = selectionStart
      textareaRef.current.selectionEnd = selectionEnd
    }
  }, [selectionStart, selectionEnd])

  const handleSelect = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart)
      setSelectionEnd(textareaRef.current.selectionEnd)
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const formatSelection = useCallback(
    (format: keyof typeof formatCommands | keyof typeof insertCommands) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const {
        selectionStart: start,
        selectionEnd: end,
        value: currentValue,
      } = textarea

      // Handle text formatting
      if (format in formatCommands) {
        const command = formatCommands[format as keyof typeof formatCommands]
        const selectedText = currentValue.substring(start, end)
        const beforeText = currentValue.substring(0, start)
        const afterText = currentValue.substring(end)

        const newValue =
          beforeText + command.start + selectedText + command.end + afterText

        onChange(newValue)

        // Restore cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            const newCursorPos =
              start +
              command.start.length +
              selectedText.length +
              command.end.length
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          }
        }, 0)
      }

      // Handle element insertion
      else if (format in insertCommands) {
        const element = insertCommands[format as keyof typeof insertCommands]
        const beforeText = currentValue.substring(0, start)
        const afterText = currentValue.substring(start)

        const newValue = beforeText + element + afterText

        onChange(newValue)

        // Restore cursor position after the inserted element
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            const newCursorPos = start + element.length
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          }
        }, 0)
      }
    },
    [onChange]
  )

  const addLink = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const {
      selectionStart: start,
      selectionEnd: end,
      value: currentValue,
    } = textarea
    const selectedText = currentValue.substring(start, end) || 'Link'

    const url = prompt('Enter URL (include https://):', 'https://')
    if (url && url.startsWith('http')) {
      const beforeText = currentValue.substring(0, start)
      const afterText = currentValue.substring(end)
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${selectedText}</a>`

      const newValue = beforeText + linkHtml + afterText
      onChange(newValue)

      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newCursorPos = start + linkHtml.length
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    }
  }, [onChange])

  const clearFormatting = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const {
      selectionStart: start,
      selectionEnd: end,
      value: currentValue,
    } = textarea
    const selectedText = currentValue.substring(start, end)

    // Remove HTML tags from selected text
    const cleanText = selectedText.replace(/<[^>]*>/g, '')
    const beforeText = currentValue.substring(0, start)
    const afterText = currentValue.substring(end)

    const newValue = beforeText + cleanText + afterText
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = start + cleanText.length
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }, [onChange])

  // Use useMemo to create toolbar buttons array
  const toolbarButtons = useMemo(
    () => [
      {
        icon: <Pilcrow className="w-4 h-4" />,
        action: () => formatSelection('paragraph'),
        label: 'Paragraph',
      },
      {
        icon: <Heading2 className="w-4 h-4" />,
        action: () => formatSelection('h2'),
        label: 'Heading 2',
      },
      {
        icon: <Heading3 className="w-4 h-4" />,
        action: () => formatSelection('h3'),
        label: 'Heading 3',
      },
      {
        icon: <Bold className="w-4 h-4" />,
        action: () => formatSelection('bold'),
        label: 'Bold',
      },
      {
        icon: <Italic className="w-4 h-4" />,
        action: () => formatSelection('italic'),
        label: 'Italic',
      },
      {
        icon: <List className="w-4 h-4" />,
        action: () => formatSelection('bullet'),
        label: 'Bullet List',
      },
      {
        icon: <ListOrdered className="w-4 h-4" />,
        action: () => formatSelection('numbered'),
        label: 'Numbered List',
      },
      {
        icon: <Quote className="w-4 h-4" />,
        action: () => formatSelection('quote'),
        label: 'Quote',
      },
      {
        icon: <Minus className="w-4 h-4" />,
        action: () => formatSelection('line'),
        label: 'Divider',
      },
      {
        icon: <LinkIcon className="w-4 h-4" />,
        action: addLink,
        label: 'Link',
      },
    ],
    [formatSelection, addLink] // Add clearFormatting if you want to include it
  )

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
        {toolbarButtons.map((btn, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={btn.action}
            title={btn.label}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            {btn.icon}
          </Button>
        ))}

        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFormatting}
            title="Clear Formatting"
            className="h-8 w-8 p-0"
          >
            <Type className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 px-2 text-xs"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="border border-gray-300 border-t-0 rounded-b-lg min-h-[200px]">
        {!showPreview ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onSelect={handleSelect}
            placeholder={placeholder}
            className="w-full min-h-[200px] p-4 focus:outline-none resize-y font-mono text-sm"
            rows={10}
          />
        ) : (
          <div className="min-h-[200px] p-4 prose prose-sm max-w-none">
            <PreviewContent
              content={value || `<p class="text-gray-400">${placeholder}</p>`}
            />
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">💡 Tips:</span>
          <span className="text-xs">
            Select text then click formatting buttons
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <kbd className="bg-gray-100 px-1 rounded">Ctrl+B</kbd> Bold
          </div>
          <div>
            <kbd className="bg-gray-100 px-1 rounded">Ctrl+I</kbd> Italic
          </div>
          <div>
            <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> New paragraph
          </div>
          <div>
            <kbd className="bg-gray-100 px-1 rounded">Shift+Enter</kbd> Line
            break
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component (same as display component)
function PreviewContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none prose-gray
                 prose-headings:font-semibold prose-headings:text-gray-900
                 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
                 prose-ul:my-2 prose-ol:my-2 prose-li:my-1
                 prose-a:text-blue-600 prose-a:underline prose-a:font-normal
                 prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-600
                 prose-hr:border-gray-200 prose-hr:my-4
                 prose-strong:font-bold prose-em:italic"
      dangerouslySetInnerHTML={{
        __html: content || '<p class="text-gray-500">No content yet...</p>',
      }}
    />
  )
}
