import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet ,AppState} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearToken, gettoken,Setuserdata } from '../../components/Features/Funcslice';

const JWT_CHECK_INTERVAL = 30000;
const Useauth = () => {
  const token = useSelector(gettoken);
  const dispatch = useDispatch();
  const router = useRouter();

  const [userData, setUserData] = useState({
    Username: '',
    id: '',
    password: '',
    role: '',
    account_no: '',
    account_name: ''
  });

  // Clear auth and logout
  const clearAuth = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('cokkie');
      dispatch(clearToken());
      setUserData({ account_no:'',Username: '', id: '', password: '', role: '',account_name:'' });
      router.replace('/(Reg)/Login');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  }, [dispatch, router]);

  const checkAndDecodeToken = useCallback((tk) => {
    try {
      if (!tk) {
        clearAuth();
        return null;
      }

      const decoded = jwtDecode(tk);
      const { exp, UserInfo } = decoded;
      const currentTime = Date.now() / 1000;

      if (exp < currentTime) {
        console.log('Token expired');
        clearAuth();
        return null;
      }

      const { username, id, password, } = UserInfo;
      setUserData({ Username:username, id, password,  });
      dispatch(Setuserdata({ Username:username, id, password, }));
     console.log(id)
      return username;
    } catch (err) {
      console.log('Invalid token:', err);
      clearAuth();
      return null;
    }
  }, [clearAuth]);


  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      checkAndDecodeToken(token);
    };

    checkTokenExpiration();

    const intervalId = setInterval(checkTokenExpiration, JWT_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token, checkAndDecodeToken]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('cokkie');
        if (storedToken) {
          checkAndDecodeToken(storedToken);
        }
      } catch (error) {
        console.log('Error loading token:', error);
      }
    };

    fetchToken();
  }, [checkAndDecodeToken]);

  
  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState) => {
  //     if (nextAppState === 'background') {
  //       console.log('App in background, clearing auth.');
  //       clearAuth();
  //     }
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);
  //   return () => subscription.remove();
  // }, [clearAuth]);

  return {role:userData.role, userData, Username: userData.Username,clearAuth };
};

export default Useauth;

const styles = StyleSheet.create({});