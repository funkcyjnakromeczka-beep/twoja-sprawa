# Identyfikatory zgłoszeń Twoja Sprawa
16 listopada 2026 r.

Przy próbie wysłania formularza tworzymy anonimowy kod \`TS-YYYYMMDD-XXXXXXXXXXXX\` (data UTC, losowe 48 bitów). Nie zawiera danych osoby, adresu e-mail ani usługi. Kod jest w temacie i metadanych \`reference_code\` wiadomości przyjmowanej przez Web3Forms.

Po odpowiedzi sukcesu kod wyświetla się odwiedzającemu. Gdy próba jest niepotwierdzona, wyświetla się „Kod próby”, który pozostaje taki sam przy powtórzeniu; nowe zgłoszenie po sukcesie otrzymuje nowy kod. E-mail awaryjny zawiera kod w temacie i treści, ale wymaga świadomego wysłania przez użytkownika.

**Ograniczenie:** Web3Forms wysyła wiadomość do skrzynki przypisanej do klucza \`access_key\`. Pole \`advisor_email\` to tylko metadane; nie zmienia odbiorcy. Odpowiedź API „sukces” nie dowodzi doręczenia do skrzynki. Weryfikacja dostarczenia wymaga ręcznego wysłania testów i sprawdzenia skrzynki i spamu.

Test E2E symuluje wszystkie 6 głównych usług z przechwyceniem POST. Żadne prawdziwe wiadomości nie są wysyłane.
