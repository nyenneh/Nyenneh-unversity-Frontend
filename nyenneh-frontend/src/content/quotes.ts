// The lines that type themselves out under the hero copy.
//
// Keep them short. They are typed one character at a time into a fixed-height
// block, so anything much longer than this wraps past three lines on a phone
// and the block starts shoving the photo credit around.
//
// Quote people who actually said the thing, and keep the attribution with it -
// an unattributed quotation on a university's front page is a bad look.

export interface EducationQuote {
  text: string;
  author: string;
}

export const educationQuotes: EducationQuote[] = [
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    text: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle",
  },
  {
    text: "Education is not preparation for life; education is life itself.",
    author: "John Dewey",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B. B. King",
  },
  {
    text: "If you think education is expensive, try ignorance.",
    author: "Derek Bok",
  },
];
