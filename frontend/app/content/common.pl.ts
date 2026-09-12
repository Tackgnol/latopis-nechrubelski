export interface CommonResource {
  roll: string;
  revealEnd: string;
  reset: string;
  resetConfirm: string;
  cancel: string;
  backToCover: string;
  allRevealed: string;
  rollFailed: string;
}

export const pl: CommonResource = {
  roll: "Rzuć",
  revealEnd: "Odsłoń Koniec",
  reset: "Nowa kampania",
  resetConfirm: "To nieodwracalne — zaczynasz nową kampanię, a stara karta odczytów zamyka się na stałe. Kontynuować?",
  cancel: "Anuluj",
  backToCover: "Powrót do okładki",
  allRevealed: "Wszystkie Psalmy I–VI zostały odsłonięte.",
  rollFailed: "Rzut się nie powiódł — czy backend działa?",
};
