import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bike, Building2, Bus, Package, Utensils } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { getOrders, type Order } from '../services/orders/ordersService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

const TABS = [
  { key: 'all',       label: 'Toutes' },
  { key: 'active',    label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
  { key: 'cancelled', label: 'Annulées' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function iconFor(order: Order) {
  const t = order.title.toLowerCase();
  if (t.includes('restaurant') || t.includes('food') || t.includes('repas')) return Utensils;
  if (t.includes('livraison') || t.includes('course')) return Bike;
  if (t.includes('appart') || t.includes('immo')) return Building2;
  if (t.includes('transport') || t.includes('yango') || t.includes('taxi')) return Bus;
  return Package;
}

export function OrdersScreen() {
  const { colors } = useAppTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<TabKey>('all');
  const orders = useRepositoryQuery(getOrders).data ?? [];

  const visible = tab === 'all' ? orders : orders.filter((o) => o.statusKey === tab);

  return (
    <Screen>
      <HeaderBar title="Mes commandes" />

      {/* Tabs — plain View, no nested ScrollView */}
      <View style={s.tabRow}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.78}
              style={[
                s.tab,
                active
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[s.tabText, { color: active ? '#FFFFFF' : colors.text }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cards */}
      <View style={s.list}>
        {visible.length === 0 ? (
          <View style={[s.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.emptyText, { color: colors.muted }]}>Aucune commande ici.</Text>
          </View>
        ) : (
          visible.map((order) => <OrderCard key={order.id} order={order} colors={colors} s={s} />)
        )}
      </View>
    </Screen>
  );
}

function OrderCard({ order, colors, s }: { order: Order; colors: typeof appColors; s: ReturnType<typeof createStyles> }) {
  const Icon = iconFor(order);
  const isActive = order.statusKey === 'active';

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Row 1: ID + status */}
      <View style={s.cardTop}>
        <Text style={[s.orderId, { color: colors.muted }]}>{order.id}</Text>
        <View style={[s.statusPill, { backgroundColor: order.statusColor + '18' }]}>
          <Text style={[s.statusText, { color: order.statusColor }]}>{order.status}</Text>
        </View>
      </View>

      {/* Row 2: icon + info */}
      <View style={s.cardBody}>
        <View style={[s.iconCircle, { backgroundColor: order.statusColor + '15' }]}>
          <Icon color={order.statusColor} size={18} strokeWidth={2.2} />
        </View>
        <View style={s.info}>
          <Text style={[s.orderTitle, { color: colors.text }]} numberOfLines={1}>{order.title}</Text>
          <Text style={[s.orderMeta, { color: colors.muted }]}>{order.meta}</Text>
          <Text style={[s.orderMeta, { color: colors.muted }]}>{order.detail}</Text>
        </View>
      </View>

      {/* Row 3: action */}
      <View style={s.cardFoot}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[
            s.actionBtn,
            isActive
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[s.actionText, { color: isActive ? '#FFFFFF' : colors.text }]}>
            {isActive ? 'Suivre' : 'Détails'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({

    tabRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 14,
    },
    tab: {
      alignItems: 'center',
      borderRadius: 20,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 8,
    },
    tabText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },

    list: { gap: 10 },

    card: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      elevation: 2,
      paddingHorizontal: 14,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },

    cardTop: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    orderId: { fontSize: 11, fontWeight: '700' },
    statusPill: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { fontSize: 11, fontWeight: '800' },

    cardBody: { alignItems: 'center', flexDirection: 'row', gap: 10 },
    iconCircle: {
      alignItems: 'center',
      borderRadius: 999,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    info: { flex: 1 },
    orderTitle: { fontSize: 15, fontWeight: '900' },
    orderMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    cardFoot: { alignItems: 'flex-end', marginTop: 10 },
    actionBtn: {
      borderRadius: 9,
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 7,
    },
    actionText: { fontSize: 13, fontWeight: '800' },

    empty: { borderRadius: 14, borderWidth: 1, padding: 24 },
    emptyText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  });
}
