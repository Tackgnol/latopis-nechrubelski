export interface PsalmSelection {
  num: number;
  verse: string;
  reveal: number;
}

export interface FillerFaceSpec {
  kind: "filler";
}

export interface PsalmFaceSpec {
  kind: "psalm";
  num: number;
  verse: string;
}

export interface NumeralFaceSpec {
  kind: "numeral";
  num: number;
  reveal: number;
}
