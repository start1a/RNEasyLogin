#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BiometricStateModule, NSObject)

RCT_EXTERN_METHOD(isExist:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(save:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(check:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(delete:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

+ (BOOL) requiresMainQueueSetup {
  return NO;
}

@end
