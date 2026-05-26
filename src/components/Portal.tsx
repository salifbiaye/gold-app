import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

type PortalContextType = {
  mount: (key: string, node: ReactNode) => void;
  unmount: (key: string) => void;
};

const PortalContext = createContext<PortalContextType>({
  mount: () => {},
  unmount: () => {},
});

export function PortalHost({ children }: { children: ReactNode }) {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const mount = useCallback((key: string, node: ReactNode) => {
    setPortals((prev) => new Map(prev).set(key, node));
  }, []);

  const unmount = useCallback((key: string) => {
    setPortals((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ mount, unmount }}>
      {children}
      {Array.from(portals.entries()).map(([key, node]) => (
        <View key={key} style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {node}
        </View>
      ))}
    </PortalContext.Provider>
  );
}

export function Portal({ children, name }: { children: ReactNode; name: string }) {
  const { mount, unmount } = useContext(PortalContext);
  const childrenRef = useRef(children);
  childrenRef.current = children;

  useEffect(() => {
    mount(name, childrenRef.current);
  });

  useEffect(() => {
    return () => unmount(name);
  }, [name, unmount]);

  return null;
}
