import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat"; // For heatmap
import { useQuery } from "@tanstack/react-query";
import { fetchRegionalData } from "../apis/fetchRegions";
import windIcon from "../assets/wind.png";
import solarIcon from "../assets/sun.png";
import gasIcon from "../assets/gas.png";
import hydroIcon from "../assets/hydro.png";
import { INTENSITY_COLORS } from "../constants/colors"
import { getFilterLabel } from "../constants/getFilterLabel";
import { getIntensityColor } from "../helper/getIntensityColors";

const Map = () => {
    const [filter, setFilter] = useState("all");
    const [lastUpdated, setLastUpdated] = useState("");
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const heatLayerRef = useRef(null);

    const { data: regions = [], refetch, isError, error: queryError } = useQuery(
        {
            queryKey: ["regionalData"],
            queryFn: fetchRegionalData,
            staleTime: 30 * 60 * 1000,
            refetchInterval: 30 * 60 * 1000,
            onError: (err) => {
                setError(err.message);
            },
        }
    );

    const initializeMap = () => {
        const map = L.map("map").setView([55.3781, -3.436], 6);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        const legend = L.control({ position: "bottomright" });
        legend.onAdd = () => {
            const div = L.DomUtil.create("div", "info legend");
            div.innerHTML = `
            <h4>Carbon Intensity</h4>
            <i style="background: ${INTENSITY_COLORS.veryLow}"></i> Very Low<br>
            <i style="background: ${INTENSITY_COLORS.low}"></i> Low<br>
            <i style="background: ${INTENSITY_COLORS.moderate}"></i> Moderate<br>
            <i style="background: ${INTENSITY_COLORS.high}"></i> High<br>
            <i style="background: ${INTENSITY_COLORS.veryHigh}"></i> Very High<br>
          `;
            return div;
        };
        legend.addTo(map);
    }

    const updateMap = () => {
        const map = mapRef.current;

        map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) map.removeLayer(layer);
        });
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        const filteredData = regions.filter(region =>
            filter === "all" ? true : region.intensity.index === filter
        );


        filteredData.forEach(region => {
            if (region.lat && region.lon) {
                L.circleMarker([region.lat, region.lon], {
                    color: getIntensityColor(region.intensity.index),
                    radius: 8,
                    fillOpacity: 0.7,
                })
                    .bindPopup(`
            <strong>${region.shortname}</strong><br>
            Intensity: ${region.intensity.forecast}<br>
            Index: ${region.intensity.index}<br>
            <h4>Generation Mix:</h4>
            <div> 
              <img src="${windIcon}" width="20"/> Wind: ${region.generationmix.find(f => f.fuel === "wind")?.perc || 0
                        }%<br>
              <img src="${solarIcon}" width="20"/> Solar: ${region.generationmix.find(f => f.fuel === "solar")?.perc || 0
                        }%<br>
              <img src="${gasIcon}" width="20"/> Gas: ${region.generationmix.find(f => f.fuel === "gas")?.perc || 0
                        }%<br>
              <img src="${hydroIcon}" width="20"/> Hydro: ${region.generationmix.find(f => f.fuel === "hydro")?.perc || 0
                        }%<br>
            </div>
          `)
                    .addTo(map);
            }
        });


        const heatData = filteredData.map(region => [
            region.lat,
            region.lon,
            region.intensity.forecast / 200
        ]);
        const heatLayer = L.heatLayer(heatData, { radius: 30 });
        heatLayerRef.current = heatLayer;
        heatLayer.addTo(map);
    };

    useEffect(() => {
        if (!mapRef.current) {
            initializeMap();
        }

        if (regions.length > 0) {
            updateMap();
        }

    }, [regions, filter]);


    return (
        <>
            {isError && (
                <div className="error-msg">
                    Error: {queryError.message || error}
                </div>
            )}
            <div className="fetch-latest">
                Last updated: {lastUpdated || "Never"}
                <button
                    onClick={() => {
                        refetch();
                        setLastUpdated(new Date().toLocaleTimeString());
                    }}
                    className="button"
                >
                    Fetch Latest
                </button>
            </div>
            <strong>{getFilterLabel(filter)}</strong>
            <select
                onChange={e => setFilter(e.target.value)}
            >
                <option value="all">All</option>
                <option value="very low">Very Low</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very high">Very High</option>
            </select>
            <div id="map" style={{ height: "80vh", width: "80%" }} />
        </>
    );
};

export default Map;
