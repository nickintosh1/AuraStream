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
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between glass-panel rounded-none rounded-b-3xl border-t-0 p-5 md:px-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 accent-button rounded-xl">
          <Layers size={20} className="stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-950">
            AuraStream
          </h1>
          <p className="text-[10px] font-mono text-indigo-900/50 uppercase tracking-wider">
            Stellar Soroban Linear Vesting
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {address ? (
          <>
            <div className="flex items-center gap-2 px-3.5 py-1.5 glass-input rounded-xl font-mono text-xs text-indigo-900/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {address.slice(0, 6)}...{address.slice(-6)}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 glass-input rounded-xl font-mono text-xs text-indigo-900/80">
              <span className="text-indigo-900/50 text-[10px] uppercase font-semibold">Balance:</span>
              <span className="text-indigo-950 font-bold text-sm">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              <span className="text-violet-700 font-bold text-[10px]">AURA</span>
              <button
                onClick={onRefreshBalance}
                className="ml-1 p-0.5 hover:bg-white/60 rounded transition-colors text-indigo-900/60"
                title="Refresh balance"
              >
                <RefreshCw size={12} className="stroke-[2]" />
              </button>
            </div>

            <button
              onClick={onAddTokenToWallet}
              className="px-3.5 py-1.5 glass-button text-indigo-900/80 font-semibold rounded-xl text-xs"
            >
              Add AURA to Wallet
            </button>

            <button
              onClick={onMintTokens}
              className="px-3.5 py-1.5 glass-button text-indigo-900/80 font-semibold rounded-xl text-xs"
            >
              Mint 1000 AURA (Faucet)
            </button>

            <button
              onClick={onDisconnect}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 accent-button font-semibold rounded-xl text-xs"
            >
              <LogOut size={12} className="stroke-[2]" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 accent-button disabled:opacity-50 font-semibold rounded-xl text-sm"
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
