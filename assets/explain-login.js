(() => {
  'use strict';
  const q=new URLSearchParams(location.search);
  if(q.get('next')!=='explain')return;
  document.body.dataset.page='explain-login';
  const orderId=q.get('order_id');
  if(!orderId||!/^\d+$/.test(orderId)){location.replace('../');return;}
  const byId=(id)=>document.getElementById(id);
  const cfg=window.__SUPABASE_CONFIG__||{};
  const h1=document.querySelector('.auth-card h1');if(h1)h1.textContent='Откройте полный разбор документа';
  const successText=document.querySelector('#proverjdo-login-success p');if(successText)successText.textContent='Откройте одноразовую ссылку из письма. После подтверждения сразу откроется оплаченный разбор документа.';
  try{localStorage.setItem('proverjdo.result.order_id',orderId)}catch{}
  const loadSdk=()=>new Promise((resolve,reject)=>{if(window.supabase)return resolve();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('SDK_LOAD_FAILED'));document.head.append(s)});
  async function sendMagicLink(email){const redirectTo=new URL(`/explain-result/?order_id=${encodeURIComponent(orderId)}`,location.origin).toString();const endpoint=`${cfg.url}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`;const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey,Authorization:`Bearer ${cfg.publishableKey}`},body:JSON.stringify({email,create_user:false})});if(!response.ok){let p={};try{p=await response.json()}catch{}throw new Error(p.msg||p.message||`HTTP ${response.status}`)}}
  (async()=>{try{await loadSdk();const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const{data:{session}}=await client.auth.getSession();if(session){location.replace(`../explain-result/?order_id=${encodeURIComponent(orderId)}`);return}const form=byId('proverjdo-login-form'),email=byId('proverjdo-login-email'),error=byId('proverjdo-login-error'),success=byId('proverjdo-login-success');try{const saved=JSON.parse(sessionStorage.getItem('proverjdo.payment.v1')||'null');if(saved?.email&&!email.value)email.value=saved.email}catch{}form?.addEventListener('submit',async(event)=>{event.preventDefault();if(!form.reportValidity())return;error?.classList.add('hidden');const button=form.querySelector('button[type="submit"]');button.disabled=true;try{await sendMagicLink(email.value.trim().toLowerCase())}catch(e){button.disabled=false;if(error){error.textContent=`Не удалось отправить ссылку: ${e?.message||'ошибка авторизации'}`;error.classList.remove('hidden')}return}button.disabled=false;form.classList.add('hidden');success?.classList.remove('hidden');success?.focus()})}catch{const error=byId('proverjdo-login-error');if(error){error.textContent='Не удалось загрузить вход. Обновите страницу.';error.classList.remove('hidden')}}})();
})();
