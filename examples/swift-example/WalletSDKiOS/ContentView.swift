//
//  ContentView.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import SwiftUI
import WebKit
import Combine
import os.log



struct ContentView: View {
    @StateObject private var walletSDK = WalletSDK()
    @State private var showImportModal = false
    @State private var credentialOfferUrl = ""
    @State private var isImporting = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showProofRequestModal = false
    @State private var showCopiedToast = false
    
    private var webViewSection: some View {
        Group {
            if let url = walletSDK.getWebViewURL() {
                WalletWebViewInternal(url: url, walletSDK: walletSDK)
                    .frame(width: 1, height: 1) // Minimal visible size to ensure proper rendering
                    .opacity(0.01) // Nearly invisible but still rendered
                    .background(Color.clear)
            } else {
                Text("Failed to load web view")
                    .foregroundColor(.red)
                    .frame(width: 1, height: 1)
                    .opacity(0.01)
                    .background(Color.clear)
            }
        }
    }
    
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Hidden WebView for RPC communication
                webViewSection
                
                // Main UI
                VStack {
                    // Wallet Status
                    HStack {
                        Circle()
                            .fill(walletSDK.isInitialized ? Color.green : Color.red)
                            .frame(width: 10, height: 10)
                        Text(walletSDK.isInitialized ? "Wallet Connected" : "Connecting...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top)
                    
                    if walletSDK.isInitialized && !walletSDK.defaultDID.isEmpty {
                        HStack {
                            Text("DID: \(walletSDK.defaultDID)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                                .lineLimit(1)
                                .truncationMode(.middle)
                            
                            Spacer()
                            
                            Button(action: {
                                UIPasteboard.general.string = walletSDK.defaultDID
                                // Haptic feedback for copy action
                                let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                                impactFeedback.impactOccurred()
                                // Show confirmation
                                showCopiedToast = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    showCopiedToast = false
                                }
                            }) {
                                Image(systemName: "doc.on.doc")
                                    .font(.system(size: 14))
                                    .foregroundColor(.blue)
                                    .padding(8)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(6)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                        .padding(.horizontal)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    // Credentials List
                    if walletSDK.credentials.isEmpty {
                        Spacer()
                        VStack(spacing: 20) {
                            Image(systemName: "wallet.pass")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("No credentials yet")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            Text("Import your first credential to get started")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    } else {
                        List(walletSDK.credentials) { credential in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(credential.displayName)
                                    .font(.headline)
                                Text("Issuer: \(credential.issuer.name ?? credential.issuer.id)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Text("Issued: \(credential.issuanceDate)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    
                    // Action buttons
                    VStack(spacing: 12) {
                        Button(action: {
                            showImportModal = true
                        }) {
                            Label("Import Credential", systemImage: "plus.circle.fill")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        .disabled(!walletSDK.isInitialized)
                        
                        Button(action: {
                            showProofRequestModal = true
                        }) {
                            Label("Scan Proof Request", systemImage: "qrcode.viewfinder")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        .disabled(!walletSDK.isInitialized || walletSDK.credentials.isEmpty)
                        
                        Button(action: {
                            Task {
                                do {
                                    try await walletSDK.fetchMessages()
                                } catch {
                                    errorMessage = error.localizedDescription
                                    showError = true
                                }
                            }
                        }) {
                            Label("Fetch Messages", systemImage: "envelope.fill")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.purple)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        .disabled(!walletSDK.isInitialized)
                    }
                    .padding()
                }
            }
            .navigationTitle("Wallet SDK")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task {
                            do {
                                try await walletSDK.getCredentials()
                            } catch {
                                errorMessage = error.localizedDescription
                                showError = true
                            }
                        }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(!walletSDK.isInitialized)
                }
            }
        }
        .overlay(
            VStack {
                if showCopiedToast {
                    Text("DID Copied!")
                        .font(.caption)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(20)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .animation(.easeInOut(duration: 0.3), value: showCopiedToast)
                }
                Spacer()
            }
            .padding(.top, 50)
        )
        .sheet(isPresented: $showImportModal) {
            NavigationView {
                VStack(spacing: 20) {
                    Text("Import Credential")
                        .font(.headline)
                        .padding(.top)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Credential Offer URL")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        TextField("openid-credential-offer://...", text: $credentialOfferUrl)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                    }
                    .padding(.horizontal)
                    
                    if isImporting {
                        ProgressView("Importing...")
                            .padding()
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 20) {
                        Button("Cancel") {
                            showImportModal = false
                            credentialOfferUrl = ""
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(10)
                        
                        Button("Import") {
                            Task {
                                isImporting = true
                                do {
                                    // Add a timeout for the entire import operation
                                    try await withThrowingTaskGroup(of: Credential.self) { group in
                                        group.addTask {
                                            try await walletSDK.importCredential(offerUri: credentialOfferUrl)
                                        }
                                        
                                        group.addTask {
                                            try await Task.sleep(nanoseconds: 45_000_000_000) // 45 seconds
                                            throw NSError(domain: "Import", code: 0, userInfo: [NSLocalizedDescriptionKey: "Import operation timed out"])
                                        }
                                        
                                        // Get the first result (either success or timeout)
                                        guard let result = try await group.next() else {
                                            throw NSError(domain: "Import", code: 0, userInfo: [NSLocalizedDescriptionKey: "Import operation failed"])
                                        }
                                        
                                        // Cancel remaining tasks
                                        group.cancelAll()
                                        
                                        showImportModal = false
                                        credentialOfferUrl = ""
                                    }
                                } catch {
                                    errorMessage = error.localizedDescription
                                    showError = true
                                }
                                isImporting = false
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(credentialOfferUrl.isEmpty ? Color.gray : Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .disabled(credentialOfferUrl.isEmpty || isImporting)
                    }
                    .padding()
                }
                .navigationBarHidden(true)
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") {
                errorMessage = nil
            }
        } message: {
            Text(errorMessage ?? "An unknown error occurred")
        }
        .sheet(isPresented: $showProofRequestModal) {
            ProofRequestModal(isPresented: $showProofRequestModal, walletSDK: walletSDK)
        }
        .onAppear {
            // Use local bundle files (set to false for file:// URLs)
            walletSDK.useLocalhost = false
            
            // Fetch credentials once wallet is initialized
            Task {
                while !walletSDK.isInitialized {
                    try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
                }
                do {
                    try await walletSDK.getCredentials()
                } catch {
                    Logger.wallet.error("Failed to fetch initial credentials: \(error.localizedDescription, privacy: .public)")
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Item.self, inMemory: true)
}
