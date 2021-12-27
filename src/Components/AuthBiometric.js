import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    Alert,
    Platform,
    StyleSheet,
    TextInput
} from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { KeyChainModule, BiometricStateModule } from '../NativeModuleIndex';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyledButton } from './Button';

const AuthBiometric = () => {

    // TouchId + FaceId
    const BiometricScanner = FingerprintScanner;
    const BiometricController = Platform.OS == 'android' ? BiometricController_Android : BiometricController_IOS;

    // 로그인 정보 저장 키
    const KEY_BIOMETRIC = "login";

    const TEXT_NO_TEXT = "NO TEXT";

    const [existBioId, setExistBioId] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [text, setText] = useState(TEXT_NO_TEXT);

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        checkExistBiometricHistory();

        return () => {
            BiometricScanner.release();
        }
    }, [])



    const checkExistBiometricHistory = () => {
        BiometricController.checkExist(KEY_BIOMETRIC)
            .then(isExist => {
                setExistBioId(isExist);
                if (isExist)
                    checkBiometricStateChanged();
            })
            .catch(err => {
                Alert.alert("CheckBiometricEnrolled", JSON.stringify(err));
            })
    }

    const saveBiometricHistory = () => {
        if (Platform.OS === 'android') {
            if (userName.length == 0 || password.length == 0) {
                Alert.alert("NO TEXT", "UserName or Password is empty.");
                return;
            }

            BiometricScanner.authenticate({
                description: "Enroll Biometric",
                isLogin: false,
                keyName: KEY_BIOMETRIC,
                data: JSON.stringify({
                    userName: userName,
                    password: password
                }),
                onSucceed: async (res) => {
                    BiometricScanner.release();
                    await AsyncStorage.setItem(KEY_BIOMETRIC, res);
                    setText(res);
                    setExistBioId(true);
                }
            })
                .catch(err => {
                    Alert.alert("SaveBiometricInfo", JSON.stringify(err));
                })

        }
        else {
            authByBiometric(() => {
                BiometricController_IOS.save(KEY_BIOMETRIC)
                    .then(() => {
                        setExistBioId(true);
                    })
                    .catch(err => {
                        Alert.alert("SaveBiometricInfo", JSON.stringify(err));
                    })
            })
        }
    }


    const deleteBiometricHistory = async (onFinished = () => { }) => {
        BiometricController.delete(KEY_BIOMETRIC)
            .then(() => {
                setExistBioId(false);
                setIsLogin(false);
                onFinished();
            })
            .catch(err => {
                Alert.alert("DeleteBiometricInfo", JSON.stringify(err));
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
            Alert.alert("CheckBiometricStateError", err.message);
            return true;
        }
    }


    const authByBiometric = (onSucceed = () => { }) => {
        BiometricScanner.authenticate({ description: "Login With Authentication" })
            .then(() => {
                onSucceed();
            })
            .catch(err => {
                Alert.alert(err.name, JSON.stringify(err));
            })
    }

    const proceedLogin = async () => {

        if (Platform.OS === 'android') {
            let data = null;
            try {
                data = await AsyncStorage.getItem(KEY_BIOMETRIC);
            } catch (e) { Alert.alert("LoginError", "Failed to Load data"); }

            if (data != null) {
                BiometricScanner.authenticate({
                    description: "Login by Biometric",
                    isLogin: true,
                    keyName: KEY_BIOMETRIC,
                    data: data,
                    onSucceed: (res) => {
                        BiometricScanner.release();
                        console.log(`res :: ${res}`);
                        setText(res);
                        setIsLogin(true);
                    }
                })
            }
        }
        else {
            authByBiometric(() => {
                KeyChainModule.load(KEY_BIOMETRIC)
                    .then(data => {
                        setText(JSON.stringify(data));
                        setIsLogin(true);
                    })
                    .catch(err => {
                        Alert.alert("LoginError", JSON.stringify(err));
                    })
            })
        }
    }

    return (
        <View style={{ flex: 1, paddingVertical: 10 }}>
            <Text style={styles.text}>{text}</Text>

            {
                !isLogin && !existBioId && <>
                    <TextInput
                        style={styles.textfield}
                        placeholder='USERNAME'
                        value={userName}
                        onChangeText={setUserName}
                    />

                    <TextInput
                        style={[styles.textfield, { marginBottom: 16 }]}
                        placeholder='PASSWORD'
                        value={password}
                        onChangeText={setPassword}
                    />
                </>
            }

            {
                isLogin && <StyledButton
                    style={styles.button}
                    title='로그아웃'
                    onPress={() => {
                        setIsLogin(false);
                        setText(TEXT_NO_TEXT);
                    }} />
            }

            {
                !isLogin && (existBioId ?
                    <StyledButton
                        style={styles.button}
                        title='로그인'
                        onPress={async () => {
                            const isChanged = await checkBiometricStateChanged();
                            if (!isChanged) proceedLogin();
                        }} />
                    : <StyledButton
                        style={styles.button}
                        title='등록'
                        onPress={() => {
                            saveBiometricHistory();
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
    static checkExist = async (key) => {
        const encryptedData = await AsyncStorage.getItem(key);
        return encryptedData != null;
    }

    static checkChanged = async (key) => {
        const data = await AsyncStorage.getItem(key);
        const parsedData = JSON.parse(data);
        return FingerprintScanner.checkChanged(key, parsedData.initializationVector);
    }

    static save = (key) => {

    }

    static delete = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (e) {
            console.log(`remove Item is Failed : ${e.message}`);
        }
    }
}

const BiometricController_IOS = class {
    static checkExist = (key) => {
        new Promise((resolve) => {
            return BiometricStateModule.isExist(key);
        })
    }

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
    textfield: {
        borderBottomWidth: 1,
        borderColor: '#aaa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginHorizontal: 32,
        marginVertical: 4
    },
    button: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 15,
        borderWidth: 1
    }
});

export default AuthBiometric;