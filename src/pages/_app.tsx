import { type AppType } from "next/app";


import "~/styles/globals.css";

declare namespace JSX {
  interface Element { }
  interface IntrinsicElements { div: any; }
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp