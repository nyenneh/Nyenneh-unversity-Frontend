import campusGate from "@/assets/campus/campus-gate.jpg";
import facultyBlock from "@/assets/campus/faculty-block.jpg";
import mainBuilding from "@/assets/campus/main-building.jpg";
import scienceTower from "@/assets/campus/science-tower.jpg";

// The photos that rotate behind the hero headline - campus buildings, so the
// first thing a visitor sees is a university and not a beach.
//
// These are stand-ins. They are real buildings at other universities (Makerere,
// Legon, LASU, and the University of Liberia gate at Fendell), used here to
// show the kind of campus the site is describing. Swap them for photographs of
// our own buildings as soon as we have any.
//
// IMPORTANT: all four are Creative Commons off Wikimedia Commons, and
// attribution is a licence condition. The credit line under the hero is not
// decoration - don't delete it to tidy the layout up. If you replace an image,
// bring its credit/licence/source with it, and if you can't attribute the
// replacement then drop the entry rather than the credit. All four were resized
// for the web; nothing else about them was changed.

export interface HeroSlide {
  id: string;
  src: string; // imported, so vite fingerprints it rather than a /public path
  place: string; // caption shown next to the indicators
  credit: string; // photographer, named exactly as the licence requires
  licence: string;
  source: string; // the file's page on Commons
}

export const heroSlides: HeroSlide[] = [
  {
    id: "main-building",
    src: mainBuilding,
    place: "The main administration building",
    credit: "Fiktube",
    licence: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:New_Refurbished_Ivory_Tower_at_Makerere_University.jpg",
  },
  {
    id: "faculty-block",
    src: facultyBlock,
    place: "Lecture halls across the quadrangle",
    credit: "Simon Ontoyin",
    licence: "CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:University_Of_Ghana,_Accra,_Ghana_-_panoramio_(12).jpg",
  },
  {
    id: "science-tower",
    src: scienceTower,
    place: "The science and engineering block",
    credit: "SIMIOFAFRICA",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:LASU_Senate_Building_Right_Section_1.jpg",
  },
  {
    id: "campus-gate",
    src: campusGate,
    place: "The campus gate",
    credit: "mjmkeating",
    licence: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:University_of_Liberia_-_Fendel_Campus.jpg",
  },
];
