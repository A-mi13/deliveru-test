declare global {
  interface Window {
    ymaps: typeof ymaps;
  }
}

declare const ymaps: {
  geocode: (query: string, options?: { results: number }) => Promise<any>;
  GeoObject: new () => ymaps.GeoObject;
  MapEvent: new () => ymaps.MapEvent;
};

declare namespace ymaps {
  interface GeoObject {
    properties: {
      get(key: string, defaultValue?: any): any;
    };
  }

  interface IGeometry {
    getCoordinates(): number[];
  }

  interface MapEvent {
    get(key: string): any;
  }
}
