//
//  ProofRequestModal.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import SwiftUI
import os.log

struct ProofRequestModal: View {
    @Binding var isPresented: Bool
    @ObservedObject var walletSDK: WalletSDK
    @State private var proofRequestUrl = ""
    @State private var selectedCredential: Credential?
    @State private var currentStep = 1
    @State private var isProcessing = false
    @State private var successMessage = ""
    @State private var showSuccess = false
    @State private var errorMessage = ""
    @State private var showError = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                progressIndicator
                
                switch currentStep {
                case 1:
                    proofRequestUrlInput
                case 2:
                    credentialSelection
                default:
                    processingOrResult
                }
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
    
    private var progressIndicator: some View {
        HStack {
            ForEach(1...3, id: \.self) { step in
                Circle()
                    .fill(step <= currentStep ? Color.green : Color.gray.opacity(0.3))
                    .frame(width: 12, height: 12)
                if step < 3 {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 2)
                }
            }
        }
        .padding(.horizontal)
    }
    
    private var proofRequestUrlInput: some View {
        VStack(spacing: 16) {
            Text("Enter Proof Request URL")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Proof Request URL")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                TextField("", text: $proofRequestUrl)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
            }
            
            Spacer()
            
            HStack(spacing: 20) {
                Button("Cancel") {
                    isPresented = false
                    resetModal()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.2))
                .foregroundColor(.primary)
                .cornerRadius(10)
                
                Button("Proceed") {
                    currentStep = 2
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(proofRequestUrl.isEmpty ? Color.gray : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(proofRequestUrl.isEmpty)
            }
        }
    }
    
    private var credentialSelection: some View {
        VStack(spacing: 16) {
            Text("Select Credential to Share")
                .font(.headline)
            
            if walletSDK.credentials.isEmpty {
                Text("No credentials available")
                    .foregroundColor(.secondary)
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(walletSDK.credentials) { credential in
                            credentialRow(credential)
                        }
                    }
                }
            }
            
            Spacer()
            
            HStack(spacing: 20) {
                Button("Back") {
                    currentStep = 1
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.2))
                .foregroundColor(.primary)
                .cornerRadius(10)
                
                Button("Proceed") {
                    currentStep = 3
                    createPresentation()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(selectedCredential == nil ? Color.gray : Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(selectedCredential == nil)
            }
        }
    }
    
    private func credentialRow(_ credential: Credential) -> some View {
        Button(action: {
            selectedCredential = credential
        }) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading) {
                        Text(credential.displayName)
                            .font(.headline)
                            .foregroundColor(.primary)
                        Text("Issuer: \(credential.issuer.name ?? credential.issuer.id)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    if selectedCredential?.id == credential.id {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    }
                }
            }
            .padding()
            .background(selectedCredential?.id == credential.id ? Color.green.opacity(0.1) : Color.gray.opacity(0.1))
            .cornerRadius(10)
        }
    }
    
    private var processingOrResult: some View {
        VStack(spacing: 16) {
            if isProcessing {
                ProgressView("Submitting to Truvera...")
                Text("Please wait while we create and submit your presentation")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else if showSuccess {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                Text("Success!")
                    .font(.headline)
                Text(successMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            } else if showError {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.red)
                Text("Error")
                    .font(.headline)
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            if !isProcessing {
                Button("Done") {
                    isPresented = false
                    resetModal()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
    }
    
    private func createPresentation() {
        guard let credential = selectedCredential else { return }
        
        isProcessing = true
        
        Task {
            do {
                let attributesToReveal = credential.credentialSubject.keys.map { "credentialSubject.\($0)" }
                
                let response = try await walletSDK.createPresentation(
                    credentialId: credential.id,
                    proofRequestUrl: proofRequestUrl,
                    attributesToReveal: attributesToReveal
                )
                
                DispatchQueue.main.async {
                    self.isProcessing = false
                    self.handleTruveraResponse(response)
                }
            } catch {
                Logger.wallet.error("Failed to create presentation: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    self.isProcessing = false
                    self.errorMessage = "Failed to create presentation: \(error.localizedDescription)"
                    self.showError = true
                }
            }
        }
    }
    
    private func handleTruveraResponse(_ response: [String: Any]) {
        Logger.wallet.info("Full response from webview: \(response)")
        
        guard let result = response["result"] else {
            Logger.wallet.error("No result field in response")
            self.errorMessage = "Failed to create presentation: Invalid response format"
            self.showError = true
            return
        }
        
        Logger.wallet.info("Truvera API response: \(String(describing: result))")
        
        if let resultDict = result as? [String: Any] {
            Logger.wallet.info("Processing Truvera response dictionary: \(resultDict)")
            
            if let success = resultDict["success"] as? Bool {
                if success {
                    Logger.wallet.info("Truvera API returned success: true")
                    self.successMessage = "Presentation submitted successfully to Truvera!"
                    if let message = resultDict["message"] as? String {
                        self.successMessage = message
                    }
                    self.showSuccess = true
                } else {
                    handleTruveraError(resultDict)
                }
            } else if let status = resultDict["status"] as? Int {
                handleTruveraStatusCode(status, resultDict)
            } else if let error = resultDict["error"] {
                handleTruveraDirectError(error)
            } else {
                Logger.wallet.info("Truvera API response assumed successful (no explicit error)")
                self.successMessage = "Presentation submitted successfully to Truvera!"
                self.showSuccess = true
            }
        } else {
            Logger.wallet.info("Truvera API response (non-dictionary): \(String(describing: result))")
            self.successMessage = "Presentation submitted successfully to Truvera!"
            self.showSuccess = true
        }
    }
    
    private func handleTruveraError(_ resultDict: [String: Any]) {
        Logger.wallet.error("Truvera API returned success: false")
        let errorMsg = resultDict["error"] as? String ?? 
                      resultDict["message"] as? String ?? 
                      "Unknown error from Truvera API"
        Logger.wallet.error("Truvera error message: \(errorMsg)")
        
        if errorMsg.lowercased().contains("already verified") || 
           errorMsg.lowercased().contains("already submitted") {
            self.errorMessage = "This proof request has already been verified."
        } else {
            self.errorMessage = "Truvera API error: \(errorMsg)"
        }
        self.showError = true
    }
    
    private func handleTruveraStatusCode(_ status: Int, _ resultDict: [String: Any]) {
        Logger.wallet.info("Truvera API HTTP status: \(status)")
        if status >= 200 && status < 300 {
            Logger.wallet.info("Truvera API success with status: \(status)")
            self.successMessage = "Presentation submitted successfully to Truvera!"
            if let message = resultDict["message"] as? String {
                self.successMessage = message
            }
            self.showSuccess = true
        } else {
            Logger.wallet.error("Truvera API error with status: \(status)")
            let errorMsg = resultDict["error"] as? String ?? 
                          resultDict["message"] as? String ?? 
                          "HTTP error \(status)"
            Logger.wallet.error("Truvera error message: \(errorMsg)")
            
            if status == 409 || errorMsg.lowercased().contains("already") {
                self.errorMessage = "This proof request has already been verified."
            } else {
                self.errorMessage = "Truvera API error (\(status)): \(errorMsg)"
            }
            self.showError = true
        }
    }
    
    private func handleTruveraDirectError(_ error: Any) {
        Logger.wallet.error("Truvera API returned error: \(String(describing: error))")
        let errorMsg = error as? String ?? "\(error)"
        
        if errorMsg.lowercased().contains("already verified") || 
           errorMsg.lowercased().contains("already submitted") {
            self.errorMessage = "This proof request has already been verified."
        } else {
            self.errorMessage = "Truvera API error: \(errorMsg)"
        }
        self.showError = true
    }
    
    private func resetModal() {
        proofRequestUrl = ""
        selectedCredential = nil
        currentStep = 1
        isProcessing = false
        successMessage = ""
        showSuccess = false
        errorMessage = ""
        showError = false
    }
}