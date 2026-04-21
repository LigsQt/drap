// The `draft-admins-card/sender-timeline.svelte` component reuses
// `$lib/features/drafts/timeline/step.svelte` via cross-feature import. See
// `$lib/features/AGENTS.md` for the module composition convention.
export { default as DraftAdminsCard } from './draft-admins-card/index.svelte';

export type { CandidateSenderEntry, RegisteredAdmin, SenderRole } from './types';
