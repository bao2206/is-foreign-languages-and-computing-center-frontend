import React from 'react';
import HomeHeader from '../components/Headers/HomeHeader';
import HeroSection from '../components/HeroSection';
import FeaturedCourses from '../components/FeaturedCourses';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';
import LatestNews from '../components/LatestNews';
import Partners from '../components/Partners';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div>
      <HomeHeader />
      <HeroSection />
      <FeaturedCourses />
      <WhyChooseUs />
      <Testimonials />
      <Statistics />
      <LatestNews />
      <Partners />
      <ContactForm />
      <Footer />
      {/* Add other homepage sections here */}
    </div>
  );
};

export default HomePage;


