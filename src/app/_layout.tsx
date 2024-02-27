import "../global.css";
import { Slot, usePathname, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import { BackIcon } from "@/components/Icons";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export default function Layout() {
  const queryClient = new QueryClient();

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Header />
        <Slot />
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const path = usePathname();

  return (
    //change to safeareaview
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row bg-red-600 gap-x-4">
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
        <View className="flex flex-row gap-x-2">
          <TouchableOpacity onPress={() => i18n.changeLanguage("en")}>
            <Text className="text-white text-lg">EN</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg">{" | "}</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage("zh")}>
            <Text className="text-white text-lg">中</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
