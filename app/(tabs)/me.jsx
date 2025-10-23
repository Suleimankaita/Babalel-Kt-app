import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useGetGetCategoriesQuery,
  useAdd_categoriesMutation,
  useRemovecategoryMutation,
} from "@/components/Features/Getslice";
import Loading from "../Loader/Loading";
import { setTheame, getTheame } from "@/components/Features/Funcslice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Useauth from "../hooks/Useauth";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import useTheame from "@/hooks/theame";

const ORANGE_COLOR = "#f97316";

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { clearAuth } = Useauth();

  // Queries and Mutations
  const {
    data,
    isLoading: isLoadingCate,
    isError: isErrorCate,
  } = useGetGetCategoriesQuery("", {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [addCategory, { isLoading: isLoadingAdd }] = useAdd_categoriesMutation();
  const [removeCategory, { isLoading: isLoadingRemove }] =
    useRemovecategoryMutation();

  // Redux + Theme
  const isDarkStored = useSelector(getTheame);
  const [isDarkMode, setIsDarkMode] = useState(isDarkStored);
  const { theame, colorsh } = useTheame();

  // States
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    if (data) setCategories(data);
  }, [data]);

  // Persist theme mode
  useEffect(() => {
    (async () => {
      try {
        dispatch(setTheame(isDarkMode));
        const savedData = (await AsyncStorage.getItem("Blk")) || "{}";
        const parsed = JSON.parse(savedData);
        await AsyncStorage.setItem(
          "Blk",
          JSON.stringify({ ...parsed, theame: isDarkMode })
        );
      } catch (err) {
        console.error("Theme save error:", err.message);
      }
    })();
  }, [isDarkMode]);

  // Add category
  const handleAddCategory = async () => {
    if (!categoryName.trim()) return alert("Enter a valid category name.");
    try {
      await addCategory({ name: categoryName }).unwrap();
      setCategoryName("");
      setModalVisible(false);
    } catch (err) {
      alert(err.message || "Failed to add category");
    }
  };

  // Remove category
  const handleRemove = async (id) => {
    try {
      await removeCategory({ id }).unwrap();
    } catch (err) {
      alert(err.message || "Failed to remove category");
    }
  };

  // Dynamic colors
  const backgroundColor = theame.background;
  const textColor = theame.text;
  const cardColor = theame.card;
  const lightShade = colorsh ? "#2e2e2e" : "#f9f9f9";
  const TotalIn=!colorsh?['#ff8c00', '#ffae42']:[theame.background,'rgba(108, 108, 108, 1)']

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        <LinearGradient
          colors={TotalIn}
          style={styles.header}
        >
          <Text style={styles.headerText}>System Settings</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Account Section */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Account
            </Text>

            <TouchableOpacity
              onPress={() => router.push("../profile/Profile")}
              style={styles.optionRow}
            >
              <Feather name="user" size={20} color={ORANGE_COLOR} />
              <Text style={[styles.optionText, { color: textColor }]}>
                Edit Profile
              </Text>
              <AntDesign name="right" size={18} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("../Remove/RemoveAllProduct")}
              style={styles.optionRow}
            >
              <Feather name="lock" size={20} color={ORANGE_COLOR} />
              <Text style={[styles.optionText, { color: textColor }]}>
                Remove All Product
              </Text>
              <AntDesign name="right" size={18} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("../Remove/RemoveAllCate")}
              style={styles.optionRow}
            >
              <Feather name="lock" size={20} color={ORANGE_COLOR} />
              <Text style={[styles.optionText, { color: textColor }]}>
                Remove All Categories
              </Text>
              <AntDesign name="right" size={18} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* App Settings */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              App Settings
            </Text>

            <View style={styles.switchRow}>
              <Feather name="bell" size={20} color={ORANGE_COLOR} />
              <Text style={[styles.optionText, { color: textColor }]}>
                Notifications
              </Text>
              <Switch
                value={isNotificationOn}
                onValueChange={setIsNotificationOn}
                thumbColor={isNotificationOn ? ORANGE_COLOR : "#ccc"}
              />
            </View>

            <View style={styles.switchRow}>
              <Ionicons name="moon-outline" size={20} color={ORANGE_COLOR} />
              <Text style={[styles.optionText, { color: textColor }]}>
                Dark Mode
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                thumbColor={isDarkMode ? ORANGE_COLOR : "#ccc"}
              />
            </View>
          </View>

          {/* Categories */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Categories
            </Text>

            {categories.map((cat) => (
              <View
                key={cat?._id}
                style={[styles.categoryRow, { backgroundColor: lightShade }]}
              >
                <Text style={[styles.categoryText, { color: textColor }]}>
                  {cat?.name}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(cat._id)}>
                  <Feather name="trash-2" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <AntDesign name="plus-circle" size={22} color="white" />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View
            style={[
              styles.section,
              { backgroundColor: cardColor, borderTopColor: "#fee2e2" },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: "#dc2626" }]}>
              Danger Zone
            </Text>
            <TouchableOpacity onPress={clearAuth} style={styles.optionRow}>
              <Feather name="log-out" size={20} color="#dc2626" />
              <Text
                style={[styles.optionText, { color: "#dc2626", fontWeight: "600" }]}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for Adding Category */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Add New Category
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: "#ccc" }]}
                placeholder="Enter category name"
                placeholderTextColor="#aaa"
                value={categoryName}
                onChangeText={setCategoryName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ddd" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: ORANGE_COLOR }]}
                  onPress={handleAddCategory}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {(isLoadingCate || isLoadingAdd || isLoadingRemove) && (
        <View style={styles.loaderOverlay}>
          <Loading />
        </View>
      )}
    </>
  );
};

export default SettingsScreen;

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 15,
  },
  addButton: {
    backgroundColor: ORANGE_COLOR,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#1414142a",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
