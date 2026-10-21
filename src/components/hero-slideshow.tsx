"use client";

import { PhotoCycle } from "@/components/photo-cycle";
import { forumPhotos } from "@/lib/photos";

export function HeroSlideshow() {
  return <PhotoCycle slides={forumPhotos} label="Moments from the forum" tone="on-dark" priority />;
}
