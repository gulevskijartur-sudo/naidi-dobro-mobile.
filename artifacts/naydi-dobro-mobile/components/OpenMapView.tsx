import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
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
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error' | 'timeout'>(
    'loading',
  );
  const [mapErrorDetail, setMapErrorDetail] = useState('');
  const html = useMemo(() => buildMapHtml(markers, mode), [markers, mode]);
  const source = useMemo(() => ({ html }), [html]);

  useEffect(() => {
    if (mapStatus !== 'loading') return undefined;
    const timeout = setTimeout(() => setMapStatus('timeout'), 16_000);
    return () => clearTimeout(timeout);
  }, [html, mapStatus]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      handleMapMessage(event.nativeEvent.data, {
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

  const showError = mapStatus === 'error' || mapStatus === 'timeout';

  return (
    <View style={[style, styles.container]}>
      <WebView
        source={source}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        bounces={false}
        onMessage={handleMessage}
        onError={() => setMapStatus('error')}
        style={styles.webView}
      />
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
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                Загружаем карту Ставрополя…
              </Text>
            </>
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
  webView: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
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
