import type { StyleProp, ViewStyle } from 'react-native';
import type { TaskCoordinates } from '@/state/AppState';

export interface MapMarker extends TaskCoordinates {
  id: string;
}

export type MapViewMode = 'browse' | 'pick';

export interface OpenMapViewProps {
  markers?: readonly MapMarker[];
  mode?: MapViewMode;
  onTaskPress?: (taskId: string) => void;
  onCoordinatePick?: (coordinates: TaskCoordinates) => void;
  style?: StyleProp<ViewStyle>;
}

interface MapMessageHandlers {
  onTaskPress?: (taskId: string) => void;
  onCoordinatePick?: (coordinates: TaskCoordinates) => void;
  onReady?: () => void;
  onError?: (detail?: string) => void;
}

export function buildMapHtml(
  markers: readonly MapMarker[],
  mode: MapViewMode,
): string {
  const safeMarkers = JSON.stringify(markers).replace(/</g, '\\u003c');
  const pickerMode = JSON.stringify(mode === 'pick');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; overflow: hidden; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .leaflet-container { font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .leaflet-control-zoom { overflow: hidden; border: 0 !important; border-radius: 12px !important; box-shadow: 0 2px 8px rgba(35, 31, 28, .14) !important; }
      .leaflet-control-zoom a { color: #543a2f !important; background: #fff !important; }
      .leaflet-control-attribution { max-width: 90vw; border-radius: 8px 0 0 0; font-size: 10px; }
      .task-icon, .picker-icon { border: 0 !important; background: transparent !important; }
      .task-pin, .picker-marker {
        display: flex; align-items: center; justify-content: center; border: 3px solid #fff;
        border-radius: 50%; background: #ee7a38; color: #fff; box-shadow: 0 3px 10px rgba(49, 44, 39, .28);
      }
      .task-pin { width: 38px; height: 38px; font-size: 18px; line-height: 1; }
      .picker-marker { width: 28px; height: 28px; border-width: 4px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div id="map" aria-label="Карта Ставрополя"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        const markers = ${safeMarkers};
        const pickerMode = ${pickerMode};
        let mapReady = false;
        let pickerMarker = null;

        function send(message) {
          const payload = JSON.stringify(message);
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(payload);
          } else if (window.parent && window.parent !== window) {
            window.parent.postMessage({ source: 'naydi-dobro-map', payload: payload }, '*');
          }
        }

        window.addEventListener('error', function (event) {
          if (!mapReady) send({ type: 'error', detail: event.message || 'JavaScript error' });
        });
        window.addEventListener('unhandledrejection', function (event) {
          if (!mapReady) {
            send({ type: 'error', detail: String(event.reason || 'Map request failed') });
          }
        });

        try {
          if (!window.L) throw new Error('Map library failed to load');

          const map = L.map('map', {
            center: [45.0448, 41.9691],
            zoom: 12,
            minZoom: 5,
            maxZoom: 19,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            tap: true
          });

          L.control.zoom({ position: 'topright' }).addTo(map);
          L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

          const tileLayer = L.tileLayer(
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
              maxZoom: 19,
              updateWhenIdle: true,
              keepBuffer: 1
            }
          ).addTo(map);

          tileLayer.once('tileload', function () {
            mapReady = true;
            send({ type: 'ready' });
          });
          tileLayer.once('tileerror', function () {
            if (!mapReady) {
              send({ type: 'error', detail: 'Не удалось получить карту OpenStreetMap' });
            }
          });

          const taskIcon = L.divIcon({
            className: 'task-icon',
            html: '<span class="task-pin">♥</span>',
            iconSize: [44, 44],
            iconAnchor: [22, 36]
          });

          markers.forEach(function (task) {
            const marker = L.marker([task.latitude, task.longitude], {
              icon: taskIcon,
              title: 'Открыть задание',
              keyboard: true
            }).addTo(map);
            marker.on('click', function () {
              send({ type: 'task', id: task.id });
            });
          });

          if (pickerMode) {
            const pickerIcon = L.divIcon({
              className: 'picker-icon',
              html: '<span class="picker-marker">•</span>',
              iconSize: [32, 32],
              iconAnchor: [16, 28]
            });

            map.on('click', function (event) {
              const coordinates = {
                latitude: event.latlng.lat,
                longitude: event.latlng.lng
              };

              if (!pickerMarker) {
                pickerMarker = L.marker(
                  [coordinates.latitude, coordinates.longitude],
                  { icon: pickerIcon, keyboard: false, title: 'Выбранное место' }
                ).addTo(map);
              } else {
                pickerMarker.setLatLng([coordinates.latitude, coordinates.longitude]);
              }

              send({
                type: 'coordinate',
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
              });
            });
          }

          window.addEventListener('resize', function () {
            map.invalidateSize();
          });
          window.setTimeout(function () {
            map.invalidateSize();
          }, 100);
        } catch (error) {
          send({
            type: 'error',
            detail: error instanceof Error ? error.message : String(error)
          });
          return;
        }
      })();
    </script>
  </body>
</html>`;
}

export function handleMapMessage(
  rawMessage: unknown,
  handlers: MapMessageHandlers,
): void {
  if (typeof rawMessage !== 'string') return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== 'object') return;

  const message = parsed as Record<string, unknown>;
  if (message.type === 'task' && typeof message.id === 'string') {
    handlers.onTaskPress?.(message.id);
    return;
  }
  if (
    message.type === 'coordinate' &&
    typeof message.latitude === 'number' &&
    Number.isFinite(message.latitude) &&
    typeof message.longitude === 'number' &&
    Number.isFinite(message.longitude)
  ) {
    handlers.onCoordinatePick?.({
      latitude: message.latitude,
      longitude: message.longitude,
    });
    return;
  }
  if (message.type === 'ready') {
    handlers.onReady?.();
  } else if (message.type === 'error') {
    handlers.onError?.(typeof message.detail === 'string' ? message.detail : undefined);
  }
}
