// Stand-in for the `geist` package's prebuilt faces. Its modules call
// next/font/local from node_modules, beyond the reach of the alias that mocks
// it for our own code, so they are replaced with what that mock would return.
import localFont from "./next-font-local";

export const GeistSans = localFont({ variable: "--font-geist-sans" });
