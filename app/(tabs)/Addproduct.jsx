import ColorPicker from 'react-native-wheel-color-picker';
import Constants from 'expo-constants';
import { useAddproductsMutation, useGetGetCategoriesQuery } from '@/components/Features/Getslice';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { getTheame } from '@/components/Features/Funcslice';
import { useSelector } from 'react-redux';
import * as Device from "expo-device"
import theames from '@/hooks/theame';
import * as Notifications from 'expo-notifications';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { products as datas } from "../json/data";
import Loading from '../Loader/Loading';

const ORANGE_COLOR = '#f97316';
const GRAY_TEXT = '#666';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- Sub-Components ---
const TimeFilter = ({ addProductStyles,onPress, value, selectdate, text, isActive }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      addProductStyles.timeButton,
      value === selectdate ? addProductStyles.timeActive : addProductStyles.timeInactive,
    ]}
  >
    <Text
      style={[
        addProductStyles.timeText,
        isActive ? addProductStyles.timeTextActive : addProductStyles.timeTextInactive,
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

const ProductImageCard = ({ theame,addProductStyles,filter, router }) => (
  <TouchableOpacity onPress={() => router.push(`(product)/${filter[0]?.id}`)} style={addProductStyles.productImageCard}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri:`http://172.20.10.2:4000/img/1760816365586.jpeg`}}
        style={addProductStyles.productImage}
      />
      <View style={addProductStyles.productInfo}>
        <Text style={[addProductStyles.productName,{color:theame.text}]}>{filter[0]?.name}</Text>
        <Text style={[addProductStyles.productSKU,{color:theame.text}]}>₦{filter[0]?.retailPrice}</Text>
      </View>
    </View>
    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 10 }}>
      <Text style={{ fontSize: 12, color: GRAY_TEXT }}>{"View More"}</Text>
      <AntDesign name="right" size={12} color={theame.text} />
    </View>
  </TouchableOpacity>
);
const InputField = ({ colorsh, theame, addProductStyles, label, placeholder, value, onChangeText, isLarge = false, hasHint = false }) => (
  <View style={addProductStyles.inputContainer}>
    {label ? <Text style={addProductStyles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[addProductStyles.input, isLarge && addProductStyles.inputLarge]}
      placeholder={placeholder}
      placeholderTextColor={!colorsh ? "#aaa" : theame.txt}
      value={value}
      onChangeText={onChangeText}
      multiline={isLarge}
      numberOfLines={isLarge ? 4 : 1}
      keyboardType={label?.toLowerCase().includes('price') || label?.toLowerCase().includes('quantity') ? 'numeric' : 'default'}
    />
    {hasHint && (
      <Text style={addProductStyles.inputHint}>
        {label === 'Retail Price' ? '₦159.00' : 'QTY 50'}
      </Text>
    )}
  </View>
);

// --- Add Product Screen ---
const AddProductScreen = () => {

  const [productImage, setProductImage] = useState([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectdate, setselectdate] = useState('Today');
  const router = useRouter();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [caetegorieset, setCategoryset] = useState([]);
  const {
    isLoading: isloadingCate,
    isSuccess: issucesscate,
    isError: isErrorCate,
    error: errorCate,
    data,
  } = useGetGetCategoriesQuery('', {
    pollingInterval: 100,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const [
    Addproducts,
    { isLoading: isloading_addproducts, isSuccess: isSuccess_addproducts, isError: isErrorProducts, error: errorProducts },
  ] = useAddproductsMutation();

    const {theame}=theames();
  const colorsh=useSelector(getTheame)

  const addProductStyles=styles(colorsh,theame)


  useEffect(() => {
    const ms = async () => {
      if (data) {
        const { ids, entities } = data;
          
        setCategoryset(data);
      }
    };
    ms();
  }, [issucesscate, data]);

  const [cate_error, setCate_error] = useState(null);

  useEffect(() => {
    if (isErrorCate) {
      setCate_error(errorCate?.data?.message);
    }
  }, [isErrorCate]);

  // --- Pick Image Functions ---
  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setProductImage(result.assets);
    }
    setShowImageModal(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setProductImage(result.assets);
    }
    setShowImageModal(false);
  };

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const lastWeekDate = lastWeek.toISOString().split("T")[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfMonthDate = firstDayOfMonth.toISOString().split("T")[0];
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const firstDayOfYearDate = firstDayOfYear.toISOString().split("T")[0];

  const filteredProducts = datas.filter(
    (product) =>
      product.date >=
      (selectdate === 'Today'
        ? todayDate
        : selectdate === 'Last 7 Days'
        ? lastWeekDate
        : selectdate === 'Mothly'
        ? firstDayOfMonthDate
        : firstDayOfYearDate) || datas[0]
  );

  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [colors,setcolors]=useState([])

  const showCate = (
    <>
      {!isloadingCate && issucesscate && caetegorieset.length ? (
        <Picker
        style={{color:theame.text}}
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {caetegorieset.map((cat) => (
            <Picker.Item style={{color:theame.text}} color={theame.text} key={cat?._id} label={cat?.name} value={cat?.name} />
          ))}
        </Picker>
      ) : isloadingCate ? (
        <ActivityIndicator size="small" color={ORANGE_COLOR} />
      ) : (
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {cate_error || 'An error occurred'}
        </Text>
      )}
    </>
  );

    useEffect(() => {
    registerForNotifications();
  }, []);

  const registerForNotifications = async () => {
    if (!Constants.isDevice) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission not granted for notifications!');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };



  useEffect(()=>{
    
    if(isSuccess_addproducts){
      router.replace('/')
    }

  },[isSuccess_addproducts])

  

  return (
    <>
    <SafeAreaView style={addProductStyles.container}>

        
      <ScrollView showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
        <View style={addProductStyles.contentPadding}>
          {/* Time Filter Row */}
          {/* <View style={addProductStyles.timeFilterRow}>
            <TimeFilter addProductStyles={addProductStyles} selectdate={selectdate} value="Today" onPress={() => setselectdate("Today")} text="Today" isActive={selectdate === "Today"} />
            <TimeFilter addProductStyles={addProductStyles} selectdate={selectdate} value="Last 7 Days" onPress={() => setselectdate("Last 7 Days")} text="Last 7 Days" isActive={selectdate === "Last 7 Days"} />
            <TimeFilter addProductStyles={addProductStyles} selectdate={selectdate} value="Mothly" onPress={() => setselectdate("Mothly")} text="Mothly" isActive={selectdate === "Mothly"} />
            <TimeFilter addProductStyles={addProductStyles} selectdate={selectdate} value="This Year" onPress={() => setselectdate("This Year")} text="This Year" isActive={selectdate === "This Year"} />
          </View>

          {/* Product Card */}
          {/* <ProductImageCard theame={theame} addProductStyles={addProductStyles}filter={filteredProducts} router={router} /> */} 

          {/* Product Name */}
          {/* Product Name */}
            <InputField addProductStyles={addProductStyles} label="Product Name" placeholder="Enter product name" value={productName} onChangeText={setProductName} />


          {/* Category Picker */}
          <View style={addProductStyles.inputContainer}>
            <Text style={addProductStyles.inputLabel}>Category</Text>
            <View style={addProductStyles.pickerContainer}>{showCate}</View>
          </View>

          {/* Quantity and Color */}
          <View style={addProductStyles.qtyPriceRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
             <InputField colorsh={colorsh} theame={theame} addProductStyles={addProductStyles} label="Quantity" placeholder="0" value={quantity} onChangeText={setQuantity} />
              
            </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 10, marginLeft: 10, flexWrap: 'wrap', alignItems:'center' }}>
              {colors.map((c) => (
                <Pressable
                  key={c}
                  onLongPress={() =>{
                    setcolors((prev) => prev.filter((color) => color !== c));
                  }}
                  style={{
                    backgroundColor: c,
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginVertical: 10,
                  }}
                />
              ))}
              {colors.length < 3 && (
                <Pressable
                  onPress={() => setIsColorPickerVisible(true)}
                  style={{
                    backgroundColor: selectedColor,
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="plus" color="#555" size={20} />
                </Pressable>
              )}
              
              
              {/* <InputField label="Color name" placeholder="Color name" value={initialStock} onChangeText={setInitialStock} /> */}
            </View>
          </View>

          {/* Description */}
            <InputField colorsh={colorsh} theame={theame} addProductStyles={addProductStyles}
              label="Description" placeholder="Detailed description of the product" value={description} onChangeText={setDescription} isLarge />

          {/* Is Featured Switch */}
          <View style={[addProductStyles.inputContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={addProductStyles.inputLabel}>Is Featured</Text>
            <Switch
              value={isFeatured}
              onValueChange={(val) => setIsFeatured(val)}
              trackColor={{ false: '#ccc', true: ORANGE_COLOR }}
              thumbColor={isFeatured ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Upload Photos and Retail Price */}
          <View style={addProductStyles.photoRetailRow}>
            <View style={addProductStyles.photoUploadBox}>
              <Text style={addProductStyles.inputLabel}>Upload Photos</Text>
              <TouchableOpacity onPress={() => setShowImageModal(true)} style={addProductStyles.uploadBox}>
                {productImage?.length > 0 ? (
                  <Image source={{ uri: productImage[0]?.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                ) : (
                  <>
                    <Feather name="camera" size={30} color={ORANGE_COLOR} />
                    <Text style={addProductStyles.uploadText}>+ Add Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={addProductStyles.retailPriceBox}>
              <InputField colorsh={colorsh} theame={theame} addProductStyles={addProductStyles} label="Retail Price" placeholder="₦0.00" value={retailPrice} onChangeText={setRetailPrice} />
            </View>
          </View>
        </View>

        {/* Preview Button */}
        <TouchableOpacity onPress={() => setShowPreviewModal(true)} style={addProductStyles.saveButton}>
          <Text style={addProductStyles.saveButtonText}>Preview & Publish</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- Image Picker Modal --- */}
     <Modal visible={showImageModal} transparent animationType="slide">
          <View style={addProductStyles.modalContainer}>
            <View style={addProductStyles.modalBox}>
              <Text style={addProductStyles.modalTitle}>Add Product Image</Text>
              <TouchableOpacity onPress={takePhoto} style={addProductStyles.modalButton}>
                <Feather name="camera" size={20} color={ORANGE_COLOR} />
                <Text style={addProductStyles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickFromLibrary} style={addProductStyles.modalButton}>
                <Feather name="image" size={20} color={ORANGE_COLOR} />
                <Text style={addProductStyles.modalButtonText}>Upload from Gallery</Text>
              </TouchableOpacity>
              <Pressable onPress={() => setShowImageModal(false)}>
                <Text style={{ color: 'red', textAlign: 'center', marginTop: 15 }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      <Modal visible={isColorPickerVisible} transparent animationType="slide">
  <Pressable 
      onPress={() => setIsColorPickerVisible(false)}
  
  style={{height:'100%' ,padding:50, justifyContent: 'center', alignItems: 'center',backgroundColor:'#0e0e0e2e' }}>
    <ColorPicker
      color={selectedColor}
      onColorChangeComplete={setSelectedColor}
      thumbSize={30}
      sliderSize={30}
      noSnap={true}
      row={false}
    />
    <Pressable
     onPress={() => {
                if (colors.length >= 3) return alert('You can only add up to 3 colors.');
                if (colors.includes(selectedColor)) return alert('Color already added.');
                setcolors((prev) => [...prev, selectedColor]);
                setIsColorPickerVisible(false);
              }}
              style={{ marginTop: 20, backgroundColor: '#000', padding: 10, borderRadius: 8 }}
            

    >
      <Text style={{ color: '#fff' }}>Done</Text>
    </Pressable>
  </Pressable>
</Modal>


        <Modal visible={showPreviewModal} transparent animationType="fade">
          <View style={addProductStyles.previewModalContainer}>
            <View style={addProductStyles.previewBox}>
              {productImage?.length > 0 && <Image source={{ uri: productImage[0]?.uri }} style={addProductStyles.previewImage} />}
              <Text style={addProductStyles.previewTitle}>{productName || 'Product Name'}</Text>
              <Text style={addProductStyles.previewCategory}>{category || 'Category'}</Text>
              <Text style={addProductStyles.previewDesc}>{description || 'No description'}</Text>
              <Text style={addProductStyles.previewPrice}>₦{retailPrice || '0.00'}</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                <Pressable onPress={() => setShowPreviewModal(false)} style={addProductStyles.cancelButton}>
                  <Text style={addProductStyles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                     onPress={async () => {
                try {
                  setShowPreviewModal(false)
                  const fm = new FormData();
                  productImage.forEach((res) => {
                    fm.append("file", {
                      uri: res?.uri,
                      name: "." + res?.uri.split(".").at(-1),
                      type: "image/" + res?.uri.split(".").at(-1),
                    });
                  });
                  fm.append('name', productName);
                  fm.append('quantity', quantity);
                  fm.append('colors', colors);
                  fm.append('description', description);
                  fm.append('retailPrice', retailPrice);
                  fm.append('category', category);
                  fm.append('isFeatured', isFeatured);

                  const add = await Addproducts({ fm });
 await Notifications.scheduleNotificationAsync({
      content: {
        title: category,
        body: description,
        data: { extraData: retailPrice,quantity,isFeatured },
        // iOS image
        attachments: [
          {
            url: productImage[0].uri, // replace with your image URL
            type: 'image/jpeg',
          },
        ],
      },
      trigger: { seconds: 1 }, // triggers after 1 second
    });

    Alert.alert('Notification scheduled!');
                  console.log(add);
                  setShowPreviewModal(false);
                } catch (err) {
                  alert(err.message);
                }
              }}
                  style={addProductStyles.publishButton}
                >
                  {isloading_addproducts ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={addProductStyles.publishButtonText}>Publish Product</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>

    {isloading_addproducts && (
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
};

// --- Styles ---
const styles=(colorsh,theame)=> StyleSheet.create({
  container: { flex: 1, backgroundColor: !colorsh?'#f5f5f5':theame.background },
  contentPadding: { paddingHorizontal: 20 },
  timeFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theame.background,
    borderRadius: 15,
    padding: 5,
    marginVertical: 15,
  },
     cancelButton: { padding: 10, backgroundColor: '#ccc', borderRadius: 8, width: 100, alignItems: 'center' },
    cancelButtonText: { color: '#000' },
  timeButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  timeActive: { backgroundColor:!colorsh? ORANGE_COLOR:"rgba(249, 161, 29, 1)" },
  timeInactive: { backgroundColor: theame.background },
  timeTextActive: { color: theame.text },
  timeTextInactive: { color:!colorsh? GRAY_TEXT:theame.text },
  productImageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theame.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
    publishButton: { padding: 10, backgroundColor: ORANGE_COLOR, borderRadius: 8, width: 140, alignItems: 'center' },
    publishButtonText: { color: '#fff', fontWeight: 'bold' },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: !colorsh?'#333':theame.text, marginBottom: 5 },
  input: {
    backgroundColor: theame.background,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: !colorsh?'#333':theame.text,
    borderWidth: 1,
    borderColor: !colorsh?'#eee':theame.text,
  },
  inputLarge: { height: 100, textAlignVertical: 'top' },
  qtyPriceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  photoRetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  photoUploadBox: { flex: 1, marginRight: 10 },
  retailPriceBox: { flex: 1, marginLeft: 10 },
  uploadBox: {
    backgroundColor: theame.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:!colorsh? ORANGE_COLOR:theame.text,
    borderStyle: 'dashed',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: { fontSize: 14, color:!colorsh? ORANGE_COLOR:theame.text, marginTop: 5 },
  saveButton: {
    backgroundColor: ORANGE_COLOR,
    padding: 18,
    marginHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color:'white', fontSize: 18, fontWeight: 'bold' },
  pickerContainer: {
    backgroundColor: theame.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: !colorsh?'#eee':theame.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 1, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: theame.background,
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalButton: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  modalButtonText: { fontSize: 16, color: ORANGE_COLOR },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 1, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    backgroundColor: theame.background,
    width: '85%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  previewImage: { width: 120, height: 120, borderRadius: 15, marginBottom: 10 },
  previewTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  previewCategory: { fontSize: 14, color: colorsh?GRAY_TEXT:theame.text, marginBottom: 5 },
  previewDesc: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  previewPrice: { fontSize: 18, color: !colorsh?ORANGE_COLOR:theame.text, fontWeight: 'bold', marginBottom: 15 },
  txt:{
    color:!colorsh?"#aaa":theame.text
  }
});

export default AddProductScreen;
