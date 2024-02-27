import "../global.css";
import { Slot, usePathname, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Text,
  View,
  FlatList,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BackIcon } from "@/components/Icons";

export default function Layout() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <SafeAreaView className="flex-1"> */}
      <Header />
      <Slot />
      {/* </SafeAreaView> */}
    </QueryClientProvider>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const path = usePathname();

  return (
    //change to safeareaview
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between bg-red-600 gap-x-4">
        {path !== "/" && (
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : null)}
          >
            <BackIcon />
          </TouchableOpacity>
        )}
        <Text className="flex-1 items-center justify-center font-medium text-white text-xl">
          KMB-CLONE
        </Text>
      </View>
    </View>
  );
}
