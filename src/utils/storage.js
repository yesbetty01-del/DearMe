import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItems = async (Key, value) => {
    try {
        await AsyncStorage.setItem(Key, value);
        return true;
    }
    catch (error) {
        console.error("Error setting item in AsyncStorage:", error);
        return false;
    }
};
export const getItems = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    }
    catch (error) {
        console.error("Error getting item in AsyncStorage:", error);
        return null;
    }
};
