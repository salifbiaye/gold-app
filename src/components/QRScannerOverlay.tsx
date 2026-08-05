import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarcodeScanningResult, CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Flashlight, FlashlightOff, Image as ImageIcon, ScanLine, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanner } from '../context/ScannerContext';

export function QRScannerOverlay() {
  const { state, closeScanner } = useScanner();
  const { visible } = state;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const slideY = useRef(new Animated.Value(800)).current;
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setScanned(false);
      setTorch(false);
      setPhotoLoading(false);
      slideY.setValue(800);
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 2,
      }).start();
    } else if (mounted) {
      Animated.timing(slideY, {
        toValue: 800,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeScanner();
      return true;
    });
    return () => sub.remove();
  }, [visible, closeScanner]);

  const handleScan = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    state.onScanned?.(result.data);
    closeScanner();
  };

  const showPhotoError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
      return;
    }
    Alert.alert('QR introuvable', message);
  };

  const handlePickPhoto = async () => {
    if (photoLoading || scanned) return;

    setPhotoLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: false,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0]?.uri;
      if (!uri) {
        showPhotoError('Impossible de lire cette image.');
        return;
      }

      const codes = await scanFromURLAsync(uri, ['qr']);
      const qr = codes.find((item) => item.data);

      if (!qr?.data) {
        showPhotoError('Aucun QR code lisible dans cette photo.');
        return;
      }

      setScanned(true);
      state.onScanned?.(qr.data);
      closeScanner();
    } catch {
      showPhotoError('Cette photo ne peut pas etre analysee pour le moment.');
    } finally {
      setPhotoLoading(false);
    }
  };

  if (!mounted) return null;

  const scanLineTranslateY = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slideY }] }]}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={closeScanner}>
          <X color="#FFFFFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner un QR</Text>
        <TouchableOpacity
          style={[styles.iconBtn, torch && styles.iconBtnActive]}
          onPress={() => setTorch((v) => !v)}
        >
          {torch
            ? <Flashlight color="#FFD700" size={22} />
            : <FlashlightOff color="#FFFFFF" size={22} />}
        </TouchableOpacity>
      </View>

      {permission?.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            enableTorch={torch}
            onBarcodeScanned={scanned ? undefined : handleScan}
            style={styles.camera}
          />
          <View style={styles.overlay}>
            <View style={styles.overlayBand} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.frame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Animated.View
                  style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]}
                />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBandBottom}>
              <Text style={styles.hint}>
                {scanned ? 'QR code detecte' : 'Placez le QR code dans le cadre'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.permWrap}>
          <ScanLine color="#FFFFFF" size={48} strokeWidth={1.5} />
          <Text style={styles.permTitle}>Acces camera requis</Text>
          <Text style={styles.permText}>
            Autorisez la camera pour scanner un QR, ou choisissez une photo depuis votre galerie.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Autoriser la camera</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.tabBar, { marginBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={[styles.tabBtn, styles.tabBtnActive]}
          onPress={handlePickPhoto}
          activeOpacity={0.8}
        >
          <ImageIcon color="#0D0D0D" size={18} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>
            {photoLoading ? 'Analyse en cours...' : 'Choisir une photo'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const FRAME = 240;
const CORNER = 22;
const CORNER_W = 4;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    position: Platform.OS === 'web' ? ('fixed' as never) : 'absolute',
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconBtn: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconBtnActive: {
    backgroundColor: 'rgba(255,215,0,0.18)',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  overlayBand: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: FRAME,
  },
  overlaySide: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    flex: 1,
  },
  frame: {
    height: FRAME,
    width: FRAME,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    borderColor: '#12C47F',
    height: CORNER,
    position: 'absolute',
    width: CORNER,
  },
  cornerTL: { borderLeftWidth: CORNER_W, borderTopWidth: CORNER_W, left: 0, top: 0 },
  cornerTR: { borderRightWidth: CORNER_W, borderTopWidth: CORNER_W, right: 0, top: 0 },
  cornerBL: { borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, bottom: 0, left: 0 },
  cornerBR: { borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, bottom: 0, right: 0 },
  scanLine: {
    backgroundColor: '#12C47F',
    borderRadius: 2,
    height: 2,
    opacity: 0.9,
    width: FRAME - 12,
  },
  overlayBandBottom: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    flex: 1,
    paddingTop: 22,
  },
  hint: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  permWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  permText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  permBtn: {
    alignItems: 'center',
    backgroundColor: '#12C47F',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 40,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 40,
    padding: 5,
  },
  tabBtn: {
    alignItems: 'center',
    borderRadius: 36,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    paddingVertical: 13,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#0D0D0D',
  },
});
