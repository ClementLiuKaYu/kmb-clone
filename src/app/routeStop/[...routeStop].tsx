import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Eta, useEta, useStop } from "@/api/kmb";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import ErrorScreen from "@/components/ErrorScreen";

export default function MapPage() {
  const {
    routeStop: [route, stop, bound, serviceType],
  } = useLocalSearchParams();

  const {
    data: stopData,
    isError: isStopError,
    isFetching: isStopFetching,
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
              : Math.round((Date.parse(etaList[0].eta) - Date.now()) / 60000);
          return { etaMins, ...data };
        })
      );
    }
  }, [isSuccessEta]);

  if (isStopFetching || (isEtaFetching && !etaData)) return <LoadingScreen />;

  if (isStopError) return <ErrorScreen />;

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: stopData.lat,
          longitude: stopData.long,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        style={styles.map}
      >
        <Marker
          title={stopData.name_tc}
          coordinate={{ latitude: stopData.lat, longitude: stopData.long }}
        />
      </MapView>
      <View className="border-t-4 border-red-500 flex flex-col p-6">
        <Text className="text-2xl pb-4">{stopData.name_tc}</Text>
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
                mins
              </Text>
              <Text className="text-xl text-gray-500">{eta.rmk_tc}</Text>
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
