import {useMemo} from 'react';
import {createBiometricBindingProvider, getIssuerConfigsForNetwork, setBiometricConfigs} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {defaultBiometricsPlugin} from '../default-biometrics-plugin';
import {useWallet} from '../';
import { getWallet } from '../wallet';

export function initializeBiometricsPlugin(configs: any) {
  setBiometricConfigs(configs);
}

export function isBiomericsPluginEnabled(): boolean {
  return !!getIssuerConfigsForNetwork(getWallet().getNetworkId());
}

export const useBiometricBinding = () => {
  const {wallet} = useWallet();
  const biometricBindingProvider = useMemo(() => {
    if (!wallet) {
      return null;
    }
    return createBiometricBindingProvider({
      wallet,
      onEnroll: defaultBiometricsPlugin.enrollBiometrics,
      onMatch: defaultBiometricsPlugin.matchBiometrics,
      onCheckBiometryRequired: defaultBiometricsPlugin.hasProofOfBiometrics,
    });
  }, [wallet]);

  return biometricBindingProvider;
};
