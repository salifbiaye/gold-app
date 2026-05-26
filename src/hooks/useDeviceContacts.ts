import { useEffect, useState } from 'react';
import * as Contacts from 'expo-contacts';

export type DeviceContact = {
  id: string;
  name: string;
  phone: string;
  initials: string;
};

export function useDeviceContacts() {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') return;
      setGranted(true);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: DeviceContact[] = [];
      for (const c of data) {
        if (!c.name || !c.phoneNumbers?.length) continue;
        const phone = c.phoneNumbers[0].number ?? '';
        const parts = c.name.trim().split(/\s+/);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : c.name.slice(0, 2).toUpperCase();
        mapped.push({ id: c.id ?? phone, name: c.name, phone, initials });
      }
      setContacts(mapped);
    })();
  }, []);

  return { contacts, granted };
}
