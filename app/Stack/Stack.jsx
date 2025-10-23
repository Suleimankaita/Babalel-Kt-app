import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {GetRoute,getTheame} from "../../components/Features/Funcslice"
import { Stack } from 'expo-router'
import { useSelector } from 'react-redux'
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';
import theames from '@/hooks/theame';



export const unstable_settings = {
  anchor: '(tabs)',
};
const Stacks = () => {

    const colors=useSelector(getTheame)
      const {theame}=theames()
    const Route=useSelector(GetRoute)
               
  return (

            <ThemeProvider value={colors? DarkTheme : DefaultTheme}>
   <Stack>
           <Stack.Screen name="(tabs)" options={{ headerShown: false,title:'Home' }} />
           <Stack.Screen name="(Reg)/Login" options={{ headerShown: false,title:'Home' }} />
           <Stack.Screen name="(Sold)/[id]" options={{ headerShown: true,title:Route }} />
           <Stack.Screen name="(update)" options={{ headerShown: true,title:Route }} />
           <Stack.Screen name="(product)" options={{ headerShown:true,title:Route }} />
           <Stack.Screen name="(Reg)/Sign" options={{ headerShown: false,title:'Home' }} />
           <Stack.Screen name="(Reg)/otp" options={{ headerShown: true,title:'Otp' }} />
           <Stack.Screen name="Remove/RemoveAllProduct" options={{ headerShown: true,title:'RemoveAllProducts' }} />
           <Stack.Screen name="Remove/RemoveAllCate" options={{ headerShown: true,title:'RemoveAllCategories' }} />
           <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
         </Stack>
               <StatusBar style={colors?"inverted":"dark"} />
         
    </ThemeProvider>
  )
}

export default Stacks

const styles = StyleSheet.create({})