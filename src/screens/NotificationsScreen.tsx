import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  CreditCard,
  MoreVertical,
  Package,
  Wallet,
  X,
} from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { useAppTheme } from '../context/ThemeContext';
import {
  GoldNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications/notificationService';
import { serviceConfig } from '../services/serviceConfig';
import { colors as appColors } from '../theme/colors';

type Notif = {
  id: string;
  icon: any;
  color: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const TYPE_META: Record<string, { icon: any; color: string }> = {
  PAYMENT: { icon: CreditCard, color: '#FF6848' },
  ORDER: { icon: Package, color: '#0EB56D' },
  SECURITY: { icon: AlertCircle, color: '#F59E0B' },
  PROMO: { icon: Bell, color: '#3388F2' },
  SYSTEM: { icon: CheckCircle2, color: '#0EB56D' },
};

const INITIAL_NOTIFICATIONS: Notif[] = [
  {
    id: 'n1',
    icon: CreditCard,
    color: '#FF6848',
    title: 'Paiement debite',
    body: 'Restaurant Chez Fatou - 8 500 FCFA debite avec succes.',
    time: '1 h',
    read: false,
  },
  {
    id: 'n2',
    icon: Package,
    color: '#0EB56D',
    title: 'Commande en route',
    body: 'Ousmane Diop a pris en charge votre commande #CMD-2024-1256.',
    time: '2 h',
    read: false,
  },
  {
    id: 'n3',
    icon: Wallet,
    color: '#3388F2',
    title: 'Recharge reussie',
    body: 'Votre wallet Gold a ete recharge de 20 000 FCFA.',
    time: 'Hier',
    read: true,
  },
  {
    id: 'n4',
    icon: CheckCircle2,
    color: '#0EB56D',
    title: 'Transfert confirme',
    body: 'Transfert de 25 000 FCFA vers O. Diop confirme.',
    time: 'Hier',
    read: true,
  },
  {
    id: 'n5',
    icon: AlertCircle,
    color: '#F59E0B',
    title: 'Verification requise',
    body: 'Validez votre identite pour augmenter votre limite de transaction.',
    time: '20 mai',
    read: true,
  },
];

export function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notifications, setNotifications] = useState<Notif[]>(serviceConfig.useMock ? INITIAL_NOTIFICATIONS : []);
  const [sheetOpen, setSheetOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (serviceConfig.useMock) return;
    void loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const items = await listNotifications();
    setNotifications(items.map(toNotif));
  };

  const markAllAsRead = async () => {
    if (!serviceConfig.useMock) {
      await markAllNotificationsRead();
    }
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setSheetOpen(false);
  };

  const toggleRead = async (id: string) => {
    if (!serviceConfig.useMock) {
      const updated = await markNotificationRead(id);
      setNotifications((items) => items.map((item) => (item.id === id ? toNotif(updated) : item)));
      return;
    }
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.78} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={25} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.78} onPress={() => setSheetOpen(true)}>
          <MoreVertical color={colors.text} size={23} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>Tout</Text>
        </View>
        {unreadCount > 0 ? (
          <Text style={styles.unreadText}>{unreadCount} non lues</Text>
        ) : (
          <Text style={styles.unreadText}>A jour</Text>
        )}
      </View>

      <View style={styles.list}>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <TouchableOpacity key={notif.id} activeOpacity={0.78} style={styles.item} onPress={() => toggleRead(notif.id)}>
              <View style={[styles.iconBox, { backgroundColor: `${notif.color}18` }]}>
                <Icon color={notif.color} size={25} strokeWidth={2.35} />
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notif.title}</Text>
                  {!notif.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.body} numberOfLines={2}>
                  {notif.body}
                </Text>
                <Text style={styles.time}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {notifications.length === 0 && (
        <View style={styles.empty}>
          <Bell color={colors.muted} size={48} strokeWidth={1.9} />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      )}

      <Modal transparent visible={sheetOpen} animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setSheetOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Options notifications</Text>
            <TouchableOpacity style={styles.sheetClose} onPress={() => setSheetOpen(false)}>
              <X color={colors.muted} size={23} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sheetRow} activeOpacity={0.72} onPress={markAllAsRead}>
            <Check color={colors.text} size={23} strokeWidth={2.4} />
            <Text style={styles.sheetRowText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Screen>
  );
}

function toNotif(notification: GoldNotification): Notif {
  const meta = TYPE_META[notification.type] ?? TYPE_META.SYSTEM;
  return {
    id: notification.id,
    icon: meta.icon,
    color: meta.color,
    title: notification.title,
    body: notification.body,
    time: relativeTime(notification.createdAt),
    read: notification.read,
  };
}

function relativeTime(value?: string | null) {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'Maintenant';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Hier' : `${days} j`;
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 12,
      paddingTop: 4,
    },
    iconButton: {
      alignItems: 'center',
      borderRadius: 21,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    filterRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      marginTop: 4,
    },
    filterChip: {
      alignItems: 'center',
      backgroundColor: colors.text,
      borderRadius: 18,
      minHeight: 40,
      paddingHorizontal: 17,
      justifyContent: 'center',
    },
    filterText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '900',
    },
    unreadText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '800',
    },
    list: {
      gap: 12,
      marginTop: 10,
    },
    item: {
      flexDirection: 'row',
      gap: 15,
      paddingVertical: 10,
    },
    iconBox: {
      alignItems: 'center',
      borderRadius: 22,
      height: 52,
      justifyContent: 'center',
      width: 52,
    },
    copy: {
      flex: 1,
      paddingTop: 2,
    },
    titleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 7,
    },
    title: {
      color: colors.text,
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '900',
    },
    dot: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      height: 7,
      width: 7,
    },
    body: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      marginTop: 3,
    },
    time: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 5,
    },
    empty: {
      alignItems: 'center',
      flex: 1,
      gap: 12,
      justifyContent: 'center',
      paddingTop: 60,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 16,
      fontWeight: '700',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.42)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      bottom: 0,
      left: 0,
      paddingBottom: Platform.OS === 'ios' ? 38 : 24,
      paddingHorizontal: 18,
      paddingTop: 18,
      position: 'absolute',
      right: 0,
    },
    sheetHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sheetTitle: {
      color: colors.text,
      flex: 1,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
    },
    sheetClose: {
      alignItems: 'center',
      height: 38,
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      width: 38,
    },
    sheetRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      minHeight: 54,
    },
    sheetRowText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}

