import type { CurrentUser } from "~/lib/api";

/** The nickname to greet, or null for signed-out and anonymous visitors (who have no nickname to show). */
export function nicknameToShow(me: CurrentUser): string | null {
  if (!me.authenticated || !me.user || me.user.isAnonymous) return null;
  return me.user.login;
}
