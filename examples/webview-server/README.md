### Wallet SDK Webview Server

**WebView Project**

This project serves as the WebView logic implementation for Truvera's Wallet SDK. It creates a JavaScript bundle that handles wallet-related operations and sends data between the JavaScript and host environments using a JSON-RPC protocol.

#### **Project Structure**

```
webview-project/
├── src/
│   ├── index.js                 # Main file for WebView initialization and message handling
│   ├── shim.js                  # Shim to set up required polyfills
├── public/
│   ├── index.html               # HTML entry point
│   ├── static/
├── package.json
```

#### **Getting Started**

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Build the Bundle**
   Build the WebView bundle using Webpack:
   ```bash
   npm run build
   ```

   After building, the bundled files will be available in the `build/` directory.

3. **Configure Local Storage**
   The WebView project uses a JSON-RPC protocol and stores data using local storage. The `setLocalStorageImpl` function can be modified to store data within the Host app instead of using the browser's local storage, if necessary.

4. **Running the Project**
   For testing or local development:
   ```bash
   npm start
   ```
   Access the WebView locally via the provided URL (e.g., `http://localhost:3000/index.html`).

#### **Project Details**

- **Message Handling**: Messages from host are processed in the `handleHostMessage` function, which routes JSON-RPC requests to their respective methods, such as `importCredential`, `getCredentials`, and `clearData`.
- **WebView Communication**: Communication with host is achieved using the `sendMessageToHost` function, which sends JSON-RPC responses back to the host app.

#### **Building for Production**

After testing, you can copy `build/` files to your host project's assets folder.

#### **Notes**

- This WebView project is designed to integrate specifically with Truvera's Wallet SDK. Refer to the Wallet SDK documentation for more details on available methods and configurations.

