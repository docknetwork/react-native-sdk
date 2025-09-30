# WalletSDK Swift Example

A comprehensive SwiftUI iOS application that demonstrates integration with the Dock Wallet SDK through a WebView-based architecture for handling verifiable digital credentials.

## Features

### Core Wallet SDK Features
- **Wallet Initialization**: Automatic wallet setup with DID generation
- **Credential Management**: Import, store, and retrieve verifiable credentials
- **OID4VC Support**: Import credentials using OpenID for Verifiable Credentials (OID4VC) protocol
- **Proof Request Handling**: Workflow for responding to verification requests

### WebView Integration
- **Embedded Wallet SDK**: Web-based wallet SDK loaded in a hidden WKWebView
- **Dual Mode Support**: The webivew can be loaded with both localhost for development and bundled web assets
- **JSON-RPC Communication**: Bidirectional messaging between Swift app and WebView
- **Network Proxy**: Native iOS networking for cross-origin requests and CORS handling

## Architecture

### WebView Layer
The application uses a hybrid architecture combining native iOS components with a web-based wallet SDK:

- **WalletWebView**: Custom WKWebView wrapper that hosts the Dock Wallet SDK
- **WebViewJavaScriptBridge**: JavaScript bridge for communication between iOS and WebView
- **Console Logging Bridge**: Captures and forwards WebView console output to iOS Logger

### JSON-RPC Communication
Communication between the iOS app and WebView uses a JSON-RPC 2.0 protocol:

```
iOS App ←→ JSON-RPC Messages ←→ WebView (Wallet SDK)
```

Current RPC methods:
- `importCredential`: Import credentials via OID4VC offer URIs
- `getCredentials`: Retrieve all stored credentials
- `createPresentation`: Generate verifiable presentations for proof requests

### Network Proxy Layer
The `NetworkProxy` component handles network requests from the WebView:
- Bypasses CORS restrictions
- Provides native iOS networking capabilities
- Handles authentication and secure requests
- Supports various HTTP methods and custom headers

### Data Models
- **Credential**: Verifiable credential with issuer, subject, and proof information
- **AnyCodable**: Flexible JSON encoding/decoding for credential attributes
- **WalletSDKError**: Comprehensive error handling for various failure scenarios

## Requirements

- **Xcode**: 15.0 or later
- **iOS**: 18.4+ simulator or device
- **macOS**: Command line tools for development
- **Development Server** (optional): localhost:3000 for web SDK development

## Setup and Installation

### 1. Clone and Open Project
```bash
clone the wallet-sdk repository
cd examples/swift-example
open WalletSDKiOS.xcodeproj
```

### 2. Configure Build Settings
- Ensure iOS deployment target is set to 18.4+
- Verify Bundle Identifier matches your development team
- Check that WKWebView capabilities are enabled

### 3. Web SDK Assets
The project includes bundled web assets in `wallet-sdk-web/`:
- `index.html`: Main WebView entry point
- `main.eeb62a29.js`: Compiled Wallet SDK JavaScript
- Additional assets and dependencies
- You can generate new assets by running `npm run build` in the ../examples/webview-server project

## Linking WebView Files in Xcode (Optional)

This example already has the integration configured, so you can skip this step if you are using the provided project. However, if you want to integrate it into your own project, follow these steps:

### Steps to Link WebView Assets

1. **Add WebView Assets to Project**
   - In Xcode, right-click on your project navigator
   - Select "Add Files to [YourProject]..."
   - Navigate to your `wallet-sdk-web` folder containing the built assets
   - Select the folder and ensure "Create folder references" is selected (blue folder icon)
   - Make sure "Copy items if needed" is checked
   - Add to your app target

2. **Verify Folder Reference**
   - The `wallet-sdk-web` folder should appear as a blue folder in Xcode (not yellow)
   - Blue folders maintain their directory structure in the app bundle
   - This ensures relative paths in HTML/JS files work correctly

3. **Configure Build Phases**
   - Select your project in Xcode
   - Go to your app target → Build Phases
   - Expand "Copy Bundle Resources"
   - Verify that `wallet-sdk-web` folder is listed
   - If not, click "+" and add the folder manually

4. **Update Info.plist (if needed)**
   - For local file access, ensure your Info.plist allows arbitrary loads:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoadsInWebContent</key>
       <true/>
   </dict>
   ```

## Running the Example

### Option 1: Using Xcode
1. Open `WalletSDKiOS.xcodeproj` in Xcode
2. Select your target device or simulator (iOS 18.4+)
3. Build and run the project (⌘+R)

### Option 2: Development with Localhost
For WebView development with hot reload:
1. Start the Webview Server on localhost:3000. Check ../examples/webview-server project for more details.
2. Set useLocalhost to true in WalletSDKiOS/ContentView.swift
3. Ensure your development server accepts connections from iOS Simulator

## Usage Examples

### Importing Credentials with OID4VC
1. Obtain a credential offer URI from an issuer
2. Navigate to the import section in the app
3. Enter the OID4VC offer URI
4. The credential will be imported and stored automatically

### Creating Presentations for Proof Requests
1. Tap "Create Proof Request" in the main interface
2. Enter the proof request URL from a verifier
3. Select which credential to use for the presentation
4. Choose which attributes to reveal
5. Submit the presentation to the verifier

## Development Notes

- The WebView is hidden from the user interface and serves purely for backend communication
- All user interactions happen through native SwiftUI components
- The JSON-RPC layer provides type-safe communication between iOS and JavaScript
- Network requests from the WebView are proxied through native iOS networking for security and CORS handling

