import AsyncStorage from '@react-native-async-storage/async-storage';


const PRODUCTS_KEY = '@inventory_products_v2';
const ACTIVITIES_KEY = '@inventory_activities_v2';


export async function loadProducts(){
const json = await AsyncStorage.getItem(PRODUCTS_KEY);
return json ? JSON.parse(json) : [];
}
export async function saveProducts(products){
await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
export async function loadActivities(){
const json = await AsyncStorage.getItem(ACTIVITIES_KEY);
return json ? JSON.parse(json) : [];
}
export async function saveActivities(activities){
await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}