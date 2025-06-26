"use client";

import Navbar from "./component/Navbar";
import Home from "./page/index";
import About from "./about/page";
import WhyWinggurSection from './WinggurSection/page';
import HowItWorks from "./how-it-works/page";
import FaqSection from "./faq/page";
import Contact from "./contact/page";
import Footer from "./component/Footer";

export default function HomeWrapper() {
  return (
    <>
      <Navbar/>
      <Home/>
      <About/>
      <WhyWinggurSection/>
      <HowItWorks/>
      <FaqSection/>
      <Contact/>
      <Footer/>
    </>
  );
}
