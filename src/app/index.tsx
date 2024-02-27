import {
  type RouteStop,
  useRouteStopList,
  useStop,
  useEta,
  useStopList,
} from "@/api/kmb";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, FlatList, Pressable } from "react-native";
import { AlertCircleIcon } from "@/components/Icons";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTranslation } from "react-i18next";
import { getLanguageKMB } from "@/i18n";
import * as Location from "expo-location";
import haversine from "haversine-distance";

export default function HomePage() {
  return (
    <View className="flex flex-1">
      <Content />
    </View>
  );
}

const Content = () => {
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const updateLocation = async () => {
    setFetchingLocation(true);
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setFetchingLocation(false);
  };

  const stop1 = "BFA3460955AC820C";
  const stop2 = "5FB1FCAF80F3D97D";

  const { data, error, isFetching, refetch } = useRouteStopList();
  const { data: stopData } = useStopList();

  if (error) return <ErrorScreen />;
  if (!data && isFetching) return <LoadingScreen />;

  if (location && stopData) {
    const inRangeStops = stopData
      .filter(({ lat, long, stop }) => {
        const dis = haversine(
          { latitude: Number(lat), longitude: Number(long) },
          {
            latitude: Number(location.coords.latitude),
            longitude: Number(location.coords.longitude),
          }
        );
        return dis < 300;
      })
      .map(({ stop }) => stop);
    return (
      <View className="flex-1">
        <FlatList
          data={data.filter((route) => inRangeStops.includes(route.stop))}
          renderItem={({ item: routeStop }) => <RouteListItem {...routeStop} />}
          refreshing={fetchingLocation}
          onRefresh={() => {
            updateLocation();
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={data.filter(
          (route) => route.stop == stop1 || route.stop == stop2
        )}
        renderItem={({ item: routeStop }) => <RouteListItem {...routeStop} />}
        refreshing={isFetching}
        onRefresh={() => {
          refetch();
        }}
      />
    </View>
  );
};

const RouteListItem = (routeStop: RouteStop) => {
  const { t } = useTranslation();
  const lng = getLanguageKMB();
  const { route, stop, service_type: serviceType, bound } = routeStop;
  const { data: stopData, isSuccess: isSuccessStop } = useStop(stop);
  const {
    data: etaData,
    isError: isErrorEta,
    isSuccess: isSuccessEta,
    isFetching: isFetchingEta,
  } = useEta({
    route,
    stop,
    serviceType,
  });

  const [etaClosest, setEtaClosest] = useState<number | null>(null);

  useEffect(() => {
    if (isSuccessEta) {
      const etaList = etaData
        // filter eta of right direction
        .filter((eta) => eta.dir == bound)
        // sort by eta_seq
        .sort((a, b) => a.eta_seq - b.eta_seq);
      setEtaClosest(() => {
        if (etaList[0]?.eta == null) return null;
        return Math.round((Date.parse(etaList[0].eta) - Date.now()) / 60000);
      });
    }
  }, [isSuccessEta]);

  return (
    <Link
      push
      href={`/routeStop/${route}/${stop}/${bound}/${serviceType}`}
      asChild
    >
      <Pressable className="flex flex-row h-20 border-b border-gray-500 items-center px-2 justify-between">
        <View className="flex flex-row items-center justify-between gap-2">
          <Text className="text-2xl font-semibold w-20">{routeStop.route}</Text>
          <View>
            <View className="flex flex-row items-center">
              <Text className="text-xs text-gray-500">{t("going")}</Text>
              <Text
                className="text-lg text-semibold max-w-64"
                numberOfLines={1}
              >
                {isSuccessEta && !isFetchingEta
                  ? lng == "en"
                    ? etaData[0]?.dest_en
                    : etaData[0]?.dest_tc
                  : "-"}
              </Text>
            </View>
            <Text className="text-gray-700 text-sm">
              {isSuccessStop
                ? lng == "en"
                  ? stopData?.name_en
                  : stopData?.name_tc
                : "-"}
            </Text>
          </View>
        </View>
        <View>
          {etaData || isErrorEta ? (
            <>
              <Text className="text-blue-700 text-2xl">
                {etaClosest ?? "-"}
              </Text>
              <Text className="text-gray-500 text-xs">{t("min")}</Text>
            </>
          ) : (
            <AlertCircleIcon />
          )}
        </View>
      </Pressable>
    </Link>
  );
};
