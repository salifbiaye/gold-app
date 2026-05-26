import { useMemo, useState } from 'react';
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
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setSheetOpen(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.78} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.78} onPress={() => setSheetOpen(true)}>
          <MoreVertical color={colors.text} size={20} />
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
            <TouchableOpacity key={notif.id} activeOpacity={0.78} style={styles.item}>
              <View style={[styles.iconBox, { backgroundColor: `${notif.color}18` }]}>
                <Icon color={notif.color} size={21} />
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
          <Bell color={colors.muted} size={40} />
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
              <X color={colors.muted} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sheetRow} activeOpacity={0.72} onPress={markAllAsRead}>
            <Check color={colors.text} size={20} />
            <Text style={styles.sheetRowText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Screen>
  );
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
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 16,
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
      minHeight: 34,
      paddingHorizontal: 15,
      justifyContent: 'center',
    },
    filterText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '900',
    },
    unreadText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    list: {
      gap: 12,
      marginTop: 10,
    },
    item: {
      flexDirection: 'row',
      gap: 13,
      paddingVertical: 8,
    },
    iconBox: {
      alignItems: 'center',
      borderRadius: 18,
      height: 46,
      justifyContent: 'center',
      width: 46,
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
      fontSize: 14,
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
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 17,
      marginTop: 3,
    },
    time: {
      color: colors.muted,
      fontSize: 11,
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
      fontSize: 14,
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
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'center',
    },
    sheetClose: {
      alignItems: 'center',
      height: 32,
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      width: 32,
    },
    sheetRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      minHeight: 54,
    },
    sheetRowText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
