import Foundation
import React
import LocalAuthentication

@objc(BiometricStateModule)
class BiometricStateModule : NSObject {
  
  
  @objc
  func isExist(_ key: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    resolve(UserDefaults.standard.data(forKey:key) != nil)
  }
  
  
  @objc
  func save(_ key: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    let authContext = LAContext()
    var error: NSError?
    
    authContext.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    guard error == nil else {
      reject(BiometricError.unExpectedStatus.string(), "authentication cannot proceed.", nil)
      return
    }
    
    UserDefaults.standard.removeObject(forKey: key)
    UserDefaults.standard.set(authContext.evaluatedPolicyDomainState, forKey: key)
    resolve(true)
  }
  
  @objc
  func check(_ key: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    let authContext = LAContext()
    var error: NSError?
    let savedBiometricPolicyState = UserDefaults.standard.data(forKey: key)
    
    authContext.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    guard error == nil, savedBiometricPolicyState != nil else {
      reject(BiometricError.unExpectedStatus.string(), "authentication cannot proceed.", nil)
      return
    }
    
    resolve(savedBiometricPolicyState == authContext.evaluatedPolicyDomainState)
  }
  
  
  @objc
  func delete(_ key: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    UserDefaults.standard.removeObject(forKey: key)
    resolve(true)
  }
  
  // error
  enum BiometricError: Error {
    case unExpectedStatus
    
    func string() -> String {
      switch self {
        
      case .unExpectedStatus:
        return "unExpectedStatus"
      }
    }
  }

}
