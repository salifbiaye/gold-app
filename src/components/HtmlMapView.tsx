import { createElement, forwardRef } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

type HtmlMapViewProps = {
  html: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  onError?: () => void;
};

function cleanDomStyle(style: object) {
  return Object.fromEntries(Object.entries(style).filter(([key]) => Number.isNaN(Number(key))));
}

export const HtmlMapView = forwardRef<WebView, HtmlMapViewProps>(
  ({ html, style, scrollEnabled = false, onError }, ref) => {
    if (Platform.OS === 'web') {
      const flatStyle = cleanDomStyle(StyleSheet.flatten(style) ?? {});
      return createElement('iframe', {
        srcDoc: html,
        style: {
          ...flatStyle,
          border: 0,
          display: 'block',
          height: '100%',
          width: '100%',
        },
        onError,
      });
    }

    return (
      <WebView
        ref={ref}
        style={style}
        source={{ html }}
        scrollEnabled={scrollEnabled}
        javaScriptEnabled
        originWhitelist={['*']}
        onError={onError}
      />
    );
  },
);

HtmlMapView.displayName = 'HtmlMapView';
