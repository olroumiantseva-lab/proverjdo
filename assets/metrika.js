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

  window.proverjdoGoal=(name,params)=>{
    try{window.ym(counterId,'reachGoal',name,params||{});}catch{}
  };

  const path=location.pathname.replace(/\/+$/,'/') || '/';
  if(path==='/') window.proverjdoGoal('landing_view');
  if(path==='/check/') window.proverjdoGoal('check_start');

  const imagePages={
    '/pretenziya-postavshchiku/':'pretenziya-postavshchiku',
    '/pretenziya-o-narushenii-srokov-postavki/':'pretenziya-o-narushenii-srokov-postavki',
    '/pretenziya-po-dogovoru-okazaniya-uslug/':'pretenziya-po-dogovoru-okazaniya-uslug',
    '/otvet-na-pretenziyu/':'otvet-na-pretenziyu',
    '/sostavit-dogovor-online/':'sostavit-dogovor-online',
    '/dogovor-okazaniya-uslug/':'dogovor-okazaniya-uslug',
    '/dogovor-podryada/':'dogovor-podryada',
    '/dogovor-postavki/':'dogovor-postavki',
    '/dop-soglashenie-k-dogovoru/':'dop-soglashenie-k-dogovoru'
  };

  window.proverjdoSeoImages=(heroAlt,insideAlt,heroBase64,insideBase64)=>{
    if(!document.getElementById('seo-image-style')){
      const style=document.createElement('style');
      style.id='seo-image-style';
      style.textContent='.story-hero-side{display:grid;gap:16px;align-self:start}.story-photo{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:20px;background:#edf2ef;box-shadow:0 12px 32px rgba(16,24,40,.08)}.story-hero-photo{margin:0}.story-inline-photo{max-width:820px;margin:26px 0 8px}@media(max-width:820px){.story-hero-side{max-width:620px}}@media(max-width:560px){.story-photo{border-radius:16px}}';
      document.head.appendChild(style);
    }

    const dataSrc=base64=>`data:image/webp;base64,${base64}`;
    const makeImage=(base64,alt,className,lazy)=>{
      const img=document.createElement('img');
      img.className=`story-photo ${className}`;
      img.src=dataSrc(base64);
      img.alt=alt;
      img.width=240;
      img.height=135;
      img.decoding='async';
      if(lazy) img.loading='lazy';
      else img.fetchPriority='high';
      return img;
    };

    const heroGrid=document.querySelector('.story-hero-grid');
    const existingHero=heroGrid&&heroGrid.querySelector('.story-hero-photo');
    if(existingHero){
      existingHero.src=dataSrc(heroBase64);
      existingHero.alt=heroAlt;
    } else if(heroGrid){
      const aside=heroGrid.querySelector(':scope > aside.sergey-card');
      if(aside){
        const side=document.createElement('div');
        side.className='story-hero-side';
        heroGrid.insertBefore(side,aside);
        side.append(makeImage(heroBase64,heroAlt,'story-hero-photo',false),aside);
      }
    }

    const existingInside=document.querySelector('.story-inline-photo');
    if(existingInside){
      existingInside.src=dataSrc(insideBase64);
      existingInside.alt=insideAlt;
      existingInside.loading='lazy';
    } else {
      const section=[...document.querySelectorAll('.story-section .narrow')].find(el=>el.querySelector('h2'));
      const heading=section&&section.querySelector('h2');
      if(section&&heading){
        heading.insertAdjacentElement('afterend',makeImage(insideBase64,insideAlt,'story-inline-photo',true));
      }
    }
  };

  const imageSlug=imagePages[path];
  if(imageSlug){
    const script=document.createElement('script');
    script.src=`/assets/seo-images/${imageSlug}.js?v=20260913-2`;
    script.async=true;
    document.head.appendChild(script);
  }
})();
