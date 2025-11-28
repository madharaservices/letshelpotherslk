import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://helpsl.vercel.app/sitemap.xml', // ඔබේ Domain එක
  };
}