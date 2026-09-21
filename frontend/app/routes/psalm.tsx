import { data, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { psalmsByLocale, type Locale } from "~/content";

export function loader({ params, request }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const num = Number(params.num);
  const psalm = psalmsByLocale[locale].psalms[num];
  if (!psalm) throw data("Psalm not found", { status: 404 });
  const revealParam = Number(new URL(request.url).searchParams.get("r"));
  const reveal = Number.isInteger(revealParam) && revealParam >= 1 && revealParam <= 7 ? revealParam : num;
  return { locale, num, reveal, title: psalm.label };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => [{ title: loaderData?.title }];

// Rendering is handled by the persistent <BookPage> mounted in locale-layout.tsx, which reads
// this route's loader data (via useMatches) to know which leaf to open to.
export default function PsalmPage() {
  return null;
}
