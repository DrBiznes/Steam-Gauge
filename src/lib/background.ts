// background.ts
import valveBg from '@/assets/valvebg.jpg'
import gaugeBg from '@/assets/gaugebg.jpg'
import artfuscationBg from '@/assets/artfuscationbg.jpg'
import aboutBg from '@/assets/aboutbg.jpg'

export type PageBackground = {
  image: string
  overlay?: string
}

export type PageBackgrounds = {
  [key: string]: PageBackground
}

export const backgrounds: PageBackgrounds = {
  home: {
    image: valveBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))'
  },
  about: {
    image: aboutBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))'
  },
  gauge: {
    image: gaugeBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'gauge/top100in2weeks': {
    image: gaugeBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'gauge/top100forever': {
    image: gaugeBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'gauge/genre': {
    image: gaugeBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  artfuscation: {
    image: artfuscationBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'artfuscation/top100in2weeks': {
    image: artfuscationBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'artfuscation/top100forever': {
    image: artfuscationBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  },
  'artfuscation/genre': {
    image: artfuscationBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  }
}