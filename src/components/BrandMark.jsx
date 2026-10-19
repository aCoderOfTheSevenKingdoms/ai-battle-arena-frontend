/**
 * App wordmark: the crossed-swords glyph, the product name, and an optional
 * tagline. Presentational only — the same mark serves the landing hero and the
 * compact arena console.
 *
 * @param {object} props
 * @param {'h1' | 'div'} [props.as='div'] Wrapper element; use `h1` for the landing hero.
 * @param {'sm' | 'lg'} [props.size='lg']
 * @param {boolean} [props.showTagline=true]
 * @param {string} [props.className]
 */
function BrandMark({ as: Wrapper = 'div', size = 'lg', showTagline = true, className = '' }) {
  const large = size === 'lg'

  return (
    <Wrapper
      className={['flex items-center gap-space-sm', className].filter(Boolean).join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'material-symbols-outlined text-primary leading-none shrink-0',
          large ? 'text-[28px]' : 'text-[22px]',
        ].join(' ')}
      >
        swords
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={[
            'font-display font-bold uppercase leading-none tracking-wider text-primary text-glow-fighter-1',
            large ? 'text-headline-lg-mobile sm:text-headline-lg' : 'text-[15px]',
          ].join(' ')}
        >
          AI Battle Arena
        </span>
        {showTagline && (
          <span className="mt-space-xs font-display text-label-caps text-on-surface-variant">
            DUAL MODEL SYNTHESIS &amp; JUDICIAL BENCHMARK
          </span>
        )}
      </span>
    </Wrapper>
  )
}

export default BrandMark
