"use client"

import { Loader, Sparkle, Sparkles, Waypoints } from 'lucide-react';
import {  useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { EB_Garamond, Geist } from 'next/font/google';
import Link from 'next/link';

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-garamond',
});

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['sans-serif'],
  adjustFontFallback: true,
  variable: '--font-geist',
});

const MeteorGrid = ({ start }: { start: boolean }) => {
  return (
    <div 
      className="absolute inset-0"
      style={{ 
        transformStyle: 'preserve-3d',
        transform: 'translateZ(104px) rotateX(21deg)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Vertical Meteors */}
        {Array.from({ length: 370 }).map((_, index) => (
          <motion.div 
            key={`v-meteor-${index}`}
            className="absolute w-[1px] h-[60px]"
            style={{
              left: `${(index * 13) + 13}px`,  
              top: 0,
              background: 'linear-gradient(1deg, transparent, rgba(255, 255, 255, 0.3)) 50%, rgba(252, 115, 72, 0.2)',
            }}
            initial={{ 
              y: "740%", 
              opacity: 0 
            }}
            animate={start ? {
              y: 0, 
              opacity: 1,
              transition: { 
                y: {
                  duration: Math.random() * 3 + 7,
                  
                  repeat: Infinity,
                  repeatDelay: Math.random() * 1,
                  delay: 0.5,
                },
                opacity: {
                  duration: 1,
                  
                  repeat: Infinity,
                  repeatDelay: Math.random() * 1 + 6,
                  delay: Math.random() * 1 + 2,
                }
              }
            } : {}}
          />
        ))}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const controls = useAnimation();
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    
    const sequence = async () => {
      setAnimationStarted(true);
      await controls.start("visible");
    };
    
    sequence();
  }, [controls]);
  
  const titleVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(13px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        staggerChildren: 0.1,
        delayChildren: 1.2,
        ease: "easeOut"
      }
    }
  };
  
  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(13px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };
  
  const subtitleVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(13px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: "easeOut", delay: 1.5 }
    }
  };
  
  const buttonVariants = {
    hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.37, ease: "easeIn", delay: 1.8 }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut", delay: 2.1 }
    }
  };
  
  const cardsVariants = {
    hidden: { opacity: 0, y: 80, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut", delay: 2.1 }
    }
  };

  const titleText = "where traditional credentials don't necessarily signal real capability.";
  const titleWords = titleText.split(' ');

  return (
    <>
      <div className={`flex flex-col relative w-full ${geist.className} overflow-hidden h-[100vh] bg-gradient-to-b from-[#1D1D1F] to-transparent`}>
        <div className="absolute inset-0 overflow-hidden" style={{ perspective: '60px' }}>
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {/* Base grid */}
            <div 
              className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(to_right,#ffffff1c,#fc734810_0.6px,transparent_1px,transparent_13px)]"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(104px) rotateX(21deg)',
                opacity: 0.7,
                backgroundSize: '100% 100%, 100% 40px, 40px 100%'
              }}
            ></div>
            <MeteorGrid start={animationStarted} />
          </div>
        </div>
        
        <nav className="nav px-10 flex items-center w-full justify-between top-0 z-50 sticky pt-5">
          <div className="flex items-center">
            <h1 className={`text-4xl ${garamond.className} mb-2 font-medium bg-clip-text leading-relaxed text-start text-transparent bg-gradient-to-r to-slate-100 from-[#fc7348]`}>Tingle</h1>
          </div>
          <div className='flex items-center gap-[10px] px-1 py-1 bg-gradient-to-b from-white/2 to-[120%] to-[#fc7348]/5 shadow-[0_1px_2px_rgba(0,0,0,0.7),inset_0px_0.5px_0.6px_rgba(255,255,255,0.30)] fixed rounded-3xl backdrop-blur-3xl max-w-max inset-x-0 mx-auto'>
            <div className='text-[#fc7348] cursor-pointer font-light text-[16px] tracking-[-0.13px] shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.75px_0.65px_rgba(255,255,255,0.10)] py-1 px-3 rounded-3xl contrast-125 border-x-[0.1px] border-x-white/5'>Features</div>
            <div className='text-white/75 cursor-pointer py-1 px-3 text-[16px] tracking-[-0.13px] font-light hover:text-[#F27500]/55 rounded-3xl transition-all duration-150'>How it works</div>
            <div className='text-white/75 cursor-pointer py-1 px-3 text-[16px] tracking-[-0.13px] font-light hover:text-[#F27500]/55 rounded-3xl transition-all duration-150'>Pricing</div>
            <div className='text-white/75 cursor-pointer py-1 px-3 text-[16px] tracking-[-0.13px] font-light hover:text-[#F27500]/55 rounded-3xl transition-all duration-150'>About</div>
          </div>
          <div className='flex items-center gap-3'>
            <button className="flex items-center justify-center gap-2 font-light px-3 py-2 border-[0.5px] text-slate-100 rounded-xl border-black/80 bg-[#fc7348]/80 hover:bg-[#fc7348]/90 cursor-pointer hover:to-[#fc7348]/10 hover:bg-gradient-to-b hover:from-transparent transition-all duration-300 hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_2px_rgba(0,0,0,0.48)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.80)] shadow-[0_1px_0.4px_rgba(0,0,0,0.15),inset_0px_0.7px_0px_rgba(255,255,255,0.15)] text-[14px] disabled:opacity-50">
              <Link href={'/sign-up'} className="text-white font-medium">Get Started</Link>
            </button>
          </div>
        </nav>
        
        <section className='relative flex flex-col overflow-hidden items-center pt-[180px] h-full'>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent from-[1%] via-[25%] to-[#fc7348]/20 to-[90%] z-10"></div>
          <div className="leftSide absolute inset-0 top-[120px] w-full h-full bg-radial-[at_50%_-190%] from-transparent from-[1%] via-transparent via-[77%] to-[#1D1D1F] z-10"></div>
          <div className='flex flex-col items-center relative z-20 pt-1'>
            <motion.div 
              className={`${garamond.className} text-center text-white text-7xl max-w-[890px] tracking-tight`}
              initial="hidden"
              animate={controls}
              variants={titleVariants}
            >
              {titleWords.map((word, index) => (
                <motion.span
                  key={index}
                  className="inline-block mr-2"
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            
            <motion.div
              className={`mt-8 text-center text-2xl text-white/80 ${garamond.className}`}
              initial="hidden"
              animate={controls}
              variants={subtitleVariants}
            >
              Because the most brilliant stars don&apos;t always have diplomas!
            </motion.div>
            
            <div className='flex items-center w-full justify-center gap-3 mt-6'>
              <motion.div
                className="px-3 py-2 rounded-xl text-white border-[0.5px] border-black/50 tracking-[-0.12px] transition-all duration-150 cursor-pointer bg-gradient-to-b from-white/10 to-[120%] to-[#fc7348]/5 overflow-hidden"
                initial="hidden"
                animate={controls}
                variants={buttonVariants}
              >
                Learn more
              </motion.div>
              
              <motion.div
                className="text-white font-medium tracking-[-0.12px] flex items-center justify-center gap-2 px-3 py-2 border-[0.5px] rounded-xl border-black/80 bg-[#fc7348]/80 hover:bg-[#fc7348]/90 cursor-pointer hover:to-[#fc7348]/10 hover:bg-gradient-to-b hover:from-transparent transition-all duration-300 hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_2px_rgba(0,0,0,0.48)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.80)] shadow-[0_1px_0.4px_rgba(0,0,0,0.15),inset_0px_0.7px_0px_rgba(255,255,255,0.15)] text-[14px] disabled:opacity-50"
                initial="hidden"
                animate={controls}
                variants={buttonVariants}
                transition={{ delay: 1.9 }}
              >
                <Link href={'/sign-up'} className="text-white ">Join the community</Link>
               
              </motion.div>
            </div>
            
            <div className='flex items-start w-full gap-[80px] mt-[40px] z-50' style={{ perspective: '1000px' }}>
              <motion.div
                className='w-[360px] h-[250px] px-[7px] py-2 to-[150%] border border-white/5 rounded-xl border-b-0 border-r-0 z-40'
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(-7px) rotateY(45deg)',
                }}
                initial="hidden"
                animate={controls}
                variants={cardsVariants}
              >
                <div className='px-2 relative shadow-xl flex flex-col justify-end overflow-hidden items-start gap-2 py-1 rounded-xl h-full backdrop-blur-2xl w-full border bg-gradient-to-b from-white/5 to-[#fc7348]/3 border-white/20'>
                  <Loader 
                    strokeWidth={0.3} 
                    color='#ffffff80' 
                    vectorEffect={"nonScalingStroke"}  
                    height={100} width={100}  
                    className='absolute left-[4px] top-[7px]'
                    style={{ transform: 'rotate(1deg)' }} 
                  />
                  <Loader 
                    strokeWidth={0.3} 
                    color='#ffffff30' 
                    vectorEffect={"nonScalingStroke"}  
                    height={200} 
                    width={200}  
                    className='absolute right-[-29px] top-[-29px] blur-[6px]' 
                  />
                  
                  <div className='flex flex-col gap-1 pb-6 w-full px-2'>
                    <div className={`${garamond.className} text-2xl tracking-[-0.12px] text-white`}>Talent Thermometer</div>
                    <div className='max-w-[240px] text-white/80 font-light'>Watch your reputation heat up as your work speaks volumes.</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className='w-[386px] max-h-[250px] h-full mt-[70px] px-[7px] py-2 to-[150%] border border-white/5 rounded-xl border-b-0'
                initial="hidden"
                animate={controls}
                variants={cardVariants}
              >
                <div className='px-2 relative shadow-xl flex flex-col justify-end overflow-hidden items-start gap-2 py-1 rounded-xl h-full backdrop-blur-2xl w-full border bg-gradient-to-b from-white/5 to-[#fc7348]/3 border-white/20'>
                  <Sparkle 
                    strokeWidth={0.3} 
                    color='#ffffff60' 
                    vectorEffect={"nonScalingStroke"}  
                    height={100} width={100}  
                    className='absolute left-[4px] top-[7px]'
                    style={{ transform: 'rotate(1deg)' }}
                  />
                  <Sparkles 
                    strokeWidth={0.3} 
                    color='#ffffff30' 
                    vectorEffect={"nonScalingStroke"}  
                    height={200} 
                    width={200}  
                    className='absolute right-[-29px] top-[-29px] blur-[6px]' 
                  />
                  
                  <div className='flex flex-col gap-1 pb-6 w-full px-2'>
                    <div className={`${garamond.className} text-2xl text-white`}>Brilliance Showcase</div>
                    <div className='max-w-[240px] text-white/80'>Your work in full color, not just black and white credentials.</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className='w-[360px] h-[250px] px-[7px] py-2 to-[150%] border border-white/5 rounded-xl border-b-0 border-l-0'
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(10px) rotateY(-45deg)',
                }}
                initial="hidden"
                animate={controls}
                variants={cardsVariants}
              >
                <div className='px-2 relative shadow-xl flex flex-col justify-end overflow-hidden items-start gap-2 py-1 rounded-xl h-full backdrop-blur-2xl w-full border bg-gradient-to-b from-white/5 to-[#fc7348]/3 border-white/20'>
                  <Waypoints 
                    strokeWidth={0.3} 
                    color='#ffffff80' 
                    vectorEffect={"nonScalingStroke"}  
                    height={100} width={100}  
                    className='absolute left-[4px] top-[7px]'
                    style={{ transform: 'rotate(1deg)' }} 
                  />
                  <Waypoints 
                    strokeWidth={0.3} 
                    color='#ffffff30' 
                    vectorEffect={"nonScalingStroke"}  
                    height={200} 
                    width={200}  
                    className='absolute right-[-29px] top-[-29px] blur-[6px]' 
                  />
                  
                  <div className='flex flex-col gap-1 pb-6 w-full px-2'>
                    <div className={`${garamond.className} text-2xl text-white`}>Skill Seeker</div>
                    <div className='max-w-[240px] text-white/80'>Connecting your talent directly to those seeking your magic.</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}