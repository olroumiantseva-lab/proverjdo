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
    '/sostavit-pretenziyu-online/':{slug:'sostavit-pretenziyu-online',hero:'Сергей разбирает документы перед подготовкой претензии',inside:'Сергей изучает документы за домашним столом'},
    '/pretenziya-postavshchiku/':{slug:'pretenziya-postavshchiku',hero:'Сергей разбирает документы по спорной поставке',inside:'Сергей проверяет документы и условия поставки'},
    '/pretenziya-o-narushenii-srokov-postavki/':{slug:'pretenziya-o-narushenii-srokov-postavki',hero:'Сергей проверяет сроки поставки по документам',inside:'Сергей разбирает ситуацию с задержкой поставки'},
    '/pretenziya-po-dogovoru-okazaniya-uslug/':{slug:'pretenziya-po-dogovoru-okazaniya-uslug',hero:'Сергей изучает договор оказания услуг и документы',inside:'Сергей проверяет документы по оказанным услугам'},
    '/otvet-na-pretenziyu/':{slug:'otvet-na-pretenziyu',hero:'Сергей читает полученную претензию',inside:'Сергей готовит ответ на претензию по документам'},
    '/sostavit-dogovor-online/':{slug:'sostavit-dogovor-online',hero:'Сергей готовит договор по реальной договорённости',inside:'Сергей собирает условия будущего договора'},
    '/dogovor-okazaniya-uslug/':{slug:'dogovor-okazaniya-uslug',hero:'Сергей разбирает условия договора оказания услуг',inside:'Сергей проверяет объём услуг, сроки и результат'},
    '/dogovor-podryada/':{slug:'dogovor-podryada',hero:'Сергей разбирает условия договора подряда',inside:'Сергей сверяет план ремонта, материалы и условия подряда'},
    '/dogovor-postavki/':{slug:'dogovor-postavki',hero:'Сергей изучает условия договора поставки',inside:'Сергей проверяет поставку, документы и комплектность'},
    '/dop-soglashenie-k-dogovoru/':{slug:'dop-soglashenie-k-dogovoru',hero:'Сергей сравнивает действующий договор и новые условия',inside:'Сергей проверяет изменения для дополнительного соглашения'},
    '/delovoe-pismo-online/':{slug:'delovoe-pismo-online',hero:'Сергей разбирает документы перед подготовкой делового письма',inside:'Документы и ноутбук для подготовки делового письма'},
    '/otvet-na-delovoe-pismo/':{slug:'otvet-na-delovoe-pismo',hero:'Сергей изучает полученное деловое письмо перед ответом',inside:'Рабочее место для подготовки ответа на деловое письмо'}
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

  const letterCluster={
    '/delovoe-pismo-online/':{title:'Деловое письмо онлайн',text:'Общий сценарий: определить цель письма, собрать факты и выбрать нужный формат.'},
    '/pismo-postavshchiku/':{title:'Письмо поставщику',text:'Поставка, товар, счёт, характеристики, документы или ответ поставщика.'},
    '/pismo-o-narushenii-srokov/':{title:'Письмо о нарушении сроков',text:'Срок уже прошёл и нужно получить конкретный статус и новую дату.'},
    '/zapros-dokumentov-u-kontragenta/':{title:'Запрос документов у контрагента',text:'Акты, УПД, счета, сертификаты, спецификации и другие документы по сделке.'},
    '/otvet-na-delovoe-pismo/':{title:'Ответ на деловое письмо',text:'Контрагент уже написал и нужно спокойно ответить по пунктам.'}
  };

  const addLetterClusterLinks=()=>{
    if(!letterCluster[path] || document.getElementById('letter-cluster-links')) return;
    const main=document.querySelector('main');
    if(!main) return;
    const section=document.createElement('section');
    section.id='letter-cluster-links';
    section.className='story-section alt';
    section.setAttribute('aria-label','Другие материалы о деловых письмах');
    const cards=Object.entries(letterCluster)
      .filter(([url])=>url!==path)
      .map(([url,item])=>`<a class="story-link" href="${url}"><strong>${item.title}</strong><span>${item.text}</span></a>`)
      .join('');
    section.innerHTML=`<div class="narrow"><p class="story-kicker">Деловые письма</p><h2>Другие сценарии</h2><div class="story-links">${cards}</div></div>`;
    main.appendChild(section);
  };

  addLetterClusterLinks();
})();
