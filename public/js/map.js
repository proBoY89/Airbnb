window.addEventListener("load", function () {
  const mapDiv = document.getElementById("map");
  const coordinates = JSON.parse(mapDiv.dataset.coordinates);
  const title = mapDiv.dataset.title;

  if (typeof maplibregl !== "undefined") {
    const map = new maplibregl.Map({
      container: "map",
      style:
        "https://api.maptiler.com/maps/streets-v2/style.json?key=qgSfmfsJxIwbRYcJQOoN",
      center: coordinates,
      zoom: 9,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl());

    const markerE1 = document.createElement("div");
    markerE1.id = "markerE1";

    new maplibregl.Marker({
      element: markerE1,
    })
      .setLngLat(coordinates)
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          "<p>exact Location provided after booking</p>"
        )
      )
      .addTo(map);
  } else {
    console.error("MapLibre failed to load.");
  }
});
