import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { products } from '../json/data';
import { router } from 'expo-router';
import { useGetSoldProductQuery,useRemoveProductMutation } from '@/components/Features/Getslice';
import { uri } from '@/components/Features/api/uri';
import Loading from '../Loader/Loading';
import theames from '@/hooks/theame';
import { getTheame } from '@/components/Features/Funcslice';
import { useDispatch,useSelector } from 'react-redux';
import { SetRoute } from '@/components/Features/Funcslice';
const ProductCard = ({ styles,item ,Delete,disp}) => (
  <TouchableOpacity  onPress={()=>{
    disp(SetRoute(item?.name))
    router.push(`(update)/${item._id}`)}} style={styles.card}>
    {/* Badge */}
    {item.badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>
    )}
    
    {/* Wishlist Icon */}
    {/* <TouchableOpacity style={styles.wishlistIcon}>
      <AntDesign name="heart" size={20} color={item.id === '1' ? '#FF5757' : '#D3D3D3'} />
    </TouchableOpacity> */}

    {/* Shoe Image (Use a placeholder image source for a real app) */}
    <Image 
      source={{ uri:`${uri}/img/${item.image[0]}` }} 
      style={styles.shoeImage} 
    />

    <View style={styles.detailsContainer}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.price}>${item?.retailPrice}</Text>
      
      {/* Rating Stars */}
       <View style={styles.rating}>
        {/* {[...Array(5)].map((_, i) => (
          <Ionicons 
            key={i} 
            name={i < Math.floor(item.rating) ? 'star' : 'star-outline'} 
            size={12} 
            color="#FFC107" 
            style={{ marginRight: 2 }}
          />
        ))} */}
        <Text style={{ fontSize: 12, color: '#999' }}>({item?.quantity} in stock)</Text>
      </View> 
    </View>


    <TouchableOpacity onPress={async({styles})=>{
      try{

        const data=await Delete({id:item?._id}).unwrap()

        console.log(data)

      }catch(err){
        alert(err.message)
      }
    }} style={styles.addToCartButton}>
      <AntDesign name="delete" size={18} color="white" />
    </TouchableOpacity>

  </TouchableOpacity>
);

export default function ProductListingScreen() {

    const {data,isLoading:isLoadingProduct,isError:isErrorProduct,error:errorProduct}=useGetSoldProductQuery('',{
      pollingInterval:1000,
      refetchOnFocus:true
    })
    const [search,setSearch]=useState('');
    const [PRODUCTS,setPRODUCTS]=useState([])
    
    const {theame,colorsh}=theames()

    useEffect(()=>{
      if(!data)return;
      setPRODUCTS(data)
    },[data])

    const filteredProducts = PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );

    const [Delete,{isLoading:isLoadingDelete,isSuccess:isSuccessDelete,error:errorDelete,isError:isErrorDelete}]=useRemoveProductMutation()

    const disp=useDispatch()

    const styles=style(colorsh,theame)

    if(!filteredProducts.length){
      return <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:'center'}}>
        <Text style={{color:theame.text}}>No Low Stock Product to display</Text>
      </SafeAreaView>
    }

  return (
    <>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Feather name="grid" size={24} color="#FF5757" /> */}
        {/* Placeholder for the user avatar/profile image */}
        {/* <Image 
          source={{ uri: 'https://i.pravatar.cc/300' }} 
          style={styles.avatar}
        /> */}
      </View>

      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
        {/* <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune" size={24} color="white" />
        </TouchableOpacity> */}
      </View>

      {/* <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Sports Shoes</Text>
        <TouchableOpacity>
            <Text style={styles.sortText}>Sort By $\downarrow$</Text>
        </TouchableOpacity>
      </View> */}

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard styles={styles} disp={disp} item={item } Delete={Delete} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>


  {isLoadingProduct||isLoadingDelete && (
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
}

// --- Stylesheet ---
const style =(colorsh,theame)=> StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theame.background,
    paddingHorizontal: 15,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: !colorsh?'#FF5757':theame.text,
  },

  // Search Bar Styles
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: !colorsh?'#f0f0f0':'rgba(109, 107, 107, 0.31)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: !colorsh?'#333':theame.text,
  },
  filterButton: {
    backgroundColor: '#FF5757',
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category Header Styles
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: !colorsh?'#333':theame.text,
  },
  sortText: {
    fontSize: 14,
    color:!colorsh? '#999':theame.text,
  },

  // List & Card Styles
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: theame.background,
    borderRadius: 15,
    padding: 10,
    margin: 8,
    alignItems: 'center',
    shadowColor:!colorsh ?'#000':'rgba(93, 93, 93, 0.17)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
    position: 'relative', // for absolute positioning of badge/heart/plus
  },
  shoeImage: {
    width: '100%',
    height: 150,
    borderRadius:10,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  badge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#00C853', // Example color for a badge
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  detailsContainer: {
    width: '100%',
    paddingLeft: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color:!colorsh?'#333':theame.text,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5757',
    marginVertical: 4,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF5757',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});