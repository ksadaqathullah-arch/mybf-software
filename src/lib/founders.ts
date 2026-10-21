import type { StaticImageData } from "next/image";
import aslif from "../../public/founders/aslif.jpg";
import irfana from "../../public/founders/irfana.jpg";
import musavvir from "../../public/founders/musavvir.jpg";
import nasrin from "../../public/founders/nasrin.jpg";
import nisam from "../../public/founders/nisam.jpg";
import nishana from "../../public/founders/nishana.jpg";
import rinshad from "../../public/founders/rinshad.jpg";
import sana from "../../public/founders/sana.jpg";
import shibili from "../../public/founders/shibili.jpg";
import vipin from "../../public/founders/vipin.jpg";

export type Founder = {
  name: string;
  role: string;
  poster: StaticImageData;
};

export const founders: Founder[] = [
  { name: "Shibili Rahiman KP", role: "Chairman, Rac Global", poster: shibili },
  { name: "Rinshad Silvan", role: "Global Director, Silvan Business Group", poster: rinshad },
  { name: "Muhammed Musavvir K", role: "Founder & CEO, 6AMCLUB", poster: musavvir },
  { name: "Dr Nishana Mohammed Ashraf", role: "Dental surgeon, content creator", poster: nishana },
  { name: "Sana Naseer", role: "Founder, Level Up Her", poster: sana },
  { name: "Vipin VK", role: "Founder, Navik Strategy Labs", poster: vipin },
  { name: "Nisam VM", role: "Founder, Desgro Media", poster: nisam },
  { name: "Nasrin Hameed", role: "Founder, Her Stories", poster: nasrin },
  { name: "Irfana Izzath", role: "Creator, entrepreneur and mentor", poster: irfana },
  { name: "Mohamed Aslif", role: "Creator, entrepreneur and mentor", poster: aslif },
];
