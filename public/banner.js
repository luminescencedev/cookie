(()=>{var $=Object.defineProperty;var x=Object.getOwnPropertySymbols;var E=Object.prototype.hasOwnProperty,L=Object.prototype.propertyIsEnumerable;var f=(e,t,n)=>t in e?$(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,h=(e,t)=>{for(var n in t||(t={}))E.call(t,n)&&f(e,n,t[n]);if(x)for(var n of x(t))L.call(t,n)&&f(e,n,t[n]);return e};var k="__VITE_API_URL__";function v(e){return`cc_consent_${e}`}function w(e){try{let t=localStorage.getItem(v(e));return t?JSON.parse(t):null}catch(t){return null}}function z(e,t){localStorage.setItem(v(e),JSON.stringify(t))}async function I(e,t){try{await fetch(`${k}/api/consent/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h({siteId:e},t))})}catch(n){}}function V(e){var c,l,d;let t=w(e.siteId);if(t&&t.configVersion===e.configVersion)return;let n=document.createElement("div"),r=e.position==="modal";n.style.cssText=`
    position: fixed;
    ${r?"inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 999999;":"bottom: 0; left: 0; right: 0; z-index: 999999;"}
  `;let o=document.createElement("div");o.style.cssText=`
    background: ${e.backgroundColor};
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    padding: 20px 24px;
    max-width: ${r?"480px":"100%"};
    width: 100%;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.1);
    border-radius: ${r?"12px":"0"};
  `;let s=!1,j=!1;o.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div>
        <strong style="font-size:15px">${e.title}</strong>
        <p style="margin:6px 0 0;color:#555;line-height:1.4">${e.description}</p>
        ${e.privacyPolicyUrl?`<a href="${e.privacyPolicyUrl}" target="_blank" style="color:${e.primaryColor};font-size:12px;margin-top:4px;display:inline-block">Privacy Policy</a>`:""}
      </div>
    </div>
    <div id="cc-categories" style="display:none;margin:14px 0;border-top:1px solid #eee;padding-top:14px">
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:not-allowed;opacity:.6">
        <input type="checkbox" checked disabled> Necessary (always on)
      </label>
      ${e.analyticsEnabled?'<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer"><input type="checkbox" id="cc-analytics"> Analytics</label>':""}
      ${e.marketingEnabled?'<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="cc-marketing"> Marketing</label>':""}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
      <button id="cc-accept" style="background:${e.primaryColor};color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px">${e.acceptLabel}</button>
      <button id="cc-reject" style="background:transparent;border:1px solid #ccc;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px">${e.rejectLabel}</button>
      <button id="cc-customize" style="background:transparent;border:none;padding:8px 6px;cursor:pointer;font-size:14px;color:${e.primaryColor};text-decoration:underline">Customize</button>
    </div>
    ${e.showBranding?'<p style="margin:10px 0 0;font-size:11px;color:#aaa">Powered by CookieConsent</p>':""}
  `,n.appendChild(o),document.body.appendChild(n);function a(i){z(e.siteId,i),I(e.siteId,i),n.remove()}(c=o.querySelector("#cc-accept"))==null||c.addEventListener("click",()=>{a({choice:"accepted",necessary:!0,analytics:e.analyticsEnabled,marketing:e.marketingEnabled,configVersion:e.configVersion})}),(l=o.querySelector("#cc-reject"))==null||l.addEventListener("click",()=>{a({choice:"rejected",necessary:!0,analytics:!1,marketing:!1,configVersion:e.configVersion})}),(d=o.querySelector("#cc-customize"))==null||d.addEventListener("click",()=>{var p,y,u,g;let i=o.querySelector("#cc-categories");i.style.display=i.style.display==="none"?"block":"none";let S=o.querySelector("#cc-customize");if(S.textContent=i.style.display==="none"?"Customize":"Save preferences",i.style.display==="none"){let b=(y=(p=o.querySelector("#cc-analytics"))==null?void 0:p.checked)!=null?y:!1,m=(g=(u=o.querySelector("#cc-marketing"))==null?void 0:u.checked)!=null?g:!1;a({choice:b||m?"partial":"rejected",necessary:!0,analytics:b,marketing:m,configVersion:e.configVersion})}})}async function C(){var n,r;let e=document.currentScript,t=(r=e==null?void 0:e.dataset.siteId)!=null?r:new URLSearchParams((n=e==null?void 0:e.src.split("?")[1])!=null?n:"").get("siteId");if(t)try{let o=await fetch(`${k}/api/consent/config/${t}`);if(!o.ok)return;let s=await o.json();V(s)}catch(o){}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C();})();
