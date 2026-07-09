'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, XCircle, ShieldAlert } from 'lucide-react';
import { VestingFlowInfo } from '../../core/stellar';
import { calculateVestingProgress, calculateWithdrawable } from '../../core/vesting-math';

interface VestingCardProps {
  flow: VestingFlowInfo;
  currentUserAddress: string;
  onClaim: (flowId: number) => Promise<void>;
  onRevoke: (flowId: number) => Promise<void>;
  loadingClaim: boolean;
  loadingRevoke: boolean;
}

export const VestingCard: React.FC<VestingCardProps> = ({
  flow,
  currentUserAddress,
  onClaim,
  onRevoke,
  loadingClaim,
  loadingRevoke,
}) => {
  const isDepositor = currentUserAddress.toLowerCase() === flow.depositor.toLowerCase();
  const isBeneficiary = currentUserAddress.toLowerCase() === flow.beneficiary.toLowerCase();

  const [liveVested, setLiveVested] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTicker = () => {
      const now = Math.floor(Date.now() / 1000);
      const { vested, progress } = calculateVestingProgress(
        now,
        flow.commencement,
        flow.vestingPeriod,
        flow.principal,
      );

      setLiveVested(vested);
      setProgress(progress);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 100); // Smooth update every 100ms

    return () => clearInterval(interval);
  }, [flow]);

  const withdrawable = calculateWithdrawable(liveVested, flow.claimedAmount);
  const isFullyVested = progress >= 100;
  const isCompleted = flow.claimedAmount >= flow.principal;

  return (
    <div className="glass-panel rounded-3xl flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(76,29,149,0.16)]">
      {/* Top Header */}
      <div className="p-4 border-b border-white/40 bg-white/20 flex items-center justify-between rounded-t-3xl">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 accent-button font-mono text-[9px] font-bold rounded-lg uppercase">
            ID: #{flow.id}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-900/50">
            {isDepositor ? 'Depositor' : isBeneficiary ? 'Beneficiary' : 'Vesting'}
          </span>
        </div>
        <div>
          {isDepositor ? (
            <ArrowUpRight size={14} className="text-indigo-900/50" />
          ) : (
            <ArrowDownLeft size={14} className="text-emerald-600" />
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-4 flex-grow">
        {/* Addresses */}
        <div className="space-y-1 glass-input p-3 rounded-xl font-mono text-[10px] text-indigo-900/60">
          <div className="flex justify-between">
            <span className="font-semibold uppercase">From:</span>
            <span className="text-indigo-950">{flow.depositor.slice(0, 8)}...{flow.depositor.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold uppercase">To:</span>
            <span className="text-indigo-950">{flow.beneficiary.slice(0, 8)}...{flow.beneficiary.slice(-8)}</span>
          </div>
        </div>

        {/* Hero Vesting Ticker */}
        <div className="text-center py-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-900/50 font-semibold mb-1">
            Unlocked / Principal
          </p>
          <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className="text-2xl font-bold tabular-nums text-gradient tracking-tight">
              {liveVested.toFixed(4)}
            </span>
            <span className="text-xs text-indigo-900/50">/ {flow.principal.toFixed(0)} AURA</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase">
            <span className="text-indigo-900/50">Progress</span>
            <span className="text-indigo-950">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Claim State Info */}
        <div className="p-3 glass-panel rounded-2xl font-mono text-xs space-y-1 text-indigo-900/80">
          <div className="flex justify-between">
            <span className="text-indigo-900/50 uppercase font-medium">Claimed:</span>
            <span className="font-semibold text-indigo-950">{flow.claimedAmount.toFixed(2)} AURA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-indigo-900/50 uppercase font-medium">Withdrawable:</span>
            <span className="font-bold text-violet-700">{withdrawable.toFixed(4)} AURA</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-white/40 bg-white/20 flex gap-2.5 rounded-b-3xl">
        {isBeneficiary ? (
          <button
            onClick={() => onClaim(flow.id)}
            disabled={loadingClaim || withdrawable <= 0 || isCompleted}
            className="flex-grow py-2 accent-button disabled:opacity-50 font-semibold rounded-xl text-xs disabled:cursor-not-allowed"
          >
            {loadingClaim ? 'Claiming...' : isCompleted ? 'Completed' : `Claim ${withdrawable.toFixed(2)} AURA`}
          </button>
        ) : (
          <div className="flex-grow flex items-center justify-center gap-1 py-2 border border-dashed border-white/50 bg-white/20 rounded-xl font-mono text-[10px] text-indigo-900/50 font-semibold uppercase">
            <ShieldAlert size={12} />
            Beneficiary Only
          </div>
        )}

        {isDepositor && !isFullyVested && !isCompleted && (
          <button
            onClick={() => onRevoke(flow.id)}
            disabled={loadingRevoke}
            title="Revoke Flow"
            className="p-2 border border-rose-200/80 bg-rose-50/60 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all disabled:opacity-50"
          >
            <XCircle size={14} className="stroke-[2]" />
          </button>
        )}
      </div>
    </div>
  );
};
