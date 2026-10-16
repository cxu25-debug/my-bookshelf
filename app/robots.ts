import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||'my-bookshelf-cxu25-debug.vercel.app';return {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:'https://'+host+'/sitemap.xml'};}
