import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";

const Map = () => {
    
  useEffect(() => {
    // Initialize the map
    const map = L.map("map").setView([51.505, -0.09], 6); // Adjust view to your desired region

    // Add tile layer (map background)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => map.remove(); // Cleanup map on component unmount
  }, []);

  return <div id="map" style={{ height: "80vh", width: "80%" }} />;
};

export default Map;
