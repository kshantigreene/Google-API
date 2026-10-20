export function createLocalStorageGeoJsonLayer(map, storageKey, options = {}) {
  const readGeoJson = () => {
    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue === null) {
      return { type: "FeatureCollection", features: [] };
    }

    const geoJson = JSON.parse(storedValue);
    if (
      geoJson?.type !== "FeatureCollection" ||
      !Array.isArray(geoJson.features)
    ) {
      throw new Error(
        `localStorage key "${storageKey}" must contain a GeoJSON FeatureCollection.`,
      );
    }

    return geoJson;
  };

  const initialGeoJson = readGeoJson();
  const dataLayer = new google.maps.Data({ map });
  if (options.style !== undefined) {
    dataLayer.setStyle(options.style);
  }
  dataLayer.addGeoJson(initialGeoJson);

  const refresh = () => {
    const geoJson = readGeoJson();
    const existingFeatures = [];
    dataLayer.forEach((feature) => existingFeatures.push(feature));
    existingFeatures.forEach((feature) => dataLayer.remove(feature));
    dataLayer.addGeoJson(geoJson);
  };

  const handleStorage = (event) => {
    if (event.key !== storageKey && event.key !== null) {
      return;
    }

    try {
      refresh();
    } catch (error) {
      console.error(`Could not refresh map layer "${storageKey}".`, error);
    }
  };

  window.addEventListener("storage", handleStorage);

  return {
    layer: dataLayer,
    refresh,
    destroy() {
      window.removeEventListener("storage", handleStorage);
      dataLayer.setMap(null);
    },
  };
}
