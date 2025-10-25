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
  Modal,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetProductQuery, useSellProductsMutation } from "@/components/Features/Getslice";
import { uri } from "@/components/Features/api/uri";
import Loading from "../Loader/Loading";
import theames from "@/hooks/theame";
const { width } = Dimensions.get("window");

const ORANGE_COLOR = "#f97316";
const GRAY_TEXT = "#666";
const LIGHT_GRAY_BG = "#f5f5f5";
const BORDER_COLOR = "#ddd";

const ProductDetailPage = ({ onGoBack }) => {
  const { id } = useLocalSearchParams();
  const router = useRouter(); // ✅ FIXED: must be outside of function

  const { data, isLoading: isLoadingPro, isError } = useGetProductQuery("", {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [Sell, { isLoading: isLoadingSell, isSuccess: sellSuccess, isError: isErrorSell, error: errorSell }] =
    useSellProductsMutation();

  const [PRODUCT_DETAILS, setProductDetails] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // 🧠 Load product
  useEffect(() => {
    if (!data) return;
    const find = data.find((p) => p._id === id);
    if (find) {
      setProductDetails(find);
      if (find.colors && find.colors.length > 0) {
        setSelectedColor(find.colors[0]);
      }
    }
  }, [id, data]);

  // ❌ Error alert (only trigger when error changes)
  useEffect(() => {
    if (isErrorSell && errorSell?.data?.message) {
      alert(errorSell.data.message);
    }
  }, [isErrorSell, errorSell]);

  // 🖼 Auto-scroll images
  useEffect(() => {
    if (!PRODUCT_DETAILS || !PRODUCT_DETAILS.image) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % PRODUCT_DETAILS.image.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, PRODUCT_DETAILS]);

  const handleQuantityChange = (type) => {
    if (type === "increase") setQuantity((prev) => prev + 1);
    else if (type === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // 🧮 Total Price
  const totalPrice = Number(PRODUCT_DETAILS?.retailPrice || 0) * quantity;

  const handleSellProduct = async () => {
    try {
      await Sell({
        id: PRODUCT_DETAILS._id,
        quantity,
        retailPrice: totalPrice,
        colors: PRODUCT_DETAILS?.colors,
        isFeatured: PRODUCT_DETAILS?.isFeatured,
        category: PRODUCT_DETAILS?.category,
        image: PRODUCT_DETAILS?.image,
        name: PRODUCT_DETAILS?.name,
        description: PRODUCT_DETAILS?.description,
      }).unwrap();
      setModalVisible(false);
      router.push("/"); // ✅ FIXED
      console.log("✅ Product sold successfully");
    } catch (err) {
      console.log("❌ Sell failed", err.message);
    }
  };
  
    const {theame,colorsh}=theames() 
    const styles=style(colorsh,theame)

  if (isLoadingPro || !PRODUCT_DETAILS) {
    return <Loading />;
  }
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 📸 Image Gallery */}
        {PRODUCT_DETAILS.image && PRODUCT_DETAILS.image.length > 0 ? (
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
              {PRODUCT_DETAILS?.image.map((uris, index) => (
                <Image
                  key={index}
                  source={{ uri: `${uri}/img/${uris}` }}
                  style={styles.mainProductImage}
                />
              ))}
            </Animated.ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {PRODUCT_DETAILS.image.map((_, index) => {
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
                    style={[styles.dot, { width: dotWidth, opacity }]}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text>No images available</Text>
          </View>
        )}

        {/* 🧾 Product Info */}
        <View style={styles.productInfoCard}>
          <Text style={styles.productName}>{PRODUCT_DETAILS.name}</Text>
        
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

          <Text style={styles.productPrice}>
        
            ₦{Number(PRODUCT_DETAILS?.retailPrice).toFixed(2)}
          </Text>
        <TouchableOpacity onPress={()=>router.push(`(update)/${PRODUCT_DETAILS?._id}`)} style={{width:100,padding:5,height:30,borderRadius:10,backgroundColor:ORANGE_COLOR,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'white'}}>Edit {PRODUCT_DETAILS.name}</Text>
          </TouchableOpacity>
        </View>
          <Text style={styles.productDescription}>
            {PRODUCT_DETAILS.description || "No description available."}
          </Text>

          {/* Color Selector */}
          {PRODUCT_DETAILS.colors && PRODUCT_DETAILS.colors.length > 0 && (
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Color</Text>
              <View style={styles.colorOptions}>
                {PRODUCT_DETAILS?.colors.map((color, index) => (
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
          )}



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
            <Text style={styles.totalPrice}>Total: ₦{totalPrice.toFixed(2)}</Text>
          </View>
          
          {/* 🛒 Sell Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addToCartButtonText}>
              Sell {PRODUCT_DETAILS?.name}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🪟 Confirmation Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Sell</Text>
            <Text style={styles.modalText}>
              Are you sure you want to sell this product?
            </Text>
            <Text style={styles.modalAmount}>
              Total: ₦{totalPrice.toFixed(2)}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSellProduct}
              >
                <Text style={styles.confirmText}>
                  {isLoadingSell ? "Processing..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const style =(colorsh,theame)=> StyleSheet.create({
  container: { flex: 1, backgroundColor:!colorsh? LIGHT_GRAY_BG:theame.background },
  imageGallery: { backgroundColor: theame.background, alignItems: "center", paddingVertical: 20 },
  mainProductImage: { width, height: 250, resizeMode: "cover" },
  pagination: { flexDirection: "row", alignSelf: "center", marginTop: 10 },
  dot: { height: 8, borderRadius: 4, backgroundColor: ORANGE_COLOR, marginHorizontal: 4 },
  productInfoCard: {
    backgroundColor: theame.background,
    marginHorizontal: 10,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: !colorsh?"#000":"rgba(123, 123, 123, 0.32)",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  productName: { fontSize: 24, fontWeight: "bold", color: !colorsh?"#333":theame.text, marginBottom: 5 },
  productPrice: { fontSize: 28, fontWeight: "bold", color: ORANGE_COLOR, marginBottom: 10 },
  productDescription: { fontSize: 14, color:!colorsh? GRAY_TEXT:theame.text, lineHeight: 20, marginBottom: 20 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  optionLabel: { fontSize: 16, fontWeight: "600", color: !colorsh?"#333":theame.text },
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
    color:theame.text
  },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: ORANGE_COLOR },
  addToCartButton: {
    backgroundColor: ORANGE_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addToCartButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // 🪟 Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theame.background,
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10,color:theame.text },
  modalText: { fontSize: 16, color: !colorsh?"#333":theame.text, textAlign: "center", marginBottom: 15 },
  modalAmount: { fontSize: 18, fontWeight: "bold", color: ORANGE_COLOR, marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#ccc", marginRight: 10 },
  confirmButton: { backgroundColor: ORANGE_COLOR },
  cancelText: { color: "#333", fontWeight: "bold" },
  confirmText: { color: "white", fontWeight: "bold" },
});

export default ProductDetailPage;
