import { describe, it, expect } from 'vitest';
import { calculateVestingProgress, calculateWithdrawable } from './vesting-math';

describe('calculateVestingProgress', () => {
  it('reports nothing vested before commencement', () => {
    const { vested, progress } = calculateVestingProgress(100, 200, 1000, 5000);
    expect(vested).toBe(0);
    expect(progress).toBe(0);
  });

  it('accrues linearly at the halfway point', () => {
    const { vested, progress } = calculateVestingProgress(1500, 1000, 1000, 5000);
    expect(vested).toBe(2500);
    expect(progress).toBe(50);
  });

  it('caps at full principal once the vesting period has elapsed', () => {
    const { vested, progress } = calculateVestingProgress(5000, 1000, 1000, 5000);
    expect(vested).toBe(5000);
    expect(progress).toBe(100);
  });

  it('does not exceed 100% progress long after full vesting', () => {
    const { progress } = calculateVestingProgress(100_000, 1000, 1000, 5000);
    expect(progress).toBe(100);
  });
});

describe('calculateWithdrawable', () => {
  it('returns the unclaimed portion of vested funds', () => {
    expect(calculateWithdrawable(2500, 1000)).toBe(1500);
  });

  it('never goes negative when claimed exceeds the current vested snapshot', () => {
    expect(calculateWithdrawable(1000, 1500)).toBe(0);
  });

  it('returns zero when nothing has vested yet', () => {
    expect(calculateWithdrawable(0, 0)).toBe(0);
  });
});
