import { INDEXES } from "./indexes";

export const getFilterLabel = (filter) => {
    switch (filter) {
        case INDEXES.veryLow:
            return "Showing: Very Low Intensity Regions";
        case INDEXES.low:
            return "Showing: Low Intensity Regions";
        case INDEXES.moderate:
            return "Showing: Moderate Intensity Regions";
        case INDEXES.high:
            return "Showing: High Intensity Regions";
        case INDEXES.veryHigh:
            return "Showing: High Intensity Regions";
        default:
            return "Showing: All Regions";
    }
};
