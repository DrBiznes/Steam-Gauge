// background.ts
import valveBg from '@/assets/valvebg.jpg'
import gaugeBg from '@/assets/gaugebg.jpg'

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
  gauge: {
    image: gaugeBg,
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))'
  }
}