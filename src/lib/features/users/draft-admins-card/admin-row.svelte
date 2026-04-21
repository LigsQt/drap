<script lang="ts" module>
  import type { RegisteredAdmin, SenderRole } from '$lib/features/users/types';

  export interface Props {
    user: RegisteredAdmin;
    isSelf: boolean;
    role: SenderRole;
  }
</script>

<script lang="ts">
  import UserCircleIcon from '@lucide/svelte/icons/circle-user';

  import * as Avatar from '$lib/components/ui/avatar';
  import { cn } from '$lib/components/ui/utils';

  import AdminActions from './admin-actions.svelte';
  import RoleBadge from './role-badge.svelte';
  import VolunteerButton from './volunteer-button.svelte';

  const { user, isSelf, role }: Props = $props();

  const rowClass = $derived.by(() => {
    switch (role) {
      case 'designated':
        return 'ring-2 ring-success/50 bg-success/5';
      case 'candidate':
      case 'none':
        return 'bg-muted';
      default:
        throw new Error('unreachable');
    }
  });
</script>

<div
  class={cn(
    'flex flex-wrap items-center gap-3 rounded-lg p-2 transition-colors duration-150',
    rowClass,
  )}
>
  <Avatar.Root class="size-12 shrink-0">
    <Avatar.Image src={user.avatarUrl} alt="{user.givenName} {user.familyName}" />
    <Avatar.Fallback>
      <UserCircleIcon class="size-12" />
    </Avatar.Fallback>
  </Avatar.Root>
  <div class="min-w-0 grow">
    <div class="flex flex-wrap items-center gap-2">
      <strong class="truncate"
        ><span class="uppercase">{user.familyName}</span>, {user.givenName}</strong
      >
      <RoleBadge {role} />
    </div>
    <a
      href="mailto:{user.email}"
      class="block truncate text-sm opacity-70 hover:underline hover:opacity-100"
    >
      {user.email}
    </a>
  </div>
  {#if role === 'none'}
    {#if isSelf}
      <VolunteerButton />
    {/if}
  {:else}
    <AdminActions userId={user.id} {role} />
  {/if}
</div>
