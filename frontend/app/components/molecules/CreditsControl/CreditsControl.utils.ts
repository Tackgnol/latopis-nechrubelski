import type { ArtCredit } from "./CreditsControl.models";

export const NARRATOR = "Tuje Szmaragd";

const PIXABAY_UTM = "utm_source=link-attribution&utm_medium=referral&utm_campaign=image";

export const PIXABAY_URL = `https://pixabay.com/?${PIXABAY_UTM}`;

function pixabayUser(slug: string, imageId: number) {
  return `https://pixabay.com/users/${slug}/?${PIXABAY_UTM}&utm_content=${imageId}`;
}

/** Each image is one of the alpha masks in `app.css`, named there by its Pixabay id. */
export const ART_CREDITS: ArtCredit[] = [
  { labelKey: "creditSkull", author: "OpenClipart-Vectors", href: pixabayUser("openclipart-vectors-30363", 2027035) },
  { labelKey: "creditBlot", author: "CreatureSH", href: pixabayUser("creaturesh-1531436", 2174692) },
  { labelKey: "creditSplatTop", author: "fjdafdafafa", href: pixabayUser("fjdafdafafa-1953055", 2209587) },
  { labelKey: "creditSplatBottom", author: "fjdafdafafa", href: pixabayUser("fjdafdafafa-1953055", 2209585) },
  { labelKey: "creditSplatBackground", author: "fjdafdafafa", href: pixabayUser("fjdafdafafa-1953055", 2209578) },
];
