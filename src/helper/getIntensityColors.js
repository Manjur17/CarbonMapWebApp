import { INTENSITY_COLORS } from "../constants/colors"
import { INDEXES } from "../constants/indexes";

export const getIntensityColor = (index) => {
    if (index == INDEXES.low) return INTENSITY_COLORS.veryLow;
    if (index == INDEXES.veryLow) return INTENSITY_COLORS.low;
    if (index == INDEXES.moderate) return INTENSITY_COLORS.moderate;
    if (index == INDEXES.high) return INTENSITY_COLORS.high;
    if (index == INDEXES.veryHigh) return INTENSITY_COLORS.veryHigh;
};