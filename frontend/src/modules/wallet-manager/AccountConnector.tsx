'use client';

import React from 'react';
import { Wallet, LogOut, RefreshCw, Layers } from 'lucide-react';

interface AccountConnectorProps {
  address: string;
  balance: number;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
  onAddTokenToWallet: () => void;
  onMintTokens: () => void;
}

export const AccountConnector: React.FC<AccountConnectorProps> = ({
  address,
  balance,
  connecting,
  onConnect,
  onDisconnect,
  onRefreshBalance,
  onAddTokenToWallet,
  onMintTokens,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/10 glass-panel p-5 md:px-8 gap-4 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 text-white rounded-lg">
          <Layers size={20} className="stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            AuraStream
          </h1>
          <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            Stellar Soroban Linear Vesting
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {address ? (
          <>
            <div className="flex items-center gap-2 px-3.5 py-1.5 border border-white/10 bg-black/20 rounded-md font-mono text-xs text-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/300 animate-pulse"></span>
              <span>
                {address.slice(0, 6)}...{address.slice(-6)}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 border border-white/10 bg-black/20 rounded-md font-mono text-xs text-white/80">
              <span className="text-white/50 text-[10px] uppercase font-semibold">Balance:</span>
              <span className="text-white font-bold text-sm">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              <span className="text-cyan-400 font-bold text-[10px]">AURA</span>
              <button 
                onClick={onRefreshBalance} 
                className="ml-1 p-0.5 hover:bg-zinc-200 rounded transition-colors text-white/60"
                title="Refresh balance"
              >
                <RefreshCw size={12} className="stroke-[2]" />
              </button>
            </div>

            <button
              onClick={onAddTokenToWallet}
              className="px-3.5 py-1.5 border border-white/10 glass-panel hover:bg-black/20 text-white/80 font-semibold rounded-md text-xs transition-colors shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            >
              Add AURA to Wallet
            </button>

            <button
              onClick={onMintTokens}
              className="px-3.5 py-1.5 border border-white/10 glass-panel hover:bg-black/20 text-white/80 font-semibold rounded-md text-xs transition-colors shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            >
              Mint 1000 AURA (Faucet)
            </button>

            <button
              onClick={onDisconnect}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-zinc-800 text-white font-semibold rounded-md text-xs transition-colors shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            >
              <LogOut size={12} className="stroke-[2]" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 bg-white/10 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold rounded-md text-sm transition-colors shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          >
            {connecting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Connecting Wallet...
              </>
            ) : (
              <>
                <Wallet size={14} className="stroke-[2]" />
                Connect Wallet
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
