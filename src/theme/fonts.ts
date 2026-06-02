import { cloneElement } from 'react';
import { Platform, StyleSheet, Text, TextInput } from 'react-native';
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

/**
 * Police Poppins (identique à la version Flutter qui utilise GoogleFonts.poppins).
 * Chaque graisse est enregistrée sous son propre nom de famille — on résout la
 * bonne famille à partir du `fontWeight` de chaque <Text>, ce qui fonctionne
 * uniformément sur web et natif (RN ne synthétise pas les graisses des polices custom).
 */
export const poppinsFonts = {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
};

function familyForWeight(weight?: string | number): string {
  switch (String(weight ?? '400')) {
    case '100':
    case 'thin':
      return 'Poppins_100Thin';
    case '200':
      return 'Poppins_200ExtraLight';
    case '300':
      return 'Poppins_300Light';
    case '500':
      return 'Poppins_500Medium';
    case '600':
      return 'Poppins_600SemiBold';
    case '700':
    case 'bold':
      return 'Poppins_700Bold';
    case '800':
      return 'Poppins_800ExtraBold';
    case '900':
      return 'Poppins_900Black';
    case '400':
    case 'normal':
    default:
      return 'Poppins_400Regular';
  }
}

let installed = false;

/**
 * Patch de Text & TextInput (NATIF uniquement) : injecte la famille Poppins
 * correspondant au fontWeight.
 *
 * Sur web on ne patche PAS le rendu (RN-Web rend un <span> dont le style interne
 * casse au clonage). À la place, Poppins est appliqué en CSS via app/+html.tsx
 * (Google Fonts + cascade `font-family`), où le fontWeight inline est résolu
 * nativement par le navigateur.
 */
export function installPoppinsDefault() {
  if (installed) return;
  installed = true;

  if (Platform.OS === 'web') return;

  [Text, TextInput].forEach((Component) => {
    const anyComp = Component as unknown as { render?: (...args: unknown[]) => any };
    const original = anyComp.render;
    if (typeof original !== 'function') return;

    anyComp.render = function patched(...args: unknown[]) {
      const element = original.apply(this, args);
      if (!element) return element;

      const flat = StyleSheet.flatten(element.props?.style) || {};
      if (flat.fontFamily) return element; // famille déjà imposée → on respecte

      const family = familyForWeight(flat.fontWeight as string | number | undefined);
      return cloneElement(element, { style: { ...flat, fontFamily: family } });
    };
  });
}

// Installé à l'import (avant tout rendu de <Text>), idempotent.
installPoppinsDefault();
