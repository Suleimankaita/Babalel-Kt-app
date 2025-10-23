import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAUTHMutation, useRegMutation } from '@/components/Features/Getslice';
import LOGO_IMAGE from "../../assets/images/logo.jpg";
import Loading from '../Loader/Loading';
import { settoken } from '@/components/Features/Funcslice';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

  const SignUpScreen = () => {
  
    const [Regs, { isLoading: isloadingReg }] = useRegMutation();
  const [Login, { isLoading: isloadingLogin,isSuccess }] = useAUTHMutation();

  const disp=useDispatch()
  const [Colors, setColors] = useState('#ccc');
  const [fullname, setFullname] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [Confirm, setConfirm] = useState('');

  useEffect(() => {
    if (Password.length && Confirm.length && Password !== Confirm) {
      setColors('tomato');
    } else {
      setColors('#ccc');
    }
  }, [Confirm, Password]);

  useEffect(()=>{
    if(isSuccess){
          router.replace('/')
    
    }
  },[isSuccess,router])

  const handleSignUp = async () => {
    // --- Basic Validation ---
    if (!fullname || !Email || !Password || !Confirm) {
      return alert('Please fill in all fields');
    }
    if (Password !== Confirm) {
      return alert('Passwords do not match');
    }

    try {
      // --- Register ---
      await Regs({ username: fullname, Email, Password }).unwrap();

      const logins = await Login({ username: fullname, password: Password }).unwrap();
      disp(settoken(logins))
        if(data.error?.status){
        alert(data.error?.message)
      } 

       if(data){
      
              await AsyncStorage.setItem('cokkie',JSON.stringify(data?.data))
            }
              
    } catch (err) {
      alert(err?.data?.message || err.message);
    }
  };

  return (
    <>
      <ScrollView style={{backgroundColor:'white'}} automaticallyAdjustKeyboardInsets contentContainerStyle={styles.container}>
        <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="cover" />

        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="user" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullname}
              onChangeText={setFullname}
              keyboardType="default"
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={setEmail}
              autoCapitalize="none"
              value={Email}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={Password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrapper, { borderColor: Colors, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              onChangeText={setConfirm}
              value={Confirm}
              placeholder="Confirm Password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (Password !== Confirm || !Password) && { backgroundColor: '#999' }]}
          onPress={handleSignUp}
          disabled={Password !== Confirm || !Password}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.socialText} />

        <View style={styles.loginLinkContainer}>
          <Text style={styles.alreadyAccountText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/Login')}>
            <Text style={styles.loginLinkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {(isloadingReg || isloadingLogin) && (
        <View style={styles.loaderOverlay}>
          <Loading />
        </View>
      )}
    </>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#f97316',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialText: {
    color: '#777',
    marginVertical: 20,
    fontSize: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  alreadyAccountText: {
    fontSize: 16,
    color: '#777',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 5,
  },
  loaderOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#14141434',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default SignUpScreen;
