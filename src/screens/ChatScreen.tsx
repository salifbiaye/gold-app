import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ImageStyle,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { Mic, Send, Square } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { sendMessage as aiSendMessage } from '../services/chat/chatService';
import { getApartments } from '../services/realEstate/realEstateService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

type Message = {
  id: string;
  from: 'user' | 'ai';
  text: string;
  audioUri?: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', from: 'user', text: 'Je cherche un appartement meublé à Dakar' },
  { id: '2', from: 'ai', text: 'Voici 3 appartements meublés disponibles à Dakar.' },
];

const AI_FILTERS = ['Prix', 'Quartier', '2 pièces', '3 pièces'];

export function ChatScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apartments = useRepositoryQuery(getApartments).data ?? [];

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const pulse = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!isRecording) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 500, toValue: 1.25, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 500, toValue: 1, useNativeDriver: true }),
      ]),
    );
    anim.start();

    const timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => {
      anim.stop();
      clearInterval(timer);
    };
  }, [isRecording, pulse]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    aiSendMessage(trimmed).then((reply) => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), from: 'ai', text: reply }]);
      setIsThinking(false);
    });
  };

  const startRecording = async () => {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') return;

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch {
      // Permission ou materiel indisponible.
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      setRecordingSeconds(0);

      if (uri) {
        const userMsg: Message = { id: Date.now().toString(), from: 'user', text: 'Message vocal', audioUri: uri };
        setMessages((prev) => [...prev, userMsg]);
        setIsThinking(true);
        aiSendMessage('[message vocal]').then((reply) => {
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), from: 'ai', text: reply }]);
          setIsThinking(false);
        });
      }
    } catch {
      setRecordingSeconds(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const recordingTime = `0:${recordingSeconds.toString().padStart(2, '0')}`;

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.messageLine, isUser && styles.userLine]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={isUser ? styles.userText : styles.aiText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <Screen scroll={false} edges={['top', 'left', 'right', 'bottom']}>
      <HeaderBar title="Chat IA" />
      <KeyboardAvoidingView style={styles.chatShell} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          alwaysBounceVertical
          bounces
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messages}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
              refreshing={isRefreshing}
              tintColor={colors.primary}
              titleColor={colors.muted}
              onRefresh={async () => {
                setIsRefreshing(true);
                await new Promise((resolve) => setTimeout(resolve, 800));
                setMessages(INITIAL_MESSAGES);
                setInputText('');
                setActiveFilter(null);
                setIsThinking(false);
                setIsRefreshing(false);
              }}
            />
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            <View style={styles.footer}>
              {messages.length >= 2 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={apartments}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.cardsRow}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.apartmentCard} activeOpacity={0.82}>
                      <Image source={{ uri: item.image }} style={styles.apartmentImage as ImageStyle} />
                      <View style={styles.apartmentCopy}>
                        <Text numberOfLines={1} style={styles.apartmentTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.apartmentDistrict}>{item.district}</Text>
                        <Text style={styles.apartmentPrice}>{item.price}</Text>
                        <Text style={styles.rating}>★ {item.rating}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}

              <View style={[styles.messageLine, styles.aiLine]}>
                <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.aiText}>Souhaitez-vous filtrer par prix, quartier ou nombre de pièces ?</Text>
                </View>
              </View>

              <View style={styles.filters}>
                {AI_FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filter, isActive && styles.filterActive]}
                      activeOpacity={0.84}
                      onPress={() => {
                        setActiveFilter(isActive ? null : filter);
                        if (!isActive) sendMessage(`Filtrer par : ${filter}`);
                      }}
                    >
                      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isThinking && (
                <View style={[styles.messageLine, styles.aiLine]}>
                  <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
                    <Text style={styles.aiText}>...</Text>
                  </View>
                </View>
              )}
            </View>
          }
        />

        <View style={styles.inputRow}>
          {isRecording ? (
            <View style={styles.recorder}>
              <View style={styles.recordDot} />
              <Text style={styles.recordText}>Enregistrement</Text>
              <View style={styles.wave}>
                {[8, 16, 11, 20, 13].map((height, index) => (
                  <View key={`${height}-${index}`} style={[styles.waveBar, { height }]} />
                ))}
              </View>
              <Text style={styles.recordTime}>{recordingTime}</Text>
            </View>
          ) : (
            <TextInput
              placeholder="Écrivez votre message..."
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
            />
          )}

          {!isRecording && inputText.trim().length > 0 && (
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={() => sendMessage(inputText)}>
              <Send color="#FFFFFF" size={23} strokeWidth={2.35} />
            </TouchableOpacity>
          )}

          {(isRecording || inputText.trim().length === 0) && (
            <TouchableOpacity
              style={[styles.micButton, isRecording && styles.micButtonRecording]}
              activeOpacity={0.85}
              onPress={toggleRecording}
            >
              <Animated.View style={{ transform: [{ scale: pulse }] }}>
                {isRecording ? <Square color="#FFFFFF" size={23} /> : <Mic color="#FFFFFF" size={25} />}
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    chatShell: {
      flex: 1,
    },
    messages: {
      paddingBottom: 16,
      paddingTop: 14,
    },
    footer: {
      paddingBottom: 4,
    },
    messageLine: {
      alignItems: 'flex-start',
      marginBottom: 18,
      width: '100%',
    },
    aiLine: {
      marginBottom: 8,
    },
    userLine: {
      alignItems: 'flex-end',
    },
    bubble: {
      borderRadius: 18,
      maxWidth: '86%',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 6,
    },
    aiBubble: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 6,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
    },
    thinkingBubble: {
      minWidth: 48,
    },
    userText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
    },
    aiText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22,
    },
    cardsRow: {
      gap: 10,
      paddingBottom: 14,
      paddingRight: 2,
    },
    apartmentCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      width: 176,
    },
    apartmentImage: {
      height: 96,
      width: '100%',
    },
    apartmentCopy: {
      padding: 11,
    },
    apartmentTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    apartmentDistrict: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 4,
    },
    apartmentPrice: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
      marginTop: 10,
    },
    rating: {
      color: colors.warning,
      fontSize: 13,
      fontWeight: '900',
      marginTop: 7,
    },
    filters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 9,
      marginBottom: 12,
      marginTop: 2,
    },
    filter: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 15,
      paddingVertical: 9,
    },
    filterActive: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    filterText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    filterTextActive: {
      color: colors.primary,
    },
    inputRow: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
      padding: 8,
    },
    input: {
      color: colors.text,
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      maxHeight: 86,
      minHeight: 44,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    sendButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    micButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    micButtonRecording: {
      backgroundColor: colors.danger,
    },
    recorder: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 8,
    },
    recordDot: {
      backgroundColor: colors.danger,
      borderRadius: 5,
      height: 10,
      width: 10,
    },
    recordText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    wave: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 3,
      marginLeft: 'auto',
    },
    waveBar: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      width: 4,
    },
    recordTime: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '900',
    },
  });
}

