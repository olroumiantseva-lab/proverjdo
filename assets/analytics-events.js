(() => {
  'use strict';
  const goal=(name,params)=>window.proverjdoGoal?.(name,params);
  const once=(name,params)=>{
    const key=`proverjdo.goal.${name}.${location.pathname}`;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
    goal(name,params);
  };
  const watchVisible=(id,event,params)=>{
    const node=document.getElementById(id);
    if(!node)return;
    const report=()=>{if(!node.classList.contains('hidden'))once(event,params);};
    new MutationObserver(report).observe(node,{attributes:true,attributeFilter:['class']});
    report();
  };
  const trackPaymentForm=(id,product)=>{
    const form=document.getElementById(id);
    if(!form)return;
    let last=0;
    form.addEventListener('submit',()=>{
      const now=Date.now();
      if(now-last<1500)return;
      last=now;
      goal('payment_attempted',{product,source_page:location.pathname});
    });
  };

  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.dataset.page==='scan'){
      once('scan_started');
      const content=document.getElementById('scan-content');
      if(content){
        const report=()=>{
          if(!content.classList.contains('hidden')){
            once('scan_completed');
            once('paywall_view',{product:'document_check'});
          }
        };
        new MutationObserver(report).observe(content,{attributes:true,attributeFilter:['class']});
        report();
      }
    }

    watchVisible('letter-preview','paywall_view',{product:'letter'});
    watchVisible('compose-preview','paywall_view',{product:'document'});
    watchVisible('explain-preview','paywall_view',{product:'explain'});

    trackPaymentForm('contract-payment-form','document_check');

    const cancelled=new URLSearchParams(location.search).get('payment')==='cancelled';
    if(cancelled){
      const path=location.pathname.replace(/\/+$/,'/')||'/';
      const product=path==='/letter/'?'letter':path==='/compose/'?'document':path==='/explain/'?'explain':path==='/situation-analysis/'?'situation':(path==='/scan/'||path==='/check/')?'document_check':'';
      if(product)once('payment_cancelled',{product});
    }

    const loginForm=document.getElementById('proverjdo-login-form');
    if(loginForm){
      const page=document.body.dataset.page||'';
      const product=page==='letter-login'?'letter':page==='compose-login'?'document':page==='situation-login'?'situation':page==='explain-login'?'explain':'';
      loginForm.addEventListener('submit',()=>goal('login_started',{product:product||undefined}));
    }

    const paidResults=[
      ['result-content','document_check'],
      ['explain-result-content','explain'],
      ['letter-result-content','letter'],
      ['compose-result-content','document'],
      ['situation-result-content','situation']
    ];
    for(const [id,product] of paidResults){
      const node=document.getElementById(id);
      if(!node)continue;
      const report=()=>{if(!node.classList.contains('hidden'))once('paid_result_opened',{product});};
      new MutationObserver(report).observe(node,{attributes:true,attributeFilter:['class']});
      report();
    }
  });
})();
