//
//  WalletWebView.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import SwiftUI
import WebKit
import Combine
import os.log

class WebViewModel: NSObject, ObservableObject {
    @Published var isLoading = true
    @Published var credentials: [Credential] = []
    @Published var isWalletInitialized = false
    @Published var defaultDID: String = ""
    
    private let rpcClient = RPCClient()
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        super.init()
        setupBindings()
    }
    
    private func setupBindings() {
        rpcClient.$isWalletInitialized
            .receive(on: DispatchQueue.main)
            .assign(to: \.isWalletInitialized, on: self)
            .store(in: &cancellables)
        
        rpcClient.$credentials
            .receive(on: DispatchQueue.main)
            .assign(to: \.credentials, on: self)
            .store(in: &cancellables)
        
        rpcClient.$defaultDID
            .receive(on: DispatchQueue.main)
            .assign(to: \.defaultDID, on: self)
            .store(in: &cancellables)
    }
    
    func setupWebView(_ webView: WKWebView) {
        rpcClient.setupWebView(webView)
    }
    
    func handleMessage(_ message: String) {
        rpcClient.handleMessage(message)
    }
    
    func importCredential(offerUri: String) async throws -> Credential {
        return try await rpcClient.importCredential(offerUri: offerUri)
    }
    
    func createPresentation(credentialId: String, proofRequestUrl: String, attributesToReveal: [String]) async throws -> [String: Any] {
        return try await rpcClient.createPresentation(
            credentialId: credentialId,
            proofRequestUrl: proofRequestUrl,
            attributesToReveal: attributesToReveal
        )
    }
    
    func getCredentials() async throws {
        try await rpcClient.getCredentials()
    }
}

struct WebView: UIViewRepresentable {
    let url: URL
    @ObservedObject var viewModel: WebViewModel
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        
        contentController.add(context.coordinator, name: "Toaster")
        
        let bridgeScript = WebViewJavaScriptBridge.createBridgeScript()
        let bridgeSetupScript = WKUserScript(source: bridgeScript, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        contentController.addUserScript(bridgeSetupScript)
        
        let postLoadBridgeScript = WebViewJavaScriptBridge.createPostLoadScript()
        let postLoadScript = WKUserScript(source: postLoadBridgeScript, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        contentController.addUserScript(postLoadScript)
        
        let consoleLogScript = WebViewJavaScriptBridge.createConsoleLogScript()
        let consoleScript = WKUserScript(source: consoleLogScript, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        contentController.addUserScript(consoleScript)
        contentController.add(context.coordinator, name: "consoleLog")
        
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.preferences.javaScriptEnabled = true
        
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.suppressesIncrementalRendering = false
        
        if #available(iOS 16.4, *) {
            config.preferences.isElementFullscreenEnabled = true
        }
        
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        config.applicationNameForUserAgent = "WalletSDK/1.0 (iOS) Mobile"
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        
        webView.isInspectable = true
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) WalletSDK/1.0 Mobile/15E148"
        
        viewModel.setupWebView(webView)
        
        let request = URLRequest(url: url)
        webView.load(request)
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let coordinator = context.coordinator
        
        let shouldLoad = !coordinator.hasInitiallyLoaded && 
                        coordinator.currentURL == nil && 
                        !uiView.isLoading
        
        if shouldLoad {
            Logger.navigation.debug("Loading URL in WebView: \(url.absoluteString, privacy: .public)")
            let request = URLRequest(url: url)
            uiView.load(request)
            coordinator.currentURL = url
        } else {
            Logger.navigation.debug("Skipping reload - already loaded or loading")
        }
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: WebView
        private var retryTimer: Timer?
        private var retryCount = 0
        private let maxRetries = 5
        var hasInitiallyLoaded = false
        var currentURL: URL?
        
        init(_ parent: WebView) {
            self.parent = parent
        }
        
        deinit {
            retryTimer?.invalidate()
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "Toaster", let messageBody = message.body as? String {
                if !messageBody.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && messageBody != "{}" {
                    parent.viewModel.handleMessage(messageBody)
                }
            } else if message.name == "consoleLog", let log = message.body as? String {
                Logger.webView.debug("WebView Console: \(log, privacy: .public)")
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.viewModel.isLoading = false
            retryTimer?.invalidate()
            retryCount = 0
            hasInitiallyLoaded = true
            currentURL = webView.url
            Logger.navigation.info("Page loaded successfully")
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            Logger.navigation.error("WebView navigation failed: \(error.localizedDescription, privacy: .public)")
            parent.viewModel.isLoading = false
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            let nsError = error as NSError
            var errorMessage = error.localizedDescription
            
            if nsError.code == -999 {
                errorMessage = "Request cancelled. This usually means the server at localhost:3000 is not running."
            } else if nsError.code == -1004 || nsError.code == -1001 {
                errorMessage = "Could not connect to server. Make sure your local server is running on localhost:3000."
            }
            
            Logger.navigation.error("WebView provisional navigation failed: \(errorMessage, privacy: .public)")
            parent.viewModel.isLoading = false
            
            if nsError.code == -999 {
                hasInitiallyLoaded = false
                currentURL = nil
            }
            
            if (nsError.code == -999 || nsError.code == -1004 || nsError.code == -1001) && 
               !errorMessage.contains("chunk") && !errorMessage.contains("ChunkLoadError") {
                if self.retryCount < self.maxRetries {
                    let retryDelay = Double(self.retryCount + 1) * 2.0
                    Logger.navigation.info("Will retry in \(Int(retryDelay)) seconds... (attempt \(self.retryCount + 1)/\(self.maxRetries))")
                    
                    self.retryTimer?.invalidate()
                    self.retryTimer = Timer.scheduledTimer(withTimeInterval: retryDelay, repeats: false) { _ in
                        self.retryCount += 1
                        Logger.navigation.info("Retrying connection...")
                        self.hasInitiallyLoaded = false
                        self.currentURL = nil
                        webView.reload()
                    }
                } else {
                    Logger.navigation.notice("Stopped retrying after \(self.maxRetries) attempts. Run your local server on port 3000 before launching the app")
                }
            } else if errorMessage.contains("chunk") || errorMessage.contains("ChunkLoadError") {
                Logger.navigation.error("Chunk loading error detected - not retrying to prevent infinite loop")
            }
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url {
                Logger.navigation.debug("WebView navigating to: \(url.absoluteString, privacy: .public)")
            }
            decisionHandler(.allow)
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
            if let httpResponse = navigationResponse.response as? HTTPURLResponse {
                Logger.navigation.debug("WebView response: \(httpResponse.url?.absoluteString ?? "unknown") Status: \(httpResponse.statusCode)")
                if httpResponse.statusCode >= 400 {
                    Logger.navigation.error("HTTP Error: \(httpResponse.statusCode) for \(httpResponse.url?.absoluteString ?? "unknown")")
                }
            }
            decisionHandler(.allow)
        }
    }
}

