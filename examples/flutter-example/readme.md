### Flutter App Using Truvera Wallet SDK WebView

This Flutter project demonstrates how to integrate Truvera's Wallet SDK (written in JavaScript) by loading it within a WebView. The app utilizes JSON-RPC calls to interact with the wallet’s functionality, allowing credential management and import via a web bundle.

#### **Project Structure**

```
flutter-project/
├── lib/src/sample_feature
│   ├── json_rpc_webview.dart       # WebView controller and JSON-RPC messaging logic
│   ├── sample_item_list_view.dart  # UI for displaying and managing credentials
├── assets/
│   ├── dock-sdk/                   # Folder for WebView assets (index.html, main.bundle.js)
│       ├── index.html
│       ├── main.bundle.js
├── pubspec.yaml                    # Flutter dependencies
└── main.dart                       # Flutter app entry point
```

#### **Prerequisites**

1. Flutter SDK installed.

#### **Getting Started**

1. **Add Assets**

   This example already includes the required WebView assets in the `assets/dock-sdk` folder. If you need to update the assets, you can check the [Flutter Webview Example](../flutter-webview/)

2. **Install Dependencies**

   Install required dependencies with:
   ```bash
   flutter pub get
   ```

3. **Running the App**

   Launch the Flutter app:
   ```bash
   flutter run
   ```

#### **Features**

- **JSON-RPC Communication**: The `JsonRpcWebView` widget establishes a JSON-RPC interface with the WebView, enabling interaction with Truvera’s Wallet SDK methods such as `importCredential`, `getCredentials`, and `clearData`.
- **UI Components**: The UI provides options to view, import, refresh, and clear credentials using simple controls.

#### **Usage**

- **View Credentials**: Tap the refresh icon to fetch and view stored credentials.
- **Import Credential**: Use the "Scan QR Code" button to import a sample credential from a QR code URL.
- **Clear Data**: Use the delete icon to remove all stored credentials.

#### **Additional Notes**

- The WebView is hidden and only used for background operations.
- This project uses `Toaster` as the channel for JSON-RPC communication between Flutter and the WebView.

