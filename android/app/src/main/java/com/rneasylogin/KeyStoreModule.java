package com.rneasylogin;

import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import androidx.annotation.RequiresApi;
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class KeyStoreModule {

    private final String KEY_PROVIDER = "AndroidKeyStore";

    @RequiresApi(api = Build.VERSION_CODES.N)
    private SecretKey generateSecretKey(String keyName) {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_AES, KEY_PROVIDER);

                keyGenerator.init(new KeyGenParameterSpec.Builder(
                        keyName,
                        KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                        .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
                        .setUserAuthenticationRequired(true)
                        // Invalidate the keys if the user has registered a new biometric
                        // credential, such as a new fingerprint. Can call this method only
                        // on Android 7.0 (API level 24) or higher. The variable
                        // "invalidatedByBiometricEnrollment" is true by default.
                        .setInvalidatedByBiometricEnrollment(true)
                        .build());

            return keyGenerator.generateKey();
        } catch (NoSuchAlgorithmException | NoSuchProviderException | InvalidAlgorithmParameterException exception) {
            exception.printStackTrace();
        }

        return null;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private SecretKey getSecretKey(String keyName) {

        try {
            KeyStore keyStore = KeyStore.getInstance(KEY_PROVIDER);
            // Before the keystore can be accessed, it must be loaded.
            keyStore.load(null);
            SecretKey existKey = ((SecretKey) keyStore.getKey(keyName, null));
            if (existKey != null) return existKey;
        } catch (java.security.KeyStoreException | java.security.cert.CertificateException | java.io.IOException |
                java.security.NoSuchAlgorithmException | java.security.UnrecoverableKeyException e) {
            e.printStackTrace();
        }

        return generateSecretKey(keyName);
    }

    private Cipher getCipher() {
        try {
            return Cipher.getInstance(KeyProperties.KEY_ALGORITHM_AES + "/"
                    + KeyProperties.BLOCK_MODE_CBC + "/"
                    + KeyProperties.ENCRYPTION_PADDING_PKCS7);
        } catch (java.security.NoSuchAlgorithmException | javax.crypto.NoSuchPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }
}
