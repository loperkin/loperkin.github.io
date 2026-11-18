(()=>{"use strict";const socials=[["YouTube","https://www.youtube.com/@PurposeinPracticeCh"],["TikTok","https://www.tiktok.com/@purposeinpractice5"],["Instagram","https://www.instagram.com/purposeinpractice5/"],["Facebook","https://www.facebook.com/Purposeinpractice"],["X","https://x.com/purposeinpract"],["GitHub","https://github.com/loperkin"],["Email","mailto:purposeinpractice5@gmail.com"]];const nav=[["Home","/"],["Projects","/projects/"],["Tech Guides","/guides/"],["Tumblewood","/tumblewood/"],["About","/#about"],["Connect","/#connect"]];const path=location.pathname;const active=url=>url==="/"?path==="/":url.startsWith("/#")?false:path.startsWith(url);const header=document.getElementById("site-header");if(header){header.innerHTML='<header class="shared-header"><div class="shared-header-inner"><a class="shared-brand" href="/"><img src="/assets/purpose-in-practice-emblem.png" alt="Purpose in Practice emblem"><span>Purpose <strong>in Practice</strong></span></a><button type="button" class="shared-menu-toggle" aria-controls="shared-nav" aria-expanded="false">☰ Menu</button><nav id="shared-nav" class="shared-nav" aria-label="Main navigation">'+nav.map(([name,url])=>'<a href="'+url+'"'+(active(url)?' aria-current="page"':'')+'>'+name+'</a>').join("")+'</nav></div></header>';const btn=header.querySelector(".shared-menu-toggle"),menu=header.querySelector("#shared-nav");btn.addEventListener("click",()=>{const open=btn.getAttribute("aria-expanded")!=="true";btn.setAttribute("aria-expanded",String(open));menu.classList.toggle("is-open",open)});menu.addEventListener("click",e=>{if(e.target.closest("a")){menu.classList.remove("is-open");btn.setAttribute("aria-expanded","false")}})}const footer=document.getElementById("site-footer");if(footer){footer.innerHTML='<footer class="shared-footer"><div class="shared-footer-inner"><strong>Purpose in Practice</strong><p>Learn it. Build it. Put it into practice.</p><div class="shared-socials">'+socials.map(([name,url])=>'<a href="'+url+'"'+(url.startsWith("http")?' target="_blank" rel="noopener noreferrer"':'')+'>'+name+' ↗</a>').join("")+'</div><small>© '+new Date().getFullYear()+' Purpose in Practice · Some product links may earn an affiliate commission at no extra cost to you.</small></div></footer>'}})();

// GA4: single shared tag, privacy-conscious click and embedded video events.
// Avoid sending full query strings, email addresses or other personal data.
(()=>{
"use strict";
const measurementId="G-9E0NTY7M9P";
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
window.gtag("js",new Date());
window.gtag("config",measurementId);
const script=document.createElement("script");
script.async=true;
script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(measurementId);
document.head.appendChild(script);

const clean=(s,max=100)=>String(s||"").replace(/\\s+/g," ").trim().slice(0,max);
const categoryFromPage=()=>{
 const p=location.pathname;
 if(p.startsWith("/guides/smart-lighting/"))return "smart_lighting";
 if(p.startsWith("/guides/home-assistant-hardware/"))return "home_assistant_hardware";
 if(p.startsWith("/projects/multi-sensor/"))return "multi_sensor";
 return p.startsWith("/guides/")?"tech_guide":p.startsWith("/projects/")?"project":"other";
};
function track(name,params){
 window.gtag("event",name,{source_page:location.pathname,content_category:categoryFromPage(),...params});
}
document.addEventListener("click",event=>{
 const link=event.target.closest?.("a[href]");
 if(!link)return;
 let url;
 try{url=new URL(link.href,location.href)}catch{return}
 if(!["http:","https:"].includes(url.protocol))return;
 const host=url.hostname.toLowerCase(),internal=url.origin===location.origin;
 if(internal){
  if(url.pathname.startsWith("/projects/")&&url.pathname!=="/projects/")track("project_click",{link_url:url.origin+url.pathname,link_domain:host});
  else if(url.pathname.startsWith("/guides/")&&url.pathname!=="/guides/")track("guide_click",{link_url:url.origin+url.pathname,link_domain:host});
  return;
 }
 const affiliate=host==="geni.us"||host.endsWith(".geni.us")||host==="amazon.com"||host.endsWith(".amazon.com")||host==="amzn.to"||link.matches('[rel~="sponsored"]')||link.matches("[data-affiliate]");
 let name;
 if(affiliate)name="affiliate_click";
 else if(host==="youtu.be"||host==="youtube.com"||host.endsWith(".youtube.com"))name="youtube_click";
 else if(host==="github.com"||host.endsWith(".github.com"))name="github_click";
 else return;
 const params={link_url:url.origin+url.pathname,link_domain:host};
 if(affiliate){
  params.affiliate_network=host;
  // Prefer explicit data attributes; otherwise use the model cell in a product table.
  const row=link.closest("tr");
  params.product_name=clean(link.dataset.productName||row?.querySelector("td")?.textContent||link.getAttribute("aria-label")||"",100)||"unknown";
  params.product_category=clean(link.dataset.productCategory||row?.closest("table")?.previousElementSibling?.textContent||categoryFromPage(),60);
 }
 track(name,params);
},true);

// YouTube iframe API reports actual play, pause and completion events.
// Only activate for existing YouTube embeds; no additional tracking pixels.
const frames=[...document.querySelectorAll('iframe[src*="youtube.com/embed/"],iframe[src*="youtube-nocookie.com/embed/"]')];
if(frames.length){
 const previous=window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady=function(){
  if(typeof previous==="function")previous();
  frames.forEach((frame,index)=>{
   let url;try{url=new URL(frame.src)}catch{return}
   const videoId=url.pathname.split("/").filter(Boolean).pop()||"unknown";
   const eventsSeen=new Set();
   try{
    new window.YT.Player(frame.id,{
     events:{onStateChange:e=>{
      const states={1:"video_start",2:"video_pause",0:"video_complete"};
      const name=states[e.data];if(!name)return;
      if(name!=="video_pause"&&eventsSeen.has(name))return;
      if(name!=="video_pause")eventsSeen.add(name);
      track(name,{video_id:videoId,video_provider:"youtube",video_title:clean(frame.title,100)});
     }}
    });
   }catch(_){}
  });
 };
 frames.forEach((frame,index)=>{
  if(!frame.id)frame.id="pip-youtube-"+index;
  try{
   const url=new URL(frame.src);
   url.searchParams.set("enablejsapi","1");
   url.searchParams.set("origin",location.origin);
   frame.src=url.toString();
  }catch(_){}
 });
 if(window.YT?.Player)window.onYouTubeIframeAPIReady();
 else{
  const yt=document.createElement("script");
  yt.async=true;yt.src="https://www.youtube.com/iframe_api";
  document.head.appendChild(yt);
 }
}
})();
