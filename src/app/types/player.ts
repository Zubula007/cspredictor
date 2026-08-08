export type PlayerApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface Player {
  id: string;

  displayName: string;

  joinedAt: string;

  active: boolean;

  isAdmin: boolean;

  /**
   * Player login username.
   *
   * Optional for existing players until
   * the new registration system is introduced.
   */
  username?: string;

  /**
   * Password is never stored directly.
   *
   * The authentication system will store
   * a password hash here.
   */
  passwordHash?: string;

  /**
   * New players begin as PENDING.
   * Admin approval changes this to APPROVED.
   */
  approvalStatus?: PlayerApprovalStatus;
}