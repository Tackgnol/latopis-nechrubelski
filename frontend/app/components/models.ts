export interface PsalmSelection {
  num: number;
  reveal: number;
}

export interface FillerFaceSpec {
  kind: "filler";
}

export interface PsalmFaceSpec {
  kind: "psalm";
  num: number;
}

export interface NumeralFaceSpec {
  kind: "numeral";
  num: number;
  reveal: number;
}
