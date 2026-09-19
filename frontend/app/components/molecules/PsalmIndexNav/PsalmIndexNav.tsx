import { Link } from "react-router";
import { toRomanNumeral } from "~/content/roman-numerals";
import type { PsalmIndexNavProps } from "./PsalmIndexNav.models";
import "./PsalmIndexNav.styles.css";

export function PsalmIndexNav({ locale, psalmNumbers }: PsalmIndexNavProps) {
  return (
    <nav className="seo-index" aria-label="Psalms">
      <ul>
        {psalmNumbers.map((n) => (
          <li key={n}>
            <Link to={`/${locale}/psalm/${n}`}>Psalm {toRomanNumeral(n)}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
