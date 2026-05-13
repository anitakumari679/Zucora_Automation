/**
 * Holds auth tokens received during API tests so other specs can reuse them.
 * Mutate only after successful login + OTP verification.
 */
export const authStorage = {
  accessToken: null as string | null,

  clear(): void {
    this.accessToken = null;
  },
};
