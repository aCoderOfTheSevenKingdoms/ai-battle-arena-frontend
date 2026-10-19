import ComponentGallery from './ComponentGallery.jsx'

const isGallery =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('gallery') === '1'

function App() {
  if (isGallery) return <ComponentGallery />

  return (
    <div className="min-h-screen bg-surface-container-lowest arena-grid-bg flex items-center justify-center p-space-lg">
      <div className="text-center flex flex-col gap-space-md items-center">
        <h1 className="font-display text-display-hero-mobile sm:text-display-hero uppercase text-on-surface">
          AI Battle Arena
        </h1>
        <p className="font-body text-body-md text-on-surface-variant max-w-md">
          Phase 1 component gallery is live at{' '}
          <a href="?gallery=1" className="text-primary underline underline-offset-2">
            ?gallery=1
          </a>
          . Full arena assembly lands in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default App
