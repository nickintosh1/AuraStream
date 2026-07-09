'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AccountConnector } from '../modules/wallet-manager/AccountConnector';
import { FlowInitiator } from '../modules/flow-creator/FlowInitiator';
import { FlowConsole } from '../modules/dashboard/FlowConsole';
import { AuditLog, AuditEvent } from '../modules/dashboard/AuditLog';
import {
  connectWallet,
  getTokenBalance,
  fetchUserFlows,
  getVestingFlowDetails,
  initiateVesting,
  claimUnlockedFlow,
  revokeVestingFlow,
  VestingFlowInfo,
  addTokenToWallet,
  mintTokens,
} from '../core/stellar';
import { ShieldCheck, Layers, RefreshCw } from 'lucide-react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [flows, setFlows] = useState<VestingFlowInfo[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  
  const [connecting, setConnecting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingClaimId, setLoadingClaimId] = useState<number | null>(null);
  const [loadingRevokeId, setLoadingRevokeId] = useState<number | null>(null);
  
  const [errorNotice, setErrorNotice] = useState<{ message: string; type: 'error' | 'info' | 'warning' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Parse error messages into user-friendly notices
  const parseError = (err: unknown) => {
    let msg = '';
    if (err instanceof Error) {
      msg = err.message;
    } else if (err && typeof err === 'object') {
      if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
        msg = (err as Record<string, unknown>).message as string;
      } else {
        try {
          msg = JSON.stringify(err);
        } catch {
          msg = String(err);
        }
      }
    } else {
      msg = String(err);
    }

    if (!msg || msg === '{}' || msg === '[object Object]') {
      msg = 'An unknown wallet or network error occurred.';
    }

    console.error('Captured Error:', msg);

    if (msg.toLowerCase().includes('freighter') && msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('wallet not found')) {
      return {
        message: 'Freighter extension not found. Please install Freighter from freighter.app to connect.',
        type: 'warning' as const,
      };
    }
    if (msg.toLowerCase().includes('user reject') || msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('declined') || msg.toLowerCase().includes('closed')) {
      return {
        message: 'Signature request cancelled. No changes were made.',
        type: 'info' as const,
      };
    }
    if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('balance')) {
      return {
        message: 'Insufficient balance to complete the transaction.',
        type: 'error' as const,
      };
    }
    return {
      message: msg || 'Transaction failed. Please try again.',
      type: 'error' as const,
    };
  };

  const loadBlockchainData = useCallback(async (userAddress: string) => {
    if (!userAddress) return;
    setRefreshing(true);
    setErrorNotice(null);
    try {
      // Get balance
      const tokenBal = await getTokenBalance(userAddress);
      setBalance(tokenBal);

      // Get flows list
      const flowIds = await fetchUserFlows(userAddress);
      
      const flowList: VestingFlowInfo[] = [];
      for (const id of flowIds) {
        const details = await getVestingFlowDetails(id);
        if (details) {
          flowList.push(details);
        }
      }
      setFlows(flowList);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setErrorNotice(null);
    try {
      const walletAddr = await connectWallet();
      setAddress(walletAddr);
      await loadBlockchainData(walletAddr);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setBalance(0);
    setFlows([]);
    setErrorNotice({
      message: 'Wallet disconnected successfully.',
      type: 'info',
    });
  };

  const handleAddToken = async () => {
    setErrorNotice(null);
    try {
      setErrorNotice({
        message: 'Requesting to add AURA to Freighter...',
        type: 'info',
      });
      await addTokenToWallet();
      setErrorNotice({
        message: 'AURA token successfully added/verified in your Freighter wallet!',
        type: 'info',
      });
    } catch (err) {
      setErrorNotice(parseError(err));
    }
  };

  const handleMintTokens = async () => {
    if (!address) return;
    setErrorNotice(null);
    try {
      setErrorNotice({
        message: 'Minting 1000 AURA from the testnet faucet... Please wait.',
        type: 'info',
      });
      const txHash = await mintTokens(address, 1000);
      setErrorNotice({
        message: `Successfully minted 1000 AURA to your wallet! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });
      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    }
  };

  const handleCreateFlow = async (recipient: string, amount: number, duration: number) => {
    setCreating(true);
    setErrorNotice(null);
    try {
      const txHash = await initiateVesting(address, recipient, amount, duration);
      
      // Add event to feed
      const newEvent: AuditEvent = {
        id: Math.random().toString(),
        type: 'initiated',
        flowId: flows.length + 1, // temporary mock ID calculation for feed
        amount,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Vesting flow of ${amount} AURA initiated successfully! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      // Reload
      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleClaim = async (flowId: number) => {
    setLoadingClaimId(flowId);
    setErrorNotice(null);
    try {
      const txHash = await claimUnlockedFlow(address, flowId);

      // Find flow details to log amount
      const targetFlow = flows.find(f => f.id === flowId);
      const amountClaimed = targetFlow ? (targetFlow.principal - targetFlow.claimedAmount) : 0; // estimation

      const newEvent: AuditEvent = {
        id: Math.random().toString(),
        type: 'claimed',
        flowId,
        amount: amountClaimed,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Tokens claimed successfully! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setLoadingClaimId(null);
    }
  };

  const handleRevoke = async (flowId: number) => {
    setLoadingRevokeId(flowId);
    setErrorNotice(null);
    try {
      const txHash = await revokeVestingFlow(address, flowId);

      const newEvent: AuditEvent = {
        id: Math.random().toString(),
        type: 'revoked',
        flowId,
        amount: 0, // remainder returned
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Vesting flow revoked successfully. Remaining unvested funds returned to depositor. Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setLoadingRevokeId(null);
    }
  };

  // Poll blockchain data every 8 seconds when connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      loadBlockchainData(address);
    }, 8000);
    return () => clearInterval(interval);
  }, [address, loadBlockchainData]);

  return (
    <main className="min-h-screen text-indigo-950 pb-16">
      {/* Top Banner Wallet Panel */}
      <AccountConnector
        address={address}
        balance={balance}
        connecting={connecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRefreshBalance={() => loadBlockchainData(address)}
        onAddTokenToWallet={handleAddToken}
        onMintTokens={handleMintTokens}
      />

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* User feedback / alerts panel */}
        {errorNotice && (
          <div 
            className={`p-4 font-mono text-xs rounded-2xl flex items-center justify-between glass-panel transition-all ${
              errorNotice.type === 'error'
                ? 'text-rose-700 border-rose-200/70'
                : errorNotice.type === 'warning'
                  ? 'text-amber-700 border-amber-200/70'
                  : 'text-indigo-800 border-white/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">[{errorNotice.type.toUpperCase()}]</span>
              <span>{errorNotice.message}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="font-bold font-mono text-[10px] uppercase ml-4 text-indigo-900/70 glass-button px-2 py-0.5 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {address ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left panels: forms & logs */}
            <div className="lg:col-span-1 space-y-8">
              <FlowInitiator
                balance={balance}
                onSubmit={handleCreateFlow}
                loading={creating}
              />

              <AuditLog events={events} />
            </div>

            {/* Right panel: Active flows board */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-white/40 pb-2 mb-4">
                <h2 className="text-md font-bold uppercase tracking-tight text-indigo-950 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-violet-700" />
                  Active Vesting Flows
                </h2>
                {refreshing && (
                  <span className="font-mono text-[9px] text-indigo-900/50 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                    <RefreshCw size={10} className="animate-spin" />
                    Syncing...
                  </span>
                )}
              </div>

              <FlowConsole
                flows={flows}
                currentUserAddress={address}
                onClaim={handleClaim}
                onRevoke={handleRevoke}
                loadingClaimId={loadingClaimId}
                loadingRevokeId={loadingRevokeId}
                refreshing={refreshing}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl max-w-lg mx-auto text-center p-8 mt-12">
            <div className="w-12 h-12 accent-button flex items-center justify-center rounded-2xl mb-5">
              <Layers size={24} className="stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-indigo-950 mb-2">
              Connect to Vesting Console
            </h2>
            <p className="text-xs text-indigo-900/60 max-w-sm mb-6 leading-relaxed">
              Connect your Freighter or other Stellar wallet to initiate, monitor, and claim vesting payment flows in real time.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 accent-button disabled:opacity-50 font-semibold rounded-xl text-sm"
            >
              {connecting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Connecting Wallet...
                </>
              ) : (
                <>
                  <Layers size={14} className="stroke-[2]" />
                  Unlock AuraStream
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
