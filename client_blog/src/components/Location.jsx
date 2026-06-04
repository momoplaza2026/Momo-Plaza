import React from 'react';
import { motion } from 'framer-motion';

const Location = () => {
  const address = "709 (8, 136/4/2, Pashupati Bhattacharya Rd, East Behala, Green Park, Sarada Pally, Kolkata, West Bengal 700034";
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-momo-darker border-t border-white/5 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full lg:w-1/2 space-y-8"
        >
          <div>
            <h2 className="text-5xl md:text-6xl font-black text-momo-gold mb-4 tracking-tight">
              FIND US
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-momo-red to-transparent rounded-full"></div>
          </div>
          
          <p className="text-2xl md:text-3xl text-white font-bold leading-relaxed tracking-wide">
            DINE IN <span className="text-momo-red mx-2">|</span> TAKE AWAY <span className="text-momo-red mx-2">|</span> DELIVERY
          </p>
          
          <div className="bg-gradient-to-br from-white/10 to-transparent p-8 md:p-10 rounded-3xl border border-white/10 mt-8 shadow-2xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-momo-gold opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="flex items-start gap-6 relative z-10">
              <span className="text-4xl mt-1 drop-shadow-md">📍</span>
              <div>
                <h3 className="font-bold text-xl text-white mb-3 tracking-wide">Address</h3>
                <p className="text-lg text-momo-accent/80 leading-relaxed">
                  709 (8, 136/4/2, Pashupati Bhattacharya Rd,<br/>
                  East Behala, Green Park, Sarada Pally,<br/>
                  Kolkata, West Bengal 700034
                </p>
              </div>
            </div>
            
            <div className="mt-10 relative z-10">
              <a 
                href="https://maps.app.goo.gl/ybtTupzPbb54nTAv6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-momo-gold/15 hover:bg-momo-gold text-momo-gold hover:text-momo-darker border border-momo-gold/40 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="text-lg">Open in Google Maps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="w-full lg:w-1/2"
        >
          <div className="w-full aspect-square md:aspect-video lg:aspect-square xl:aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
            <div className="absolute inset-0 bg-momo-dark animate-pulse z-0"></div>
            <iframe
              title="Momo Plaza Location"
              src={mapUrl}
              className="absolute inset-0 w-full h-full z-10 filter grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:contrast-100 group-hover:opacity-100 transition-all duration-700"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Location;
