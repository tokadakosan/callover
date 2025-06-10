// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head'; // Headコンポーネントをインポート

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Zoom Phone Webhook App</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;