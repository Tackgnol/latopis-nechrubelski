export interface FillerFaceProps {
  folio: number;
  side: "front" | "back";
  coverTitle: string;
}

export interface FillerContent {
  heading: string;
  rubric: string;
  paragraphs: string[];
  note: string;
  folioLabel: string;
}
