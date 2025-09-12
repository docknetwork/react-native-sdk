import {storageService as _storageService} from './service';
import {StorageServiceRpc} from './service-rpc';

let storageService;

if (typeof window !== 'undefined' && window.ReactNativeWebView) {
  // Detect if we are running inside the webview
  // then route the calls to the service-rpc
  storageService = new StorageServiceRpc();
} else {
  // use the service directly for non-webview environments
  storageService = _storageService;
}

export {storageService};
