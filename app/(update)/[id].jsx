import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router'; 
import {
  useGetProductQuery,
  useEditProductsMutation,
  useGetGetCategoriesQuery,
  useGetSoldProductQuery,
} from '@/components/Features/Getslice';    
import Loading from '../Loader/Loading';
import { uri } from '@/components/Features/api/uri';
import { Colors } from '@/constants/theme';
import { getTheame } from '@/components/Features/Funcslice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const ORANGE_COLOR = '#f97316';
const GRAY_TEXT = '#666';

const UpdateProductScreen = () => {
  const {
    data: ProductData,
    isSuccess: IsproductSucess,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetSoldProductQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: CategoryData,
    isSuccess: IsCateSucess,
    isLoading: isLoadingCate,
    isError: isErrorCate,
    error: errorCAte,
  } = useGetGetCategoriesQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [Update, { isLoading: isLoadingUpdate, isSuccess: isSuccessUpdate, isError: isErrorUpdate, error: errorUpdate }] =
    useEditProductsMutation();
  const [selectdate, setselectdate] = useState('Today');

  const [productImages, setProductImages] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showImageListModal, setShowImageListModal] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const { id } = useLocalSearchParams();

  const [productName, setProductName] = useState('Smart Fan');
  const [quantity, setQuantity] = useState('0'); // changed to string to keep input controlled
  const [description, setDescription] = useState('A modern smart ceiling fan with remote control.');
  const [retailPrice, setRetailPrice] = useState('12000');
  const [category, setCategory] = useState('Electronics');
  const [categories, setcategories] = useState([]);
  const [ActualPrice,setActualPrice]=useState(0)


  
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
  
  
      
      const styles=style(colorsh,theame)
  

  useEffect(() => {
    if (!ProductData) return;

    const prod = ProductData.find(p => p?._id == id);

    if (prod) {
      setProductName(prod.name);
      setQuantity(prod?.quantity.toString());
      setDescription(prod.description);
      setRetailPrice(String(prod.retailPrice));
      setCategory(prod.category);
      setActualPrice(String(prod.actualPrice));

      // Assume prod.image is array of strings (filenames)
      setProductImages(prod?.image || []);
    }
  }, [id, ProductData]);

  useEffect(() => {
    if (!CategoryData) return;

    setcategories(CategoryData);
  }, [CategoryData]);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to your photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(a => a.uri);
      setProductImages(prev => [...prev, ...newImages]);
    }
    setShowPickerModal(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take pictures.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProductImages(prev => [...prev, result.assets[0].uri]);
    }
    setShowPickerModal(false);
  };

  const removeImage = uriToRemove => {
    setProductImages(productImages.filter(img => img !== uriToRemove));
  };

  const confirmChanges = async () => {
    try {
      const fm = new FormData();

      const existingImages = productImages.filter(img => !img.startsWith('file://'));
      const newImages = productImages.filter(img => img.startsWith('file://'));

      fm.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach((uriLocal, index) => {
        const fileExtension = uriLocal.split('.').pop();
        fm.append('file', {
          uri: uriLocal,
          name: `image_${index}.${fileExtension}`,
          type: `image/${fileExtension}`,
        });
      });

      fm.append('id', id);
      fm.append('name', productName);
      fm.append('quantity', quantity);
      fm.append('description', description);
      fm.append('retailPrice', retailPrice);
      fm.append('category', category);
      fm.append('category', category);
      fm.append('actualPrice', ActualPrice);

      const data = await Update({ fm });
      console.log(data);

      Alert.alert('Product Updated', 'Your product has been successfully updated!');
      setShowPreviewModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoadingCate && (
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              backgroundColor: '#1414142a',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loading />
          </View>
        )}
        <View style={styles.content}>
          {/* Product Name */}
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={val => setCategory(val)}>
              {categories.map(res => (
                <Picker.Item color={theame.text} key={res._id} label={res.name} value={res.name} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder={quantity.toString()}
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Retail Price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={retailPrice}
            onChangeText={setRetailPrice}
          />
          <Text style={styles.label}>ActualPrice</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={ActualPrice}
            onChangeText={setActualPrice}
          />


          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={description}
            placeholderTextColor={theame.text}
            onChangeText={setDescription}
            placeholder="Enter product description"
          />

          <Text style={styles.label}>Product Photos</Text>
          <TouchableOpacity onPress={() => setShowImageListModal(true)} style={styles.uploadBox}>
            <Feather name="camera" size={30} color={ORANGE_COLOR} />
            <Text style={styles.uploadText}>Manage Images</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowPreviewModal(true)} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Preview & Update</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image List Modal */}
      <Modal visible={showImageListModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Product Images</Text>

            {productImages && productImages.length > 0 ? (
  <FlatList
    data={productImages}
    horizontal
    keyExtractor={(item, index) => `${item ?? 'img'}-${index}`}
    renderItem={({ item }) => {
      // Check if item is a valid string before calling startsWith
      let imageUri = '';
      if (typeof item === 'string') {
        if (item.startsWith('file://') || item.startsWith('http')) {
          imageUri = item;
        } else {
          imageUri = `${uri}/img/${item}`;
        }
      }

      return (
        <View style={styles.imageItem}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imageThumb} />
          ) : (
            <Text style={{ color: GRAY_TEXT, width: 80, textAlign: 'center' }}>Invalid</Text>
          )}
          <TouchableOpacity onPress={() => removeImage(item)} style={styles.removeBtn}>
            <Feather name="trash-2" size={18} color="white" />
          </TouchableOpacity>
        </View>
      );
    }}
  />
) : (
  <Text style={{ textAlign: 'center', color: GRAY_TEXT }}>No images added</Text>
)}


            <TouchableOpacity
              onPress={() => {
                setShowImageListModal(false);
                setShowPickerModal(true); // close list first, then open picker modal
              }}
              style={[styles.actionBtn, { backgroundColor: ORANGE_COLOR }]}
            >
              <Text style={{fontSize: 14, fontWeight: '600', color: 'white', marginLeft: 10}}>+ Add More</Text>
            </TouchableOpacity>

            <Pressable onPress={() => setShowImageListModal(false)}>
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 15 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Pick Image Modal */}
      <Modal visible={showPickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product Photo</Text>
            <TouchableOpacity onPress={takePhoto} style={styles.actionBtn}>
              <Feather name="camera" size={20} color={ORANGE_COLOR} />
              <Text style={styles.actionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromLibrary} style={styles.actionBtn}>
              <Feather name="image" size={20} color={ORANGE_COLOR} />
              <Text style={styles.actionText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <Pressable onPress={() => setShowPickerModal(false)}>
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 15 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreviewModal} transparent animationType="fade">
        <Pressable onPress={()=>setShowPreviewModal(false)} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
          {productImages && productImages.length > 0 && (() => {
  const firstImage = productImages[0];
  const isLocal = typeof firstImage === 'string' && (firstImage.startsWith('file://') || firstImage.startsWith('http'));
  const imageUri = isLocal ? firstImage : `${uri}/img/${firstImage}`;

  return <Image source={{ uri: imageUri }} style={styles.previewImage} />;
})()}


            <Text style={styles.modalTitle}>{productName}</Text>
            <Text style={{color:theame.text}}>{category}</Text>
            <Text style={{color:theame.text,marginVertical:10}}>{description}</Text>
            <Text style={{ color: ORANGE_COLOR, fontWeight: 'bold', marginVertical: 8 }}>
              ₦{retailPrice}
            </Text>

            <TouchableOpacity onPress={confirmChanges} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Confirm Update</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const style =(colorsh,theame)=> StyleSheet.create({
  container: { flex: 1, backgroundColor:theame.background },
  content: { padding: 20 },
  label: { fontWeight: '600', fontSize: 14, color: !colorsh?'#333':theame.text, marginBottom: 5 },
  input: {
    backgroundColor: theame.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    color:theame.text,
    fontSize: 15,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: theame.background,
    borderRadius: 10,
    borderWidth: 1,
    color:theame.text,
    borderColor: '#eee',
    marginBottom: 15,
  },
  uploadBox: {
    height: 100,
    borderWidth: 1,
    borderColor: ORANGE_COLOR,
    borderRadius: 10,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theame.background,
  },
  uploadText: { color: ORANGE_COLOR, marginTop: 5 },
  saveButton: {
    backgroundColor: ORANGE_COLOR,
    padding: 15,
    borderRadius: 15,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theame.background,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center',color:theame.text },
  actionBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: ORANGE_COLOR,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 14, fontWeight: '600', color: ORANGE_COLOR, marginLeft: 10 },
  imageItem: {
    marginRight: 10,
    position: 'relative',
  },
  imageThumb: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 5,
    borderRadius: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
});

export default UpdateProductScreen;
