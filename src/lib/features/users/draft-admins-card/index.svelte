<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import {
    type CandidateSenderEntry,
    deriveSenderRole,
    type RegisteredAdmin,
  } from '$lib/features/users/types';
  import type { schema } from '$lib/server/database/drizzle';

  export interface Props {
    id?: string;
    selfUserId: schema.User['id'];
    registeredAdmins: RegisteredAdmin[];
    candidateSenders: CandidateSenderEntry[];
    headerAction?: Snippet;
  }
</script>

<script lang="ts">
  import * as Card from '$lib/components/ui/card';

  import AdminRow from './admin-row.svelte';
  import SenderTimeline from './sender-timeline.svelte';

  const { id, selfUserId, registeredAdmins, candidateSenders, headerAction }: Props = $props();

  const designated = $derived.by(() => {
    const active = candidateSenders.find(({ isActive }) => isActive);
    if (typeof active === 'undefined') return;
    return {
      givenName: active.givenName,
      familyName: active.familyName,
      email: active.email,
    };
  });
</script>

<Card.Root {id}>
  <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
    <Card.Title class="text-2xl">Draft Administrators</Card.Title>
    {@render headerAction?.()}
  </Card.Header>
  <Card.Content class="space-y-6">
    <SenderTimeline candidateCount={candidateSenders.length} {designated} />
    {#if registeredAdmins.length === 0}
      <p class="text-sm text-muted-foreground">No registered users.</p>
    {:else}
      <ul class="space-y-2">
        {#each registeredAdmins as admin (admin.id)}
          <li>
            <AdminRow
              user={admin}
              isSelf={admin.id === selfUserId}
              role={deriveSenderRole(admin.id, candidateSenders)}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </Card.Content>
</Card.Root>
