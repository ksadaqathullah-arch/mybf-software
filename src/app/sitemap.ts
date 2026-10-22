import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const paths = [
  "",
  "/about",
  "/what-we-offer",
  "/initiatives",
  "/mission",
  "/membership",
  "/members",
  "/contact",
  "/chapters",
  "/events",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${site.url}${path || "/"}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
