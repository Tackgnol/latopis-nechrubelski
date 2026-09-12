export interface CommonResource {
  roll: string;
  revealEnd: string;
  revealEndConfirm: string;
  cancel: string;
  backToCover: string;
}

export const pl: CommonResource = {
  roll: "Rzuć",
  revealEnd: "Odsłoń Koniec",
  revealEndConfirm: "To nieodwracalne — zaczynasz nową kampanię. Kontynuować?",
  cancel: "Anuluj",
  backToCover: "Powrót do okładki",
};
