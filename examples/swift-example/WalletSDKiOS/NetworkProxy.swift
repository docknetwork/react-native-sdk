//
//  NetworkProxy.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import Foundation
import Combine
import os.log

class NetworkDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
        Logger.rpc.debug("URLSession became invalid: \(error?.localizedDescription ?? "no error")")
    }
}

class NetworkProxy: ObservableObject {
    private var rpcCompleters: [String: (Result<[String: Any], Error>) -> Void] = [:]
    private var requestCounter = 0
    
    func makeNativeNetworkRequest(url: String, method: String, body: Data?, headers: [String: String]) async throws -> [String: Any] {
        guard let requestURL = URL(string: url) else {
            throw NSError(domain: "WebView", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }
        
        var request = URLRequest(url: requestURL)
        request.httpMethod = method
        request.httpBody = body
        
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        request.setValue("close", forHTTPHeaderField: "Connection")
        request.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
        request.setValue("HTTP/1.1", forHTTPHeaderField: "Upgrade")
        request.setValue("1.1", forHTTPHeaderField: "HTTP-Version")
        request.setValue("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1", forHTTPHeaderField: "User-Agent")
        
        Logger.rpc.debug("Making native network request to: \(url)")
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30.0
        config.timeoutIntervalForResource = 60.0
        config.waitsForConnectivity = true
        config.allowsCellularAccess = true
        config.allowsConstrainedNetworkAccess = true
        config.allowsExpensiveNetworkAccess = true
        
        config.httpMaximumConnectionsPerHost = 1
        config.httpShouldUsePipelining = false
        
        if #available(iOS 14.5, *) {
            config.multipathServiceType = .none
        }
        
        if #available(iOS 15.0, *) {
            config.tlsMinimumSupportedProtocolVersion = .TLSv12
            config.tlsMaximumSupportedProtocolVersion = .TLSv13
        }
        
        config.httpAdditionalHeaders = [
            "Alt-Svc": "",
            "Upgrade": "HTTP/1.1"
        ]
        
        let delegate = NetworkDelegate()
        let session = URLSession(configuration: config, delegate: delegate, delegateQueue: nil)
        
        Logger.rpc.debug("URLSession config: timeout=\(config.timeoutIntervalForRequest)s, waitsForConnectivity=\(config.waitsForConnectivity)")
        
        var lastError: Error?
        for attempt in 1...3 {
            do {
                Logger.rpc.debug("Network request attempt \(attempt)/3")
                let (data, response) = try await session.data(for: request)
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw NSError(domain: "WebView", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
                }
                
                Logger.rpc.debug("Native request response: \(httpResponse.statusCode)")
                
                if httpResponse.statusCode >= 400 {
                    throw NSError(domain: "WebView", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "HTTP Error \(httpResponse.statusCode)"])
                }
                
                guard let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    throw NSError(domain: "WebView", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON response"])
                }
                
                return jsonObject
                
            } catch {
                lastError = error
                Logger.rpc.error("Network request attempt \(attempt) failed: \(error.localizedDescription)")
                
                if let nsError = error as NSError?,
                   nsError.domain == "WebView" && nsError.code != -1005 {
                    throw error
                }
                
                if attempt < 3 {
                    try await Task.sleep(nanoseconds: UInt64(attempt * 1_000_000_000))
                }
            }
        }
        
        throw lastError ?? NSError(domain: "WebView", code: 0, userInfo: [NSLocalizedDescriptionKey: "All network attempts failed"])
    }
    
    func proxyNetworkRequest(url: String, method: String, body: String?, headers: [String: String]) async throws -> [String: Any] {
        var bodyData: Data? = nil
        
        if let body = body {
            if let data = body.data(using: .utf8) {
                bodyData = data
            } else {
                bodyData = Data(body.utf8)
            }
        }
        
        Logger.rpc.debug("Proxy request body: \(body ?? "nil")")
        
        return try await makeNativeNetworkRequest(url: url, method: method, body: bodyData, headers: headers)
    }
}