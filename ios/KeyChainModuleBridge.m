#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KeyChainModule, NSObject)

RCT_EXTERN_METHOD(save:(NSString *) key
                  objectData:(NSString *) objectData
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(load:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(delete:(NSString *) key
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)

+ (BOOL) requiresMainQueueSetup {
  return NO;
}

@end
