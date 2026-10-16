import type { MetadataRoute } from 'next';
export default function sitemap():MetadataRoute.Sitemap{const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||'my-bookshelf-cxu25-debug.vercel.app';return [{url:'https://'+host+'/',changeFrequency:'weekly',priority:1}];}
