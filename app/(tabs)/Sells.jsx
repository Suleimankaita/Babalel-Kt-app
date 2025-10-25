import { uri } from '@/components/Features/api/uri';
import { SetRoute } from '@/components/Features/Funcslice';
import { useGetSellsQuery } from '@/components/Features/Getslice';
import theames from '@/hooks/theame';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Loading from '../Loader/Loading';

const ORANGE_COLOR = '#f97316';
const GRAY_TEXT = '#666';

// --- Time Filter Component ---
const TimeFilter = ({ styles, onPress, value, selectdate, text, isActive }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.timeButton,
      value === selectdate ? styles.timeActive : styles.timeInactive,
    ]}
  >
    <Text
      style={[
        styles.timeText,
        isActive ? styles.timeTextActive : styles.timeTextInactive,
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

// --- Sold Item Row ---
const SoldItemRow = ({ styles, item, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item)}>
    <Image
      source={{ uri: `${uri}/img/${item?.image?.[0]}` }}
      style={styles.itemImage}
    />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemDate}>Sold on: {item?.date}</Text>
      <Text style={styles.itemQuantity}>Qty: {item?.quantity}</Text>
    </View>
    <View style={styles.itemStats}>
      <Text style={styles.itemPrice}>₦{Number(item?.retailPrice).toFixed(2)}</Text>
    </View>
  </TouchableOpacity>
);

// --- Main Component ---
const SoldProductsPage = () => {
  const { data, isLoading, isSuccess } = useGetSellsQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const router = useRouter();
  const disp = useDispatch();
  const { colorsh, theame } = theames(); // ✅ use your custom theme hook properly

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectdate, setSelectdate] = useState('Today');

  const handleItemPress = (item) => {
    disp(SetRoute(item?.name));
    router.push(`/(Sold)/${item._id}`);
  };

  useEffect(() => {
    if (!data) return;
    if (data.ids && data.entities) {
      const s = data.ids.map((id) => data.entities[id]);
      setProducts(s);
    } else {
      setProducts(data);
    }
  }, [data]);

  // --- Date Filters ---
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const lastWeekDate = lastWeek.toISOString().split('T')[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfMonthDate = firstDayOfMonth.toISOString().split('T')[0];
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const firstDayOfYearDate = firstDayOfYear.toISOString().split('T')[0];

  const filteredData = products.filter((product) => {
    const matchesSearch = product?.name
      ?.toLowerCase()
      ?.includes(searchQuery.toLowerCase());
    const productDate = product?.date?.split('T')[0] || '';
    const dateFilter =
      selectdate === 'Today'
        ? productDate === todayDate
        : selectdate === 'Last 7 Days'
        ? productDate >= lastWeekDate
        : selectdate === 'Mothly'
        ? productDate >= firstDayOfMonthDate
        : productDate >= firstDayOfYearDate;

    return matchesSearch && dateFilter;
  });

  const styles = style(colorsh, theame);

  if(!filteredData.length){
    return<SafeAreaView style={{flex:1,justifyContent:"center",alignItems:'center'}}>
            <Text style={{color:theame.text}}>No Sell Product to display</Text>
          </SafeAreaView>
  }

  return (
    <>
      {isSuccess && (
        <SafeAreaView style={styles.container}>
          {/* --- Date Filters --- */}
          <View style={styles.timeFilterRow}>
            <TimeFilter
              styles={styles}
              selectdate={selectdate}
              value="Today"
              onPress={() => setSelectdate('Today')}
              text="Today"
              isActive={selectdate === 'Today'}
            />
            <TimeFilter
              styles={styles}
              selectdate={selectdate}
              value="Last 7 Days"
              onPress={() => setSelectdate('Last 7 Days')}
              text="Last 7 Days"
              isActive={selectdate === 'Last 7 Days'}
            />
            <TimeFilter
              styles={styles}
              selectdate={selectdate}
              value="Mothly"
              onPress={() => setSelectdate('Mothly')}
              text="Mothly"
              isActive={selectdate === 'Mothly'}
            />
            <TimeFilter
              styles={styles}
              selectdate={selectdate}
              value="This Year"
              onPress={() => setSelectdate('This Year')}
              text="This Year"
              isActive={selectdate === 'This Year'}
            />
          </View>

          {/* --- Search Bar --- */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search product name or ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theame.textMuted || '#999'}
            />
          </View>

          {/* --- Product List --- */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <SoldItemRow item={item} styles={styles} onPress={handleItemPress} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>
                No products sold matched your search.
              </Text>
            )}
          />
        </SafeAreaView>
      )}

      {isLoading && (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: '#14141434',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <Loading />
        </View>
      )}
    </>
  );
};

export default SoldProductsPage;

// --- Styles (Theme Integrated) ---
const style = (colorsh, theame) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorsh?theame.background: '#f8f8f8',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theame.background,
      borderRadius: 8,
      margin: 15,
      paddingHorizontal: 10,
      shadowColor: !colorsh?'#000':'rgba(120, 120, 120, 1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    searchIcon: {
      fontSize: 18,
      color: theame.textMuted || '#999',
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: colorsh?theame.text: '#333',
    },
    listContent: {
      paddingHorizontal: 15,
      paddingBottom: 20,
    },
    itemContainer: {
      flexDirection: 'row',
      backgroundColor: theame.background ,
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      alignItems: 'center',
      shadowColor: !colorsh?'#000':"rgba(108, 108, 108, 0.3)",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 6,
      marginRight: 15,
      backgroundColor: !colorsh ? '#f0f0f0':theame.background,
    },
    itemDetails: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 10,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color:'#333',
    },
    itemDate: {
      fontSize: 12,
      color:  '#777',
      marginTop: 2,
    },
    itemQuantity: {
      fontSize: 12,
      color: '#777',
    },
    itemStats: {
      alignItems: 'flex-end',
      minWidth: 70,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '700',
      color:  '#28a745',
    },
    emptyListText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color:  '#999',
    },
    timeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    timeActive: {
      backgroundColor: ORANGE_COLOR,
    },
    timeInactive: {
      backgroundColor: theame.background,
    },
    timeTextActive: {
      color: 'white',
    },
    timeTextInactive: {
      color:  GRAY_TEXT,
    },
    timeFilterRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theame.background ,
      borderRadius: 15,
      padding: 5,
      marginVertical: 15,
    },
  });
