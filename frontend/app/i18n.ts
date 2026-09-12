import { pl as commonPl } from "./content/common.pl";
import { pl as psalmsPl } from "./content/psalms.pl";

export const defaultNS = "common";

export const resources = {
  pl: { common: commonPl, psalms: psalmsPl },
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["pl"];
  }
}
