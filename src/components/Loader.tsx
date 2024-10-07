// Loader.tsx
import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="loader-container">
      <motion.div 
        className="loader" 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
      />
      <p>Loading...</p>
    </div>
  );
};

export default Loader;
