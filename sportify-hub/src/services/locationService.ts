import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

// Bangalore center — used as a fallback so the nearby-venues/games UI still
// has something sensible to show on web or when the user denies permission.
export const FALLBACK_COORDS: Coords = { latitude: 12.9716, longitude: 77.5946 };

export async function getCurrentCoords(): Promise<{ coords: Coords; usingFallback: boolean }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { coords: FALLBACK_COORDS, usingFallback: true };
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      usingFallback: false,
    };
  } catch {
    return { coords: FALLBACK_COORDS, usingFallback: true };
  }
}
