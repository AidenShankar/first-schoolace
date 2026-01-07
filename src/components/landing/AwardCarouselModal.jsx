
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const carouselItems = [
    {
        type: 'image',
        src: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/bf5ef6584_C9EE48A0-CD0E-4AD4-BA5B-0C648FA3E8B4_1_105_c.jpeg',
        alt: 'Schoolace winning the 2025 SYVEP Stanford Youth Business Venture Challenge'
    },
    {
        type: 'image',
        src: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/b41157173_9F68F5E5-0B76-452C-B61D-6279101544C7_1_201_a.jpg',
        alt: 'Youth Business Venture Challenge participants'
    },
    {
        type: 'video',
        src: 'https://drive.google.com/file/d/1H-hDHmCfZKuTiOpetou65wXz4L338syC/preview'
    },
    {
        type: 'video',
        src: 'https://drive.google.com/file/d/1XR8VXyzJeemv6RvRPi1NQ3LFPjvn2WX3/preview'
    }
];

const AwardCarouselModal = ({ onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselItems.length) % carouselItems.length);
    };

    const currentItem = carouselItems[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-4xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="relative overflow-hidden flex flex-col aspect-video"
                    style={{
                        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                    }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 h-10 w-10 z-20 transition-all duration-200"
                        style={{
                            color: '#cbd5e1',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="w-full h-full"
                            >
                                {currentItem.type === 'image' && (
                                    <img src={currentItem.src} alt={currentItem.alt} className="w-full h-full object-contain rounded-2xl" />
                                )}
                                {currentItem.type === 'video' && (
                                    <iframe
                                        src={currentItem.src}
                                        className="w-full h-full border-0 rounded-2xl"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                        title={`Carousel Video ${currentIndex + 1}`}
                                    ></iframe>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {carouselItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                    currentIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AwardCarouselModal;
