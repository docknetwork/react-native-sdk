import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import and initialize WASM before bootstrapping Angular
async function initializeApp() {
  try {
    console.log('Initializing WASM modules...');

    // Add detailed logging for each step
    console.log('Attempting to import EDV module...');

    try {
      const edvModule = await import('@docknetwork/wallet-sdk-wasm/lib/services/edv' as any);
      console.log('EDV module imported successfully:', edvModule);
      console.log('EDV module keys:', Object.keys(edvModule));

      // Check if edvService exists in the module
      if (edvModule.edvService) {
        console.log('edvService found:', typeof edvModule.edvService);
      } else {
        console.warn('edvService not found in module');
      }
    } catch (edvError: any) {
      console.error('Failed to import EDV module:', edvError);
      console.error('EDV Error stack:', edvError.stack);
      throw edvError;
    }

    console.log('WASM modules loaded successfully');

    // Bootstrap Angular after WASM is ready
    console.log('Starting Angular bootstrap...');
    await bootstrapApplication(AppComponent, appConfig);

    console.log('Angular app bootstrapped successfully');
  } catch (err: any) {
    console.error('Error starting app:', err);
    console.error('Error type:', typeof err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    // Log additional details about the error
    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error cause:', err.cause);
    }

    console.log('Attempting fallback bootstrap...');
    try {
      await bootstrapApplication(AppComponent, appConfig);
      console.log('Fallback bootstrap successful');
    } catch (fallbackErr) {
      console.error('Fallback bootstrap failed:', fallbackErr);
    }
  }
}

// Add a global error handler to catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise:', event.promise);
});

// Add a global error handler for other errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Message:', event.message);
  console.error('Source:', event.filename, 'Line:', event.lineno);
});

console.log('Starting app initialization...');
initializeApp();
