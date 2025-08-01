//
//  Models.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 19/06/25.
//

import Foundation

public struct Credential: Identifiable, Codable {
    public let id: String
    public let type: [String]
    public let issuer: CredentialIssuer
    public let issuanceDate: String
    public let credentialSubject: [String: AnyCodable]
    public let proof: [String: AnyCodable]?
    public let credentialSchema: CredentialSchema?
    public let cryptoVersion: String?
    public let context: [AnyCodable]?
    
    private enum CodingKeys: String, CodingKey {
        case id, type, issuer, issuanceDate, credentialSubject, proof, credentialSchema, cryptoVersion
        case context = "@context"
    }
    
    public var displayName: String {
        if let name = credentialSubject["name"]?.value as? String {
            return name
        } else if let nome = credentialSubject["nome"]?.value as? String {
            return nome
        }
        return type.last ?? "Credential"
    }
}

public struct CredentialSchema: Codable {
    public let id: String
    public let type: String?
    public let version: String?
    public let details: String?
}

public struct CredentialIssuer: Codable {
    public let id: String
    public let name: String?
}

public struct AnyCodable: Codable {
    public let value: Any
    
    public init(_ value: Any) {
        self.value = value
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array
        } else {
            value = NSNull()
        }
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let string = value as? String {
            try container.encode(string)
        } else if let int = value as? Int {
            try container.encode(int)
        } else if let double = value as? Double {
            try container.encode(double)
        } else if let bool = value as? Bool {
            try container.encode(bool)
        } else if let dict = value as? [String: AnyCodable] {
            try container.encode(dict)
        } else if let array = value as? [AnyCodable] {
            try container.encode(array)
        }
    }
}