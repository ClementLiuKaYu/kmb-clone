import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const baseUrl = "https://data.etabus.gov.hk/v1/transport/kmb";

// export type Route = {
//   route: string;
//   bound: "I" | "O";
//   service_type: String;
//   orig_en: string;
//   orig_tc: string;
//   orig_sc: string;
//   dest_en: string;
//   dest_tc: string;
//   dest_sc: string;
// };

// export const useRouteList = () => {
//   return useQuery({
//     queryKey: ["routeList"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${baseUrl}/route`);
//       return new Map<string, Route>(
//         data.data.map((route: Route) => [route.route, route])
//       );
//     },
//   });
// };

export type Stop = {
  stop: string;
  name_tc: string;
  name_en: string;
  name_sc: string;
  lat: number;
  long: number;
};

export const useStop = (stopId) => {
  return useQuery({
    queryKey: ["stop", stopId],
    queryFn: async (): Promise<Stop> => {
      const { data } = await axios.get(`${baseUrl}/stop/${stopId}`);
      return data.data;
    },
  });
};

export const useStopList = () => {
  return useQuery({
    queryKey: ["stopList"],
    queryFn: async (): Promise<Stop[]> => {
      const { data } = await axios.get(`${baseUrl}/stop`);
      return data.data;
    },
  });
};

export type RouteStop = {
  route: string;
  bound: "I" | "O";
  service_type: string;
  seq: number;
  stop: string;
};

export const useRouteStopList = () => {
  return useQuery({
    queryKey: ["routeStopList"],
    queryFn: async () => {
      const { data } = await axios.get(`${baseUrl}/route-stop`);
      return data.data as [RouteStop];
    },
  });
};

export type Eta = {
  route: string;
  dir: "I" | "O";
  service_type: string;
  seq: number;
  stop: string;
  dest_tc: string;
  dest_en: string;
  dest_sc: string;
  eta_seq: number;
  eta: string;
  rmk_tc: string;
  rmk_en: string;
  rmk_sc: string;
};

const ETA_REVALIDATE = 10000;

export const useEta = ({ stop, route, serviceType }) => {
  return useQuery({
    queryKey: ["eta", stop, route, serviceType],
    queryFn: async (): Promise<Eta[]> => {
      const { data } = await axios.get(
        `${baseUrl}/eta/${stop}/${route}/${serviceType}`
      );
      return data.data;
    },
    refetchInterval: ETA_REVALIDATE,
  });
};

export const useStopEta = (stopId) => {
  return useQuery({
    queryKey: ["stop-eta", stopId],
    queryFn: async (): Promise<Eta[]> => {
      const { data } = await axios.get(`${baseUrl}/stop-eta/${stopId}`);
      return data.data;
    },
    refetchInterval: ETA_REVALIDATE,
  });
};
