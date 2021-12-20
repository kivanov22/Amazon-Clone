import { getSession } from "next-auth/client";
import Head from "next/head";
import Banner from "../components/Banner.js";
import Header from "../components/Header.js";
import ProductFeed from "../components/ProductFeed.js";

export default function Home({ products }) {
  return (
    <div className="bg-gray-100">
      <Head>
        <title>Amazon </title>
      </Head>


      <Header></Header>

      <main className="max-w-screen-2xl mx-auto">
        {/* banner */}
        <Banner />
        {/* product feed */}
        <ProductFeed products={products}/>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const products = await fetch('https://fakestoreapi.com/products').then(
    (res) => res.json()
  );

  return {
    props: {
      products,
      session,
    },
  };
}