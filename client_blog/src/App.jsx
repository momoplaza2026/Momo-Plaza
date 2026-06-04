import React from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import MapSection from './components/MapSection';
import Footer from './components/Footer';

function App() {
  return (
    <div style={{ backgroundColor: '#060200', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Loader overlays on top - page always renders underneath */}
      <Loader />
      <Navbar />
      <Hero />
      <Menu />
      <MapSection />
      <Footer />
    </div>
  );
}

export default App;
