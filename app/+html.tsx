import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <ScrollViewStyleReset />

        {/* Police Poppins (identique à la version Flutter). Chargée via Google
            Fonts en toutes graisses ; le fontWeight inline de chaque <Text> est
            résolu nativement par le navigateur. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Cascade globale. Spécificité `html:root *` (0,1,1) pour battre la classe
            font-family système posée par RN-Web (0,1,0), tout en restant sous les
            styles inline des polices d'icônes (@expo/vector-icons) → icônes intactes. */}
        <style dangerouslySetInnerHTML={{ __html: `html:root, html:root * { font-family: 'Poppins', system-ui, -apple-system, sans-serif; }` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
