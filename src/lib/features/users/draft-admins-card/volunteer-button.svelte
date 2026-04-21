<script lang="ts" module>
  export interface Props {
    size?: 'default' | 'sm';
  }
</script>

<script lang="ts">
  import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';

  import { Button } from '$lib/components/ui/button';

  const { size = 'sm' }: Props = $props();
</script>

<form method="get" action="/dashboard/oauth/login" class="contents">
  <input type="hidden" name="extended" value="1" />
  <Button type="submit" {size}>
    <ShieldAlertIcon class="size-4" />
    <span>Volunteer as Candidate Sender</span>
  </Button>
</form>
