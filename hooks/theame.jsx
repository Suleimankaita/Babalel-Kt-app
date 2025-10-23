import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Colors } from '../constants/theme'
import {getTheame} from '../components/Features/Funcslice'
import { useSelector,useDispatch } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'

 
  const theame = () => {

    // const colorsh=useColorScheme();
    
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



  return {colorsh,theame}
}

export default theame

const styles = StyleSheet.create({})