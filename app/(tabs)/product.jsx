import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetProductQuery, useGetGetCategoriesQuery } from '@/components/Features/Getslice';
import Loading from '../Loader/Loading';
import { uri } from '@/components/Features/api/uri';
import { SetRoute } from '@/components/Features/Funcslice';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { getTheame } from '@/components/Features/Funcslice';
import theames from '@/hooks/theame';
import { useSelector } from 'react-redux';
const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 20;
const FEATURED_CARD_WIDTH = width * 0.75;
const FEATURED_ITEM_SPACING = 15;

// --- Product Card ---
const GridProductCard = ({styles, product, router, disp }) => (
  <TouchableOpacity
    style={styles.cardContainer}
    onPress={() => {
      disp(SetRoute(product?.name));
      router.push(`/(product)/${product?._id}`);
    }}>
    <Image
      source={{ uri: `${uri}/img/${product?.image?.[0]}` }}
      style={styles.cardImage}
    />
    <View style={styles.cardDetails}>
      <Text style={styles.cardCategory}>{product?.category}</Text>
      <Text style={styles.cardName} numberOfLines={1}>
        {product?.name}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>${product?.retailPrice?.toFixed(2)}</Text>
        <Text style={styles.wishlistIcon}>{'♡'}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// --- Featured Product Card ---
const FeaturedCard = ({ styles,disp, item, index, scrollX, searchQuery, router }) => {
  const inputRange = [
    (index - 1) * (FEATURED_CARD_WIDTH + FEATURED_ITEM_SPACING),
    index * (FEATURED_CARD_WIDTH + FEATURED_ITEM_SPACING),
    (index + 1) * (FEATURED_CARD_WIDTH + FEATURED_ITEM_SPACING),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });

  if (searchQuery?.length) return null;

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => {
          disp(SetRoute(item?.name));
          router.push(`/(product)/${item?._id}`);
        }}>
        <Image
          source={{styles, uri: `${uri}/img/${item?.image?.[0]}` }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text style={styles.featuredPrice}>${item?.retailPrice?.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.featuredButton}
            onPress={() => router.push(`/(product)/${item?._id}`)}>
            <Text style={styles.featuredButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main Page ---
const AllProductsPage = () => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [CATEGORIES, setCATEGORIES] = useState([]);
  const [refreshings, setrefreshings] = useState(false);
  const socket=useRef(null)

  const disp = useDispatch();

  const {
    data: productData,
    isLoading: isloadingPro,
    isError,
  } = useGetProductQuery('', {
    pollingInterval: 100,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: productCate,
    isLoading: Isloadingcate,
    isError: isErrorCate,
  } = useGetGetCategoriesQuery('', {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // useEffect(() => {

  //   const ms=async()=>{

  //       setPRODUCTS(productData)
      
  //   }
  //   ;
  //   ms()
  // }, [productData]);

useEffect(() => {
  if (!socket.current) {
    socket.current = io(uri, {
      transports: ['websocket'],
    });
  }

  socket.current.on('connect', () => {
    console.log('✅ Connected to Socket Server');
    fetch(`${uri}/Products`)
      .then(res => res.json())
      .then(data =>  data)
      .catch(err => console.error('Fetch error:', err));
  });

  socket.current.off('All').on('All', (datass) => {
    // Prevent flicker by checking if data actually changed
    setPRODUCTS(prev => {
      const sameLength = prev?.length === datass?.length;
      const sameIds = sameLength && prev.every((p, i) => p._id === datass[i]._id);
      if (sameIds) return prev;
      return datass;
    });
  });

  return () => {
    socket.current.off('All');
    socket.current.disconnect();
    socket.current = null;
  };
}, []);

  
  

  const FEATURED_PRODUCTS = PRODUCTS?.filter((p) => p?.isFeatured);

  useEffect(() => {
    if (!productCate) return;
    setCATEGORIES(productCate.map((res) => res.name));
  }, [productCate]);

  const filteredProducts = useMemo(() => {
    if (!PRODUCTS) return ;
    let result = PRODUCTS;

    if (selectedCategory.toLowerCase() !== 'all') {
      result = result.filter((product) => product?.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product?.name?.toLowerCase().includes(query) ||
          product?.category?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [PRODUCTS, selectedCategory, searchQuery]);

  const refresh = () => {
    setrefreshings(true);
    setTimeout(() => {
      setrefreshings(false);
    }, 1000);
  };

  

  let styless;
  // const renderHeader = () => (
    // <View>
    //   {!searchQuery && (
    //     <>
    //       <Text style={styles.scrollSectionTitle}>🔥 Trending Products</Text>
    //       <Animated.FlatList
    //         horizontal
    //         showsHorizontalScrollIndicator={false}
    //         data={FEATURED_PRODUCTS}
    //         keyExtractor={(item) => item?._id}
    //         renderItem={({ item, index }) => (
    //           <FeaturedCard
    //       styles={styles}

    //             router={router}
    //             searchQuery={searchQuery}
    //             item={item}
    //             index={index}
    //             scrollX={scrollX}
    //             disp={disp}
    //           />
    //         )}
    //         onScroll={Animated.event(
    //           [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    //           { useNativeDriver: true }
    //         )}
    //         snapToInterval={FEATURED_CARD_WIDTH + FEATURED_ITEM_SPACING}
    //         decelerationRate="fast"
    //         contentContainerStyle={styles.featuredScrollContainer}
    //       />

    //       <Text style={styles.scrollSectionTitle}>Shop By Category</Text>
    //       <ScrollView
    //         horizontal
    //         showsHorizontalScrollIndicator={false}
    //         style={styles.categoryScroller}>
    //         {CATEGORIES.map((category, _) => (
    //           <TouchableOpacity
    //             key={_}
    //             style={[
    //               styles.categoryButton,
    //               selectedCategory === category && styles.categorySelected,
    //             ]}
    //             onPress={() => setSelectedCategory(category)}>
    //             <Text
    //               style={[
    //                 styles.categoryText,
    //                 selectedCategory === category && styles.categoryTextSelected,
    //               ]}>
    //               {category}
    //             </Text>
    //           </TouchableOpacity>
    //         ))}
    //       </ScrollView>

    //       <View style={styles.sectionHeader}>
    //         <Text style={styles.sectionTitle}>
    //           {selectedCategory === 'All'
    //             ? 'Explore All'
    //             : `${selectedCategory} (${filteredProducts.length})`}
    //         </Text>
    //         <TouchableOpacity onPress={() => console.log('Open Filter/Sort Modal')}>
    //           <Text style={styles.filterIcon}>{'⚙️ Filter'}</Text>
    //         </TouchableOpacity>
    //       </View>
    //     </>
    //   )}
    // </View>
  // );
    if (!PRODUCTS) {
    return (
      <View style={styles.loading}>
        <Text>Failed to load products.</Text>
      </View>
    );
  }

  
  const colorsh=useSelector(getTheame)
  const {theame}=theames()
  const styles=style(colorsh,theame)
  styless=styles
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Baballe Shop</Text>
        <View style={styles.rightIcons}>
          <Text style={styles.iconPlaceholder}>{'👤'}</Text>
        </View>
      </View>

      {Isloadingcate && (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor:!colorsh? '#1414142a':theame.background,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
          <Loading />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>{'🔍'}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all products..."
          value={searchQuery}
          placeholderTextColor={theame.text}
          styles={styles.searchInput}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        refreshControl={<RefreshControl refreshing={refreshings} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <GridProductCard
          styles={styles}
           disp={disp} router={router} product={item} />
        )}
        keyExtractor={(item) => item?._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ <View>
      {!searchQuery && (
        <>
          <Text style={styles.scrollSectionTitle}>🔥 Trending Products</Text>
          <Animated.FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FEATURED_PRODUCTS}
            keyExtractor={(item) => item?._id}
            renderItem={({ item, index }) => (
              <FeaturedCard
          styles={styles}

                router={router}
                searchQuery={searchQuery}
                item={item}
                index={index}
                scrollX={scrollX}
                disp={disp}
              />
            )}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            snapToInterval={FEATURED_CARD_WIDTH + FEATURED_ITEM_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.featuredScrollContainer}
          />

          <Text style={styles.scrollSectionTitle}>Shop By Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroller}>
            {CATEGORIES.map((category, _) => (
              <TouchableOpacity
                key={_}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categorySelected,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All'
                ? 'Explore All'
                : `${selectedCategory} (${filteredProducts.length})`}
            </Text>
            <TouchableOpacity onPress={() => console.log('Open Filter/Sort Modal')}>
              <Text style={styles.filterIcon}>{'⚙️ Filter'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <Text style={styles.emptyList}>No products found.</Text>
        )}
      />
    </View>
  );
};

// --- Styles ---
const style =(colorsh,theame)=> StyleSheet.create({
  container: { flex: 1, backgroundColor:theame.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 20,
  },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color:!colorsh? '#333':theame.text },
  rightIcons: { flexDirection: 'row' },
  iconPlaceholder: { fontSize: 28, marginLeft: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: !colorsh?'#f5f5f5':theame.background,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth:1,borderColor:'rgba(222, 221, 221, 0.24)'
  },
  searchIcon: { marginRight: 10, fontSize: 20, color: '#999' },
  searchInput: {color:theame.text, flex: 1, height: 45, fontSize: 16 },
  scrollSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: !colorsh?'#333':theame.text,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  featuredScrollContainer: {
    paddingHorizontal: 20 - FEATURED_ITEM_SPACING,
    paddingBottom: 20,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_WIDTH * 1.1,
    marginHorizontal: FEATURED_ITEM_SPACING / 2,
    borderRadius: 15,
    backgroundColor:!colorsh? '#f9f9f9':theame.background,
    overflow: 'hidden',
    elevation: 5,
    borderWidth:1,
    borderColor:'rgba(127, 127, 127, 0.22)'
  },
  featuredImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  featuredContent: { padding: 15, flex: 1, justifyContent: 'space-between' },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: !colorsh?'#333':theame.text },
  featuredPrice: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  featuredButton: {
    backgroundColor: '#f97316',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  featuredButtonText: { color: theame.text, fontWeight: '600', fontSize: 14 },
  categoryScroller: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: theame.background,
    borderWidth: 1,
    borderColor:'#ccc',
  },
  categorySelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  categoryText: { color: !colorsh?'#555':theame.text, fontWeight: '600' },
  categoryTextSelected: { color: theame.text },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color:!colorsh? '#333':theame.text },
  filterIcon: { fontSize: 16, color:!colorsh? '#555':theame.text, fontWeight: '600' },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  cardContainer: {
    width: ITEM_WIDTH,
    backgroundColor: theame.background,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:!colorsh? '#eee':'rgba(101, 101, 101, 0.27)',
  },
  cardImage: { width: '100%', height: ITEM_WIDTH, resizeMode: 'cover' },
  cardDetails: { padding: 10 },
  cardCategory: { fontSize: 12, color: !colorsh?'#999':theame.text, marginBottom: 2 },
  cardName: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  wishlistIcon: { fontSize: 20, color:!colorsh? '#aaa':theame.text },
  emptyList: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color:!colorsh?'#666':theame.text,
  },
});

export default AllProductsPage;
