import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    Alert,
    Platform,
    StyleSheet
} from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { KeyChainModule, BiometricStateModule } from '../NativeModuleIndex';
import { StyledButton } from './Button';

const AuthBiometric = () => {

    // TouchId + FaceId
    const BiometricScanner = FingerprintScanner;
    const BiometricController = Platform.OS == 'android' ? BiometricController_Android : BiometricController_IOS;

    // 로그인 정보 저장 키
    const KEY_BIOMETRIC = "login";

    const TEXT_NO_DATA = "NO DATA";

    const [existBioId, setExistBioId] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [text, setText] = useState(TEXT_NO_DATA);

    useEffect(() => {
        checkExistBiometricHistory();
    }, [])


    const checkExistBiometricHistory = () => {
        BiometricController.checkExist(KEY_BIOMETRIC)
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
        BiometricController.save(KEY_BIOMETRIC)
            .then(() => {
                setExistBioId(true);
            })
            .catch(err => {
                Alert.alert("SaveBiometricInfo", err.message);
            })
    }


    const deleteBiometricHistory = async (onFinished = () => { }) => {
        BiometricController.delete(KEY_BIOMETRIC)
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
            const isChanged = !(await BiometricController.checkChanged(KEY_BIOMETRIC));
            if (isChanged) {
                deleteBiometricHistory(() => {
                    Alert.alert("CheckBiometricStateChanged", "Changes in biometric state is detected. Please proceed with biometric authentication Again.");
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

    const proceedLogin = () => {
        if (Platform.OS === 'android') {
            
        }
        else {
            KeyChainModule.load(KEY_BIOMETRIC)
            .then(data => {
                setText(JSON.stringify(data));
                setIsLogin(true);
            })
            .catch(err => {
                Alert.alert("LoginError", err.message);
            })
        }
    }

    return (
        <View style={{ flex: 1, paddingVertical: 10 }}>
            <Text style={styles.text}>{text}</Text>

            {
                isLogin && <StyledButton
                    style={styles.button}
                    title='로그아웃'
                    onPress={() => {
                        setIsLogin(false);
                        setText(TEXT_NO_DATA);
                    }} />
            }

            {
                !isLogin && (existBioId ?
                    <StyledButton
                        style={styles.button}
                        title='로그인'
                        onPress={async () => {
                            const isChanged = await checkBiometricStateChanged();
                            if (!isChanged) {
                                authByBiometric(proceedLogin);
                            }
                        }} />
                    : <StyledButton
                        style={styles.button}
                        title='등록'
                        onPress={() => {
                            authByBiometric(saveBiometricHistory);
                        }}
                    />)
            }

            {isLogin && existBioId ?
                <StyledButton
                    style={styles.button}
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

    static checkChanged = (key) => {

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


const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        padding: 8
    },
    button: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'blue'
    }
});

export default AuthBiometric;