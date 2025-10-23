import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useGetSellsQuery } from '@/components/Features/Getslice';
import { useLocalSearchParams } from 'expo-router';
import Loader from '../Loader/Loading';
import { uri } from '@/components/Features/api/uri';
import theames from '@/hooks/theame';

const { width } = Dimensions.get('window');
const ORANGE_COLOR = '#f97316';

const SoldProductDetails = () => {
  const { data, isLoading, isSuccess, isError, error } = useGetSellsQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { id } = useLocalSearchParams();
  const { colorsh, theame } = theames();

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!data) return;
    const find = data.find((p) => p._id === id);
    if (find) setProduct(find);
  }, [id, data]);

  useEffect(() => {
    if (!product?.image?.length) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % product.image.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, product]);

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <SafeAreaView
        style={[
          styles.centered,
          { backgroundColor: theame.background },
        ]}
      >
        <Text style={{ color: theame.text }}>
          {error?.data?.message || error.error}
        </Text>
      </SafeAreaView>
    );

  if (!product) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theame.background },
        ]}
      >
        <Text style={{ color: theame.text }}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <>
      {isSuccess && (
        <SafeAreaView
          style={[styles.container, { backgroundColor: theame.background }]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* --- Image Gallery --- */}
            {product?.image?.length > 0 ? (
              <View
                style={[
                  styles.imageGallery,
                  { backgroundColor: theame.card },
                ]}
              >
                <Animated.ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  {product.image.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: `${uri}/img/${img}` }}
                      style={styles.mainProductImage}
                    />
                  ))}
                </Animated.ScrollView>

                {/* --- Pagination Dots --- */}
                <View style={styles.pagination}>
                  {product.image.map((_, index) => {
                    const inputRange = [
                      (index - 1) * width,
                      index * width,
                      (index + 1) * width,
                    ];
                    const dotWidth = scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 20, 8],
                      extrapolate: 'clamp',
                    });
                    const opacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    });
                    return (
                      <Animated.View
                        key={index}
                        style={[
                          styles.dot,
                          { width: dotWidth, opacity, backgroundColor: ORANGE_COLOR },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: theame.text }}>No images available</Text>
              </View>
            )}

            {/* --- Product Details --- */}
            <View style={styles.detailsSection}>
              <View style={styles.titlePriceBlock}>
                <Text style={[styles.productName, { color: theame.text }]}>
                  {product?.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.soldPrice, { color: theame.text }]}>
                    ${Number(product?.retailPrice).toFixed(2)}
                  </Text>
                  <View
                    style={[
                      styles.soldOutBadge,
                      { backgroundColor:'#e64e4e' },
                    ]}
                  >
                    <Text style={[styles.soldOutText,{color:theame.text}]}>Sold Out</Text>
                  </View>
                </View>
                <Text style={[styles.metaText, { color: theame.text }]}>
                  Quantity: {product?.quantity}
                </Text>
              </View>

              {/* --- Sold On Banner --- */}
              <View
                style={[
                  styles.soldOnBanner,
                  { backgroundColor: theame.card },
                ]}
              >
                <Text style={[styles.clockIcon, { color: theame.text }]}>🕑</Text>
                <Text style={[styles.soldOnText, { color: theame.text }]}>
                  Sold On: {product?.date}
                </Text>
              </View>

              {/* --- Description --- */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theame.text }]}>
                  Description
                </Text>
                <Text
                  style={[styles.descriptionText, { color: theame.text }]}
                >
                  {product?.description || 'No description available.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

export default SoldProductDetails;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainProductImage: {
    width,
    height: 250,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  titlePriceBlock: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  soldPrice: {
    fontSize: 26,
    fontWeight: '800',
    marginRight: 10,
  },
  soldOutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  soldOutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 14,
    marginTop: 2,
  },
  soldOnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  clockIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  soldOnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
