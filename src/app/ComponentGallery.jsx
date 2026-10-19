import { useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ChallengeCard from '../components/ChallengeCard'
import ConfirmPopover from '../components/ConfirmPopover'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import ExampleChip from '../components/ExampleChip'
import FighterAvatar from '../components/FighterAvatar'
import HudChip from '../components/HudChip'
import IndeterminateProgressBar from '../components/IndeterminateProgressBar'
import JudgeAvatar from '../components/JudgeAvatar'
import MarkdownBlock from '../components/MarkdownBlock'
import ProblemTextarea from '../components/ProblemTextarea'
import RecommendedRibbon from '../components/RecommendedRibbon'
import ScoreMeter from '../components/ScoreMeter'
import SpeechBubble from '../components/SpeechBubble'
import StatusTicker from '../components/StatusTicker'
import VsEmblem from '../components/VsEmblem'
import WinnerBanner from '../components/WinnerBanner'

const MOCK_SOLUTION = `## Lock-Free Ring Buffer

Here is the winning approach using **atomic CAS** operations:

\`\`\`go
type BoundedRing[T any] struct {
    head  uint64
    tail  uint64
    mask  uint64
    nodes []node[T]
}

func (r *BoundedRing[T]) Push(item T) bool {
    // acquire/release semantics prevent races
    return true
}
\`\`\`

Key points:

- Zero allocations after init
- Cache-line padding avoids false sharing
- \`O(1)\` amortized enqueue/dequeue
`

/** @param {{ title: string, children: React.ReactNode }} props */
function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-space-md p-space-lg rounded-xl bg-surface-container panel-inset">
      <h2 className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-tertiary">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-space-md">{children}</div>
    </section>
  )
}

/**
 * Temporary Phase 1 visual gallery — every component in every state with
 * mock props, for review against the Stitch designs. Reachable at ?gallery=1
 * and removed at the end of Phase 2.
 */
function ComponentGallery() {
  const [problem, setProblem] = useState('Write an optimal lock-free ring buffer in Go.')
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-container-lowest arena-grid-bg">
      <div className="w-full max-w-[1440px] mx-auto px-space-lg py-space-xl flex flex-col gap-space-xl">
        <header className="flex flex-col gap-1">
          <span className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-primary">
            Phase 1 · Temporary Review Surface
          </span>
          <h1 className="font-display text-display-hero-mobile sm:text-display-hero uppercase text-on-surface">
            Arcade HUD Component Matrix
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Every Phase 1 component in all states — matched to the Stitch
            &ldquo;Cybernetic Arena HUD&rdquo; designs.
          </p>
        </header>

        <Section title="1 · Buttons">
          <Button variant="primary" size="md" icon="bolt">
            Primary
          </Button>
          <Button variant="rival" size="md" icon="bolt">
            Rival
          </Button>
          <Button variant="fight" size="lg" icon="swords">
            Fight!
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="danger" size="md" icon="restart_alt">
            Danger
          </Button>
          <Button variant="primary" size="md" loading>
            Loading
          </Button>
          <Button variant="fight" size="lg" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </Section>

        <Section title="2 · Chips & Badges">
          <ExampleChip label="Optimal Cache Eviction (Go)" emoji="⚡" />
          <ExampleChip label="Anti-Hallucination Guardrail" emoji="🛡️" selected />
          <ExampleChip label="Fighter 2 pick" emoji="🎮" tone="2" />
          <ExampleChip label="Disabled chip" disabled />
          <HudChip tone="fighter1">ARMED</HudChip>
          <HudChip tone="fighter2" dot>
            STREAMING
          </HudChip>
          <HudChip tone="judge" icon="gavel">
            STATUS: LISTENING
          </HudChip>
          <HudChip tone="error">TIMEOUT</HudChip>
          <Badge tone="judge" icon="military_tech" size="md">
            Recommended Code
          </Badge>
          <Badge tone="fighter1" icon="verified">
            Consensus Certified
          </Badge>
          <Badge tone="fighter2" icon="shield">
            Zero Hallucinations
          </Badge>
          <Badge tone="neutral">Runner-Up</Badge>
          <Badge tone="error" icon="dangerous">
            Fault
          </Badge>
        </Section>

        <Section title="3 · Avatars & VS">
          <FighterAvatar side="1" variant="idle" size="sm" name="Idle P1" />
          <FighterAvatar side="1" variant="charging" size="md" name="Charging" />
          <FighterAvatar side="1" variant="winner" size="md" name="Winner" />
          <FighterAvatar side="1" variant="knockedOut" size="sm" name="KO" />
          <FighterAvatar side="2" variant="idle" size="md" name="Idle P2" />
          <FighterAvatar side="2" variant="waiting" size="sm" name="Waiting" />
          <FighterAvatar side="2" variant="loser" size="sm" name="Loser" />
          <VsEmblem size="md" label="MATCH READY" />
          <VsEmblem size="lg" label="ROUND 01" />
          <JudgeAvatar variant="idle" size="md" label="Idle" />
          <JudgeAvatar variant="deliberating" size="lg" label="Deliberating" />
          <JudgeAvatar variant="verdict" size="md" label="Verdict" />
        </Section>

        <Section title="4 · Score Meters & Progress">
          <ScoreMeter score={9.6} side="1" className="w-64" label="Fighter 1" />
          <ScoreMeter score={7.8} side="2" className="w-64" label="Fighter 2" />
          <ScoreMeter score={0} side="1" animate={false} className="w-48" label="Empty" />
          <ScoreMeter score={10} side="2" animate={false} className="w-48" label="Full" />
          <IndeterminateProgressBar tone="1" className="w-64" label="Fighter 1 charging" />
          <IndeterminateProgressBar tone="2" size="sm" className="w-64" label="Fighter 2" />
          <IndeterminateProgressBar tone="judge" className="w-64" label="Judge" />
        </Section>

        <Section title="5 · Tickers & Bubbles">
          <StatusTicker
            className="w-full max-w-xl"
            lines={[
              'Fighter 1 is sharpening its tokens...',
              'Fighter 2 is warming up its neurons...',
              'Judge is polishing the gavel...',
            ]}
          />
          <SpeechBubble
            className="w-full max-w-md"
            tone="judge"
            label="Arbiter Appraisal"
            text="Outstanding lock-free implementation with proper acquire/release semantics."
          />
          <SpeechBubble
            className="w-full max-w-md"
            tone="fighter1"
            icon="bolt"
            label="Fighter 1"
            mode="fade"
            text="Fade-in variant of the speech bubble for calmer reveals."
          />
          <SpeechBubble className="w-40" tone="judge" typing label="Typing" text="" />
        </Section>

        <Section title="6 · Input, Challenge & Copy">
          <ChallengeCard
            className="w-full"
            problem="Implement zero-allocation bounded ring buffer with lock-free atomics in Go"
            phaseLabel="PHASE: INFERENCE GENERATION"
          />
          <ProblemTextarea
            className="w-full"
            value={problem}
            onChange={setProblem}
            onSubmit={() => {}}
          />
          <CopyButton text="Hello arena" />
          <CopyButton text="Hello arena" tone="fighter1" size="md" />
        </Section>

        <Section title="7 · Markdown + Code">
          <MarkdownBlock className="w-full max-w-2xl" content={MOCK_SOLUTION} />
        </Section>

        <Section title="8 · Winner & Ribbon">
          <WinnerBanner
            className="w-full"
            outcome="fighter1"
            winnerLabel="NEXUS-7"
            subtitle="Awarded high marks for strict zero-unsafe memory encapsulation."
            showConfetti={false}
            actions={<Button variant="primary" size="sm" icon="replay">Rematch</Button>}
          />
          <WinnerBanner
            className="w-full"
            outcome="draw"
            showConfetti={false}
            subtitle="Both contenders achieved zero-defect output."
          />
          <div className="relative p-space-lg rounded-xl bg-surface-container-low glow-fighter-1 overflow-hidden">
            <RecommendedRibbon pinned />
            <span className="font-display text-headline-md text-primary">WINNER CARD</span>
          </div>
          <RecommendedRibbon />
        </Section>

        <Section title="9 · Empty, Error & Confirm">
          <EmptyState
            className="w-full max-w-md"
            title="No battles yet"
            message="Throw the first problem into the arena."
            action={<Button variant="primary" size="sm" icon="swords">Enter the Arena</Button>}
          />
          <ErrorMessage
            className="w-full"
            codeLabel="[EXCEPTION: TIMEOUT_120S]"
            message="The judge never returned. Your problem statement has been preserved."
            onRetry={() => {}}
            onAbort={() => {}}
          />
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            Open Confirm Popover
          </Button>
          <ConfirmPopover
            open={confirmOpen}
            title="Clear session log?"
            message="This deletes every battle stored in this browser session. It cannot be undone."
            confirmLabel="Clear all"
            onConfirm={() => setConfirmOpen(false)}
            onCancel={() => setConfirmOpen(false)}
          />
        </Section>
      </div>
    </div>
  )
}

export default ComponentGallery
