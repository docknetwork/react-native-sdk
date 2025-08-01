import 'package:flutter/material.dart';
import 'json_rpc_webview.dart';

class SampleItemListView extends StatefulWidget {
  const SampleItemListView({
    super.key,
    this.items = const [SampleItem(1), SampleItem(2), SampleItem(3)],
  });

  static const routeName = '/';
  final List<SampleItem> items;

  @override
  _SampleItemListViewState createState() => _SampleItemListViewState();
}

class _SampleItemListViewState extends State<SampleItemListView> {
  final GlobalKey<JsonRpcWebViewState> _webViewKey =
      GlobalKey<JsonRpcWebViewState>();
  List<dynamic> _credentials = []; // Store the list of credentials
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCredentialsOnLoad(); // Fetch credentials on app load
  }

  Future<void> _fetchCredentialsOnLoad() async {
    await _fetchCredentials(); // Fetch credentials and update the UI
  }

  Future<void> _fetchCredentials() async {
    setState(() {
      _isLoading = true;
    });

    // Fetch credentials from WebView using `getCredentials` method
    final response =
        await _webViewKey.currentState?.sendRpcMessage("getCredentials", {});

    // Parse the credentials
    final credentials = response?['body']?['result'] ?? [];

    // Update state with parsed credentials
    setState(() {
      _credentials = credentials;
      _isLoading = false;
    });
  }

  Future<void> _clearData() async {
    // Clear credentials data using `clearData` method
    await _webViewKey.currentState?.sendRpcMessage("clearData", {});

    // Update UI after clearing data
    setState(() {
      _credentials = []; // Clear credentials list in UI
      _isLoading = false;
    });
  }

  Future<void> _importCredential() async {
    setState(() {
      _isLoading = true;
    });

    // Sample QR code data for demonstration purposes. 
    // You should replace this with the actual QR data obtained from a QR code scanner when ready.
    // The scanned data will be passed to the `importCredential` method.
    const qrCodeData =
        "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fapi-staging.dock.io%2Fopenid%2Fissuers%2F2baff124-6681-428b-b5a1-449f211d9624%22%2C%22credentials%22%3A%5B%22ldp_vc%3AMyCredential%22%5D%2C%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%226HzsUcLtsnHmy1wlZ9GySRXcFcTh0haAi_5i98svGaE%22%2C%22user_pin_required%22%3Afalse%7D%7D%7D";
    // Call `importCredential` with a sample QR code URL
    await _webViewKey.currentState?.sendRpcMessage(
      "importCredential",
      {"credentialOfferUrl": qrCodeData},
    );

    // Update the credential list with the new credentials after import
    await _fetchCredentials();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Credentials'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed:
                _fetchCredentials, // Refresh button to fetch all credentials
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _clearData, // Clear button to delete all credentials
          ),
        ],
      ),
      body: Column(
        children: [
          // Hidden WebView for background JSON-RPC calls
          Visibility(
            visible: false,
            maintainState: true,
            child: SizedBox(
              height: 0,
              child: JsonRpcWebView(
                key: _webViewKey,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: _importCredential,
            child: const Text('Scan QR Code'),
          ),
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Expanded(
                  child: ListView.builder(
                    itemCount: _credentials.length,
                    itemBuilder: (context, index) {
                      final credential = _credentials[index];
                      final issuerName = credential['issuer']['name'];
                      final issuanceDate = credential['issuanceDate'];
                      final expirationDate = credential['expirationDate'];
                      final credentialId = credential['id'];

                      return Card(
                        margin: const EdgeInsets.all(8.0),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Credential ID: $credentialId',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 8.0),
                              Text('Issuer: $issuerName'),
                              Text('Issued on: $issuanceDate'),
                              Text('Expires on: $expirationDate'),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ],
      ),
    );
  }
}

class SampleItem {
  final int id;
  const SampleItem(this.id);
}
