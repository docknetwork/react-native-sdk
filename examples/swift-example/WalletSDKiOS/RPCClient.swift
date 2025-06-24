//
//  RPCClient.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 23/06/25.
//

import WebKit
import Combine
import os.log

internal class RPCClient: ObservableObject {
    @Published var isWalletInitialized = false
    @Published var credentials: [Credential] = []
    @Published var defaultDID: String = ""
    
    private var webView: WKWebView?
    private var rpcCompleters: [String: (Result<[String: Any], Error>) -> Void] = [:]
    private var requestCounter = 0
    private let networkProxy = NetworkProxy()
    
    func setupWebView(_ webView: WKWebView) {
        self.webView = webView
    }
    
    private func sendRpcMessage(method: String, params: [String: Any]) async throws -> [String: Any] {
        guard let webView = webView else {
            throw WalletSDKError.webViewNotInitialized
        }
        
        guard isWalletInitialized else {
            throw WalletSDKError.walletNotInitialized
        }
        
        requestCounter += 1
        let requestId = "ios-\(requestCounter)"
        
        let message: [String: Any] = [
            "jsonrpc": "2.0",
            "id": requestId,
            "body": [
                "method": method,
                "params": params
            ]
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: message),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            throw WalletSDKError.jsonSerializationFailed
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            rpcCompleters[requestId] = { result in
                continuation.resume(with: result)
            }
            
            let escapedJson = jsonString
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"")
                .replacingOccurrences(of: "\n", with: "\\n")
                .replacingOccurrences(of: "\r", with: "\\r")
            
            let script = """
            (function() {
                try {
                    var message = JSON.parse("\(escapedJson)");
                    console.log('Sending RPC message:', JSON.stringify(message));
                    window.postMessage(message, '*');
                } catch (e) {
                    console.error('Failed to send RPC message:', e);
                }
            })();
            """
            
            DispatchQueue.main.async {
                webView.evaluateJavaScript(script) { _, error in
                    if let error = error {
                        self.rpcCompleters.removeValue(forKey: requestId)
                        continuation.resume(throwing: error)
                    }
                }
            }
        }
    }
    
    func importCredential(offerUri: String) async throws -> Credential {
        let response = try await sendRpcMessage(
            method: "importCredential",
            params: ["credentialOfferUri": offerUri]
        )
        
        guard let result = response["result"] as? [String: Any] else {
            throw WalletSDKError.invalidResponseFormat
        }
        
        let jsonData = try JSONSerialization.data(withJSONObject: result)
        let credential = try JSONDecoder().decode(Credential.self, from: jsonData)
        
        DispatchQueue.main.async {
            self.credentials.append(credential)
        }
        
        return credential
    }
    
    func createPresentation(credentialId: String, proofRequestUrl: String, attributesToReveal: [String]) async throws -> [String: Any] {
        Logger.rpc.info("Creating presentation for credential: \(credentialId)")
        Logger.rpc.info("Proof request URL: \(proofRequestUrl)")
        Logger.rpc.info("Attributes to reveal: \(attributesToReveal)")
        
        let response = try await sendRpcMessage(
            method: "createPresentation",
            params: [
                "credentialId": credentialId,
                "proofRequestUrl": proofRequestUrl,
                "attributesToReveal": attributesToReveal
            ]
        )
        
        return response
    }
    
    func getCredentials() async throws {
        let response = try await sendRpcMessage(
            method: "getCredentials",
            params: [:]
        )
        
        guard let result = response["result"] as? [[String: Any]] else {
            Logger.rpc.error("Invalid response format - expected array of credentials")
            Logger.rpc.debug("Actual response: \(response)")
            throw WalletSDKError.invalidResponseFormat
        }
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: result)
            Logger.rpc.debug("JSON data length: \(jsonData.count)")
            
            let credentials = try JSONDecoder().decode([Credential].self, from: jsonData)
            Logger.rpc.info("Successfully decoded \(credentials.count) credentials")
            
            DispatchQueue.main.async {
                self.credentials = credentials
            }
        } catch {
            Logger.rpc.error("Failed to decode credentials: \(error.localizedDescription)")
            
            if let decodingError = error as? DecodingError {
                Logger.rpc.error("Decoding error details: \(decodingError)")
            }
            
            if let jsonString = String(data: try JSONSerialization.data(withJSONObject: result), encoding: .utf8) {
                Logger.rpc.debug("Raw credential JSON: \(jsonString)")
            }
            
            throw error
        }
    }
    
    func fetchMessages() async throws {
        Logger.rpc.info("Fetching messages")
        let response = try await sendRpcMessage(
            method: "fetchMessages",
            params: [:]
        )
        Logger.rpc.info("Messages fetched successfully")
    }
    
    func handleMessage(_ message: String) {
        guard !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            Logger.rpc.debug("Skipping empty message")
            return
        }
        
        guard let data = message.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              !json.isEmpty else {
            Logger.rpc.error("Failed to parse message or message is empty: \(message, privacy: .public)")
            return
        }
        
        if let id = json["id"] as? String,
           let body = json["body"] as? [String: Any] {
            
            if id.hasPrefix("webview-") {
                handleWebViewEvent(body: body)
            } else if let method = body["method"] as? String,
                      method == "proxyNetworkRequest",
                      let params = body["params"] as? [String: Any] {
                Task {
                    await handleProxyNetworkRequest(id: id, params: params)
                }
            } else if let completer = rpcCompleters[id] {
                handleRpcResponse(id: id, body: body, completer: completer)
            }
        }
    }
    
    private func handleWebViewEvent(body: [String: Any]) {
        if let type = body["type"] as? String {
            switch type {
            case "WALLET_INITIALIZED":
                if let data = body["data"] as? [String: Any],
                   let did = data["defaultDID"] as? String {
                    DispatchQueue.main.async {
                        self.defaultDID = did
                        self.isWalletInitialized = true
                        Logger.wallet.info("Wallet initialized with DID: \(did, privacy: .public)")
                    }
                }
            case "LOG":
                if let logMessage = body["message"] as? String {
                    Logger.rpc.debug("WebView Log: \(logMessage, privacy: .public)")
                }
            case "CREDENTIAL_ADDED":
                Logger.rpc.info("Received CREDENTIAL_ADDED event")
                if let data = body["data"] as? [String: Any],
                   let credentials = data["credentials"] as? [[String: Any]] {
                    Logger.rpc.info("Processing \(credentials.count) new credentials")
                    Task {
                        do {
                            try await self.getCredentials()
                            Logger.rpc.info("Credentials refreshed after CREDENTIAL_ADDED event")
                        } catch {
                            Logger.rpc.error("Failed to refresh credentials after CREDENTIAL_ADDED: \(error.localizedDescription)")
                        }
                    }
                }
            default:
                Logger.rpc.debug("Unhandled webview event type: \(type, privacy: .public)")
            }
        }
    }
    
    private func handleRpcResponse(id: String, body: [String: Any], completer: @escaping (Result<[String: Any], Error>) -> Void) {
        if let error = body["error"] as? String {
            let details = body["details"] as? String ?? ""
            Logger.rpc.error("RPC error for request \(id, privacy: .public): \(error, privacy: .public), details: \(details, privacy: .public)")
            completer(.failure(WalletSDKError.rpcError(error, details)))
        } else if let result = body["result"] {
            Logger.rpc.debug("RPC success for request \(id, privacy: .public)")
            completer(.success(["result": result]))
        } else if body["message"] != nil {
            Logger.rpc.debug("RPC message response for request \(id, privacy: .public)")
            completer(.success(body))
        }
        rpcCompleters.removeValue(forKey: id)
    }
    
    func handleProxyNetworkRequest(id: String, params: [String: Any]) async {
        do {
            guard let url = params["url"] as? String,
                  let method = params["method"] as? String else {
                throw WalletSDKError.missingRequiredParameters
            }
            
            let body = params["body"] as? String
            let headers = params["headers"] as? [String: String] ?? [:]
            
            Logger.rpc.debug("Proxy request: \(method) \(url)")
            
            let result = try await networkProxy.proxyNetworkRequest(url: url, method: method, body: body, headers: headers)
            
            Logger.rpc.debug("Proxy response received for \(url)")
            
            sendProxyResponse(id: id, result: ["result": result])
            
        } catch {
            Logger.rpc.error("Proxy request failed: \(error.localizedDescription)")
            sendProxyResponse(id: id, result: [
                "error": error.localizedDescription,
                "details": "Network proxy failed: \(error)"
            ])
        }
    }
    
    private func sendProxyResponse(id: String, result: [String: Any]) {
        let response: [String: Any] = [
            "jsonrpc": "2.0",
            "id": id,
            "body": result
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: response),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            DispatchQueue.main.async {
                let escapedJsonString = jsonString
                    .replacingOccurrences(of: "\\", with: "\\\\")
                    .replacingOccurrences(of: "\"", with: "\\\"")
                    .replacingOccurrences(of: "\n", with: "\\n")
                    .replacingOccurrences(of: "\r", with: "\\r")
                    .replacingOccurrences(of: "\t", with: "\\t")
                
                let script = """
                (function() {
                    console.log('Handling proxy response for ID: \(id)');
                    try {
                        var responseData = JSON.parse("\(escapedJsonString)");
                        if (window.proxyResponseHandlers && window.proxyResponseHandlers['\(id)']) {
                            window.proxyResponseHandlers['\(id)'](responseData);
                            delete window.proxyResponseHandlers['\(id)'];
                            console.log('Proxy response delivered for ID: \(id)');
                        } else {
                            console.error('No handler found for proxy response ID: \(id)');
                        }
                    } catch (e) {
                        console.error('Error parsing proxy response:', e);
                    }
                })();
                """
                self.webView?.evaluateJavaScript(script) { _, error in
                    if let error = error {
                        Logger.rpc.error("Failed to send proxy response: \(error.localizedDescription)")
                    } else {
                        Logger.rpc.debug("Successfully sent proxy response for ID: \(id)")
                    }
                }
            }
        }
    }
}

enum WalletSDKError: LocalizedError {
    case webViewNotInitialized
    case walletNotInitialized
    case jsonSerializationFailed
    case invalidResponseFormat
    case missingRequiredParameters
    case rpcError(String, String)
    
    var errorDescription: String? {
        switch self {
        case .webViewNotInitialized:
            return "WebView not initialized"
        case .walletNotInitialized:
            return "Wallet not initialized yet"
        case .jsonSerializationFailed:
            return "Failed to serialize JSON"
        case .invalidResponseFormat:
            return "Invalid response format"
        case .missingRequiredParameters:
            return "Missing required parameters"
        case .rpcError(let error, let details):
            return "RPC Error: \(error)\(details.isEmpty ? "" : " - \(details)")"
        }
    }
}