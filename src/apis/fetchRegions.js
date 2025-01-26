import { regionCoordinates } from "../constants/coordinates";

const API_URL = "https://api.carbonintensity.org.uk/regional";

export const fetchRegionalData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.data[0].regions.map(region => ({
            ...region,
            lat: regionCoordinates[region.shortname]?.lat,
            lon: regionCoordinates[region.shortname]?.lon,
        }));
    } catch (error) {
        console.error("Error fetching regional data:", error);
        return [];
    }
};