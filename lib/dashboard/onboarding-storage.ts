const STORAGE_PREFIX = "dui-checkpoints-onboarding-done:";

export function onboardingStorageKey(userEmail: string): string {
  return `${STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
}

export function isOnboardingComplete(userEmail: string): boolean {
  if (typeof window === "undefined" || !userEmail) return true;
  try {
    return window.localStorage.getItem(onboardingStorageKey(userEmail)) === "1";
  } catch {
    return true;
  }
}

export function setOnboardingComplete(userEmail: string): void {
  if (typeof window === "undefined" || !userEmail) return;
  try {
    window.localStorage.setItem(onboardingStorageKey(userEmail), "1");
  } catch {
    /* ignore */
  }
}
