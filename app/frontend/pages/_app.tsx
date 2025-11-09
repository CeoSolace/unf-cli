import type { AppProps } from 'next/app';
import '../styles/globals.css';

/**
 * Custom App component for Next.js. This is used to initialise pages and
 * inject global styles. Additional providers such as authentication can
 * be added here in the future.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}