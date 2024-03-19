import {useMemo} from 'react';
import {createBiometricBindingProvider} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {defaultBiometricsPlugin} from '../default-biometrics-plugin';
import {useWallet} from '../';

export function initializeBiometricsPlugin(configs: any) {
  return defaultBiometricsPlugin.initialize(configs);
}

export function isBiomericsPluginEnabled(): boolean {
  return defaultBiometricsPlugin.isEnabled();
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
