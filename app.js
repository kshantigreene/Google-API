import { createLocalStorageGeoJsonLayer } from "./localStorageMapLayer.js";

const STORAGE_KEY = "mapPoints";

// Each point is stored as a GeoJSON Feature. Note GeoJSON order is [lng, lat].
const SAMPLE_POINTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-69.6631, 44.5797] },
      properties: {
        name: "Thomas College",
        details: "Private college in Waterville, Maine.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-69.6317, 44.5520] },
      properties: {
        name: "Colby College",
        details: "Liberal arts college on Mayflower Hill.",
      },
    },
  ],
};

function readPoints() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null
    ? { type: "FeatureCollection", features: [] }
    : JSON.parse(stored);
}

function writePoints(geoJson) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(geoJson));
}

// Builds the info window content with DOM nodes so stored text is never parsed as HTML.
function buildInfoContent(feature) {
  const container = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = feature.getProperty("name") ?? "(unnamed)";
  const details = document.createElement("p");
  details.textContent = feature.getProperty("details") ?? "";
  const position = feature.getGeometry().get();
  const coords = document.createElement("small");
  coords.textContent = `${position.lat().toFixed(5)}, ${position.lng().toFixed(5)}`;
  container.append(title, details, coords);
  return container;
}

/*****
 * Initializes the map and sets up the GeoJSON layer.
 */
window.initMap = async () => {
  await google.maps.importLibrary("maps");

  if (window.localStorage.getItem(STORAGE_KEY) === null) {
    writePoints(SAMPLE_POINTS);
  }

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.5797, lng: -69.6631 },
    zoom: 13,
  });

  /**
   * Loads the layer from localStorage.
   */
  const { layer, refresh } = createLocalStorageGeoJsonLayer(map, STORAGE_KEY, {
    style: (feature) => ({ title: feature.getProperty("name") }),
  });

  const infoWindow = new google.maps.InfoWindow();
  /**
   * Listens for a click on the map, and opens an info window with the feature's name, 
   * details, and coordinates. 
   * The info window is positioned above the feature's geometry.
   */
  layer.addListener("click", (event) => {
    infoWindow.setContent(buildInfoContent(event.feature));
    infoWindow.setPosition(event.feature.getGeometry().get());
    infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
    infoWindow.open(map);
  });

  const form = document.getElementById("point-form");
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");

  /***
   * Listens for a click on the map, and updates the form's lat/lng inputs with the clicked coordinates.
   */
  map.addListener("click", (event) => {
    latInput.value = event.latLng.lat().toFixed(6);
    lngInput.value = event.latLng.lng().toFixed(6);
  });

  /**
   * Listens for the submit event on the form, and adds a new point to localStorage. 
   * The map layer is refreshed to show the new point.
   */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const geoJson = readPoints();
    geoJson.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(lngInput.value), Number(latInput.value)],
      },
      properties: {
        name: document.getElementById("name").value.trim(),
        details: document.getElementById("details").value.trim(),
      },
    });
    writePoints(geoJson);
    // The "storage" event only fires in other tabs, so refresh this one manually.
    refresh();
    form.reset();
  });

  /**
   * Listens for a click on the "Clear Points" button, and clears all points from localStorage.
   */
  document.getElementById("clear").addEventListener("click", () => {
    writePoints({ type: "FeatureCollection", features: [] });
    infoWindow.close();
    refresh();
  });
};
