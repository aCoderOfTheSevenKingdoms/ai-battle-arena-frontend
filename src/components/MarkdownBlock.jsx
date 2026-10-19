import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import CopyButton from './CopyButton'

/**
 * Markdown renderer for LLM solutions with highlighted code blocks and an
 * optional copy affordance. LLM output is untrusted — it is only rendered
 * through ReactMarkdown, never injected as raw HTML.
 *
 * @param {object} props
 * @param {string} props.content
 * @param {boolean} [props.showCopy=true] Show a copy button for the raw markdown.
 * @param {string} [props.copyLabel]
 * @param {string} [props.maxHeightClass='max-h-96'] Scroll constraint class.
 * @param {string} [props.className]
 */
function MarkdownBlock({
  content,
  showCopy = true,
  copyLabel,
  maxHeightClass = 'max-h-96',
  className = '',
}) {
  return (
    <div
      className={[
        'rounded-lg bg-surface-container-lowest border border-outline-variant/40 overflow-hidden',
        className,
      ].join(' ')}
    >
      {showCopy && (
        <div className="flex items-center justify-end px-space-sm py-1.5 border-b border-outline-variant/40 bg-surface-container-lowest">
          <CopyButton text={content} label={copyLabel || 'Copy solution'} size="sm" />
        </div>
      )}
      <div className={`${maxHeightClass} overflow-y-auto p-space-md arena-scroll`}>
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            p: ({ children }) => (
              <p className="font-body text-body-md text-on-surface leading-relaxed my-2 first:mt-0 last:mb-0">
                {children}
              </p>
            ),
            h1: ({ children }) => (
              <h2 className="font-display text-headline-md text-on-surface uppercase tracking-wide mt-4 mb-2">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h3 className="font-display text-headline-md text-on-surface uppercase tracking-wide mt-4 mb-2">
                {children}
              </h3>
            ),
            h3: ({ children }) => (
              <h4 className="font-display text-label-caps text-tertiary uppercase tracking-[0.12em] mt-3 mb-1">
                {children}
              </h4>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-2 hover:brightness-110"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside font-body text-body-md text-on-surface my-2 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside font-body text-body-md text-on-surface my-2 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="pl-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-tertiary pl-space-sm my-2 text-on-surface-variant font-body text-body-md">
                {children}
              </blockquote>
            ),
            code: ({ className: codeClass, children, ...rest }) => {
              const isBlock = /language-/.test(codeClass || '') || String(children).includes('\n')
              if (isBlock) {
                return (
                  <code className={`${codeClass || ''} text-[0.8125rem] leading-5`} {...rest}>
                    {children}
                  </code>
                )
              }
              return (
                <code className="px-1 py-0.5 rounded-sm bg-surface-container-high text-primary font-body text-[0.8125em]">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="my-2 p-space-md rounded-md bg-surface-container-low overflow-x-auto font-body text-body-code text-on-surface">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-2">
                <table className="w-full text-left font-body text-body-md text-on-surface border-collapse">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-2 py-1 border border-outline-variant/60 bg-surface-container font-display text-label-caps text-tertiary uppercase">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-2 py-1 border border-outline-variant/60">{children}</td>
            ),
            hr: () => <hr className="my-4 border-outline-variant/60" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownBlock
