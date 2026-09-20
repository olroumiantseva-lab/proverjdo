(() => {
  'use strict';
  const counterId = 112426595;
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (let j=0;j<document.scripts.length;j+=1){if(document.scripts[j].src===r)return;}
    k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
  })(window,document,'script',`https://mc.yandex.ru/metrika/tag.js?id=${counterId}`,'ym');

  window.ym(counterId,'init',{
    ssr:true,
    webvisor:true,
    clickmap:true,
    ecommerce:'dataLayer',
    referrer:document.referrer,
    url:location.href,
    accurateTrackBounce:true,
    trackLinks:true,
  });

  const ATTR_PREFIX='proverjdo.attribution.';
  const SESSION_KEY='proverjdo.analytics.session.v1';
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const writeSession=data=>{try{localStorage.setItem(SESSION_KEY,JSON.stringify(data))}catch{}};
  const getReferrerHost=()=>{try{return document.referrer?new URL(document.referrer).hostname:''}catch{return''}};
  const params=new URLSearchParams(location.search);
  let session=readSession();
  if(!session||Number(session.ts||0)<Date.now()-30*24*60*60*1000){
    session={
      ts:Date.now(),
      landing_page:location.pathname.replace(/\/+$/,'/')||'/',
      referrer_host:getReferrerHost(),
      utm_source:params.get('utm_source')||'',
      utm_medium:params.get('utm_medium')||'',
      utm_campaign:params.get('utm_campaign')||'',
      utm_content:params.get('utm_content')||'',
      utm_term:params.get('utm_term')||''
    };
    writeSession(session);
  }
  const productAliases={
    letter_draft_390:'letter',
    document_revision_590:'document',
    situation_analysis_1490:'situation'
  };
  const normalizeProduct=value=>productAliases[value]||value||'';
  const readAttribution=product=>{
    if(!product)return null;
    try{
      const raw=localStorage.getItem(ATTR_PREFIX+product);
      if(!raw)return null;
      const data=JSON.parse(raw);
      if(!data||Number(data.ts||0)<Date.now()-24*60*60*1000){
        localStorage.removeItem(ATTR_PREFIX+product);
        return null;
      }
      return data;
    }catch{return null}
  };
  const saveAttribution=(product,data)=>{
    if(!product)return;
    try{localStorage.setItem(ATTR_PREFIX+product,JSON.stringify({...data,ts:Date.now()}));}catch{}
  };

  window.proverjdoGoal=(name,params)=>{
    const payload={
      landing_page:session?.landing_page||undefined,
      referrer_host:session?.referrer_host||undefined,
      utm_source:session?.utm_source||undefined,
      utm_medium:session?.utm_medium||undefined,
      utm_campaign:session?.utm_campaign||undefined,
      utm_content:session?.utm_content||undefined,
      utm_term:session?.utm_term||undefined,
      ...(params||{})
    };
    const product=normalizeProduct(payload.product||payload.product_id);
    const attr=readAttribution(product);
    if(attr){
      if(!payload.entry_source_page)payload.entry_source_page=attr.source_page;
      if(!payload.entry_target)payload.entry_target=attr.target;
      if(!payload.entry_cta_text)payload.entry_cta_text=attr.cta_text;
    }
    try{window.ym(counterId,'reachGoal',name,payload);}catch{}
  };

  const path=location.pathname.replace(/\/+$/,'/') || '/';
  if(path==='/') window.proverjdoGoal('landing_view');
  if(path==='/check/') window.proverjdoGoal('check_start');

  const productTargets={
    '/letter/':'letter',
    '/compose/':'document',
    '/check/':'document_check',
    '/situation-analysis/':'situation'
  };
  const currentProduct=productTargets[path];
  if(currentProduct&&!readAttribution(currentProduct)){
    let sourcePage=session?.landing_page||path;
    try{
      const ref=new URL(document.referrer);
      if(ref.origin===location.origin)sourcePage=ref.pathname.replace(/\/+$/,'/')||'/';
    }catch{}
    saveAttribution(currentProduct,{source_page:sourcePage,target:path,cta_text:''});
  }

  document.addEventListener('click',(event)=>{
    const link=event.target.closest&&event.target.closest('a[href]');
    if(!link)return;
    try{
      const url=new URL(link.href,location.href);
      const targetPath=url.pathname.replace(/\/+$/,'/') || '/';
      const product=productTargets[targetPath];
      if(product){
        const attribution={
          source_page:path,
          target:targetPath,
          cta_text:(link.textContent||'').trim().slice(0,120)
        };
        saveAttribution(product,attribution);
        window.proverjdoGoal('product_cta_click',{
          ...attribution,
          product
        });
      }
    }catch{}
  });

  const trackFormStart=(selector,goal,product)=>{
    const form=document.querySelector(selector);
    if(!form)return;
    let sent=false;
    const send=()=>{
      if(sent)return;
      sent=true;
      window.proverjdoGoal(goal,{source_page:path,product});
      form.removeEventListener('input',send,true);
      form.removeEventListener('change',send,true);
    };
    form.addEventListener('input',send,true);
    form.addEventListener('change',send,true);
  };

  trackFormStart('#letter-form','letter_start','letter');
  trackFormStart('#compose-form','document_start','document');
  trackFormStart('#situation-analysis-form','situation_start','situation');

  const imagePages={
    '/dop-soglashenie-k-dogovoru/':{slug:'dop-soglashenie-k-dogovoru',hero:'Сергей сравнивает действующий договор и новые условия',inside:'Сергей проверяет изменения для дополнительного соглашения'}
  };

  const addSeoImages=(config)=>{
    if(!document.getElementById('seo-image-style')){
      const style=document.createElement('style');
      style.id='seo-image-style';
      style.textContent='.story-hero-side{display:grid;gap:16px;align-self:start}.story-photo{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:20px;background:#edf2ef;box-shadow:0 12px 32px rgba(16,24,40,.08)}.story-hero-photo{margin:0}.story-inline-photo{max-width:820px;margin:26px 0 8px}@media(max-width:820px){.story-hero-side{max-width:620px}}@media(max-width:560px){.story-photo{border-radius:16px}}';
      document.head.appendChild(style);
    }

    const makeImage=(src,alt,className,lazy,width,height)=>{
      const img=document.createElement('img');
      img.className=`story-photo ${className}`;
      img.src=src;
      img.alt=alt;
      img.width=width;
      img.height=height;
      img.decoding='async';
      if(lazy) img.loading='lazy';
      else img.fetchPriority='high';
      return img;
    };

    const heroSrc=`/assets/seo-images/${config.slug}-hero.webp`;
    const insideSrc=`/assets/seo-images/${config.slug}-inside.webp`;
    const heroGrid=document.querySelector('.story-hero-grid');
    const existingHero=heroGrid&&heroGrid.querySelector('.story-hero-photo');
    if(existingHero){
      existingHero.src=heroSrc;
      existingHero.alt=config.hero;
      existingHero.width=1280;
      existingHero.height=720;
      existingHero.fetchPriority='high';
    } else if(heroGrid){
      const aside=heroGrid.querySelector(':scope > aside.sergey-card');
      if(aside){
        const side=document.createElement('div');
        side.className='story-hero-side';
        heroGrid.insertBefore(side,aside);
        side.append(makeImage(heroSrc,config.hero,'story-hero-photo',false,1280,720),aside);
      }
    }

    const existingInside=document.querySelector('.story-inline-photo');
    if(existingInside){
      existingInside.src=insideSrc;
      existingInside.alt=config.inside;
      existingInside.width=960;
      existingInside.height=540;
      existingInside.loading='lazy';
    } else {
      const section=[...document.querySelectorAll('.story-section .narrow')].find(el=>el.querySelector('h2'));
      const heading=section&&section.querySelector('h2');
      if(section&&heading){
        heading.insertAdjacentElement('afterend',makeImage(insideSrc,config.inside,'story-inline-photo',true,960,540));
      }
    }
  };

  if(imagePages[path]) addSeoImages(imagePages[path]);
})();
