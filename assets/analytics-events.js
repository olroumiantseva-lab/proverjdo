(() => {
  'use strict';
  const goal=(name,params)=>window.proverjdoGoal?.(name,params);
  const once=(name,params)=>{
    const key=`proverjdo.goal.${name}.${location.pathname}`;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
    goal(name,params);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.dataset.page==='scan'){
      once('scan_started');
      const content=document.getElementById('scan-content');
      if(content){
        const report=()=>{
          if(!content.classList.contains('hidden')){
            once('scan_completed');
            once('paywall_view');
          }
        };
        new MutationObserver(report).observe(content,{attributes:true,attributeFilter:['class']});
        report();
      }
    }

    document.getElementById('contract-payment-form')?.addEventListener('submit',()=>goal('payment_started'));
    document.getElementById('proverjdo-login-form')?.addEventListener('submit',()=>goal('login_started'));

    if(document.body.dataset.page==='paid-result'){
      const content=document.getElementById('result-content');
      if(content){
        const report=()=>{if(!content.classList.contains('hidden'))once('paid_result_opened');};
        new MutationObserver(report).observe(content,{attributes:true,attributeFilter:['class']});
        report();
      }
    }
  });
})();
