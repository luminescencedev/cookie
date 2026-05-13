(()=>{(async()=>{let $=document.currentScript;if(!$)return;let p=$.dataset.siteId;if(!p){console.warn("[CookieConsent] Missing data-site-id attribute");return}let w=`cc_${p}`,C="http://localhost:3000",d={en:{customize:"Customize",savePreferences:"Save preferences",back:"\u2190 Back",alwaysActive:"Always active",necessary:"Necessary",necessaryDesc:"Required for the site to function properly.",analytics:"Analytics",analyticsDesc:"Help us understand how visitors use this site.",marketing:"Marketing",marketingDesc:"Used to show you relevant advertisements.",privacyPolicy:"Privacy policy",poweredBy:"Powered by CookieConsent"},fr:{customize:"Personnaliser",savePreferences:"Enregistrer mes pr\xE9f\xE9rences",back:"\u2190 Retour",alwaysActive:"Toujours actif",necessary:"N\xE9cessaires",necessaryDesc:"Indispensables au bon fonctionnement du site.",analytics:"Analytiques",analyticsDesc:"Nous aident \xE0 comprendre comment les visiteurs utilisent ce site.",marketing:"Marketing",marketingDesc:"Utilis\xE9s pour vous montrer des publicit\xE9s pertinentes.",privacyPolicy:"Politique de confidentialit\xE9",poweredBy:"Propuls\xE9 par CookieConsent"},de:{customize:"Anpassen",savePreferences:"Einstellungen speichern",back:"\u2190 Zur\xFCck",alwaysActive:"Immer aktiv",necessary:"Notwendig",necessaryDesc:"F\xFCr die einwandfreie Funktion der Website erforderlich.",analytics:"Analyse",analyticsDesc:"Helfen uns zu verstehen, wie Besucher die Website nutzen.",marketing:"Marketing",marketingDesc:"Werden verwendet, um Ihnen relevante Werbung zu zeigen.",privacyPolicy:"Datenschutzerkl\xE4rung",poweredBy:"Unterst\xFCtzt von CookieConsent"},es:{customize:"Personalizar",savePreferences:"Guardar preferencias",back:"\u2190 Volver",alwaysActive:"Siempre activo",necessary:"Necesarias",necessaryDesc:"Imprescindibles para el correcto funcionamiento del sitio.",analytics:"Anal\xEDticas",analyticsDesc:"Nos ayudan a entender c\xF3mo los visitantes usan este sitio.",marketing:"Marketing",marketingDesc:"Se utilizan para mostrarle anuncios relevantes.",privacyPolicy:"Pol\xEDtica de privacidad",poweredBy:"Desarrollado por CookieConsent"},it:{customize:"Personalizza",savePreferences:"Salva preferenze",back:"\u2190 Indietro",alwaysActive:"Sempre attivo",necessary:"Necessari",necessaryDesc:"Indispensabili per il corretto funzionamento del sito.",analytics:"Analitici",analyticsDesc:"Ci aiutano a capire come i visitatori usano questo sito.",marketing:"Marketing",marketingDesc:"Utilizzati per mostrare annunci pertinenti.",privacyPolicy:"Informativa sulla privacy",poweredBy:"Offerto da CookieConsent"}};function N(e){var i,r;if(e!=="auto")return(i=d[e])!=null?i:d.en;let n=navigator.language.split("-")[0].toLowerCase();return(r=d[n])!=null?r:d.en}let T=[/_ga$/,/_gid$/,/_gat/,/^amplitude/,/^mp_/,/^_hjid/,/^hjActiveViewportIds/],L=[/_fbp$/,/_fbc$/,/^fr$/,/^ads/,/ide/i,/^_tt_/,/^li_fat_id/];function M(){let e=document.cookie.split(";").map(i=>i.trim().split("=")[0].trim()),n={analytics:!1,marketing:!1};for(let i of e)T.some(r=>r.test(i))&&(n.analytics=!0),L.some(r=>r.test(i))&&(n.marketing=!0);return n}function R(){try{let e=localStorage.getItem(w);return e?JSON.parse(e):null}catch(e){return null}}function U(e){try{localStorage.setItem(w,JSON.stringify(e))}catch(n){}}let o;try{let e=await fetch(`${C}/api/consent/config/${p}`);if(!e.ok)return;o=await e.json()}catch(e){return}let g=R();if(g&&g.version===o.configVersion){z(g);return}let a=N(o.language),y=M(),u=document.createElement("div");u.id="__cc_wrapper__",document.body.appendChild(u);let m=o.position==="modal",t=o;function f(e,n,i){var S,P,A,I,B;let r=m?"position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.4);z-index:2147483647;":"position:fixed;bottom:0;left:0;right:0;z-index:2147483647;",s=`
      background:${t.backgroundColor};
      color:${t.primaryColor};
      padding:20px 24px;
      max-width:${m?"480px":"100%"};
      width:100%;
      border-radius:${m?"16px":"16px 16px 0 0"};
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    `,q=t.analyticsEnabled||t.marketingEnabled,H=y.analytics||y.marketing;u.innerHTML=`
      <div style="${r}">
        <div style="${s}">
          ${e?V(n,i):O(H,q)}
        </div>
      </div>
    `,(S=document.getElementById("__cc_accept__"))==null||S.addEventListener("click",()=>_("accepted",!0,!0)),(P=document.getElementById("__cc_reject__"))==null||P.addEventListener("click",()=>_("rejected",!1,!1)),(A=document.getElementById("__cc_customize__"))==null||A.addEventListener("click",()=>f(!0,t.analyticsEnabled,t.marketingEnabled)),(I=document.getElementById("__cc_back__"))==null||I.addEventListener("click",()=>f(!1,n,i)),(B=document.getElementById("__cc_save__"))==null||B.addEventListener("click",()=>{var D,j;let k=document.getElementById("__cc_analytics_toggle__"),v=document.getElementById("__cc_marketing_toggle__"),h=(D=k==null?void 0:k.checked)!=null?D:!1,x=(j=v==null?void 0:v.checked)!=null?j:!1;_(h&&x?"accepted":!h&&!x?"rejected":"partial",h,x)})}function O(e,n){return`
      <p style="margin:0 0 4px;font-weight:600;font-size:15px;">${l(t.title)}</p>
      <p style="margin:0 0 14px;font-size:13px;opacity:.7;">${l(t.description)}</p>
      ${e?`<p style="margin:0 0 12px;font-size:11px;opacity:.5;">\u{1F50D} We detected cookies on this page: ${[y.analytics&&"analytics",y.marketing&&"marketing"].filter(Boolean).join(", ")}.</p>`:""}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button id="__cc_accept__" style="${c("filled")}">${l(t.acceptLabel)}</button>
        <button id="__cc_reject__" style="${c("outline")}">${l(t.rejectLabel)}</button>
        ${n?`<button id="__cc_customize__" style="${c("ghost")}">${a.customize}</button>`:""}
      </div>
      ${E()}
    `}function V(e,n){return`
      <p style="margin:0 0 14px;font-weight:600;font-size:14px;">${a.customize}</p>
      <div style="border:1px solid ${t.primaryColor}22;border-radius:10px;overflow:hidden;margin-bottom:14px;">
        ${b("necessary",a.necessary,a.necessaryDesc,!0,!0)}
        ${t.analyticsEnabled?b("analytics",a.analytics,a.analyticsDesc,!1,e):""}
        ${t.marketingEnabled?b("marketing",a.marketing,a.marketingDesc,!1,n):""}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button id="__cc_save__" style="${c("filled")}">${a.savePreferences}</button>
        <button id="__cc_back__" style="${c("ghost")}">${a.back}</button>
      </div>
      ${E()}
    `}function b(e,n,i,r,s){return`
      <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:12px 14px;border-bottom:1px solid ${t.primaryColor}11;">
        <div style="flex:1;padding-right:12px;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:500;color:${t.primaryColor};">${n}</p>
          <p style="margin:0;font-size:11px;color:${t.primaryColor};opacity:.5;">${i}</p>
        </div>
        ${r?`<span style="font-size:11px;color:${t.primaryColor};opacity:.4;white-space:nowrap;padding-top:2px;">${a.alwaysActive}</span>`:`<label style="position:relative;display:inline-flex;align-items:center;cursor:pointer;flex-shrink:0;">
              <input id="__cc_${e}_toggle__" type="checkbox" ${s?"checked":""} style="opacity:0;width:0;height:0;position:absolute;" />
              <span style="display:block;width:36px;height:20px;border-radius:10px;background:${s?t.primaryColor:t.primaryColor+"33"};transition:background .2s;cursor:pointer;position:relative;" onclick="(function(){var inp=document.getElementById('__cc_${e}_toggle__');inp.checked=!inp.checked;this.style.background=inp.checked?'${t.primaryColor}':'${t.primaryColor}33';var thumb=this.querySelector('span');thumb.style.transform=inp.checked?'translateX(14px)':'translateX(0)';}).call(this)">
                <span style="display:block;width:16px;height:16px;border-radius:50%;background:white;margin:2px;transition:transform .2s;transform:${s?"translateX(14px)":"translateX(0)"}"></span>
              </span>
            </label>`}
      </div>
    `}function E(){let e=[];return t.privacyPolicyUrl&&e.push(`<a href="${l(t.privacyPolicyUrl)}" target="_blank" style="color:${t.primaryColor};opacity:.4;font-size:11px;text-decoration:none;">${a.privacyPolicy}</a>`),t.showBranding&&e.push(`<span style="color:${t.primaryColor};opacity:.25;font-size:11px;">${a.poweredBy}</span>`),e.length?`<div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;">${e.join("")}</div>`:""}function c(e){let n="border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .15s;";return e==="filled"?`${n}background:${t.primaryColor};color:${t.backgroundColor};`:e==="outline"?`${n}background:transparent;color:${t.primaryColor};border:1.5px solid ${t.primaryColor};`:`${n}background:transparent;color:${t.primaryColor};opacity:.6;`}f(!1,o.analyticsEnabled,o.marketingEnabled);async function _(e,n,i){let r={version:o.configVersion,choice:e,necessary:!0,analytics:n,marketing:i,timestamp:Date.now()};U(r),u.remove(),z(r);try{await fetch(`${C}/api/consent/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({siteId:p,choice:e,necessary:!0,analytics:n,marketing:i,configVersion:o.configVersion})})}catch(s){}}function z(e){window.cookieConsent={choice:e.choice,necessary:e.necessary,analytics:e.analytics,marketing:e.marketing,hasAnalytics:()=>e.analytics,hasMarketing:()=>e.marketing,hasConsent:()=>e.choice==="accepted"},window.dispatchEvent(new CustomEvent("cc:consent",{detail:e}))}function l(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();})();
