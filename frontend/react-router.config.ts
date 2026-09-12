import type { Config } from "@react-router/dev/config";

const LOCALES = ["pl"] as const;
const PSALM_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

export default {
  ssr: true,
  async prerender() {
    return [
      ...LOCALES.flatMap((locale) => [
        `/${locale}`,
        ...PSALM_NUMBERS.map((n) => `/${locale}/psalm/${n}`),
      ]),
    ];
  },
} satisfies Config;
