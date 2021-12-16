/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React, { useState } from 'react';
 import {
   Button,
   SafeAreaView, StyleSheet,
   NativeModules,
   TextInput,
   Text
 } from 'react-native';
 
 const { KeyChainModule } = NativeModules;
 
 const App = () => {
 
   const [text, setText] = useState("");
   const [userName, setUserName] = useState("");
   const [password, setPassword] = useState("");
 
   return (
     <SafeAreaView>
       <Text style={styles.text}>{text}</Text>
       <TextInput
         style={styles.textInput}
         placeholder='userName'
         value={userName}
         onChangeText={setUserName}
       />
       <TextInput
         style={styles.textInput}
         placeholder='password'
         value={password}
         onChangeText={setPassword}
       />
       <Button
         style={styles.button}
         title='추가'
         onPress={() => {
          KeyChainModule.save(userName, password)
          .then(res => {
            console.log(`res : ${res}`);
            setText("saved!")
          })
          .catch(err => {
            console.log(`error: ${JSON.stringify(err)}`);
          })
         }}
       />
       <Button
         style={styles.button}
         title='조회'
         onPress={() => {
          KeyChainModule.load(userName)
          .then(res => {
            console.log(`res : ${JSON.stringify(res)}`);
            setText(JSON.stringify(res));
          })
          .catch(err => {
            console.log(`error: ${JSON.stringify(err)}`);
          })
         }}
       />
       <Button
         style={styles.button}
         title='삭제'
         onPress={() => {
           KeyChainModule.delete(userName)
           .then(res => {
             console.log(`res : ${res}`);
             setText("deleted!");
           })
           .catch(err => {
             console.log(`error: ${JSON.stringify(err)}`);
           })
         }}
       />
     </SafeAreaView>
   );
 };
 
 const styles = StyleSheet.create({
   text: {
     textAlign: "center",
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
 