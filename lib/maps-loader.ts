import { Loader } from "@googlemaps/js-api-loader";

export const mapsLoader = new Loader({
  apiKey: "AIzaSyD_xex28kszrej4Al0WtKbn3cQaMkxCpVY",
  version: "weekly",
  libraries: ["drawing", "places"],
});
