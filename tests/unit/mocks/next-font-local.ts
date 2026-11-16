// Stand-in for next/font/local, which only works under Next's compiler. It
// returns the object the compiler would generate, named after the face's
// CSS variable so a test can tell the faces apart.
interface LocalFontOptions {
  variable?: string;
  [key: string]: unknown;
}

export default function localFont({ variable = "--font-local" }: LocalFontOptions) {
  const name = variable.replace(/^--/, "");
  return {
    className: `${name}-class`,
    variable: `${name}-variable`,
    style: { fontFamily: `'${name}'` },
  };
}
