import type { StaticImageData } from "next/image";
import activation from "../../public/photos/activation.jpg";
import audience from "../../public/photos/audience.jpg";
import conclave from "../../public/photos/conclave.jpg";
import group from "../../public/photos/group.jpg";
import hall from "../../public/photos/hall.jpg";
import listen from "../../public/photos/listen.jpg";
import manjeri from "../../public/photos/manjeri.jpg";
import meet from "../../public/photos/meet.jpg";
import packed from "../../public/photos/packed.jpg";
import speaker from "../../public/photos/speaker.jpg";
import speaker2 from "../../public/photos/speaker2.jpg";
import stage from "../../public/photos/stage.jpg";

export type PhotoSlide = {
  src: StaticImageData;
  alt: string;
  caption: string;
  short: string;
  tags: readonly [string, string, string];
};

export const forumPhotos: PhotoSlide[] = [
  {
    src: conclave,
    alt: "Dr Hamza Anchumukkil on stage with a student at a MYBF conclave.",
    caption: "Conclaves",
    short: "Conclaves",
    tags: ["On the stage", "A shared mic", "Why not Malappuram"],
  },
  {
    src: hall,
    alt: "A speaker addressing a full hall at the chapter activation meet.",
    caption: "The hall",
    short: "Hall",
    tags: ["A full room", "The brief", "One sitting"],
  },
  {
    src: packed,
    alt: "The hall filled with people listening at a MYBF gathering.",
    caption: "Gatherings",
    short: "Gatherings",
    tags: ["In the seats", "The district", "Paying attention"],
  },
  {
    src: manjeri,
    alt: "The MYBF Manjeri chapter together after a working session.",
    caption: "Chapters",
    short: "Chapters",
    tags: ["The chapter", "A shared table", "Together"],
  },
  {
    src: stage,
    alt: "Three people speaking on stage at the MYBF chapter activation meet.",
    caption: "On stage",
    short: "Stage",
    tags: ["Three voices", "The meet", "In public"],
  },
  {
    src: speaker,
    alt: "A speaker at the MYBF chapter activation meet.",
    caption: "The floor",
    short: "Floor",
    tags: ["The microphone", "The ask", "Building ideas"],
  },
  {
    src: activation,
    alt: "A speaker on stage at the MYBF chapter activation meet.",
    caption: "Activation",
    short: "Activation",
    tags: ["The screen", "The room", "Creating connections"],
  },
  {
    src: audience,
    alt: "Members listening at a MYBF gathering.",
    caption: "Listening",
    short: "Listening",
    tags: ["Members", "In the room", "The next introduction"],
  },
  {
    src: group,
    alt: "MYBF members together at the chapter activation meet.",
    caption: "The forum",
    short: "Forum",
    tags: ["One photograph", "The people", "Designing the future"],
  },
  {
    src: meet,
    alt: "A speaker in front of the Chapter Activation Meet screen.",
    caption: "The meet",
    short: "Meet",
    tags: ["Chapter activation", "Mission 2050", "The brief"],
  },
  {
    src: speaker2,
    alt: "A member speaking with a microphone at a MYBF gathering.",
    caption: "Speaking",
    short: "Speaking",
    tags: ["Hands up", "The pitch", "Useful, not loud"],
  },
  {
    src: listen,
    alt: "A member listening closely in the hall.",
    caption: "Portraits",
    short: "Portraits",
    tags: ["A face in the room", "The work of sitting", "Still listening"],
  },
];
