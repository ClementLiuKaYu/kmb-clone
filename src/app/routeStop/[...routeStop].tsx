import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Eta, useEta, useStop } from "@/api/kmb";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import ErrorScreen from "@/components/ErrorScreen";
import { useTranslation } from "react-i18next";
import { getLanguageKMB } from "@/i18n";

export default function MapPage() {
  const { t } = useTranslation();
  const lng = getLanguageKMB();

  const {
    routeStop: [route, stop, bound, serviceType],
  } = useLocalSearchParams();

  const {
    data: stopData,
    isError: isStopError,
    isFetching: isStopFetching,
    isSuccess: isStopSuccess,
  } = useStop(stop);

  const {
    data: etaData,
    isFetching: isEtaFetching,
    isSuccess: isSuccessEta,
  } = useEta({
    stop,
    route,
    serviceType,
  });

  const [etas, setEtas] = useState<(Eta & { etaMins: number | null })[]>([]);

  useEffect(() => {
    if (isSuccessEta) {
      const etaList = etaData
        // filter eta of right direction
        .filter((eta) => eta.dir == bound)
        // sort by eta_seq
        .sort(({ eta_seq: eta1 }, { eta_seq: eta2 }) => eta1 - eta2);

      setEtas(() =>
        etaList.map((data) => {
          const etaMins =
            data.eta == null
              ? null
              : Math.round((Date.parse(data.eta) - Date.now()) / 60000);
          return { etaMins, ...data };
        })
      );
    }
  }, [isSuccessEta]);

  if (isStopFetching || (isEtaFetching && !etaData)) return <LoadingScreen />;

  if (!isStopSuccess || isStopError) return <ErrorScreen />;

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: Number(stopData.lat),
          longitude: Number(stopData.long),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        style={styles.map}
      >
        <Marker
          title={stopData.name_tc}
          coordinate={{
            latitude: Number(stopData.lat),
            longitude: Number(stopData.long),
          }}
        />
      </MapView>
      <View className="border-t-4 border-red-500 flex flex-col p-6">
        <Text className="text-2xl pb-4">{stopData[`name_${lng}`]}</Text>
        {etas.map((eta, i) => {
          return (
            <View
              key={i}
              className="flex flex-row gap-x-2 items-center ml-4 pb-4"
            >
              <Text className="text-lg">
                <Text className="text-blue-500 text-2xl">
                  {eta.etaMins ?? "-"}
                </Text>{" "}
                {t("min")}
              </Text>
              <Text className="text-xl text-gray-500">{eta[`rmk_${lng}`]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "50%",
  },
});
