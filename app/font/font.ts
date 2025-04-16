
import { EB_Garamond, Geist,  } from "next/font/google";

export const ebGaramond = EB_Garamond({
  subsets: ['latin'],      
  display: 'swap',        
  preload: true,            
  fallback: ['serif'],      
  adjustFontFallback: true, 
  variable: '--font-eb-garamond', 
});

export const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
    preload: true,
    fallback: ['sans-serif'],
    adjustFontFallback: true,
    variable: '--font-geist',
});