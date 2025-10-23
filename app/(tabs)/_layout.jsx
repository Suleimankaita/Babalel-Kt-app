import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useDispatch, UseDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uri } from '@/components/Features/api/uri';
import { setTheame ,getTheame} from '@/components/Features/Funcslice';
import {useGetUserQuery} from "../../components/Features/Getslice"
import Useauth from '../hooks/Useauth';
import theames from '@/hooks/theame';
import { useSelector } from 'react-redux';
export default function TabLayout() {
  const {data,isLoading,isSuccess}=useGetUserQuery('',{
    pollingInterval:1000,
    refetchOnReconnect:true,
    refetchOnFocus:true
  })

  const router=useRouter()

  const dips=useDispatch()

 
  const [img,setimg]=useState("")

  const {Username,userData}=Useauth()

  const BG=useDispatch(getTheame)

  const colorScheme = useColorScheme();

  useEffect(() => {
  if (!Username) {
    const redirectTimer = setTimeout(() => {
      console.log('Username is empty, redirecting to login', Username);
      router.replace('/(Reg)/Login');
    }, 100);

    return () => clearTimeout(redirectTimer);
  } else {
    console.log('User is authenticated:', Username);
  }
}, [Username, router]);


  useEffect(()=>{
      
    if(!data)return;

    const find=data.find(res=>res?._id===userData?.id)

    if(find){
     setimg(find?.img) 
    }

  },[data])

  useEffect(()=>{

    const ms=async()=>{
      try{

        console.log(BG)

        const datas=await AsyncStorage.getItem("Blk")

        if(datas){
          const dat=JSON.parse(datas)

          dips(setTheame(dat?.theame))

        }

      }catch(err){
        alert(err.message)
      }
    }
    ms()

  },[])

   const colors=useSelector(getTheame)
  const {theame}=theames()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:colors?Colors.dark.tint:Colors.light.tint,
        headerTitleStyle:{
          textAlign:"left",
          alignItems:"flex-end"
        },
        headerRight:()=><Image style={{width:30,height:30,borderRadius:50,marginRight:10}} source={{uri:`${uri}/img/${img}`}}/>,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Addproduct"
        options={{
          title: 'Addproduct',
          tabBarIcon: ({ color }) =><Entypo name="add-to-list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) =><AntDesign name="product" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lowStock"
        options={{
          title: 'LowStock',
          tabBarIcon: ({ color }) =><AntDesign name="stock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Sells"
        options={{
          title: 'Sells',
          tabBarIcon: ({ color }) =><MaterialIcons name="sell" size={24} color={color} />,

        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'me',
          tabBarIcon: ({ color }) =><MaterialIcons name="person" size={24} color={color} />,

        }}
      />
      
    </Tabs>
  );
}
