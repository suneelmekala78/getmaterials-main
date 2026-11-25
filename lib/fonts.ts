import localFont from "next/font/local";

/** Local Caveat — avoids flaky Google Fonts fetches during `next build`. */
export const caveat = localFont({
  src: "../app/fonts/Caveat-Variable.ttf",
  weight: "600 700",
  display: "swap",
  variable: "--font-caveat",
});
