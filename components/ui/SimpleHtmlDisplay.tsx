// components/ui/SimpleHtmlDisplay.tsx
'use client'

interface SimpleHtmlDisplayProps {
  html: string
  className?: string
  emptyMessage?: string
}

export function SimpleHtmlDisplay({
  html,
  className = '',
  emptyMessage = 'No description available.',
}: SimpleHtmlDisplayProps) {
  // Basic sanitization
  const sanitize = (input: string): string => {
    if (!input) return `<p class="text-gray-500">${emptyMessage}</p>`

    // Remove script tags
    let result = input.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    )

    // Remove event handlers
    result = result.replace(/on\w+="[^"]*"/g, '')
    result = result.replace(/on\w+='[^']*'/g, '')

    // Ensure links open in new tab
    result = result.replace(
      /<a(?![^>]*\btarget\s*=)/g,
      '<a target="_blank" rel="noopener noreferrer"'
    )

    return result
  }

  const content = sanitize(html)

  return (
    <div
      className={`prose prose-sm max-w-none prose-gray
                 prose-headings:font-semibold prose-headings:text-gray-900
                 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
                 prose-ul:my-2 prose-ol:my-2 prose-li:my-1
                 prose-a:text-blue-600 prose-a:underline prose-a:font-normal
                 prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-600
                 prose-hr:border-gray-200 prose-hr:my-4
                 prose-strong:font-bold prose-em:italic
                 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
