import type { AppProps } from 'next/app';
import '../../app/frontend/styles/globals.css';

export default function AdminApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}