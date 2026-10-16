export const dynamic = 'force-dynamic';
const version = '2026-03-11';
const json = (data: unknown, status=200) => Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(req: Request) {
 if(req.headers.get('origin') !== new URL(req.url).origin) return json({error:'Invalid request origin.'},403);
 try {
 const {token, databaseId, dataSourceId} = await req.json() as {token:unknown,databaseId:unknown,dataSourceId:unknown};
 if(typeof token !== 'string' || !token || token.length>1000) return json({error:'Enter a Notion integration token.'},400);
 const valid=(id:unknown)=>typeof id==='string'&&/^[a-f0-9-]{32,36}$/i.test(id);
 if(!valid(databaseId)&&!valid(dataSourceId)) return json({error:'Enter a database or data source ID (32 hexadecimal characters, with optional hyphens).'},400);
 async function notion(path:string,body?:unknown){
 const r=await fetch('https://api.notion.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Notion-Version':version,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const d=await r.json() as any;
 if(!r.ok) throw new Error(r.status===429?'Notion is rate limiting requests. Retry after '+(r.headers.get('Retry-After')||'a few')+' seconds.':d.message||'Notion request failed.');return d;
 }
 let source=dataSourceId as string;
 if(!source){const db=await notion('databases/'+databaseId);if(db.data_sources?.length!==1)return json({error:'This database has multiple data sources. Enter the specific data source ID.'},400);source=db.data_sources[0].id;}
 const schema=await notion('data_sources/'+source);
 const expected:any={Title:['title'],Author:['rich_text'],Genre:['select'],'Cover Image':['files','url'],Rating:['number'],Review:['rich_text']};
 for(const [name,types] of Object.entries(expected) as any) if(!types.includes(schema.properties?.[name]?.type))return json({error:'Property “'+name+'” must be '+types.join(' or ')+'. Check your database schema.'},400);
 const pages:any[]=[];let cursor;
 do {const d=await notion('data_sources/'+source+'/query',{page_size:100,...(cursor?{start_cursor:cursor}:{})});pages.push(...d.results);cursor=d.has_more?d.next_cursor:null;if(pages.length>=10000&&cursor)throw new Error('This collection exceeds 10,000 books; narrow the data source.');}while(cursor);
 const text=(p:any)=> (p?.title||p?.rich_text||[]).map((x:any)=>x.plain_text||x.text?.content||'').join('');
 return json({books:pages.filter(p=>p.object==='page'&&!p.in_trash).map(p=>{const v=p.properties,c=v['Cover Image'];return {id:p.id,title:text(v.Title)||'Untitled',author:text(v.Author),genre:v.Genre.select?.name||'Uncategorized',rating:v.Rating.number,review:text(v.Review),cover:c.url||c.files?.[0]?.file?.url||c.files?.[0]?.external?.url||'',url:p.url};})});
 }catch(e){return json({error:e instanceof Error?e.message:'Unable to load books.'},400);}
}
