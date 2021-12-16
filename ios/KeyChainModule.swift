import Foundation
import Security
import React

@objc(KeyChainModule)
class KeyChainModule: NSObject {
  
  @objc(save:objectData:resolver:rejecter:)
  func save(_ key: String, objectData: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    var query = queryForKey(key)
    
    deleteForUpdate(key)
    query[kSecValueData as String] = objectData.data(using: String.Encoding.utf8)!
    
    if (SecItemAdd(query as CFDictionary, nil) == errSecSuccess) {
      resolve(true)
    }
    else {
      reject("SaveFailed", "Failed to save login data", nil)
    }
  }
  
  @objc
  func load(_ key: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    var query = queryForKey(key)
    
    query[kSecReturnData as String] = true
    query[kSecReturnAttributes as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    
    var keyData: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &keyData)
    
    if (status == errSecSuccess) {
      guard let existingItem = keyData as? [String: Any],
            let passwordData = existingItem[kSecValueData as String] as? Data,
            let password = String(data: passwordData, encoding: String.Encoding.utf8),
            let account = existingItem[kSecAttrAccount as String] as? String
      else {
        reject(KeyChainError.unExpectedData.string(), "loading login data has unexpected data.", nil)
        return
      }
      resolve([ "userName": account, "password": password ])
    }
    else if (status == errSecItemNotFound) {
      reject(KeyChainError.itemNotFound.string(), "loading login data is not found.", nil)
    }
    else {
      reject(KeyChainError.unExpectedStatus.string(), "loading login data has unexpected error", nil)
    }
  }
  
  func deleteForUpdate(_ key: String) {
    let query = queryForKey(key)
    SecItemDelete(query as CFDictionary)
  }
  
  @objc
  func delete(_ key: String,
              resolver resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    let query = queryForKey(key)
    
    let status = SecItemDelete(query as CFDictionary)
    
    if (status == errSecSuccess) {
      resolve(true)
    }
    else {
      reject("DelteFailed", "Failed to delete login data", nil)
    }
  }
  
  private func queryForKey(_ key: String) -> [String: Any] {
    return [kSecClass as String : kSecClassGenericPassword,
            kSecAttrService as String : Bundle.main.bundleIdentifier,
            kSecAttrAccount as String : key]
  }
  
  
  // error
  enum KeyChainError: Error {
    case itemNotFound
    case duplicateItem
    case unExpectedStatus
    case unExpectedData
    
    func string() -> String {
      switch self {
        
      case .itemNotFound:
        return "itemNotFound"
      case .duplicateItem:
        return "duplicateItem"
      case .unExpectedStatus:
        return "unExpectedStatus"
      case .unExpectedData:
        return "unExpectedData"
      }
    }
  }
}
