/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import {
  Button, FlatList, Platform, SafeAreaView, StyleSheet, Text, View
} from 'react-native';
import AuthBiometric from './src/Components/AuthBiometric';



const App = () => {

  const LOGINTYPES = [
    "PINNUMBER",
    "PATTERN",
    "FINGERPRINT",
    "FACE"
  ]

  const [typeLogin, setTypeLogin] = useState(LOGINTYPES[0]);

  const AuthByType = () => {
    switch (typeLogin) {
      case LOGINTYPES[0]:
        return <View />
      case LOGINTYPES[1]:
        return <View />
      case LOGINTYPES[2]:
      case LOGINTYPES[3]:
        return <AuthBiometric />
    }
  }

  const availableOnAndroid = () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 24)
        return true
      else return false
    }
    return true;
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 4, alignSelf: 'center' }}
        data={LOGINTYPES}
        horizontal
        renderItem={({ item }) => (
          item !== typeLogin && availableOnAndroid() && <Button
            title={item}
            onPress={() => {
              setTypeLogin(item);
            }}
          />
        )}
      />

      <Text style={styles.text}>{typeLogin}</Text>

      <View style={{ flex: 16 }}>
          {AuthByType()}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 'bold',
    padding: 10
  },
  textInput: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 16
  }
});

export default App;

