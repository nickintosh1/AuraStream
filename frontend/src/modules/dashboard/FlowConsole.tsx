'use client';

import React, { useState } from 'react';
import { VestingFlowInfo } from '../../core/stellar';
import { VestingCard } from './VestingCard';
import { Columns, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface FlowConsoleProps {
  flows: VestingFlowInfo[];
  currentUserAddress: string;
  onClaim: (flowId: number) => Promise<void>;
  onRevoke: (flowId: number) => Promise<void>;
  loadingClaimId: number | null;
  loadingRevokeId: number | null;
  refreshing: boolean;
}

export const FlowConsole: React.FC<FlowConsoleProps> = ({
  flows,
  currentUserAddress,
  onClaim,
  onRevoke,
  loadingClaimId,
  loadingRevokeId,
  refreshing,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');

  const sentFlows = flows.filter(f => f.depositor.toLowerCase() === currentUserAddress.toLowerCase());
  const receivedFlows = flows.filter(f => f.beneficiary.toLowerCase() === currentUserAddress.toLowerCase());

  const filteredFlows = 
    activeTab === 'sent' 
      ? sentFlows 
      : activeTab === 'received' 
        ? receivedFlows 
        : flows;

  return (
    <div className="space-y-6">
      {/* Tabs / Filtering */}
      <div className="flex glass-panel p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'all' ? 'bg-white/60 text-violet-800 shadow-sm' : 'hover:bg-white/30 text-indigo-900/60 hover:text-indigo-950'
          }`}
        >
          <Columns size={12} />
          All ({flows.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'sent' ? 'bg-white/60 text-violet-800 shadow-sm' : 'hover:bg-white/30 text-indigo-900/60 hover:text-indigo-950'
          }`}
        >
          <ArrowUpRight size={12} />
          Sent ({sentFlows.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'received' ? 'bg-white/60 text-violet-800 shadow-sm' : 'hover:bg-white/30 text-indigo-900/60 hover:text-indigo-950'
          }`}
        >
          <ArrowDownLeft size={12} />
          Recv ({receivedFlows.length})
        </button>
      </div>

      {/* Grid of Flows */}
      {refreshing && flows.length === 0 ? (
        <div className="flex items-center justify-center py-12 border border-dashed border-white/50 glass-panel rounded-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-900/50 animate-pulse">
            Syncing ledger state...
          </p>
        </div>
      ) : filteredFlows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/50 glass-panel rounded-2xl">
          <p className="font-mono text-sm uppercase tracking-wider text-indigo-950 font-bold mb-2">
            No flows found
          </p>
          <p className="font-mono text-xs text-indigo-900/60 max-w-xs text-center">
            {activeTab === 'all' 
              ? "You don't have any active vesting flows. Create one to begin vesting tokens."
              : activeTab === 'sent'
                ? "You haven't initiated any vesting flows yet."
                : "You aren't the beneficiary of any vesting flows yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
            <VestingCard
              key={flow.id}
              flow={flow}
              currentUserAddress={currentUserAddress}
              onClaim={onClaim}
              onRevoke={onRevoke}
              loadingClaim={loadingClaimId === flow.id}
              loadingRevoke={loadingRevokeId === flow.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
