const e=new TextEncoder();

async function sha(v:string){
  const d=await crypto.subtle.digest("SHA-256",e.encode(v));
  return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function shpParts(s:Record<string,string>={}){
  return Object.entries(s)
    .filter(([k])=>k.startsWith("Shp_"))
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([k,v])=>`${k}=${v}`);
}

export async function paymentSignatureWithModifiers(
  l:string,
  o:string,
  i:string,
  p:string,
  modifiers:string[]=[],
  s:Record<string,string>={}
){
  return sha([l,o,i,...modifiers,p,...shpParts(s)].join(":"));
}

export async function paymentSignature(
  l:string,
  o:string,
  i:string,
  p:string,
  r?:string,
  s:Record<string,string>={}
){
  return paymentSignatureWithModifiers(l,o,i,p,r?[r]:[],s);
}
