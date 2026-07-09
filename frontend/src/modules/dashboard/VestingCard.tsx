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
    <div className="border border-white/10 glass-panel rounded-lg flex flex-col justify-between h-full shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white/10 text-white font-mono text-[9px] font-bold rounded uppercase">
            ID: #{flow.id}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
            {isDepositor ? 'Depositor' : isBeneficiary ? 'Beneficiary' : 'Vesting'}
          </span>
        </div>
        <div>
          {isDepositor ? (
            <ArrowUpRight size={14} className="text-white/50" />
          ) : (
            <ArrowDownLeft size={14} className="text-emerald-500" />
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-4 flex-grow">
        {/* Addresses */}
        <div className="space-y-1 bg-black/20 p-3 rounded-md font-mono text-[10px] text-white/60 border border-white/5">
          <div className="flex justify-between">
            <span className="font-semibold uppercase">From:</span>
            <span className="text-white">{flow.depositor.slice(0, 8)}...{flow.depositor.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold uppercase">To:</span>
            <span className="text-white">{flow.beneficiary.slice(0, 8)}...{flow.beneficiary.slice(-8)}</span>
          </div>
        </div>

        {/* Hero Vesting Ticker */}
        <div className="text-center py-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-semibold mb-1">
            Unlocked / Principal
          </p>
          <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className="text-2xl font-bold tabular-nums text-white tracking-tight">
              {liveVested.toFixed(4)}
            </span>
            <span className="text-xs text-white/50">/ {flow.principal.toFixed(0)} AURA</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase">
            <span className="text-white/50">Progress</span>
            <span className="text-white">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 rounded-full transition-all duration-100 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Claim State Info */}
        <div className="p-3 bg-cyan-900/30 border border-cyan-500/30/50 rounded-lg border border-indigo-100/50 font-mono text-xs space-y-1 text-white/80">
          <div className="flex justify-between">
            <span className="text-white/50 uppercase font-medium">Claimed:</span>
            <span className="font-semibold text-white">{flow.claimedAmount.toFixed(2)} AURA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 uppercase font-medium">Withdrawable:</span>
            <span className="font-bold text-cyan-400">{withdrawable.toFixed(4)} AURA</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2.5 rounded-b-lg">
        {isBeneficiary ? (
          <button
            onClick={() => onClaim(flow.id)}
            disabled={loadingClaim || withdrawable <= 0 || isCompleted}
            className="flex-grow py-2 bg-white/10 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold rounded-md text-xs transition-colors shadow-[0_0_15px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed"
          >
            {loadingClaim ? 'Claiming...' : isCompleted ? 'Completed' : `Claim ${withdrawable.toFixed(2)} AURA`}
          </button>
        ) : (
          <div className="flex-grow flex items-center justify-center gap-1 py-2 border border-dashed border-white/10 bg-white/5/30 rounded-md font-mono text-[10px] text-white/50 font-semibold uppercase">
            <ShieldAlert size={12} />
            Beneficiary Only
          </div>
        )}

        {isDepositor && !isFullyVested && !isCompleted && (
          <button
            onClick={() => onRevoke(flow.id)}
            disabled={loadingRevoke}
            title="Revoke Flow"
            className="p-2 border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-md transition-all disabled:opacity-50"
          >
            <XCircle size={14} className="stroke-[2]" />
          </button>
        )}
      </div>
    </div>
  );
};
