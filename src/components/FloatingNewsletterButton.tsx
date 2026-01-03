import { motion } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { useState } from 'react';
import { NewsletterModal } from './NewsletterModal';

export function FloatingNewsletterButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all"
        style={{
          background: 'linear-gradient(135deg, #604e42 0%, #4d3e34 100%)',
        }}
        aria-label="S'inscrire à la newsletter"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 2 
          }}
        >
          <Gift className="w-7 h-7 text-white" />
        </motion.div>
        
        {/* Badge avec "10%" */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
        >
          <span className="text-[10px] font-black text-white">10%</span>
        </motion.div>
      </motion.button>

      <NewsletterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

