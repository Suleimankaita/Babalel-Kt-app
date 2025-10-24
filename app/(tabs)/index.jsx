import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { io } from "socket.io-client";
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, Grid, BarChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGetProductQuery, useGetSellsQuery,useGetGetCategoriesQuery } from '@/components/Features/Getslice';
import Loading from '../Loader/Loading';
import { getTheame } from '@/components/Features/Funcslice';
import { uri } from '@/components/Features/api/uri';
import theames from '@/hooks/theame';
import { useSelector } from 'react-redux';
import Logo from "../../assets/images/logo.jpg"
import { useRouter } from 'expo-router';
const BaballeShopDashboard = () => {
  const {
    data: productData,
    isLoading: isLoadingProduct,
  } = useGetProductQuery('', {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: productSell,
    isLoading: isLoadingSell,
  } = useGetSellsQuery('', {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: productCate,
    isLoading: isLoadingCate,
  } = useGetGetCategoriesQuery('', {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { colorsh, theame } = theames();
  const colors = useSelector(getTheame);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const socket = useRef(null);

  const [datas, setdatas] = useState([]);
  const [filter, setfilter] = useState([]);
  const [amt, setamt] = useState([]);
  const [amount, setamount] = useState(0);
  const [date, setDate] = useState(new Date());
  const [date2, setdate2] = useState(new Date());
  const [show, setShow] = useState(false);

  const [totalItems, settotalItems] = useState(0);
  const [outOfStockItems, setoutOfStockItems] = useState(0);
  const [inoutOfStockItems, setinoutOfStockItems] = useState(0);
  const [inStockItems, setinStockItems] = useState(0);
  const [stockPercentage, setstockPercentage] = useState(0);
  const [outOfStockPercentage, setoutOfStockPercentage] = useState(0);

  const [selldata, setselldata] = useState([]);
  const [sellFilter, setsellFilter] = useState([]);
  const [CateFilter, setCateFilter] = useState([]);
  const [SelectedCate, setSelectedCate] = useState('All');

  // Filter mode state for Total Inventory Value
  const [filterMode, setFilterMode] = useState('weekly'); // weekly, monthly, yearly

  // Date picker change for Today Sell
  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios'); 
    if (selectedDate) setDate(selectedDate);
  };

  // Socket connection
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(uri, { transports: ['websocket'] });
    }

    socket.current.on('connect', () => {
      fetch(`${uri}/Products`)
        .then(res => res.json())
        .then(data => data)
        .catch(err => console.error('Fetch error:', err));
    });

    socket.current.off('All').on('All', (datass) => setdatas(datass));

    return () => {
      socket.current.off('All');
      socket.current.disconnect();
      socket.current = null;
    };
  }, []);

  // Stock calculations
  useEffect(() => {
    if (!datas) return;

    settotalItems(datas.length);
    const outStock = datas.filter(item => item.quantity <= 20).length;
    const zeroStock = datas.filter(item => item?.quantity <= 0).length;

    setoutOfStockItems(outStock);
    setinoutOfStockItems(zeroStock);
    setinStockItems(datas.length - zeroStock);

    const stockPercent = datas.length ? ((datas.length - zeroStock) / datas.length) * 100 : 0;
    const outPercent = datas.length ? (outStock / datas.length) * 100 : 0;

    setstockPercentage(Number(stockPercent.toFixed(2)));
    setoutOfStockPercentage(Number(outPercent.toFixed(2)));
  }, [datas]);

  // Helper function to filter by mode
  const filterByMode = (data, mode) => {
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const today = new Date();

      if (mode === 'weekly') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      }

      if (mode === 'monthly') {
        return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      }

      if (mode === 'yearly') {
        return itemDate.getFullYear() === today.getFullYear();
      }

      return false;
    });
  };

  const [listCate,setlistCate]=useState([])

  useEffect(()=>{
    if(!productData)return;
    const ms=productData.map(res=>res.name)
    setlistCate(ms)
      setSelectedCate(ms[0])
  },[productData])

  // Total Inventory Value calculation (filter by mode)
  useEffect(() => {
    if (!datas) return;

    const filteredData = filterByMode(datas, filterMode);
    setfilter(filteredData);

    const total = filteredData.reduce((sum, i) => sum + (i.retailPrice || 0), 0);
    setamount(total);
    setamt(filteredData.map(i => i.retailPrice || 0));
  }, [datas, filterMode]);

  // Today Sell calculation (filter by date picker)
  useEffect(() => {
    if (!productSell) return;

    const filt = productSell.filter(res => res.date === date.toISOString().split('T')[0]);
    setsellFilter(filt);
    setselldata(productSell);
  }, [productSell, date]);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1800, useNativeDriver: true }).start();
  }, []);

  const styles = style(colors, theame);
  const todaySellColors = !colors ? ['#0585cfff', '#00d5ffff'] : [theame.background,'rgba(108, 108, 108, 1)'];
  const TotalInColors = !colors ? ['#ff8c00', '#ffae42'] : [theame.background,'rgba(108, 108, 108, 1)'];

  const [visible,setvisible]=useState(false)
  const [CateAmount,setCateAmount]=useState(false)

useEffect(() => {
  if (!productCate && !productData) return;

  // Filter datas where the category includes the selected category
  const Filter = datas.map(res => {
    return{name:res.name,price:res.retailPrice,Category:res.category,quantity:res.quantity,actualPrice:res?.actualPrice}});
  const mes= Filter.filter(res=>res.name.toLowerCase()===SelectedCate.toLowerCase());
    setCateFilter(mes)
  // Calculate total retail price
  const total = mes.reduce((sum, item) => sum + (item.actualPrice || 0), 0);
  setCateAmount(total);

  
  // Update filtered data
  setCateFilter(mes);

}, [SelectedCate, productCate, datas]);

const [ListVisi,setListVisi]=useState(false)
const router=useRouter()
  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Baballe Shop</Text>
            <View style={styles.headerRight}>
              {/* <AntDesign name="user" size={24} color="#888" /> */}
              <Image source={Logo} style={{width:50,height:50,borderRadius:50}} />
            </View>
          </View>

          {/* Filter mode buttons for Total Inventory Value */}
      
          {/* Total Inventory Value Card */}
          <LinearGradient colors={TotalInColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inventoryCard}>

            <Text style={styles.inventoryCardTitle}>Total Inventory Value</Text>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={styles.inventoryCardValue}>₦{Number(amount).toLocaleString()}</Text>

              <TouchableOpacity onPress={()=>{
                setvisible(true)
              }} style={{width:'35%',borderRadius:10,height:35,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(156, 148, 148, 0.25)',padding:5}}>


              <Text style={{color:'white'}} numberOfLines={1}>Filter by {filterMode}</Text>
              </TouchableOpacity>
            </View>
            <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
              <LineChart
                style={{ height: 100 }}
                data={filter.map(res => res.retailPrice || 0)}
                svg={{ stroke: 'rgba(255,255,255,0.9)', strokeWidth: 3 }}
                contentInset={{ top: 10, bottom: 10 }}
                curve={shape.curveNatural}
              >
                <Grid svg={{ stroke: 'rgba(255,255,255,0.2)' }} />
              </LineChart>
            </Animated.View>
          </LinearGradient>

          {/* Inventory and Orders */}
          <View style={styles.row}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <MaterialCommunityIcons name="package" size={20} color="#666" />
                <Text style={styles.statCardHeaderText}>Items In Stock</Text>
              </View>
              <Text style={styles.statCardValue}>{inStockItems}</Text>
              <View style={styles.statCardFooter}>
                <MaterialIcons name={stockPercentage > 20 ? 'arrow-upward' : 'arrow-downward'} size={12} color={stockPercentage < 20 ? '#FF6347' : 'green'} />
                <Text style={[styles.statCardChange, { color: stockPercentage <= 20 ? 'tomato' : 'green' }]}>{stockPercentage || 0}%</Text>
                <Text style={styles.statCardDate}>{new Date().toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <FontAwesome name="hourglass-half" size={20} color="#666" />
                <Text style={styles.statCardHeaderText}>Items out of stock</Text>
              </View>
              <Text style={styles.statCardValue}>{outOfStockItems}</Text>
              <View style={styles.statCardFooter}>
                <MaterialIcons name={outOfStockItems > 20 ? 'arrow-upward' : 'arrow-downward'} size={12} color={outOfStockItems>20 ? 'green' : '#FF6347'} />
                <Text style={[styles.statCardChange, { color: outOfStockPercentage <= 20 ? 'tomato' : 'green' }]}>{outOfStockPercentage || 0}%</Text>
                <Text style={styles.statCardDate}>{new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <Modal transparent={true} animationType='slide' visible={visible}>
            <View style={{flex:1,backgroundColor:'rgba(1, 1, 1, 0.22)',justifyContent:'center',alignItems:'center'}}>

              <View style={{backgroundColor:theame.background,width:'80%',height:'50%',borderRadius:15}}>
        <View style={{ flexDirection: 'column', justifyContent: 'space-around', marginVertical: 10 }}>
            {['weekly','monthly','yearly'].map(mode => (
              <TouchableOpacity onpre style={{height:50,width:'90%',borderRadius:10,margin:10,justifyContent:'center',padding:10,backgroundColor:'rgba(171, 171, 171, 0.15)'}} key={mode} onPress={() =>{ setFilterMode(mode)
                setvisible(false)

              }}>
                <Text style={{ color: filterMode === mode ? 'orange' : '#b9b5b5ff', fontWeight: 'bold' }}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

              </View>

            </View>
          </Modal>

          {/* Today Sell */}
          <LinearGradient colors={todaySellColors} style={styles.revenueOverviewCard}>
            <View style={styles.revenueOverviewHeader}>
              <View>
                <Text style={styles.revenueOverviewTitle}>Today Sell</Text>
                <Text style={styles.inventoryCardValue}>
                  ₦{Number(sellFilter.reduce((sum, prv) => sum + (prv.retailPrice || 0), 0)).toLocaleString()}
                </Text>
              </View>

              <View style={styles.switchContainer}>
                {Platform.OS === 'android' || Platform.OS === 'web' ? (
                  <TouchableOpacity onPress={() => setShow(true)}>
                    <Text style={{ color: 'white' }}>{date.toISOString().split('T')[0]}</Text>
                    {show && (
                      <DateTimePicker value={date2} mode="date" display="default" onChange={onChange} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <DateTimePicker value={date} mode="date" display="default" onChange={onChange} />
                )}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20, flexDirection: 'column' }}>
              <Animated.View style={{ opacity: fadeAnim }}>
                <LineChart
                  style={{ height: 150 }}
                  data={sellFilter.map(res => res?.retailPrice || 0)}
                  svg={{ stroke: '#ffffffff', strokeWidth: 3 }}
                  contentInset={{ top: 20, bottom: 20 }}
                  curve={shape.curveNatural}
                >
                  <Grid />
                </LineChart>
              </Animated.View>

              <View style={styles.chartLabels}>
                {sellFilter.map((value, index) => (
                  <View key={value?._id || index} style={styles.labelItem}>
                    <TouchableOpacity>
                      <Text style={styles.labelPrice}>{value?.time || ''}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>

           <LinearGradient
      colors={TotalInColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.inventoryCard2, { marginTop: 20 }]}
    >
      <Text style={styles.inventoryCardTitle}>Total Product price</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap:'wrap' }}>
        <Text style={styles.inventoryCardValue}>₦{Number(CateAmount).toLocaleString()}</Text>
                    <View style={{bottom:20}}>
            <Text style={{color:'white',}}>Total Quantity {CateFilter[0]?.quantity}</Text>
            <Text style={{color:'white',margin:5}}>Actual price ₦{Number(CateAmount).toLocaleString()}</Text>
        <TouchableOpacity
          onPress={() => setListVisi(true)}
          style={{
            width: '100%',
            borderRadius: 10,
            height: 35,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(156, 148, 148, 0.25)',
            padding: 5,
          }}
        >
          
          <Text style={{ color: 'white' }} numberOfLines={1}>
            Filter by {SelectedCate}
          </Text>
        </TouchableOpacity>
            </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
        <BarChart
          style={{ height: 100 }}
          data={CateFilter.map(res => res.price || 0)}
          svg={{ fill: 'rgba(255,255,255,0.9)' }}
          contentInset={{ top: 10, bottom: 10 }}
          spacingInner={0.3}
          curve={shape.curveLinear}
        >
          <Grid svg={{ stroke: 'rgba(255,255,255,0.2)' }} />
        </BarChart>
      </Animated.View>
    </LinearGradient>

              <Modal transparent={true} animationType='slide' visible={ListVisi}>
            <View style={{flex:1,backgroundColor:'rgba(1, 1, 1, 0.22)',justifyContent:'center',alignItems:'center'}}>

              <View style={{backgroundColor:theame.background,width:'80%',height:'50%',borderRadius:15}}>
        <View style={{ flexDirection: 'column', justifyContent: 'space-around', marginVertical: 10 }}>
        
            {listCate.map(mode => (
              <TouchableOpacity onpre style={{height:50,width:'90%',borderRadius:10,margin:10,justifyContent:'center',padding:10,backgroundColor:'rgba(171, 171, 171, 0.15)'}} key={mode} onPress={() =>{ setSelectedCate(mode)
                setListVisi(false)

              }}>
                <Text style={{ color: SelectedCate === mode ? 'orange' : '#b9b5b5ff', fontWeight: 'bold' }}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

              </View>

            </View>
          </Modal>


        </ScrollView>
      </SafeAreaView>

      {(isLoadingSell || isLoadingProduct) && (
        <View style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          backgroundColor: '#14141434',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <Loading />
        </View>
      )}
    </>
  );
};

const style = (colorsh, theame) => StyleSheet.create({
  container: { flex: 1, backgroundColor: !colorsh ? '#f5f5f5' : theame.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: !colorsh ? '#333' : theame.text },
  headerRight: { width: 40, height: 40, borderRadius: 20, backgroundColor: !colorsh ? '#eee' : theame.text, justifyContent: 'center', alignItems: 'center' },
  inventoryCard: { marginHorizontal: 20, borderRadius: 15, padding: 20, overflow: 'hidden', height: 220, justifyContent: 'flex-start', marginBottom: 20, elevation: 5 },
  inventoryCard2: { marginHorizontal: 20, borderRadius: 15, padding: 20, overflow: 'hidden', minHeight: 260, justifyContent: 'flex-start', marginBottom: 20, elevation: 5 },
  inventoryCardTitle: { color: 'white', fontSize: 16, marginBottom: 5 },
  inventoryCardValue: { color: 'white', fontSize: 30, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: theame.background, borderRadius: 15, padding: 15, marginRight: 10, elevation: 3 },
  statCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statCardHeaderText: { marginLeft: 5, fontSize: 14, color: !colorsh ? '#666' : theame.text },
  statCardValue: { fontSize: 28, fontWeight: 'bold', color: !colorsh ? '#333' : theame.text, marginVertical: 5 },
  statCardFooter: { flexDirection: 'row', alignItems: 'center' },
  statCardChange: { fontSize: 12, marginLeft: 3, marginRight: 8 },
  statCardDate: { fontSize: 12, color: !colorsh ? '#888' : theame.text },
  revenueOverviewCard: { borderRadius: 15, padding: 20, elevation: 3, overflow: 'hidden', marginHorizontal: 20 },
  revenueOverviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  revenueOverviewTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  labelItem: { alignItems: 'center' },
  labelPrice: { color: !colorsh ? '#f97316' : theame.text, fontWeight: 'bold', fontSize: 12 },
  labelDate: { color: !colorsh ? '#666' : theame.text, fontSize: 11 },
});

export default BaballeShopDashboard;
