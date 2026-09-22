export interface CommonResource {
  openBook: string;
  rollAgain: string;
  closeBook: string;
  reset: string;
  resetTitle: string;
  resetConfirm: string;
  resetAction: string;
  resetting: string;
  resetFailed: string;
  cancel: string;
  rollFailed: string;
  misery: string;
  welcome: string;
  read: string;
  silence: string;
  variants: string;
  volume: string;
  tapHint: string;
  clickHint: string;
  credits: string;
  readBy: string;
  creditsText: string;
  creditsArt: string;
  creditsAllArt: string;
  creditSkull: string;
  creditBlot: string;
  creditSplatTop: string;
  creditSplatBottom: string;
  creditSplatBackground: string;
  consentLabel: string;
  consentText: string;
  consentAccept: string;
  consentReject: string;
  analyticsNote: string;
  changeConsent: string;
}

export const pl: CommonResource = {
  openBook: "Otwórz Latopis",
  rollAgain: "Następny psalm",
  closeBook: "Zamknij",
  reset: "Nowa kampania",
  resetTitle: "Nowa kampania?",
  resetConfirm:
    "Stara karta odczytów zostanie zamknięta na stałe. Tej decyzji nie można cofnąć.",
  resetAction: "Rozpocznij nową kampanię",
  resetting: "Rozpoczynam…",
  resetFailed: "Nie udało się rozpocząć nowej kampanii. Spróbuj ponownie.",
  cancel: "Anuluj",
  rollFailed: "Rzut się nie powiódł — czy backend działa?",
  misery: "Nieszczęście",
  welcome: "Witaj",
  read: "Czytaj",
  silence: "Cisza",
  variants: "Warianty",
  volume: "Głośność",
  tapHint: "Stuknij dwa razy, by odsłonić następny psalm",
  clickHint: "Kliknij dwa razy, by odsłonić następny psalm",
  credits: "Źródła",
  readBy: "Czytane przez",
  creditsText: "Tekst psalmów pochodzi z MÖRK BORG — Skóra i Kości.",
  creditsArt: "Grafiki z serwisu Pixabay, użyte na licencji Pixabay Content License.",
  creditsAllArt: "Wszystkie grafiki:",
  creditSkull: "Czaszka z klepsydrą",
  creditBlot: "Kleks (karta i strona psalmu)",
  creditSplatTop: "Plama (prawy górny róg)",
  creditSplatBottom: "Plama (lewy dolny róg)",
  creditSplatBackground: "Plama (tło)",
  consentLabel: "Zgoda na analitykę",
  consentText: "Używamy Google Analytics, by wiedzieć, ile osób czyta Latopis. Zgadzasz się?",
  consentAccept: "Akceptuję",
  consentReject: "Odrzucam",
  analyticsNote:
    "Za Twoją zgodą Google Analytics (Google Ireland Ltd.) liczy odwiedziny i kilka kliknięć (otwarcie księgi, kolejne psalmy, nowa kampania) i zapisuje w tym celu pliki cookie _ga. Bez zgody nic nie trafia do Google.",
  changeConsent: "Zmień zgodę na analitykę",
};
