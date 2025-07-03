//
//  Logger+Extensions.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import Foundation
import os.log

extension Logger {
    private static var subsystem = Bundle.main.bundleIdentifier!
    
    static let webView = Logger(subsystem: subsystem, category: "webview")
    static let rpc = Logger(subsystem: subsystem, category: "rpc")
    static let wallet = Logger(subsystem: subsystem, category: "wallet")
    static let navigation = Logger(subsystem: subsystem, category: "navigation")
}