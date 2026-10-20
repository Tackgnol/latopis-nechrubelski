export interface PsalmSelection {
  num: number;
  reveal: number;
}

export interface FillerFaceSpec {
  kind: "filler";
}

export interface PsalmFaceSpec extends PsalmSelection {
  kind: "psalm";
}

export interface NumeralFaceSpec {
  kind: "numeral";
  num: number;
  reveal: number;
}
