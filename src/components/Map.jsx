import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat"; // For heatmap
import { fetchRegionalData } from "../apis/fetchRegions";
import windIcon from "../assets/wind.png";
import solarIcon from "../assets/sun.png";
import gasIcon from "../assets/gas.png";
import hydroIcon from "../assets/hydro.png";


const getIntensityColor = intensity => {
  if (intensity < 100) return "green";
  if (intensity < 200) return "yellow";
  if (intensity < 300) return "orange";
  return "red";
};


const Map = () => {
  const [filter, setFilter] = useState("all"); // Filter state
  const mapRef = useRef(null); // Ref for the map instance
  const heatLayerRef = useRef(null); // Ref for the heatmap layer
  const [lastUpdated, setLastUpdated] = useState("");


  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([55.3781, -3.436], 6); // Initialize map
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(map);

    }

    const updateData = async () => {
      const map = mapRef.current;

      // Fetch data
      const data = await fetchRegionalData()

      setLastUpdated(new Date().toLocaleTimeString()); // Update timestamp
      // Remove existing circle markers and heatmap layer
      map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) map.removeLayer(layer);
      });
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      // Filtered data based on selected filter
      const filteredData = data.filter(region =>
        filter === "all" ? true : region.intensity.index === filter
      );

      // Add circle markers for filtered data
      filteredData.forEach(region => {
        if (region.lat && region.lon) {
          L.circleMarker([region.lat, region.lon], {
            color: getIntensityColor(region.intensity.forecast),
            radius: 8,
            fillOpacity: 0.7,
          })
            .bindPopup(`
              <strong>${region.shortname}</strong><br>
              Intensity: ${region.intensity.forecast}<br>
              Index: ${region.intensity.index}<br>
              <h4>Generation Mix:</h4>
              <div> 
                <img src="${windIcon}" width="20"/> Wind: ${region.generationmix.find(f => f.fuel === "wind").perc}%<br>
                <img src="${solarIcon}" width="20" /> Solar: ${region.generationmix.find(f => f.fuel === "solar").perc}%<br>
                <img src="${gasIcon}" width="20" /> Gas: ${region.generationmix.find(f => f.fuel === "gas").perc}%<br>
                <img src="${hydroIcon}" width="20" /> Hydro: ${region.generationmix.find(f => f.fuel === "hydro").perc}%<br>
              </div>
            `)
            .addTo(map);
        }
      });

      // Add heatmap layer (not filtered)
      const heatData = filteredData.map(region => [
        region.lat,
        region.lon,
        region.intensity.forecast / 200, // Scale intensity for heatmap
      ]);
      const heatLayer = L.heatLayer(heatData, { radius: 30 });
      heatLayerRef.current = heatLayer;
      heatLayer.addTo(map);
    };

    // Initial data load
    updateData();

    // Real-time updates every 5 minutes
    const interval = setInterval(updateData, 300000);

    return () => {
      clearInterval(interval); // Cleanup interval
      if (mapRef.current) {
        mapRef.current.remove(); // Cleanup map
        mapRef.current = null;
      }
    };
  }, [filter]); // Re-run effect when filter changes

  const getFilterLabel = () => {
    switch (filter) {
      case "very low":
        return "Showing: Very Low Intensity Regions";
      case "low":
        return "Showing: Low Intensity Regions";
      case "moderate":
        return "Showing: Moderate Intensity Regions";
      case "high":
        return "Showing: High Intensity Regions";
      default:
        return "Showing: All Regions";
    }
  };

  return (
    <>
      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        Last updated: {lastUpdated}
      </div>

      <strong>{getFilterLabel()}</strong>
      <select
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", fontSize: "14px" }}
      >
        <option value="all">All</option>
        <option value="very low">Very Low</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="very high">High</option>
      </select>

      <div id="map" style={{ height: "80vh", width: "80%" }} />
    </>
  );
};

export default Map;
