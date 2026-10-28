import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import {
  buildMapHtml,
  handleMapMessage,
  type MapMarker,
  type OpenMapViewProps,
} from '@/components/mapHtml';

const EMPTY_MARKERS: readonly MapMarker[] = [];

export default function OpenMapView({
  markers = EMPTY_MARKERS,
  mode = 'browse',
  onTaskPress,
  onCoordinatePick,
  style,
}: OpenMapViewProps) {
  const colors = useColors();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error' | 'timeout'>(
    'loading',
  );
  const [mapErrorDetail, setMapErrorDetail] = useState('');
  const html = useMemo(() => buildMapHtml(markers, mode), [markers, mode]);

  useEffect(() => {
    if (mapStatus !== 'loading') return undefined;
    const timeout = setTimeout(() => setMapStatus('timeout'), 16_000);
    return () => clearTimeout(timeout);
  }, [html, mapStatus]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!event.data || typeof event.data !== 'object') return;

      const message = event.data as { source?: unknown; payload?: unknown };
      if (message.source !== 'naydi-dobro-map') return;

      handleMapMessage(message.payload, {
        onTaskPress,
        onCoordinatePick,
        onReady: () => setMapStatus('ready'),
        onError: (detail) => {
          if (detail) setMapErrorDetail(detail);
          setMapStatus((current) => (current === 'ready' ? current : 'error'));
        },
      });
    },
    [onCoordinatePick, onTaskPress],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const showError = mapStatus === 'error' || mapStatus === 'timeout';

  return (
    <View style={[style, styles.container]}>
      {React.createElement('iframe', {
        ref: frameRef,
        title: mode === 'pick' ? 'Выбор точки задания на карте' : 'Карта заданий Ставрополя',
        srcDoc: html,
        referrerPolicy: 'strict-origin-when-cross-origin',
        frameBorder: '0',
        style: styles.iframe,
      })}
      {mapStatus !== 'ready' ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.statusOverlay, { backgroundColor: colors.card }]}
        >
          {showError ? (
            <>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                Карта не загрузилась
              </Text>
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                Проверьте подключение к интернету.
              </Text>
              {__DEV__ && mapErrorDetail ? (
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                  {mapErrorDetail}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
              Загружаем карту Ставрополя…
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
  },
  statusOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
    opacity: 0.96,
  },
  statusTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  statusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
