import { View, ActivityIndicator } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ff0000" />
    </View>
  );
}
