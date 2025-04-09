export type ZoneType = "free" | "paid";

export interface DeliveryZone {
  name: string;
  zoneType: ZoneType;
  deliveryFee?: number;
  coordinates: google.maps.LatLngLiteral[];
}
