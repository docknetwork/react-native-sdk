import { useContext } from 'react';
import { WalletSDKContext } from '../index';

export function useWebViewHealth() {
  const { webViewHealth } = useContext(WalletSDKContext);
  
  return {
    isWebViewHealthy: webViewHealth?.isHealthy ?? true,
    healthReason: webViewHealth?.reason,
    healthMetadata: webViewHealth?.metadata,
  };
}