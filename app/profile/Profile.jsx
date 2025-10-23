// ✅ Import necessary dependencies and icons
import { MaterialIcons } from '@expo/vector-icons';
import * as Imgpicker from "expo-image-picker";
import { useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { uri } from '../../components/Features/api/uri';
import { useEdit_profileMutation, useGetUserQuery } from '@/components/Features/Getslice';
import { useSelector } from 'react-redux';
import { getTheame, getuserfound } from '../../components/Features/Funcslice';
import theames from '@/hooks/theame';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Profile component definition
const Profile = () => {

  // Fetch all users periodically and refetch when focus/reconnect happens
  const { data } = useGetUserQuery('', {
    pollingInterval: 100,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true
  });

  // ✅ State variables
  const [img, setimg] = useState(''); // holds user's profile image
  const [name, setname] = useState(''); // stores name input
  const [phone, setphone] = useState(''); // stores phone input
  const [password, setpassword] = useState(''); // stores password input
  const [Address, setAddress] = useState(''); // (future use) stores user address
  const [val, setval] = useState(''); // keeps track of which field is being edited
  const [show, setshow] = useState(false); // controls modal visibility

  const [postimg] = useEdit_profileMutation(); // mutation for uploading profile image

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
    
  
  const userData = useSelector(getuserfound); // gets current logged-in user info (e.g., ID)

  // ✅ Fetch current user's image when data updates
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!data) return;
      const find = data.find(res => res._id === userData.id);
      if (find) {
        console.log(find)
        setimg(find?.img);
        setphone(find?.email);
        setname(find?.Fullname);
        setpassword(find?.password);
      
      }
    };
    loadProfileImage();
  }, [data, userData.id]);

  // ✅ Function to handle image upload and update
  const upload = async () => {
    try {
      // Request permission to access gallery
      const { status } = await Imgpicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return alert('Sorry, we don’t have permission to access your photos.');
      }

      // Open image picker
      const result = await Imgpicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: Imgpicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const imgss = new FormData();
        const files = result.assets[0].uri.split('.');
        const filename = files[files.length - 1];
        const id = userData.id;

        imgss.append('Fullname',name);
        imgss.append('id', id);
        imgss.append('password', password);
        imgss.append('file', {
          uri: result.assets[0].uri,
          name: `.${filename}`,
          type: `.${filename}`,
        });


        // Send image to backend
        await postimg({ image: imgss, });
        // Update local display
        setimg(result.assets[0].uri);
      }
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  };

  const Submit =async()=>{
    try{
        const imgss = new FormData();

        imgss.append('Fullname',name);
        imgss.append('id',  userData.id);
        imgss.append('password', password);
    
        


        // Send image to backend
        await postimg({ image: imgss, });
    }catch(err){
      alert(err.message||err.data.message)
    }
  }
  

  return (
    <ScrollView contentContainerStyle={{ padding: 10, flex: 1 }} style={{ flex: 1 }}>
      <View style={{ position: 'relative', top: "10%", alignItems: 'center' }}>
        <Text style={{ fontSize: 15, textAlign: 'center', marginBottom: 10 }}>Profile</Text>

        <View style={{ height: 150, width: 150, borderRadius: 100, overflow: 'hidden', borderWidth: .4, borderColor: 'black' }}>
          <ImageBackground
            resizeMode='cover'
            resizeMethod='scale'
            source={{ uri: `${uri}/img/${img}` }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 100,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: 5
            }}>
            <Pressable
              style={{
                padding: 4,
                backgroundColor: '#f97316',
                borderRadius: 50,
                marginRight: 13,
                top: '-15'
              }}
              onPress={upload}>
              <MaterialIcons name='arrow-upward' size={20} />
            </Pressable>
          </ImageBackground>
        </View>

        <View style={{ height: '60%', justifyContent: 'center', width: '100%', marginLeft: '10%' }}>
          <Text style={{color:theame.text}}>Full Name</Text>
          <Pressable
            onPress={() => {
              setval('Name');
              setshow(true);
            }}
            style={styles.editField}>
            <Text style={{color:theame.text}}>{name||"Fullname"}</Text>
            <MaterialIcons color={theame.text} name='arrow-forward' size={15} />
          </Pressable>

          <Text style={{ marginTop: 20,color:theame.text }}>Phone number</Text>
          <Pressable
            onPress={() => {
              setval('Phone number');
              setshow(true);
            }}
            style={styles.editField}>
            <Text style={{color:theame.text}}>{phone}</Text>
            <MaterialIcons name='arrow-forward' color={theame.text} size={15} />
          </Pressable>

          {/* Password */}
          <Text style={{ marginTop: 20,color:theame.text }}>Password</Text>
          <Pressable
            onPress={() => {
              setval('Password');
              setshow(true);
            }}
            style={styles.editField}>
            <Text style={{color:theame.text}}>****</Text>
            <MaterialIcons color={theame.text} name='arrow-forward' size={15} />
          </Pressable>
        </View>
      </View>

      {/* --- Edit Modal --- */}
      <Modal visible={show} transparent animationType='slide' style={{backgroundColor:theame.background}}>
        <SafeAreaView style={{ backgroundColor: theame.background, height:'80%', marginTop: '50%', justifyContent: 'space-between',padding:100 }}>
          {/* Close button */}
          <Pressable onPress={() => setshow(false)} style={{ alignItems: 'flex-end', justifyContent: 'center', margin: 10 }}>
            <MaterialIcons name='close' size={22} color={theame.text} />
          </Pressable>

          {/* Conditionally render input fields based on selection */}
          {val === "Password" ? (
            <View style={styles.modalContent}>
              <TextInput placeholder='Password' 
              value={password}
              placeholderTextColor={theame.text}
              onChangeText={setpassword} style={styles.inputField} />
              <Text style={styles.fieldDescription}>
                Update your password to keep your account secure.
              </Text>
            </View>
          ) : val === "Name" ? (
            <View style={styles.modalContent}>
              <TextInput placeholder='Full Name' 
              value={name}
              placeholderTextColor={theame.text}
              onChangeText={setname} style={styles.inputField} />
              <Text style={styles.fieldDescription}>
                Change your full name as it appears on your profile.
              </Text>
            </View>
          ) : val === "Phone number" ? (
            <View style={styles.modalContent}>
              <TextInput placeholder='Phone Number' 
              value={phone}
              placeholderTextColor={theame.text}
              onChangeText={setphone} style={styles.inputField} />
              <Text style={styles.fieldDescription}>
                Update your phone number for verification and notifications.
              </Text>
            </View>
          ) : (
            <Text>Address</Text>
          )}

          {/* Submit button */}
          <View style={{ alignItems: 'center',marginBottom:200  }}>
            <TouchableOpacity onPress={Submit} style={styles.updateButton}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Update</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

// ✅ Styles
const style =(colorsh,theame)=> StyleSheet.create({
  editField: {
    marginTop: 10,
    alignItems: 'center',
    width: '90%',
    height: 40,
    backgroundColor: theame.background,
    borderRadius: 10,
    justifyContent: 'space-between',
    padding: 10,
    flexDirection: 'row'
  },
  modalContent: {
    marginVertical: '10%',
    width: '100%',
    marginHorizontal: 10,
    height: '70%',
    justifyContent: 'flex-start',
    backgroundColor:theame.background
  },
  inputField: {
    backgroundColor: !colorsh?'whitesmoke':theame.background,
    height: 50,
    padding: 10,
    width: '90%',
    height:50,
    boxShadow:'0px 0px 3px  #6262625a',
    color:theame.text,
    borderRadius: 10
  },
  fieldDescription: {
    marginVertical: 10,
    padding: 10,
    color: !colorsh?'#555':theame.text
  },
  updateButton: {
    borderRadius: 10,
    height: 45,
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#f97316',
    justifyContent: 'center'
  }
});
