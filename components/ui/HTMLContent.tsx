// components/ui/HTMLContent.tsx
'use client'

interface HTMLContentProps {
  content: string
  className?: string
}

type AllowedTag =
  | 'a'
  | 'span'
  | 'div'
  | 'p'
  | 'br'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'strong'
  | 'em'
  | 'b'
  | 'i'
  | 'ul'
  | 'ol'
  | 'li'
  | 'blockquote'
  | 'hr'

const ALLOWED_TAGS: AllowedTag[] = [
  'p',
  'br',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'blockquote',
  'hr',
  'a',
  'span',
  'div',
]

const ALLOWED_ATTRIBUTES: Partial<Record<AllowedTag, string[]>> = {
  a: ['href', 'target', 'rel', 'class'],
  span: ['class'],
  div: ['class'],
}

export function HTMLContent({ content, className = '' }: HTMLContentProps) {
  // Basic sanitization for display
  const sanitizeForDisplay = (html: string): string => {
    if (typeof window === 'undefined') return html

    const temp = document.createElement('div')
    temp.innerHTML = html

    const walker = document.createTreeWalker(
      temp,
      NodeFilter.SHOW_ELEMENT,
      null
    )

    const nodesToRemove: Element[] = []
    let node: Element | null

    while ((node = walker.nextNode() as Element)) {
      const tagName = node.tagName.toLowerCase() as AllowedTag

      if (!ALLOWED_TAGS.includes(tagName)) {
        nodesToRemove.push(node)
      } else {
        // Get allowed attributes for this tag
        const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || []

        // Remove disallowed attributes
        for (const attr of Array.from(node.attributes)) {
          if (!allowedAttrs.includes(attr.name)) {
            node.removeAttribute(attr.name)
          }
        }

        // Add security attributes to links
        if (tagName === 'a') {
          node.setAttribute('target', '_blank')
          node.setAttribute('rel', 'noopener noreferrer')
        }
      }
    }

    nodesToRemove.forEach((node) => node.remove())
    return temp.innerHTML
  }

  const cleanContent = sanitizeForDisplay(content || '')

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  )
}
