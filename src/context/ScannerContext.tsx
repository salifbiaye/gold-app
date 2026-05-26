import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

type ScannerState = {
  visible: boolean;
  onScanned: ((data: string) => void) | null;
  onClose: (() => void) | null;
};

type ScannerContextType = {
  state: ScannerState;
  openScanner: (opts: { onScanned: (data: string) => void; onClose: () => void }) => void;
  closeScanner: () => void;
};

const ScannerContext = createContext<ScannerContextType>({
  state: { visible: false, onScanned: null, onClose: null },
  openScanner: () => {},
  closeScanner: () => {},
});

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScannerState>({
    visible: false,
    onScanned: null,
    onClose: null,
  });

  const openScanner = useCallback(
    (opts: { onScanned: (data: string) => void; onClose: () => void }) => {
      setState({ visible: true, onScanned: opts.onScanned, onClose: opts.onClose });
    },
    [],
  );

  const closeScanner = useCallback(() => {
    setState((prev) => {
      prev.onClose?.();
      return { visible: false, onScanned: null, onClose: null };
    });
  }, []);

  return (
    <ScannerContext.Provider value={{ state, openScanner, closeScanner }}>
      {children}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  return useContext(ScannerContext);
}
