//
//  WalletSDK.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 23/06/25.
//

import SwiftUI
import WebKit
import Combine
import os.log

public class WalletSDK: ObservableObject {
    @Published public var isInitialized = false
    @Published public var credentials: [Credential] = []
    @Published public var defaultDID: String = ""
    @Published public var useLocalhost: Bool = false
    
    internal let rpcClient: RPCClient
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        self.rpcClient = RPCClient()
        setupBindings()
    }
    
    private func setupBindings() {
        rpcClient.$isWalletInitialized
            .receive(on: DispatchQueue.main)
            .assign(to: \.isInitialized, on: self)
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
    
    public func importCredential(offerUri: String) async throws -> Credential {
        Logger.wallet.info("WalletSDK: Importing credential from offer URI")
        return try await rpcClient.importCredential(offerUri: offerUri)
    }
    
    public func getCredentials() async throws {
        Logger.wallet.info("WalletSDK: Fetching credentials")
        try await rpcClient.getCredentials()
    }
    
    public func createPresentation(credentialId: String, proofRequestUrl: String, attributesToReveal: [String]) async throws -> [String: Any] {
        Logger.wallet.info("WalletSDK: Creating presentation for credential")
        return try await rpcClient.createPresentation(
            credentialId: credentialId,
            proofRequestUrl: proofRequestUrl,
            attributesToReveal: attributesToReveal
        )
    }
    
    public func fetchMessages() async throws {
        Logger.wallet.info("WalletSDK: Fetching messages")
        try await rpcClient.fetchMessages()
    }
    
    internal func setupWebView(_ webView: WKWebView) {
        rpcClient.setupWebView(webView)
    }
    
    public func getWebViewURL() -> URL? {
        if useLocalhost {
            return URL(string: "http://localhost:3000")
        } else {
            guard let bundlePath = Bundle.main.path(forResource: "wallet-sdk-web/index", ofType: "html") else {
                Logger.wallet.error("Could not find wallet-sdk-web/index.html in bundle")
                return nil
            }
            return URL(fileURLWithPath: bundlePath)
        }
    }
}