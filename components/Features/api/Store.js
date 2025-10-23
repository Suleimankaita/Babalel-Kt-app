import { configureStore } from "@reduxjs/toolkit"; 
import {apislice }from "./Apislice";
import Funcslice from "../Funcslice"
export const store=configureStore({
    reducer:{
        Auths:Funcslice,
        [apislice.reducerPath]:apislice.reducer,
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware().concat(apislice.middleware),
    devTools:true
},
)