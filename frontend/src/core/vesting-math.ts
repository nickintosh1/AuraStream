export interface VestingProgress {
  vested: number;
  progress: number;
}

/**
 * Linear vesting accrual, mirrors the on-chain calculation in
 * contracts/vesting_flow/src/lib.rs (unlocked_balance).
 */
export function calculateVestingProgress(
  nowSeconds: number,
  commencement: number,
  vestingPeriod: number,
  principal: number,
): VestingProgress {
  const elapsed = Math.max(0, nowSeconds - commencement);

  const vested = elapsed >= vestingPeriod ? principal : (principal * elapsed) / vestingPeriod;
  const progress = Math.min(100, (elapsed / vestingPeriod) * 100);

  return { vested, progress };
}

export function calculateWithdrawable(vested: number, claimedAmount: number): number {
  return Math.max(0, vested - claimedAmount);
}
