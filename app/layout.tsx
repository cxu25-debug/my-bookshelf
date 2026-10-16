import type { Metadata } from 'next';
import './globals.css';
const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||'my-bookshelf-cxu25-debug.vercel.app';
export const metadata:Metadata={metadataBase:new URL('https://'+host),title:'My bookshelf — Reading tracker',description:'Explore a personal bookshelf of mystery novels and Kazuo Ishiguro books, with covers, ratings, and reading notes. Connect a Notion database to track your own reading.',alternates:{canonical:'/'},robots:{index:true,follow:true},openGraph:{title:'My bookshelf',description:'A personal reading gallery, powered by Notion.',type:'website',url:'/'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
