"use strict";
(function(){
const API="https://pkdxfahsfuxodfwqqafu.supabase.co/auth/v1";
const KEY="sb_publishable_H_Gc6UW7eullgNFJShaO1Q_lj6i1_8k";
const BASE="https://ica-international-portal.vercel.app";
const heading=document.getElementById("heading"),intro=document.getElementById("intro"),notice=document.getElementById("notice"),emailForm=document.getElementById("email-form"),passwordForm=document.getElementById("password-form");
const mode=location.pathname.endsWith("/reset")?"reset":location.pathname.endsWith("/verify")?"verify":"forgot";
let verifiedRecoveryToken="",busy=false,lastRequest=0;
const speak=(message,error)=>{notice.hidden=false;notice.textContent=message;notice.classList.toggle("error",!!error)};
const setBusy=(b)=>{busy=b;document.querySelectorAll("button").forEach(el=>{el.disabled=b})};
function setScreen(title,sub,which){heading.textContent=title;intro.textContent=sub;emailForm.hidden=which!=="email";passwordForm.hidden=which!=="password"}
async function api(path,body,token,method){const h={"apikey":KEY,"Content-Type":"application/json"};if(token)h.Authorization="Bearer "+token;const r=await fetch(API+path,{method:method||"POST",headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",referrerPolicy:"no-referrer",mode:"cors"});let data={};try{data=await r.json()}catch{}if(!r.ok)throw Error("service_error");return data}
function scrub(){history.replaceState(null,"",location.pathname)}
async function verifyBearer(token){const u=awa���q�^