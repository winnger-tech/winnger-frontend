"use client";

import { useEffect } from 'react';
import Navbar from "./component/Navbar";
import Home from "./page/index";
import About from "./about/page";
import HowItWorks from "./how-it-works/page";
import FaqSection from "./faq/page";
import Contact from "./contact/page";
import Footer from "./component/Footer";
import { useApiQuery } from '@/hooks/useApi';

export default function HomeWrapper() {
  const { data, error } = useApiQuery<{ message: string }>(['test'], '/api/test');

  useEffect(() => {
    if (data) {
      console.log('API Response:', data);
    }
    if (error) {
      console.error('API Error:', error);
    }
  }, [data, error]);

  return (
    <>
      <Navbar/>
      <Home/>
      <About/>
      <HowItWorks/>
      <FaqSection/>
      <Contact/>
      <Footer/>
    </>
  );
}
