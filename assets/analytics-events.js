(() => {
  'use strict';
  const goal=(name,params)=>window.proverjdoGoal?.(name,params);
  const once=(name,params)=>{
    const key=`proverjdo.goal.${name}.${location.pathname}`;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
    goal(name,params);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    try{
      const raw=sessionStorage.getItem('proverjdo.payment_success.pending');
      if(raw){
        const data=JSON.parse(raw);
        const fresh=Number(data?.ts||0)>Date.now()-15*60*1000;
        if(fresh&&/^\d+$/.test(String(data?.order_id||''))){
          goal('payment_success',{order_id:String(data.order_id),product_id:data.product_id||undefined});
        }
        sessionStorage.removeItem('proverjdo.payment_success.pending');
      }
    }catch{}

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

    const paymentForm=document.getElementById('contract-payment-form');
    if(paymentForm){
      let lastPaymentSubmitAt=0;
      paymentForm.addEventListener('submit',()=>{
        const now=Date.now();
        if(now-lastPaymentSubmitAt<1500)return;
        lastPaymentSubmitAt=now;
        goal('payment_started');
      });
    }

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
