import { createSlice, } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const initialState={
    shows:false,
    theame:false,
    Route:null,
    token:null,
    userdata:{

    },
   
}

const Funcslice=createSlice({
    name:"Auths",
    initialState,
    reducers:{

           clearAuth :async (state,action) => {
            try {
                // console.log('auth')
                // const router=useRouter()
            //   await AsyncStorage.removeItem('cokkie');
              state.token=null
               state.userdata={} 
            //   router.replace('/(Login)/Login');
            } catch (error) {
              console.log('Error during logout:', error);
            }
          },

          setTheame:(state,action)=>{
            state.theame=action.payload
            console.log(action.payload)
          },
        
        toggleShows:(state)=>{
            state.shows=!state.shows
        },

        settoken:(state,action)=>{
            console.log(action.payload)
            state.token=action.payload
        },
        clearToken:(state,action)=>{
            state.token=null
        },
        Setuserdata:(state,action)=>{
            console.log(action.payload)
            state.userdata=action.payload
        },
        setUserfound:(state,action)=>{
            console.log('payload   ',action.payload)
            state.user_Transactionfound=action.payload
        },
        SetRoute:(state,action)=>{
            console.log('payload   ',action.payload)
            state.Route=action.payload
        },

    }


})

export const {clearAuth,toggleShows,settoken,clearToken,Setuserdata,setTheame,setUserfound,SetRoute}=Funcslice.actions

export const selectShows=(state)=>state.Auths.shows; 
export const getuserfound=(state)=>state.Auths.userdata; 
export const get_transaction_found=(state)=>state.Auths.user_Transactionfound; 
export const gettoken=(state)=>state.Auths.token; 
export const GetRoute=(state)=>state.Auths.Route; 
export const getTheame=(state)=>state.Auths.theame; 

export default Funcslice.reducer;