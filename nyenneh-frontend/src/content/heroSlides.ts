import liberiaBeach from "@/assets/liberia/liberia-beach.jpg";
import liberiaCountryside from "@/assets/liberia/liberia-countryside.jpg";
import monroviaCity from "@/assets/liberia/monrovia-city.jpg";
import monroviaCoast from "@/assets/liberia/monrovia-coast.jpg";

/**
 * The photographs that rotate behind the hero headline.
 *
 * All four are Liberia — the coast, the capital and the interior — so the
 * first thing a visitor sees is the country the university is in rather than
 * a stock campus that could be anywhere.
 *
 * Every one is a Creative Commons photograph from Wikimedia Commons, which
 * carries an attribution condition: the credit rendered under the hero is part
 * of the licence, not decoration. Keep `credit`, `licence` and `source` beside
 * any image that replaces one of these, and drop the whole entry rather than
 * the credit if a replacement cannot be attributed.
 */

export interface HeroSlide {
  /** Stable key, and the value the indicator buttons are labelled by. */
  id: string;
  /** Imported so Vite fingerprints and serves it, rather than a public path. */
  src: string;
  /** Where the photograph was taken, shown beside the indicators. */
  place: string;
  /** Photographer, named exactly as the licence requires. */
  credit: string;
  licence: string;
  /** The file's page on Commons — the link the attribution points at. */
  source: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "monrovia-coast",
    src: monroviaCoast,
    place: "Monrovia and the Atlantic coast",
    credit: "blk24ga",
    licence: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Liberia,_Africa_-_panoramio_(267).jpg",
  },
  {
    id: "monrovia-city",
    src: monroviaCity,
    place: "Downtown Monrovia and the waterfront",
    credit: "blk24ga",
    licence: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Liberia,_Africa_-_panoramio_(252).jpg",
  },
  {
    id: "liberia-beach",
    src: liberiaBeach,
    place: "The Atlantic shoreline, Liberia",
    credit: "blk24ga",
    licence: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Liberia,_Africa_-_panoramio_(79).jpg",
  },
  {
    id: "liberia-countryside",
    src: liberiaCountryside,
    place: "An up-country road, Liberia",
    credit: "blk24ga",
    licence: "CC BY 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Monrovia,_Liberia_-_panoramio_(89)_(cropped).jpg",
  },
];
