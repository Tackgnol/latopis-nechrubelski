export interface CommonResource {
  openBook: string;
  rollAgain: string;
  closeBook: string;
  reset: string;
  resetConfirm: string;
  cancel: string;
  rollFailed: string;
  misery: string;
  welcome: string;
  read: string;
  silence: string;
  voice: string;
  volume: string;
}

export const pl: CommonResource = {
  openBook: "Otwórz Latopis",
  rollAgain: "Następny psalm",
  closeBook: "Zamknij",
  reset: "Nowa kampania",
  resetConfirm: "To nieodwracalne — zaczynasz nową kampanię, a stara karta odczytów zamyka się na stałe. Kontynuować?",
  cancel: "Anuluj",
  rollFailed: "Rzut się nie powiódł — czy backend działa?",
  misery: "Nieszczęście",
  welcome: "Witaj",
  read: "Czytaj",
  silence: "Cisza",
  voice: "Głos lektora",
  volume: "Głośność",
};
