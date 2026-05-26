import { forwardRef, ReactNode, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

export type ScreenHandle = {
  scrollToTop: () => void;
};

type ScreenProps = {
  children: ReactNode;
  bottomBar?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  edges?: Edge[];
  refreshable?: boolean;
  onRefresh?: () => Promise<void> | void;
};

export const Screen = forwardRef<ScreenHandle, ScreenProps>(function Screen(
  {
    children,
    bottomBar,
    scroll = true,
    padded = true,
    style,
    edges = ['top', 'left', 'right'],
    refreshable = true,
    onRefresh,
  },
  ref,
) {
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const contentStyle = [
    styles.content,
    scroll ? styles.scrollPad : null,
    bottomBar && scroll ? styles.withBottomBar : null,
    padded ? styles.padded : null,
    style,
  ];

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    },
  }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={contentStyle}
          refreshControl={
            refreshable ? (
              <RefreshControl
                colors={[colors.primary]}
                progressBackgroundColor={colors.surface}
                refreshing={refreshing}
                tintColor={colors.primary}
                titleColor={colors.muted}
                onRefresh={handleRefresh}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
      {bottomBar}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  scrollPad: {
    paddingBottom: 12,
  },
  padded: {
    paddingHorizontal: 18,
  },
  withBottomBar: {
    paddingBottom: 70,
  },
});
