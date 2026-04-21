import type { schema } from '$lib/server/database/drizzle';

export type SenderRole = 'none' | 'candidate' | 'designated';

export type RegisteredAdmin = Pick<
  schema.User,
  'id' | 'email' | 'givenName' | 'familyName' | 'avatarUrl'
>;

export interface CandidateSenderEntry {
  id: schema.User['id'];
  email: schema.User['email'];
  givenName: schema.User['givenName'];
  familyName: schema.User['familyName'];
  avatarUrl: schema.User['avatarUrl'];
  isActive: boolean;
}

export function deriveSenderRole(
  userId: schema.User['id'],
  candidateSenders: readonly CandidateSenderEntry[],
): SenderRole {
  const entry = candidateSenders.find(({ id }) => id === userId);
  if (typeof entry === 'undefined') return 'none';
  return entry.isActive ? 'designated' : 'candidate';
}
