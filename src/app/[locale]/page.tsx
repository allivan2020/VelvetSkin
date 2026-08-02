import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Gallery from '@/components/sections/Gallery';
import Reviews from '@/components/sections/Reviews';
import FAQ from '@/components/sections/FAQ';
import Contacts from '@/components/sections/Contacts';
import { getApprovedReviews } from '@/lib/reviews';

export default async function Home() {
  const initialReviews = await getApprovedReviews();

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Gallery />
      <Reviews initialReviews={initialReviews} />
      <FAQ />
      <Contacts />
    </>
  );
}
