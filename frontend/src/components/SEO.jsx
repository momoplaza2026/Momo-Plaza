import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = '/brand_logo.jpg', 
  ogUrl = 'https://momoplaza.vercel.app', 
  jsonLd 
}) => {
  const defaultTitle = "Momo Plaza - Authentic Momo & Himalayan Cuisine in Kolkata";
  const defaultDesc = "Discover the best momos in Kolkata at Momo Plaza. Dine in, take away, or order online for fast delivery of authentic Himalayan cuisine.";
  const defaultKeywords = "momo shop near me, best momos in Kolkata, restaurant near me, Momo Plaza, dim sum, East Behala restaurant, food delivery";
  
  const finalTitle = title ? `${title} | Momo Plaza` : defaultTitle;
  
  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={description || defaultDesc} />
      <meta property="twitter:image" content={ogImage} />

      {/* JSON-LD Schema (if provided) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
