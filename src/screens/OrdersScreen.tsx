import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Info } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { orders } from '../data/mockData';
import { colors as appColors } from '../theme/colors';

const tabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
  { key: 'cancelled', label: 'Annulées' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function OrdersScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const visibleOrders = orders.filter((order) => activeTab === 'all' || order.statusKey === activeTab);

  return (
    <Screen edges={['left', 'right']}>
      <View style={styles.titleRow}>
        <View style={styles.titleDot} />
        <Text style={styles.screenTitle}>Mes commandes</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              activeOpacity={0.82}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.ordersList}>
        {visibleOrders.map((order, index) => {
          const isLast = index === visibleOrders.length - 1;

          return (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderRow, isLast && styles.orderRowLast]}
              activeOpacity={0.76}
            >
              <View style={[styles.statusIcon, { backgroundColor: `${order.statusColor}18` }]}>
                <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
              </View>

              <View style={styles.orderCopy}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={[styles.status, { color: order.statusColor, backgroundColor: `${order.statusColor}18` }]}>
                    {order.status}
                  </Text>
                </View>
                <Text style={styles.title}>{order.title}</Text>
                <Text style={styles.meta}>{order.meta}</Text>
                <Text style={styles.meta}>{order.detail}</Text>
              </View>

              <ChevronRight color={colors.muted} size={18} />
            </TouchableOpacity>
          );
        })}
      </View>

      {visibleOrders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aucune commande dans cette catégorie.</Text>
        </View>
      ) : null}

      <View style={styles.infoBox}>
        <Info color={colors.blue} size={18} />
        <Text style={styles.infoText}>Le suivi en temps réel se branchera ici sur votre backend commandes.</Text>
      </View>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    titleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 4,
      marginTop: 2,
    },
    titleDot: {
      backgroundColor: colors.primary,
      borderRadius: 3,
      height: 6,
      width: 6,
    },
    screenTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
    },
    tab: {
      borderRadius: 16,
      paddingHorizontal: 13,
      paddingVertical: 8,
    },
    activeTab: {
      backgroundColor: colors.primarySoft,
    },
    tabText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
    },
    activeTabText: {
      color: colors.primaryDark,
    },
    ordersList: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 18,
      overflow: 'hidden',
    },
    orderRow: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 12,
      minHeight: 92,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    orderRowLast: {
      borderBottomWidth: 0,
    },
    statusIcon: {
      alignItems: 'center',
      borderRadius: 18,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    statusDot: {
      borderRadius: 6,
      height: 12,
      width: 12,
    },
    orderCopy: {
      flex: 1,
    },
    orderHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
    },
    orderId: {
      color: colors.text,
      flexShrink: 1,
      fontSize: 11,
      fontWeight: '800',
    },
    status: {
      borderRadius: 8,
      fontSize: 10,
      fontWeight: '800',
      overflow: 'hidden',
      paddingHorizontal: 7,
      paddingVertical: 4,
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
      marginTop: 6,
    },
    meta: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 3,
    },
    infoBox: {
      alignItems: 'center',
      backgroundColor: `${colors.blue}18`,
      borderRadius: 10,
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      padding: 12,
    },
    emptyBox: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 18,
      padding: 18,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    infoText: {
      color: colors.text,
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
