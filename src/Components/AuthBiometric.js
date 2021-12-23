import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    Alert,
    Platform
} from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { KeyChainModule, BiometricStateModule } from '../NativeModuleIndex';

const AuthBiometric = () => {

    // TouchId + FaceId
    const BiometricScanner = FingerprintScanner;
    const BiometricController = Platform.OS == 'android' ? BiometricController_Android : BiometricController_IOS;

    // 로그인 정보 저장 키
    const biometricKey = "login";

    const [existBioId, setExistBioId] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        checkExistBiometricHistory();
    }, [])


    const checkExistBiometricHistory = () => {
        BiometricController.checkExist(biometricKey)
        .then(isExist => {
            setExistBioId(isExist);
            if (isExist)
                checkBiometricStateChanged();
        })
        .catch(err => {
            Alert.alert("CheckBiometricEnrolled", err.message);
        })
    }

    const saveBiometricHistory = () => {
        BiometricController.save(biometricKey)
        .then(() => {
            setExistBioId(true);
        })
        .catch(err => {
            Alert.alert("SaveBiometricInfo", err.message);
        })
    }


    const deleteBiometricHistory = async (onFinished = () => { }) => {
        BiometricController.delete(biometricKey)
        .then(() => {
            setExistBioId(false);
            setIsLogin(false);
            onFinished();
        })
        .catch(err => {
            Alert.alert("DeleteBiometricInfo", err.message);
        })
    }

    const checkBiometricStateChanged = async () => {
        try {
            const isChanged = !(await BiometricController.checkChanged(biometricKey));
            if (isChanged) {
                deleteBiometricHistory(() => {
                    Alert.alert("checkBiometricStateChanged", "Changes in biometric state is detected. Please proceed with biometric authentication Again.");
                })
            }
            return isChanged;
        } catch (err) {
            Alert.alert("CheckBiometricState", err.message);
            return true;
        }
    }


    const authByBiometric = (onSucceed = () => { }) => {
        BiometricScanner.authenticate({ description: "Login With Authentication" })
            .then(() => {
                onSucceed();
            })
            .catch(err => {
                Alert.alert(err.name, err.message);
            })
    }

    return (
        <View style={{ flex: 1, paddingVertical: 10 }}>
            {
                isLogin && <Button
                    style={{ padding: 16 }}
                    title='로그아웃'
                    onPress={() => { setIsLogin(false); }} />
            }

            {
                !isLogin && (existBioId ?
                    <Button
                        style={{ padding: 16 }}
                        title='로그인'
                        onPress={async () => {
                            const isChanged = await checkBiometricStateChanged();
                            if (!isChanged) authByBiometric(() => { setIsLogin(true); });
                        }} />
                    : <Button
                        style={{ padding: 16 }}
                        title='등록'
                        onPress={() => {
                            authByBiometric(() => {
                                saveBiometricHistory();
                            });
                        }}
                    />)
            }

            {isLogin && existBioId ?
                <Button
                    style={{ padding: 16 }}
                    title='삭제'
                    onPress={() => {
                        deleteBiometricHistory();
                    }}
                /> : null}
        </View>
    )
}


const BiometricController_Android = class {
    static checkExist = (key) => {

    }

    static checkChanged111 = (key) => {

    }

    static save = (key) => {

    }

    static delete = (key) => {

    }
}

const BiometricController_IOS = class {
    static checkExist = (key) =>
        BiometricStateModule.isExist(key);

    static checkChanged = (key) =>
        BiometricStateModule.check(key)

    static save = (key) =>
        BiometricStateModule.save(key)
            .then(() => {
                return KeyChainModule.save(key, JSON.stringify({
                    userName: "abcdefg",
                    password: "a123456"
                }));
            })

    static delete = (key) =>
        BiometricStateModule.delete(key)
            .then(() => {
                return KeyChainModule.delete(key);
            })
}

export default AuthBiometric;