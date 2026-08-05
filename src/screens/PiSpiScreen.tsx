import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, FileText, Plus, QrCode, RefreshCw, Send } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { pispiService } from '../services/pispi/pispiService';
import { getWalletBalance, type WalletBalance } from '../services/wallet/walletService';
import type {
  PiSpiPaymentConfirmationResult,
  PiSpiPaymentInitResult,
  PiSpiPaymentRequestConfirmationResult,
  PiSpiPaymentRequestInitResult,
  PiSpiStatusNotification,
} from '../services/pispi/pispiService';

const piSpiLogo = require('../../assets/images/pi-spi.logo.png');

const TRESOR_ALIAS = 'ff7057a6-1c70-4d2e-b068-49bb4745697a';
const CLIENT_ALIAS = '61b8d3d8-ee6d-4de8-9cad-b5d83f24f63e';
const PAYMENT_MOTIF = 'Envoi PI-SPI i-360';
const PAYMENT_REQUEST_MOTIF = 'Demande de paiement PI-SPI i-360';

type ActivePanel = 'receive' | 'send' | 'request';
type PiSpiTab = 'actions' | 'history';

function cleanReference(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 99);
}

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!normalized) return undefined;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : undefined;
}

function nextDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function makeOperationReference(prefix: 'PAY' | 'REQ', userId: string) {
  const userPart = cleanReference(userId).slice(0, 8).toUpperCase() || 'USER';
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${userPart}-${timePart}-${randomPart}`;
}

export function PiSpiScreen() {
  const { colors } = useAppTheme();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<PiSpiTab>('actions');
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);

  const [alias, setAlias] = useState(TRESOR_ALIAS);
  const referenceLabel = useMemo(() => cleanReference(auth.user.id), [auth.user.id]);

  const [directBeneficiaryAlias, setDirectBeneficiaryAlias] = useState(CLIENT_ALIAS);
  const [directAmountText, setDirectAmountText] = useState('10000');
  const [directPaymentInit, setDirectPaymentInit] = useState<PiSpiPaymentInitResult | null>(null);
  const [directPaymentConfirm, setDirectPaymentConfirm] = useState<PiSpiPaymentConfirmationResult | null>(null);
  const [directPaymentNotification, setDirectPaymentNotification] = useState<PiSpiStatusNotification | null>(null);

  const [requestPayerAlias, setRequestPayerAlias] = useState(CLIENT_ALIAS);
  const [requestAmountText, setRequestAmountText] = useState('12900');
  const [requestInit, setRequestInit] = useState<PiSpiPaymentRequestInitResult | null>(null);
  const [requestConfirm, setRequestConfirm] = useState<PiSpiPaymentRequestConfirmationResult | null>(null);
  const [requestNotification, setRequestNotification] = useState<PiSpiStatusNotification | null>(null);
  const [history, setHistory] = useState<PiSpiStatusNotification[]>([]);

  const receiveQr = useMemo(
    () => pispiService.createReceiveQr({
      alias,
      beneficiaryName: auth.user.fullName,
      city: 'Dakar',
      countryCode: 'SN',
      merchantChannel: '000',
      qrKind: 'STATIC',
      referenceLabel,
    }),
    [alias, auth.user.fullName, referenceLabel],
  );

  const hasLocalOperation =
    !!directPaymentInit ||
    !!requestInit ||
    !!directPaymentNotification ||
    !!requestNotification;

  const resetStatus = () => {
    setError(null);
    setDirectPaymentInit(null);
    setDirectPaymentConfirm(null);
    setDirectPaymentNotification(null);
    setRequestInit(null);
    setRequestConfirm(null);
    setRequestNotification(null);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToastMessage(null), 3200);
  };

  const loadHistory = async (silent = false) => {
    if (!silent) setHistoryLoading(true);
    try {
      const transactions = await pispiService.listTransactions();
      setHistory(transactions);
      return transactions;
    } catch (historyError) {
      if (!silent) {
        setError(historyError instanceof Error ? historyError.message : 'Historique PI-SPI indisponible.');
      }
      return [];
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  };

  const loadWalletBalance = async (silent = false) => {
    if (!silent) setWalletLoading(true);
    try {
      const balance = await getWalletBalance();
      setWalletBalance(balance);
      return balance;
    } catch {
      return null;
    } finally {
      if (!silent) setWalletLoading(false);
    }
  };

  const restoreTransaction = (transaction: PiSpiStatusNotification) => {
    const restoredInit = {
      error: 0,
      message: 'Operation restauree depuis i-360',
      montant: transaction.montant,
      payeurNom: transaction.client || '',
      statut: transaction.status as PiSpiPaymentInitResult['statut'],
      txId: transaction.txId,
    };

    if (transaction.flow === 'PAYMENT_REQUEST') {
      setActivePanel('request');
      setRequestInit({
        ...restoredInit,
        numero: null,
        statut: transaction.status as PiSpiPaymentRequestInitResult['statut'],
      });
      setRequestPayerAlias(transaction.payeurAlias ?? requestPayerAlias);
      setAlias(transaction.payeAlias ?? alias);
      setRequestAmountText(transaction.montant ? String(transaction.montant) : requestAmountText);
      if (transaction.status !== 'EN ATTENTE DE VERIFICATION') {
        setRequestConfirm({
          error: 0,
          message: 'Demande restauree depuis i-360',
          montant: transaction.montant,
          statut: transaction.status as PiSpiPaymentRequestConfirmationResult['statut'],
          txId: transaction.txId,
        });
      }
      setRequestNotification(transaction);
      return;
    }

    if (transaction.flow === 'PAYMENT') {
      setActivePanel('send');
      setDirectPaymentInit(restoredInit);
      setDirectBeneficiaryAlias(transaction.payeAlias ?? directBeneficiaryAlias);
      setDirectAmountText(transaction.montant ? String(transaction.montant) : directAmountText);
      if (transaction.status !== 'EN ATTENTE DE VERIFICATION') {
        setDirectPaymentConfirm({
          error: 0,
          message: 'Envoi restaure depuis i-360',
          montant: transaction.montant,
          statut: transaction.status as PiSpiPaymentConfirmationResult['statut'],
          txId: transaction.txId,
        });
      }
      setDirectPaymentNotification(transaction);
    }
  };

  useEffect(() => {
    void loadWalletBalance(true);
  }, []);

  useEffect(() => {
    if (hasLocalOperation) return;

    let cancelled = false;
    void (async () => {
      try {
        const transactions = await loadHistory(true);
        if (cancelled) return;
        const latest = transactions.find((item) => item.flow === 'PAYMENT_REQUEST' || item.flow === 'PAYMENT');
        if (latest) {
          restoreTransaction(latest);
        }
      } catch {
        // La restauration ne doit pas bloquer l'ecran PI-SPI.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasLocalOperation]);

  const refreshTransactionStatus = async (
    txId: string,
    apply: (notification: PiSpiStatusNotification | null) => void,
    silent = false,
  ) => {
    if (!txId) return null;
    if (!silent) setStatusLoading(true);
    try {
      const notification = await pispiService.getLastNotification(txId);
      apply(notification);
      if (!silent && notification) {
        showToast(`Statut actualise : ${notification.status}`);
      }
      if (notification?.status === 'PAIEMENT_RECU' || notification?.status === 'PAIEMENT_ENVOYE') {
        await loadWalletBalance(true);
      }
      return notification;
    } catch (statusError) {
      if (!silent) {
        setError(statusError instanceof Error ? statusError.message : 'Statut PI-SPI indisponible.');
      }
      return null;
    } finally {
      if (!silent) setStatusLoading(false);
    }
  };

  const handlePrepareDirectPayment = async () => {
    const amount = parseAmount(directAmountText);
    if (!amount) {
      setError('Montant requis pour envoyer a un beneficiaire.');
      return;
    }

    if (!directBeneficiaryAlias.trim()) {
      setError('Alias beneficiaire requis.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setDirectPaymentConfirm(null);
      setDirectPaymentNotification(null);
      const refInterne = makeOperationReference('PAY', auth.user.id);
      const init = await pispiService.initiatePayment({
        montant: amount,
        motif: PAYMENT_MOTIF,
        payeAlias: directBeneficiaryAlias.trim(),
        payeurAlias: TRESOR_ALIAS,
        refInterne,
        source: 'TRESORMONEY',
      });
      setDirectPaymentInit(init);
      showToast('Envoi prepare. Verifiez les details avant de confirmer.');
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Envoi PI-SPI indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPreparedDirectPayment = async () => {
    if (!directPaymentInit) {
      setError("Prepare l'envoi avant de confirmer.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const confirmed = await pispiService.confirmPayment({ confirmation: true, txId: directPaymentInit.txId });
      setDirectPaymentConfirm(confirmed);

      await refreshTransactionStatus(directPaymentInit.txId, setDirectPaymentNotification, true);
      showToast('Envoi confirme. Statut en attente de notification.');
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Envoi PI-SPI indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const resetDirectPayment = () => {
    setDirectPaymentInit(null);
    setDirectPaymentConfirm(null);
    setDirectPaymentNotification(null);
    setDirectAmountText('');
    setDirectBeneficiaryAlias('');
    setError(null);
  };

  const handlePrepareRequest = async () => {
    const amount = parseAmount(requestAmountText);
    if (!amount) {
      setError('Montant requis pour preparer une demande de paiement.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setRequestConfirm(null);
      setRequestNotification(null);
      const refInterne = makeOperationReference('REQ', auth.user.id);
      const init = await pispiService.initiatePaymentRequest({
        montant: amount,
        categorie: 'FACTURE',
        dateLimitePaiement: nextDeadline(),
        motif: PAYMENT_REQUEST_MOTIF,
        payeAlias: alias,
        payeurAlias: requestPayerAlias,
        refDocNumero: refInterne,
        refDocType: 'CINV',
        refInterne,
        source: 'TRESORMONEY',
      });
      setRequestInit(init);
      showToast('Demande preparee. Verifiez les details avant de confirmer.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Demande de paiement PI-SPI indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPreparedRequest = async () => {
    if (!requestInit) {
      setError('Prepare la demande avant de confirmer.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const confirmed = await pispiService.confirmPaymentRequest({ confirmation: true, txId: requestInit.txId });
      setRequestConfirm(confirmed);

      await refreshTransactionStatus(requestInit.txId, setRequestNotification, true);
      showToast('Demande envoyee. Statut en attente de notification.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Demande de paiement PI-SPI indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const balanceLabel = walletBalance ? formatMoney(walletBalance.balance, walletBalance.currency) : walletLoading ? 'Chargement...' : '0 FCFA';
  const historyPreview = history[0];

  return (
    <Screen
      edges={['left', 'right']}
      refreshable={false}
      bottomBar={toastMessage ? <ToastBar message={toastMessage} colors={colors} /> : null}
    >
      <HeaderBar title="PI-SPI" />

      <View style={[styles.walletQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.walletQrCopy}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.balanceLine}
            onPress={() => setBalanceVisible((visible) => !visible)}
          >
            {balanceVisible ? <EyeOff color={colors.text} size={22} /> : <Eye color={colors.text} size={22} />}
            <Text style={[styles.balanceText, { color: colors.text }]}>
              {balanceVisible ? balanceLabel : '****** F'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.balanceCaption, { color: colors.muted }]}>Solde wallet</Text>
        </View>

        <View style={[styles.qrShowcase, { backgroundColor: colors.text }]}>
          <View style={styles.qrInner}>
            <QRCode
              value={receiveQr.raw}
              size={132}
              color="#087C55"
              backgroundColor="#FFFFFF"
              logo={piSpiLogo}
              logoSize={22}
              logoBackgroundColor="#FFFFFF"
              logoBorderRadius={8}
            />
          </View>
        </View>
      </View>

      <View style={styles.actionStrip}>
        <QuickAction
          colors={colors}
          icon={<ArrowUp color={colors.primary} size={34} strokeWidth={2.8} />}
          label="Envoyer"
          onPress={() => {
            setActiveTab('actions');
            setShowMore(false);
            setActivePanel(activePanel === 'send' ? null : 'send');
          }}
        />
        <QuickAction
          colors={colors}
          icon={<ArrowDown color={colors.primary} size={34} strokeWidth={2.8} />}
          label="Recevoir"
          onPress={() => {
            setActiveTab('actions');
            setShowMore(false);
            setActivePanel(activePanel === 'receive' ? null : 'receive');
          }}
        />
        <QuickAction
          colors={colors}
          icon={<Plus color={colors.primary} size={34} strokeWidth={2.8} />}
          label="Voir Plus"
          onPress={() => {
            setActiveTab('actions');
            setActivePanel(null);
            setShowMore((visible) => !visible);
          }}
        />
      </View>

      <View style={styles.panelStack}>
        {activePanel === 'receive' ? (
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.detailTitleRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primarySoft }]}>
                <QrCode color={colors.primary} size={20} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Recevoir via QR</Text>
                <Text style={[styles.accordionSubtitle, { color: colors.muted }]}>QR sans montant, lie a votre compte i-360.</Text>
              </View>
            </View>
            <View style={[styles.resultBox, { backgroundColor: colors.surfaceMuted }]}>
              <InfoRow label="Reference Label" value={referenceLabel} colors={colors} />
              <InfoRow label="Alias TresorMoney" value={alias} colors={colors} />
              <InfoRow label="Type" value={receiveQr.qrKind} colors={colors} />
              <InfoRow label="CRC" value={receiveQr.crc} colors={colors} />
            </View>
          </View>
        ) : null}

        {activePanel === 'send' ? (
          <OperationCard
            colors={colors}
            icon={<Send color={colors.primary} size={20} />}
            subtitle="Envoyer directement a un alias beneficiaire"
            title="Envoyer a un beneficiaire"
          >
            <Text style={[styles.helper, { color: colors.muted }]}>
              Saisissez l'alias du beneficiaire, preparez l'envoi, puis confirmez apres verification.
            </Text>
            <Field label="Alias beneficiaire" onChangeText={setDirectBeneficiaryAlias} value={directBeneficiaryAlias} colors={colors} />
            <Field keyboardType="numeric" label="Montant a envoyer" onChangeText={setDirectAmountText} value={directAmountText} colors={colors} />
            <TouchableOpacity
              disabled={loading || !!directPaymentInit}
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading || directPaymentInit ? 0.58 : 1 }]}
              onPress={handlePrepareDirectPayment}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Preparer l'envoi</Text>}
            </TouchableOpacity>
            {(directPaymentInit || directPaymentConfirm || directPaymentNotification) ? (
              <View style={[styles.resultBox, { backgroundColor: colors.surfaceMuted }]}>
                {directPaymentInit ? (
                  <>
                    <InfoRow label="Envoi prepare" value={directPaymentInit.txId} colors={colors} />
                    <InfoRow label="Nom retourne" value={directPaymentInit.payeurNom || 'Non retourne'} colors={colors} />
                    <InfoRow label="Montant" value={`${directPaymentInit.montant} FCFA`} colors={colors} />
                    <InfoRow label="Statut" value={directPaymentInit.statut} colors={colors} />
                  </>
                ) : null}
                {directPaymentInit && !directPaymentConfirm ? (
                  <TouchableOpacity
                    disabled={loading}
                    style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.72 : 1 }]}
                    onPress={handleConfirmPreparedDirectPayment}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Confirmer l'envoi</Text>}
                  </TouchableOpacity>
                ) : null}
                {directPaymentConfirm ? <InfoRow label="Envoi confirme" value={directPaymentConfirm.statut} colors={colors} /> : null}
                {directPaymentNotification ? <InfoRow label="Statut actuel" value={directPaymentNotification.status} colors={colors} /> : null}
                {directPaymentNotification && !directPaymentNotification.status.startsWith('EN ') ? (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={resetDirectPayment}
                  >
                    <Text style={[styles.secondaryText, { color: colors.text }]}>Nouvel envoi</Text>
                  </TouchableOpacity>
                ) : null}
                {directPaymentInit ? (
                  <TouchableOpacity
                    disabled={statusLoading}
                    style={[styles.secondaryButton, { borderColor: colors.border, opacity: statusLoading ? 0.62 : 1 }]}
                    onPress={() => refreshTransactionStatus(directPaymentInit.txId, setDirectPaymentNotification)}
                  >
                    <Text style={[styles.secondaryText, { color: colors.text }]}>
                      {statusLoading ? 'Actualisation...' : 'Actualiser le statut'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </OperationCard>
        ) : null}

        {showMore ? (
          <View style={[styles.moreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.moreRow}
              onPress={() => {
                setShowMore(false);
                setActivePanel('request');
              }}
            >
              <View style={[styles.moreIcon, { backgroundColor: colors.primarySoft }]}>
                <FileText color={colors.primary} size={20} />
              </View>
              <View style={styles.moreCopy}>
                <Text style={[styles.moreTitle, { color: colors.text }]}>Demander un paiement</Text>
                <Text style={[styles.moreSubtitle, { color: colors.muted }]}>Envoyer une demande a un client.</Text>
              </View>
              <ChevronDown color={colors.muted} size={18} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.moreRow}
              onPress={() => {
                void loadWalletBalance();
                void loadHistory(true);
              }}
            >
              <View style={[styles.moreIcon, { backgroundColor: colors.primarySoft }]}>
                <RefreshCw color={colors.primary} size={20} />
              </View>
              <View style={styles.moreCopy}>
                <Text style={[styles.moreTitle, { color: colors.text }]}>Actualiser</Text>
                <Text style={[styles.moreSubtitle, { color: colors.muted }]}>Mettre a jour solde et historique.</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {activePanel === 'request' ? (
          <OperationCard
            colors={colors}
            icon={<FileText color={colors.primary} size={20} />}
            subtitle="Envoyer une demande a un client"
            title="Demander un paiement"
          >
            <Text style={[styles.helper, { color: colors.muted }]}>
              Saisissez le payeur et le montant pour lui envoyer une demande de paiement.
            </Text>
            <Field label="Alias du payeur" onChangeText={setRequestPayerAlias} value={requestPayerAlias} colors={colors} />
            <Field label="Alias beneficiaire" onChangeText={setAlias} value={alias} colors={colors} />
            <Field keyboardType="numeric" label="Montant demande" onChangeText={setRequestAmountText} value={requestAmountText} colors={colors} />
            <TouchableOpacity
              disabled={loading || !!requestInit}
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading || requestInit ? 0.58 : 1 }]}
              onPress={handlePrepareRequest}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Preparer la demande</Text>}
            </TouchableOpacity>
            {(requestInit || requestConfirm || requestNotification) ? (
              <View style={[styles.resultBox, { backgroundColor: colors.surfaceMuted }]}>
                {requestInit ? (
                  <>
                    <InfoRow label="Demande preparee" value={requestInit.txId} colors={colors} />
                    <InfoRow label="Payeur verifie" value={requestInit.payeurNom || 'Non retourne'} colors={colors} />
                    <InfoRow label="Montant" value={`${requestInit.montant} FCFA`} colors={colors} />
                    <InfoRow label="Statut" value={requestInit.statut} colors={colors} />
                  </>
                ) : null}
                {requestInit && !requestConfirm ? (
                  <TouchableOpacity
                    disabled={loading}
                    style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.72 : 1 }]}
                    onPress={handleConfirmPreparedRequest}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Confirmer la demande</Text>}
                  </TouchableOpacity>
                ) : null}
                {requestConfirm ? <InfoRow label="Demande envoyee" value={requestConfirm.statut} colors={colors} /> : null}
                {requestNotification ? <InfoRow label="Statut actuel" value={requestNotification.status} colors={colors} /> : null}
                {requestInit ? (
                  <TouchableOpacity
                    disabled={statusLoading}
                    style={[styles.secondaryButton, { borderColor: colors.border, opacity: statusLoading ? 0.62 : 1 }]}
                    onPress={() => refreshTransactionStatus(requestInit.txId, setRequestNotification)}
                  >
                    <Text style={[styles.secondaryText, { color: colors.text }]}>
                      {statusLoading ? 'Actualisation...' : 'Actualiser le statut'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </OperationCard>
        ) : null}
      </View>

      <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.historyCardHeader}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Historique</Text>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={historyLoading}
            style={[styles.showAllButton, { backgroundColor: colors.surfaceMuted, opacity: historyLoading ? 0.62 : 1 }]}
            onPress={() => {
              setActiveTab(activeTab === 'history' ? 'actions' : 'history');
              void loadHistory();
            }}
          >
            <Text style={[styles.showAllText, { color: colors.text }]}>
              {activeTab === 'history' ? 'Reduire' : 'Afficher tout'}
            </Text>
            <ChevronDown
              color={colors.text}
              size={17}
              style={{ transform: [{ rotate: activeTab === 'history' ? '180deg' : '-90deg' }] }}
            />
          </TouchableOpacity>
        </View>

        {activeTab === 'history' ? (
          history.length === 0 ? (
            <EmptyHistory colors={colors} />
          ) : (
            history.map((item) => (
              <TransactionRow key={`${item.txId}-${item.refInterne ?? ''}`} item={item} colors={colors} />
            ))
          )
        ) : historyPreview ? (
          <TransactionRow item={historyPreview} colors={colors} compact />
        ) : (
          <EmptyHistory colors={colors} />
        )}
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

    </Screen>
  );
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
}

function ToastBar({ colors, message }: { colors: any; message: string }) {
  return (
    <View style={styles.toastWrap}>
      <View style={[styles.toast, { backgroundColor: colors.text }]}>
        <Text style={[styles.toastText, { color: colors.background }]}>{message}</Text>
      </View>
    </View>
  );
}

function QuickAction({ colors, icon, label, onPress }: { colors: any; icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.78} style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: colors.primarySoft }]}>
        {icon}
      </View>
      <Text style={[styles.quickLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OperationCard({
  children,
  colors,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  colors: any;
  icon: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.detailTitleRow}>
        <View style={[styles.detailIcon, { backgroundColor: colors.primarySoft }]}>
          {icon}
        </View>
        <View style={styles.detailCopy}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.accordionSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.operationBody}>{children}</View>
    </View>
  );
}

function AccordionSection({
  active,
  children,
  colors,
  icon,
  onPress,
  subtitle,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  colors: any;
  icon: React.ReactNode;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: active ? colors.primary : colors.border }]}>
      <TouchableOpacity activeOpacity={0.84} style={styles.accordionHead} onPress={onPress}>
        <View style={[styles.accordionIcon, { backgroundColor: active ? colors.primary : colors.primarySoft }]}>
          {icon}
        </View>
        <View style={styles.accordionCopy}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.accordionSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        </View>
        <ChevronDown
          color={colors.muted}
          size={21}
          style={{ transform: [{ rotate: active ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {active ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

function Field({
  colors,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  colors: any;
  keyboardType?: 'default' | 'numeric';
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, color: colors.text }]}
        value={value}
      />
    </View>
  );
}

function InfoTiny({ colors, label, value }: { colors: any; label: string; value: string }) {
  return (
    <View>
      <Text style={[styles.metaLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ colors, label, value }: { colors: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function EmptyHistory({ colors }: { colors: any }) {
  return (
    <View style={[styles.emptyHistory, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune transaction</Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>Les operations PI-SPI apparaitront ici.</Text>
    </View>
  );
}

function TransactionRow({ colors, compact = false, item }: { colors: any; compact?: boolean; item: PiSpiStatusNotification }) {
  const label = item.flow === 'PAYMENT_REQUEST'
    ? 'Demande de paiement'
    : item.flow === 'QR_INCOMING'
      ? 'Paiement recu QR'
      : 'Paiement envoye';
  const date = new Date(item.createdAt);
  const displayDate = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.transactionRow, compact ? styles.transactionRowCompact : null, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.transactionTop}>
        <View style={styles.transactionCopy}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}>{label}</Text>
          <Text numberOfLines={1} style={[styles.transactionMeta, { color: colors.muted }]}>
            {item.txId || item.refInterne || 'Reference indisponible'}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: colors.text }]}>{item.montant} FCFA</Text>
      </View>
      <View style={styles.transactionBottom}>
        <Text style={[styles.transactionStatus, { color: colors.primary }]}>{item.status}</Text>
        <Text style={[styles.transactionDate, { color: colors.muted }]}>{displayDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  walletQrCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  walletQrCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  balanceLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  balanceText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  balanceCaption: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  qrShowcase: {
    borderRadius: 12,
    padding: 8,
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    padding: 7,
  },
  actionStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 6,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    gap: 9,
    paddingVertical: 4,
  },
  quickIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    padding: 14,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  detailIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailCopy: {
    flex: 1,
  },
  operationBody: {
    gap: 12,
    marginTop: 14,
  },
  moreCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    minHeight: 62,
  },
  moreIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  moreCopy: {
    flex: 1,
  },
  moreTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    padding: 12,
  },
  historyCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  showAllButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    padding: 16,
  },
  logo: {
    height: 58,
    width: 58,
  },
  heroText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    marginTop: 4,
  },
  panelStack: {
    marginTop: 2,
  },
  tabs: {
    borderRadius: 14,
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 11,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    padding: 14,
  },
  accordionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  accordionIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  accordionCopy: {
    flex: 1,
  },
  accordionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    marginTop: 2,
  },
  accordionBody: {
    gap: 12,
    marginTop: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderRadius: 11,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  receiveHighlight: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  receiveInfo: {
    flex: 1,
    minWidth: 0,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
  },
  qrBoxFeatured: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrMeta: {
    flexDirection: 'row',
    gap: 18,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultBox: {
    borderRadius: 12,
    gap: 10,
    padding: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 12,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  historyRefresh: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  historyRefreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyHistory: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 4,
  },
  transactionRow: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginTop: 10,
    padding: 14,
  },
  transactionRowCompact: {
    marginTop: 8,
  },
  transactionTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  transactionCopy: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionMeta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  transactionBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  transactionDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  toastWrap: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toast: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
});
