import { data, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";

export function loader({ params, request }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const num = Number(params.num);
  const psalm = psalmsByLocale[locale].psalms[num];
  if (!psalm) throw data("Psalm not found", { status: 404 });
  const url = new URL(request.url);
  const revealParam = Number(url.searchParams.get("r"));
  const reveal =
    Number.isInteger(revealParam) && revealParam >= 1 && revealParam <= 7
      ? revealParam
      : num;
  const origin = url.searchParams.get("origin") === "share" ? "share" : null;
  const publicOrigin = import.meta.env.VITE_PUBLIC_ORIGIN || url.origin;
  const shareUrl = new URL(`/${locale}/psalm/${num}`, publicOrigin);
  shareUrl.searchParams.set("origin", "share");
  const shareTitle = `Psalm ${toRomanNumeral(num)} — ${
    psalmsByLocale[locale].cover.title
  }`;
  const description = `Otwórz Psalm ${toRomanNumeral(num)} w ${
    psalmsByLocale[locale].cover.title
  }.`;
  return {
    locale,
    num,
    reveal,
    origin,
    title: psalm.label,
    shareTitle,
    description,
    shareUrl: shareUrl.href,
  };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => [
  { title: loaderData?.title },
  { name: "description", content: loaderData?.description },
  { property: "og:title", content: loaderData?.shareTitle },
  { property: "og:description", content: loaderData?.description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: loaderData?.shareUrl },
  { name: "twitter:card", content: "summary" },
];

// Rendering is handled by the persistent <BookPage> mounted in locale-layout.tsx, which reads
// this route's loader data (via useMatches) to know which leaf to open to.
export default function PsalmPage() {
  return null;
}
