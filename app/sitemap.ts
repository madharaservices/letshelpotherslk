import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://helpsl.vercel.app', // ඔබේ Domain එක
      lastModified: new Date(),
      changeFrequency: 'always', // Real-time නිසා නිතර වෙනස් වෙන බව කියනවා
      priority: 1,
    },
  ];
}