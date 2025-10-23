import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import { useRemoveAllCategoriesMutation } from '@/components/Features/Getslice';
import { router } from 'expo-router';
import Loading from '../Loader/Loading';
import { Colors } from '@/constants/theme';
import { useSelector } from 'react-redux';
import { getTheame } from '@/components/Features/Funcslice';

const RemoveAllCategoriesScreen = () => {
  
    const [del,{isLoading,isSuccess,error,isError}]=useRemoveAllCategoriesMutation()
  
    const handleDeleteAll = async() => {

    try{

        const data=await del({}).unwrap()
        console.log(data)
    }catch(err){
        alert(err.message||err.data.message)
    }

  };

  useEffect(()=>{
    if(isSuccess){
        // router.back()
    }
    if(isError){
        alert(error.data?.message)
    }
  },[isSuccess,isError])


  
          const Bg=useSelector(getTheame);
          const [colorsh,setcolorsh]=useState(Bg);
      
          const [theame,settheame]=useState(Colors.light)
    
          useEffect(()=>{
          
              const mss=async()=>{
                  try{
                      const get=await AsyncStorage.getItem('Blk')
                      const ls=JSON.parse(get).theame||Bg;
                      setcolorsh(ls)
                      
                      if(ls===true){
                          settheame(Colors.light)
                      }else if(ls===false){
                          settheame(Colors.dark)
                      }
                  }catch(err){
                      alert(err.message)
                  }
          }
         
          let clear= setInterval(() => mss,1000);
      
          return ()=>{
              clearInterval(clear)
          }
          },[])
      
      
          
          useMemo(()=>{
              if(Bg){
                  // const ms=colorsh==="dark"?Colors.dark:Colors.light
                  setcolorsh(Bg)
                  settheame(Colors.dark)
              }else{
                  setcolorsh(Bg)
                  settheame(Colors.light)
              }
          },[Bg,colorsh])
      
      
          
          const styles=style(colorsh,theame)
      

  return (
    <>
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 1. Alert Icon */}
        <View style={styles.iconContainer}>
          <AntDesign name="close-circle" size={80} color="#D9534F" />
        </View>

        {/* 2. Headline */}
        <Text style={styles.headline}>Are you absolutely sure?</Text>

        {/* 3. Warning Message */}
        <Text style={styles.warningText}>
          This action will **permanently delete** all of your custom categories
          and **cannot be undone**. All associated data may be lost.
        </Text>

        {/* 4. Delete Button (Primary Action) */}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAll}>
          <Text style={styles.deleteButtonText}>Delete All Categories</Text>
        </TouchableOpacity>

        {/* 5. Cancel Button (Secondary Action) */}
        {/* <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
       {isLoading && (
                         <View
                           style={{
                              width: '100%',
                             height: '100%',
                             position: 'absolute',
                             backgroundColor: '#14141434',
                             justifyContent: 'center',
                             alignItems: 'center',
                             zIndex:1000,
                           }}
                         >
                           <Loading/>
                         </View>
                       )}
    </>
  );
};

// ---
// Stylesheet
// ---

const style =(colorsh,theame)=> StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theame.background,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  iconContainer: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: !colorsh?'#333':theame.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color:!colorsh? '#666':theame.text,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  // Style for the main destructive action button
  deleteButton: {
    backgroundColor: '#D9534F', // A strong red color for danger
  },
  deleteButtonText: {
    color:theame.text,
    fontSize: 18,
    fontWeight: '600',
  },
  // Style for the secondary/cancel action button
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor:!colorsh? '#ccc':theame.text, // Lighter border
  },
  cancelButtonText: {
    color: !colorsh?'#666':theame.text,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RemoveAllCategoriesScreen;