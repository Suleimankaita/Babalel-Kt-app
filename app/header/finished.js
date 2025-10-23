import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ORANGE_COLOR = "#f97316";
const GRAY_TEXT = "#666";
const LIGHT_GRAY_BG = "#f5f5f5";
const BORDER_COLOR = "#ddd";

const PRODUCT_DETAILS = {
  id: 2,
  name: "Wireless Headphones",
  sku: "557-V2",
  price: "49.99",
  rating: 4.7,
  reviews: 28,
  description:
    "Experience rich immersive sound with these lightweight, comfortable headphones. Reducing noise and long-lasting battery life.",
  images: [
    "https://images.unsplash.com/photo-1585386959984-a41552231658?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1612444530450-f0f3a2f4ef39?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610214443049-6b0d8169c090?auto=format&fit=crop&w=800&q=80",
  ],
  colors: ["#E0BBE4", "#957DAD", "#D291BC"],
  relatedProducts: [
    {
      id: 101,
      name: "Smart Watch",
      image: "https://via.placeholder.com/50/333333/FFFFFF?text=Watch",
    },
    {
      id: 102,
      name: "VR Headset",
      image: "https://via.placeholder.com/50/0000FF/FFFFFF?text=VR",
    },
    {
      id: 103,
      name: "Gaming Mouse",
      image: "https://via.placeholder.com/50/FF0000/FFFFFF?text=Mouse",
    },
    {
      id: 104,
      name: "Keyboard",
      image: "https://via.placeholder.com/50/00FF00/FFFFFF?text=KB",
    },
  ],
};

const ProductDetailPage = ({ onGoBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(PRODUCT_DETAILS.colors[0]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        (currentIndex + 1) % PRODUCT_DETAILS.images.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000); // every 3s
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleQuantityChange = (type) => {
    if (type === "increase") setQuantity((prev) => prev + 1);
    else if (type === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <AntDesign name="user" size={24} color={GRAY_TEXT} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
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
            {PRODUCT_DETAILS.images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.mainProductImage} />
            ))}
          </Animated.ScrollView>

          {/* Dots */}
          <View style={styles.pagination}>
            {PRODUCT_DETAILS.images.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 20, 8],
                extrapolate: "clamp",
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    { width: dotWidth, opacity },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfoCard}>
          <Text style={styles.productName}>{PRODUCT_DETAILS.name}</Text>
          <Text style={styles.productSKU}>SKU: {PRODUCT_DETAILS.sku}</Text>
          <View style={styles.ratingPriceRow}>
            <Text style={styles.productPrice}>${PRODUCT_DETAILS.price}</Text>
            <View style={styles.ratingContainer}>
              <AntDesign name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {PRODUCT_DETAILS.rating} ({PRODUCT_DETAILS.reviews} reviews)
              </Text>
            </View>
          </View>

          <Text style={styles.productDescription}>
            {PRODUCT_DETAILS.description}
          </Text>

          {/* Color Selector */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Color</Text>
            <View style={styles.colorOptions}>
              {PRODUCT_DETAILS.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.optionRow}>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() => handleQuantityChange("decrease")}
                style={styles.quantityButton}
              >
                <AntDesign name="minus" size={18} color={GRAY_TEXT} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => handleQuantityChange("increase")}
                style={styles.quantityButton}
              >
                <AntDesign name="plus" size={18} color={GRAY_TEXT} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.wishlistButton}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={20}
                color={ORANGE_COLOR}
              />
              <Text style={styles.wishlistText}>Add to Wishlist</Text>
            </TouchableOpacity>
          </View>

          {/* Add to Cart */}
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        <View style={styles.relatedProductsSection}>
          <Text style={styles.relatedProductsTitle}>Related Products</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsScroll}
          >
            {PRODUCT_DETAILS.relatedProducts.map((item) => (
              <TouchableOpacity key={item.id} style={styles.relatedProductCard}>
                <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
                <Text style={styles.relatedProductName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_GRAY_BG },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  imageGallery: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  mainProductImage: {
    width,
    height: 250,
    resizeMode: "contain",
  },
  pagination: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE_COLOR,
    marginHorizontal: 4,
  },
  productInfoCard: {
    backgroundColor: "white",
    marginHorizontal: 10,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  productName: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 5 },
  productSKU: { fontSize: 14, color: GRAY_TEXT, marginBottom: 10 },
  ratingPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  productPrice: { fontSize: 28, fontWeight: "bold", color: ORANGE_COLOR },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, color: GRAY_TEXT, marginLeft: 5 },
  productDescription: { fontSize: 14, color: GRAY_TEXT, lineHeight: 20, marginBottom: 20 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  optionLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  colorOptions: { flexDirection: "row" },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 5,
  },
  selectedColorCircle: { borderColor: ORANGE_COLOR },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
  },
  quantityButton: { paddingHorizontal: 15, paddingVertical: 10 },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER_COLOR,
  },
  wishlistButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: LIGHT_GRAY_BG,
  },
  wishlistText: { marginLeft: 5, color: ORANGE_COLOR, fontWeight: "600" },
  addToCartButton: {
    backgroundColor: ORANGE_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addToCartButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  relatedProductsSection: { marginHorizontal: 10, marginBottom: 20 },
  relatedProductsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  relatedProductsScroll: { paddingHorizontal: 10 },
  relatedProductCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    alignItems: "center",
    width: 90,
  },
  relatedProductImage: { width: 50, height: 50, resizeMode: "contain", marginBottom: 5 },
  relatedProductName: { fontSize: 12, color: "#333", textAlign: "center" },
});

export default ProductDetailPage;
