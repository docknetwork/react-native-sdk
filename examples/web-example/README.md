# Cloud Wallet Demo

This web application leverages the **Truvera Wallet SDK** and **Truvera Cloud Wallet** for managing credentials and data storage.

## Usage Instructions

1. **Start the Application:**
   - Run the app with the following commands:
     ```bash
     npm install
     npm start
     ```

2. **Initialize the Wallet:**
   - Option 1: Upload an existing wallet key file.
   - Option 2: Generate a new wallet by clicking "Create New Wallet."

3. **Import a Credential:**
   - Click **"Import Credential"** and enter the Credential Offer URL.
   - Also, you can use DID distribution
     - Fetch DIDComm messages using the **"Fetch Messages"** button.

4. **View and Manage Credentials:**
   - Use the **"Refresh"** button to reload credentials.
   - Credentials are displayed in a structured format.

5. **Verify a Credential:**
   - Click **"Verify Credential"** and provide a **Proof Request URL**.
   - Follow the steps to select a credential and send the proof.

6. **Cloud Storage Operations:**
   - Use **"Clear EDV"** to reset cloud-stored documents.
   - Sync with the cloud wallet via **"Refresh."**
