"use client";
import { useState, useEffect, useRef } from "react";

const OCCASION_COPY = {
  tough_times: { contextQ:(n,s)=>s?"Was durchlebst du gerade?":`Was durchlebt ${n} gerade?`, contextPh:(n,s)=>s?"z.B. Ich stecke seit Monaten in einem Tief...":`z.B. ${n} hat sich getrennt und fühlt sich einsam...`, goalPh:(n,s)=>s?"z.B. Wieder wissen, dass es weitergeht.":`z.B. Dass ${n} merkt, dass sie nicht allein ist.`, freqRec:"every3" },
  motivation: { contextQ:(n,s)=>s?"Was ist dein Ziel?":`Was ist ${n}s Ziel?`, contextPh:(n,s)=>s?"z.B. Ich trainiere für meinen ersten Marathon...":`z.B. ${n} bereitet sich auf eine wichtige Prüfung vor...`, goalPh:(n,s)=>s?"z.B. Dass ich am Start stehe und weiss: Ich bin bereit.":`z.B. Dass ${n} mit Selbstvertrauen in die Prüfung geht.`, freqRec:"daily" },
  confidence: { contextQ:(n,s)=>s?"Wobei fehlt dir Selbstvertrauen?":`Wobei fehlt ${n} Selbstvertrauen?`, contextPh:(n,s)=>s?"z.B. Neuer Job, fühle mich den Aufgaben nicht gewachsen...":`z.B. ${n} hat sich beruflich verändert und zweifelt...`, goalPh:(n,s)=>s?"z.B. An mich glauben.":`z.B. Dass ${n} ihre Stärken wieder sieht.`, freqRec:"every3" },
  appreciation: { contextQ:(n,s)=>s?"Wofür bist du dankbar?":`Was schätzt du an ${n}?`, contextPh:(n,s)=>s?"z.B. Ich möchte mir bewusster machen, was gut läuft...":`z.B. ${n} ist immer für alle da, bekommt aber selten Danke gesagt...`, goalPh:(n,s)=>s?"z.B. Dankbarkeit und Zufriedenheit.":`z.B. Dass ${n} sich gesehen und wertgeschätzt fühlt.`, freqRec:"weekly" },
  celebration: { contextQ:(n,s)=>s?"Was feierst du?":"Was gibt es zu feiern?", contextPh:(n,s)=>s?"z.B. Ich werde 40 und möchte das bewusst erleben.":`z.B. ${n} hat einen Meilenstein erreicht.`, goalPh:(n,s)=>s?"z.B. Mich selbst feiern.":`z.B. Dass ${n} merkt, wie weit sie gekommen ist.`, freqRec:"daily" },
  growth: { contextQ:(n,s)=>s?"Woran arbeitest du gerade?":`Woran arbeitet ${n}?`, contextPh:(n,s)=>s?"z.B. Achtsamer leben, weniger Autopilot...":`z.B. ${n} ist in einer Umbruchphase...`, goalPh:(n,s)=>s?"z.B. Klarer wissen was ich will.":`z.B. Dass ${n} Klarheit gewinnt.`, freqRec:"every3" },
};
const DEFAULT_COPY = { contextQ:(n,s)=>s?"Was beschäftigt dich?":`Erzähl uns von ${n}`, contextPh:()=>"", goalPh:()=>"", freqRec:"every3" };


const OCC = [
  { id: "tough_times", emoji: "🌧️", label: "Durch schwere Zeiten", desc: "Trennung, Trauer, Krankheit" },
  { id: "motivation", emoji: "🎯", label: "Motivation & Ziele", desc: "Sport, Prüfung, Karriere" },
  { id: "confidence", emoji: "💪", label: "Selbstvertrauen", desc: "Mut aufbauen, Neuanfang" },
  { id: "appreciation", emoji: "💛", label: "Wertschätzung", desc: "Danke sagen, Liebe zeigen" },
  { id: "celebration", emoji: "🎉", label: "Feiern & Ermutigen", desc: "Geburtstag, Meilenstein" },
  { id: "growth", emoji: "🌱", label: "Persönliches Wachstum", desc: "Achtsamkeit, Balance" },
];
const HUMOR = [{id:"dry",label:"Trocken"},{id:"wordplay",label:"Wortspiele"},{id:"warm",label:"Warmherzig"},{id:"sarcastic",label:"Sarkastisch"},{id:"none",label:"Kein Humor"}];
const STY = [
  {id:"warm",emoji:"🤗",label:"Warm & herzlich",desc:"Wie von der besten Freundin"},
  {id:"motivating",emoji:"⚡",label:"Motivierend & direkt",desc:"Wie ein Coach"},
  {id:"poetic",emoji:"✨",label:"Reflektierend & poetisch",desc:"Nachdenklich, bildreich"},
  {id:"humorous",emoji:"😄",label:"Humorvoll & leicht",desc:"Lustig mit Tiefe"},
  {id:"wise",emoji:"🌿",label:"Weise & gelassen",desc:"Wie ein Mentor"},
  {id:"custom",emoji:"✍️",label:"Eigener Stil",desc:"Beschreibe den Ton"},
];
const PKG=[{id:"trial",name:"Trial",letters:1,price:9.9,pl:"9.90",trial:true},{id:"impuls",name:"Impuls",letters:5,price:34.9,pl:"6.98"},{id:"classic",name:"Classic",letters:10,price:59.9,pl:"5.99",pop:true},{id:"journey",name:"Journey",letters:15,price:79.9,pl:"5.33"}];
const FREQ=[{id:"daily",label:"Täglich",desc:"Intensive Journey",icon:"📬"},{id:"every3",label:"Alle 3 Tage",desc:"Raum zum Nachdenken",icon:"📅"},{id:"weekly",label:"Wöchentlich",desc:"Längere Begleitung",icon:"🗓️"}];
const PAP=[{id:"standard",label:"Standard",desc:"120g-Papier, weisses Kuvert",price:0,icon:"📄"},{id:"premium",label:"Premium-Papier",desc:"200g, crèmefarbenes Kuvert",price:9.9,icon:"📜"},{id:"handwritten",label:"Handschrift-Edition",desc:"Premium-Papier + Handschrift-Font",price:19.9,icon:"✒️"}];
const REL=["Beste/r Freund/in","Partner/in","Mutter","Vater","Schwester","Bruder","Tochter","Sohn","Kolleg/in","Andere"];
const PERS=[
  {id:"bestfriend",emoji:"👋",label:"Dein bester Freund / beste Freundin",desc:"Jemand, der dich seit Jahren kennt",ph:"z.B. Mein bester Freund Tom"},
  {id:"mentor",emoji:"🧭",label:"Ein weiser Mentor",desc:"Coach, Lehrer oder Vorbild",ph:"z.B. Mein alter Trainer"},
  {id:"deceased",emoji:"🕊️",label:"Eine verstorbene Person",desc:"Jemand, dessen Stimme du vermisst",ph:"z.B. Meine Grossmutter"},
  {id:"future_self",emoji:"🔮",label:"Dein zukünftiges Ich",desc:"Die Version von dir, die es geschafft hat",ph:"z.B. Ich in 5 Jahren"},
  {id:"fictional",emoji:"📖",label:"Eine fiktive Figur",desc:"Aus Büchern, Filmen, Serien",ph:"z.B. Gandalf, Ted Lasso"},
  {id:"custom_persona",emoji:"✨",label:"Eigene Persona",desc:"Beschreibe frei",ph:"z.B. Eine warmherzige Stimme"},
];


function assessQuality(d) {
  let s=0,mx=0; const iss=[],sug=[];
  function chk(v,w,req,l,ml,mw) {
    mx+=w; if(!v||(typeof v==="string"&&v.trim().length===0)){if(!req)sug.push(l);return;}
    const t=typeof v==="string"?v.trim():String(v);
    const wds=t.split(/\s+/).filter(Boolean);const u=new Set(wds.map(x=>x.toLowerCase()));
    const avg=wds.length>0?wds.reduce((a,x)=>a+x.length,0)/wds.length:0;
    if(/(.){4,}/.test(t)||(u.size===1&&wds.length>2)||/^[^a-zA-Zäöü]+$/.test(t)){iss.push(l+": Inhalt nicht verwertbar");return;}
    if(wds.length>3&&u.size<wds.length*0.3){iss.push(l+": Viele Wiederholungen");s+=w*0.2;return;}
    if(avg>15||(avg<2&&wds.length>3)){iss.push(l+": Text ungewöhnlich");s+=w*0.3;return;}
    if(ml&&t.length<ml){s+=w*0.5;sug.push(l+" vertiefen");return;}
    if(mw&&wds.length<mw){s+=w*0.5;sug.push(l+" ausführlicher");return;}
    s+=w;
  }
  chk(d.recipientName,2,true,"Name",2);chk(d.occasion?"set":null,2,true,"Anlass");
  chk(d.contextText,4,true,"Situation",30,8);chk(d.goal,2,false,"Ziel");
  chk(d.hobbies,2,false,"Hobbies",5);chk(d.strengths,2,false,"Stärken",5);
  chk(d.memories,5,false,"Erinnerungen",30,8);chk(d.importantPeople,1,false,"Bezugspersonen");
  chk(d.humor?.length>0?"set":null,1,false,"Humor-Typ");
  const r=mx>0?s/mx:0;let lv,co,em,msg;
  if(r<0.3){lv="Unzureichend";co="#E53E3E";em="🔴";msg="Zu wenig Material.";}
  else if(r<0.5){lv="Basis";co="#DD6B20";em="🟠";msg="Grundlage da – mehr Details machen es unvergesslich.";}
  else if(r<0.7){lv="Gut";co="#D69E2E";em="🟡";msg="Gute Basis! Erinnerungen machen es noch persönlicher.";}
  else if(r<0.85){lv="Sehr gut";co="#38A169";em="🟢";msg="Stark – richtig persönliche Briefe.";}
  else{lv="Exzellent";co="#276749";em="💚";msg="Perfekt! Genug Material für Briefe, die berühren.";}
  return{score:Math.round(r*100),level:lv,color:co,emoji:em,message:msg,issues:iss,suggestions:sug};
}

function genPreview(d,isSelf) {
  const nk=d.nickname||d.recipientName||"du";
  const sa=Array.isArray(d.style)?d.style:[];
  const isH=sa.includes("humorous"),isP=sa.includes("poetic"),isW=sa.includes("warm")||sa.length===0;
  let g=isSelf?"Hey "+nk+",":"Liebe/r "+nk+",";
  if(isSelf&&d.persona==="deceased")g="Mein/e liebe/r "+nk+",";
  if(isSelf&&d.persona==="future_self")g="Hey "+nk+" –";
  const snd=isSelf?(d.personaName||"Jemand, der an dich glaubt"):(d.senderName||"Jemand, der dich kennt");
  const hobs=d.hobbies?d.hobbies.split(",").map(h=>h.trim()).filter(Boolean):[];
  const mem=(d.memories||"").trim();const str=d.strengths?d.strengths.split(",")[0]?.trim():null;
  let ln=[];
  if(mem.length>20){ln.push("Ich musste heute an etwas denken."+(isH?" Und ja, ich musste schmunzeln.":""));ln.push("Erinnerst du dich? "+(mem.length>100?mem.substring(0,100)+"...":mem));}
  else ln.push("Ich weiss, die letzten Wochen waren nicht einfach."+(isH?' Und nein, ich sage dir nicht, dass «alles gut wird».':""));
  if(hobs[0])ln.push((isP?"Es gibt Momente beim "+hobs[0]+", die alles leiser machen.":"Warst du beim "+hobs[0]+"?")+" Manchmal hilft es.");
  if(str)ln.push("Was ich "+(isSelf?"an mir":"an dir")+" bewundere: "+str+". Das vergisst man manchmal.");
  if(d.occasion==="tough_times")ln.push(isW?"Ich drücke dich ganz fest.":"Du bist stärker, als du denkst.");
  else if(d.occasion==="motivation")ln.push(isW?"Ich glaube an dich.":"Jeder Schritt zählt.");
  else ln.push(isW?"Ich denke an dich.":"Manche Menschen machen die Welt heller.");
  return g+"\n\n"+ln.join("\n\n")+"\n\n"+(isW?"Ganz fest gedrückt –":isP?"In Gedanken bei dir –":"Alles Gute –")+"\n"+snd;
}

function useInView(th=0.15){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:th});o.observe(el);return()=>o.disconnect();},[]);return[ref,v];}

export default function App() {
  const [view,setView]=useState("landing");
  const [step,setStep]=useState(0);
  const [dir,setDir]=useState(1);
  const [anim,setAnim]=useState(false);
  const [vis,setVis]=useState(false);
  const [editing,setEditing]=useState(false);
  const [prevTxt,setPrevTxt]=useState("");
  const [prevLoading,setPrevLoading]=useState(false);
  const fetchAIPreview=async()=>{if(prevTxt||prevLoading)return;setPrevLoading(true);try{const res=await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||"")+"/functions/v1/generate-preview",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"")},body:JSON.stringify({orderData:d})});const data=await res.json();if(data.preview)setPrevTxt(data.preview);else setPrevTxt(genPreview(d,isSelf));}catch(e){console.error("Preview error:",e);setPrevTxt(genPreview(d,isSelf));}finally{setPrevLoading(false);}};
  const [loading,setLoading]=useState(false);
  const [addrSugg,setAddrSugg]=useState([]);const[addrLoading,setAddrLoading]=useState(false);const addrTimer=useRef(null);
  const [d,setD]=useState({
    bookingType:null,recipientName:"",nickname:"",gender:"",relationship:"",language:"de",
    occasion:null,contextText:"",goal:"",hobbies:"",music:"",humor:[],
    strengths:"",importantPeople:"",noGo:"",memories:"",style:[],
    customStyleDesc:"",senderName:"",senderMessage:"",
    persona:null,personaName:"",personaDesc:"",
    package:null,frequency:"weekly",paperOption:"standard",
    street:"",zip:"",city:"",country:"CH",email:"",
  });
  const u=(k,v)=>setD(x=>({...x,[k]:v}));
  useEffect(()=>{setVis(false);setTimeout(()=>setVis(true),60);},[step,view]);
  const next=()=>{setDir(1);setAnim(true);setTimeout(()=>{setStep(s=>s+1);setAnim(false);},180);};
  const back=()=>{setDir(-1);setAnim(true);setTimeout(()=>{setStep(s=>s-1);setAnim(false);},180);};
  const go=(type)=>{u("bookingType",type);setView("onboarding");setStep(0);setEditing(false);setPrevTxt("");};
  const isSelf=d.bookingType==="self";
  const rN=d.recipientName||(isSelf?"dich":"die Person");
  const isTrial=d.package==="trial";
  const STEPS=isSelf
    ?["recipient","occasion","context","personality","memories","persona","style","package",...(isTrial?[]:["delivery"]),"address","preview","summary"]
    :["recipient","occasion","context","personality","memories","sender","style","package",...(isTrial?[]:["delivery"]),"address","preview","summary"];
  const STEP_LABELS={recipient:"Empfänger",occasion:"Anlass",context:"Kontext",personality:"Persönlichkeit",memories:"Geschichte",persona:"Persona",sender:"Absender",style:"Stil",package:"Paket",delivery:"Frequenz",address:"Adresse",preview:"Vorschau",summary:"Zusammenfassung"};
  const tot=STEPS.length;const sid=STEPS[step];const prog=((step+1)/tot)*100;
  const goToStep=(idx)=>{if(idx<step){setDir(-1);setAnim(true);setTimeout(()=>{setStep(idx);setAnim(false);},200);}};

  if(view==="landing")return <Landing go={go}/>;

  const I={width:"100%",padding:"14px 18px",border:"1.5px solid #D6CFC8",borderRadius:"12px",fontSize:"15px",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",background:"#FDFCFA",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box"};
  const T={...I,minHeight:"110px",resize:"vertical",lineHeight:1.7};
  const L={display:"block",fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",letterSpacing:"0.08em",marginBottom:"7px",textTransform:"uppercase"};
  const O={color:"#BEB5AA",fontWeight:400};
  const ch=(s)=>({display:"inline-flex",alignItems:"center",padding:"9px 16px",borderRadius:"100px",border:s?"2px solid #5B7B6A":"1.5px solid #D6CFC8",background:s?"#EEF4F0":"#FDFCFA",color:s?"#3D5A4C":"#6B6360",fontSize:"13.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:s?600:400,cursor:"pointer",transition:"all 0.2s",margin:"3px"});
  const cd=(s)=>({display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px 18px",borderRadius:"12px",border:s?"2px solid #5B7B6A":"1.5px solid #E0DAD4",background:s?"#EEF4F0":"#FDFCFA",cursor:"pointer",transition:"all 0.2s"});
  const fc=e=>e.target.style.borderColor="#5B7B6A";
  const bl=e=>e.target.style.borderColor="#D6CFC8";

  const canGo=()=>{switch(sid){case"recipient":return d.recipientName.length>0;case"occasion":return!!d.occasion;case"context":return d.contextText.length>10;case"style":return Array.isArray(d.style)&&d.style.length>0;case"package":return!!d.package;case"delivery":return!!d.frequency;case"persona":return!!d.persona;case"address":return d.country==="OTHER"||( d.street.length>3&&d.city.length>1&&d.country.length>0&&(()=>{const pl={CH:4,DE:5,AT:4};const req=pl[d.country]||4;return d.zip.replace(/\D/g,"").length===req;})());default:return true;}};
  const tp=()=>{const pk=PKG.find(p=>p.id===d.package);const pa=PAP.find(p=>p.id===d.paperOption);return(pk?.price||0)+(pa?.price||0);};

  const renderStep=()=>{
    switch(sid){
    case"recipient":return(<div><SH t={isSelf?"Über dich":"Wem sollen die Briefe Kraft geben?"} s={isSelf?"Damit die Briefe sich anfühlen, als kämen sie von jemandem, der dich kennt.":"Je mehr wir erfahren, desto persönlicher."}/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>Vorname</label><input style={I} placeholder={isSelf?"Dein Vorname":"z.B. Sarah"} value={d.recipientName} onChange={e=>u("recipientName",e.target.value)} onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Geschlecht <span style={{fontSize:"11px",color:"#B0A9A3",fontWeight:400}}>(für korrekte Ansprache)</span></label><div style={{display:"flex",flexWrap:"wrap"}}>{[["f","♀ Weiblich"],["m","♂ Männlich"],["x","✦ Divers"]].map(([k,l])=><span key={k} style={ch(d.gender===k)} onClick={()=>u("gender",k)}>{l}</span>)}</div></div>
        <div><label style={L}>Spitzname <span style={O}>optional</span></label><input style={I} placeholder="z.B. Sari" value={d.nickname} onChange={e=>u("nickname",e.target.value)} onFocus={fc} onBlur={bl}/></div>
        {!isSelf&&<div><label style={L}>Beziehung</label><div style={{display:"flex",flexWrap:"wrap"}}>{REL.map(r=><span key={r} style={ch(d.relationship===r)} onClick={()=>u("relationship",r)}>{r}</span>)}</div></div>}
        <div><label style={L}>Sprache</label><div style={{display:"flex",flexWrap:"wrap"}}>{[["de","🇨🇭 Deutsch"],["en","🇬🇧 English"],["fr","🇫🇷 Français"],["it","🇮🇹 Italiano"]].map(([k,l])=><span key={k} style={ch(d.language===k)} onClick={()=>u("language",k)}>{l}</span>)}</div></div>
      </div></div>);

    case"occasion":return(<div><SH t={isSelf?"Wobei sollen die Briefe helfen?":"Worum geht es?"} s="Wähle den Bereich."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>{OCC.map(o=>(<div key={o.id} onClick={()=>u("occasion",o.id)} style={{padding:"18px",borderRadius:"14px",border:d.occasion===o.id?"2px solid #5B7B6A":"1.5px solid #E0DAD4",background:d.occasion===o.id?"#EEF4F0":"#FDFCFA",cursor:"pointer"}}><div style={{fontSize:"26px",marginBottom:"6px"}}>{o.emoji}</div><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{o.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{o.desc}</div></div>))}</div></div>);

    case"context":{const _oc=OCCASION_COPY[d.occasion]||DEFAULT_COPY;return(<div><SH t={_oc.contextQ(rN,isSelf)} s="Je ehrlicher, desto wirkungsvoller."/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>{_oc.contextQ(rN,isSelf)}</label><textarea style={T} value={d.contextText} onChange={e=>u("contextText",e.target.value)} placeholder={_oc.contextPh(rN,isSelf)} onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Ziel <span style={O}>optional</span></label><textarea style={{...T,minHeight:"70px"}} value={d.goal} onChange={e=>u("goal",e.target.value)} placeholder={_oc.goalPh(rN,isSelf)} onFocus={fc} onBlur={bl}/></div>
      </div></div>);}

    case"personality":return(<div><SH t={"Persönlichkeit"+(isSelf?"":" von "+rN)} s="Details machen den Unterschied."/>
      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div><label style={L}>Hobbies</label><input style={I} value={d.hobbies} onChange={e=>u("hobbies",e.target.value)} placeholder="z.B. Yoga, Backen" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Humor-Typ</label><div style={{display:"flex",flexWrap:"wrap"}}>{HUMOR.map(h=><span key={h.id} style={ch(d.humor.includes(h.id))} onClick={()=>u("humor",d.humor.includes(h.id)?d.humor.filter(x=>x!==h.id):[...d.humor,h.id])}>{h.label}</span>)}</div></div>
        <div><label style={L}>Stärken</label><input style={I} value={d.strengths} onChange={e=>u("strengths",e.target.value)} placeholder="z.B. Loyal, mutig" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Bezugspersonen <span style={O}>optional</span></label><input style={I} value={d.importantPeople} onChange={e=>u("importantPeople",e.target.value)} placeholder='z.B. Katze "Frida"' onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>No-Go-Themen</label><input style={I} value={d.noGo} onChange={e=>u("noGo",e.target.value)} placeholder="z.B. Ex nicht erwähnen" onFocus={fc} onBlur={bl}/><div style={{fontSize:"11px",color:"#C0785A",fontFamily:"'DM Sans',sans-serif",marginTop:"5px"}}>⚠️ Themen, die nicht vorkommen sollen.</div></div>
      </div></div>);

    case"memories":return(<div><SH t={isSelf?"Deine besonderen Momente":"Eure gemeinsame Geschichte"} s={isSelf?"Worauf bist du stolz?":"Das Herzstück deiner Briefe. Beschreibe so viele Momente wie möglich – so detailliert wie möglich."}/>
      <div style={{padding:"14px 16px",background:"#FFF8F0",borderRadius:"12px",border:"1px solid #F0E4D4",marginBottom:"14px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8B6914",lineHeight:1.6}}><strong>⭐ Hier entstehen die besten Briefe.</strong> Nimm dir 5-10 Minuten Zeit. Beschreibe mehrere Erinnerungen mit allen Details: Wo wart ihr? Was ist passiert? Was wurde gesagt? Wie hat es sich angefühlt? Insider-Witze, gemeinsame Reisen, Mutmomente, peinliche Geschichten – alles ist Gold wert.</div>
      <textarea style={{...T,minHeight:"220px"}} value={d.memories} onChange={e=>u("memories",e.target.value)} placeholder={isSelf?"Beschreibe mehrere Momente, z.B.:\n\n1. Meine 3 Monate in Neuseeland – der Moment am Gipfel des Tongariro, als ich wusste: Ich kann alles schaffen...\n\n2. Der Tag, an dem ich meinen ersten Kunden gewonnen habe...":"Beschreibe mehrere Erinnerungen, z.B.:\n\n1. Unsere Interrail-Reise 2019 – als wir in Rom den letzten Zug verpasst haben und die ganze Nacht am Bahnhof gewartet haben...\n\n2. Ihr Insider-Witz über... \n\n3. Der Moment als sie..."} onFocus={fc} onBlur={bl}/>
      <div style={{marginTop:"14px",padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}><strong>💡</strong> Insider-Witze · Reisen · Mutmomente · Liebevolle Macken</div></div>);

    case"persona":return(<div><SH t="Wer soll dir die Briefe schreiben?" s="Wähle eine Stimme. Die Briefe klingen, als kämen sie von dieser Person."/>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{PERS.map(pt=>(<div key={pt.id} onClick={()=>u("persona",pt.id)} style={cd(d.persona===pt.id)}><div style={{fontSize:"24px",marginTop:"2px"}}>{pt.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{pt.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{pt.desc}</div></div>{d.persona===pt.id&&<div style={{color:"#5B7B6A",fontSize:"17px",fontWeight:700}}>✓</div>}</div>))}</div>
      {d.persona&&<div style={{marginTop:"16px"}}><label style={L}>{d.persona==="deceased"?"Name der Person":d.persona==="future_self"?"Wie spricht dein zukünftiges Ich?":"Name / Beschreibung"}</label><input style={I} value={d.personaName} onChange={e=>u("personaName",e.target.value)} placeholder={PERS.find(p=>p.id===d.persona)?.ph} onFocus={fc} onBlur={bl}/>
        {d.persona==="deceased"&&<div style={{marginTop:"12px",padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.6}}><strong>🕊️</strong> Behutsam im Ton dieser Person. Erzähl typische Sätze, Kosenamen, Eigenheiten.</div>}
        {d.persona==="future_self"&&<div style={{marginTop:"12px",padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>🔮</strong> Schreibt aus einer Position der Stärke – es hat geschafft, was du anstrebst.</div>}
        {(d.persona==="custom_persona"||d.persona==="fictional")&&<div style={{marginTop:"12px"}}><label style={L}>Stimme beschreiben <span style={O}>optional</span></label><textarea style={{...T,minHeight:"80px"}} value={d.personaDesc} onChange={e=>u("personaDesc",e.target.value)} placeholder="z.B. Spricht ruhig, nennt mich 'Kleines'..." onFocus={fc} onBlur={bl}/></div>}
      </div>}</div>);

    case"sender":return(<div><SH t="Über dich als Absender" s="Damit die Briefe authentisch klingen."/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>Dein Vorname</label><input style={I} value={d.senderName} onChange={e=>u("senderName",e.target.value)} placeholder="z.B. Lena" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Was möchtest du {rN} mitgeben? <span style={O}>optional</span></label><textarea style={{...T,minHeight:"80px"}} value={d.senderMessage} onChange={e=>u("senderMessage",e.target.value)} placeholder={rN+" soll wissen, dass ich da bin."} onFocus={fc} onBlur={bl}/></div>
        <div style={{padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>✉️ Volle Kontrolle:</strong> Du erhältst jeden Brief vor dem Versand und kannst ihn bearbeiten.</div>
      </div></div>);

    case"style":return(<div><SH t="Wie sollen die Briefe klingen?" s="Mehrere Stile kombinierbar."/>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{STY.map(s=>{const arr=Array.isArray(d.style)?d.style:[];const sel=arr.includes(s.id);return(<div key={s.id} onClick={()=>{if(s.id==="custom")u("style",[s.id]);else{const p=arr.filter(x=>x!=="custom");u("style",sel?p.filter(x=>x!==s.id):[...p,s.id]);}}} style={cd(sel)}><div style={{fontSize:"22px",width:"34px",textAlign:"center",flexShrink:0}}>{s.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{s.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{s.desc}</div></div>{sel&&<div style={{color:"#5B7B6A",fontSize:"17px",fontWeight:700}}>✓</div>}</div>);})}</div>
      {Array.isArray(d.style)&&d.style.includes("custom")&&<div style={{marginTop:"14px"}}><label style={L}>Beschreibe den Stil</label><textarea style={T} value={d.customStyleDesc} onChange={e=>u("customStyleDesc",e.target.value)} placeholder="z.B. Wie meine Oma – liebevoll, altmodisch..." onFocus={fc} onBlur={bl}/></div>}</div>);

    case"package":return(<div><SH t="Wähle dein Paket" s="Ein einzelner Brief oder eine durchkomponierte Serie."/>
      <div onClick={()=>u("package","trial")} style={{padding:"18px 22px",borderRadius:"16px",border:d.package==="trial"?"2.5px solid #5B7B6A":"1.5px dashed #D6CFC8",background:d.package==="trial"?"#F0F5EE":"#FDFCFA",cursor:"pointer",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>🔍 Trial-Brief</div><div style={{fontSize:"13px",color:"#6B6360",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.</div></div><div style={{fontSize:"22px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>CHF 9.90</div></div>
      <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"12px",fontWeight:500}}>Oder als Serie:</div>
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{PKG.filter(pk=>!pk.trial).map(pk=>(<div key={pk.id} onClick={()=>u("package",pk.id)} style={{padding:"22px",borderRadius:"16px",border:d.package===pk.id?"2.5px solid #5B7B6A":"1.5px solid #E0DAD4",background:"#FDFCFA",cursor:"pointer",position:"relative"}}>{pk.pop&&<div style={{position:"absolute",top:"-9px",right:"18px",background:"#5B7B6A",color:"#fff",fontSize:"10px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,padding:"3px 12px",borderRadius:"100px",textTransform:"uppercase"}}>Beliebt</div>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"18px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>{pk.name}</div><div style={{fontSize:"13px",color:"#7A7470",fontFamily:"'DM Sans',sans-serif"}}>{pk.letters} Briefe</div></div><div style={{textAlign:"right"}}><div style={{fontSize:"26px",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>CHF {pk.price.toFixed(2)}</div><div style={{fontSize:"12px",color:"#B0A9A3",fontFamily:"'DM Sans',sans-serif"}}>CHF {pk.pl}/Brief</div></div></div></div>))}</div></div>);

    case"delivery":{const pk=PKG.find(q=>q.id===d.package);const dy=pk?(d.frequency==="daily"?pk.letters:d.frequency==="every3"?pk.letters*3:pk.letters*7):0;return(<div><SH t="Versand & Ausstattung" s="Wie oft und in welcher Qualität?"/>
      <label style={{...L,marginBottom:"10px"}}>Frequenz</label>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"24px"}}>{FREQ.map(f=>(<div key={f.id} onClick={()=>u("frequency",f.id)} style={cd(d.frequency===f.id)}><div style={{fontSize:"20px"}}>{f.icon}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{f.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{f.desc}</div></div>{d.frequency===f.id&&<div style={{color:"#5B7B6A",fontWeight:700}}>✓</div>}</div>))}</div>
      {pk&&<div style={{padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",marginBottom:"24px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>📊 <strong>{pk.letters} Briefe</strong> × <strong>{FREQ.find(f=>f.id===d.frequency)?.label}</strong> = ca. <strong>{Math.ceil(dy/7)} Wochen</strong></div>}
      <label style={{...L,marginBottom:"10px"}}>Papier</label>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{PAP.map(po=>(<div key={po.id} onClick={()=>u("paperOption",po.id)} style={cd(d.paperOption===po.id)}><div style={{fontSize:"20px"}}>{po.icon}</div><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{po.label}</span>{po.price>0&&<span style={{fontSize:"13px",fontWeight:600,color:"#5B7B6A",fontFamily:"'DM Sans',sans-serif"}}>+ CHF {po.price.toFixed(2)}</span>}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{po.desc}</div></div>{d.paperOption===po.id&&<div style={{color:"#5B7B6A",fontWeight:700}}>✓</div>}</div>))}</div></div>);}

    case"address":{const COUNTRIES=[{id:"CH",label:"🇨🇭 Schweiz",plzLen:4,plzPh:"8001",streetPh:"Bahnhofstrasse 42",cityPh:"Zürich"},{id:"DE",label:"🇩🇪 Deutschland",plzLen:5,plzPh:"10115",streetPh:"Friedrichstraße 42",cityPh:"Berlin"},{id:"AT",label:"🇦🇹 Österreich",plzLen:4,plzPh:"1010",streetPh:"Stephansplatz 1",cityPh:"Wien"},{id:"OTHER",label:"🌍 Anderes Land anfragen"}];const cc=COUNTRIES.find(c=>c.id===d.country)||COUNTRIES[0];const plzValid=d.zip&&cc.plzLen?d.zip.replace(/\D/g,"").length===cc.plzLen:true;const plzError=d.zip.length>0&&!plzValid;
      const GEOAPIFY_KEY=process.env.NEXT_PUBLIC_GEOAPIFY_KEY||"";
      const searchAddr=(val)=>{u("street",val);if(!GEOAPIFY_KEY||val.length<4||d.country==="OTHER")return setAddrSugg([]);clearTimeout(addrTimer.current);addrTimer.current=setTimeout(async()=>{setAddrLoading(true);try{const countryFilter=d.country?`&filter=countrycode:${d.country.toLowerCase()}`:"";const res=await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&lang=de&limit=5&type=street&format=json${countryFilter}&apiKey=${GEOAPIFY_KEY}`);const data=await res.json();if(data.results)setAddrSugg(data.results.map(r=>({street:(r.street||"")+(r.housenumber?" "+r.housenumber:""),zip:r.postcode||"",city:r.city||r.town||r.village||"",country:r.country_code?.toUpperCase()||d.country,formatted:r.formatted||""})));}catch(e){console.error("Geoapify error:",e);}finally{setAddrLoading(false);}},350);};
      const selectAddr=(s)=>{u("street",s.street);u("zip",s.zip);u("city",s.city);if(s.country&&["CH","DE","AT"].includes(s.country))u("country",s.country);setAddrSugg([]);};
      return(<div><SH t={isSelf?"Wohin sollen die Briefe kommen?":"Wohin sollen die Briefe geschickt werden?"} s={isSelf?"Deine Adresse bleibt vertraulich.":"Die Adresse des Empfängers."}/>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div><label style={L}>Land</label><div style={{display:"flex",flexWrap:"wrap"}}>{COUNTRIES.map(c=><span key={c.id} style={ch(d.country===c.id)} onClick={()=>{u("country",c.id);if(c.id!==d.country){u("zip","");u("city","");u("street","");setAddrSugg([]);}}}>{c.label}</span>)}</div></div>
        {d.country==="OTHER"&&<div style={{padding:"16px",background:"#EEF4F0",borderRadius:"12px",border:"1px solid #D6E8DD",marginTop:"8px"}}><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}>📬 Wir liefern aktuell nach CH, DE und AT. Für andere Länder schreib uns an <strong>hello@letterlift.ch</strong> – wir prüfen die Möglichkeiten!</div></div>}
        {d.country!=="OTHER"&&<><div style={{position:"relative"}}><label style={L}>Strasse & Hausnummer</label><input style={I} value={d.street} onChange={e=>searchAddr(e.target.value)} placeholder={cc.streetPh||"Strasse 1"} onFocus={fc} onBlur={e=>{bl(e);setTimeout(()=>setAddrSugg([]),200);}} autoComplete="off"/>
          {addrSugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,background:"#fff",border:"1px solid #D6CFC8",borderRadius:"0 0 12px 12px",boxShadow:"0 8px 24px rgba(0,0,0,0.08)",maxHeight:"200px",overflowY:"auto"}}>{addrSugg.map((s,i)=><div key={i} onMouseDown={()=>selectAddr(s)} style={{padding:"10px 14px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",cursor:"pointer",borderBottom:i<addrSugg.length-1?"1px solid #F0EDE8":"none",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#F6F3EF"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div style={{fontWeight:500}}>{s.street}</div><div style={{fontSize:"12px",color:"#8A8480",marginTop:"2px"}}>{s.zip} {s.city}</div></div>)}</div>}
          {addrLoading&&<div style={{position:"absolute",right:"12px",top:"38px",fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>...</div>}
        </div>
        <div style={{display:"flex",gap:"12px"}}><div style={{flex:"0 0 120px"}}><label style={L}>PLZ</label><input style={{...I,borderColor:plzError?"#E53E3E":"#D6CFC8"}} value={d.zip} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,cc.plzLen||5);u("zip",v);}} placeholder={cc.plzPh||"PLZ"} maxLength={cc.plzLen||5} onFocus={fc} onBlur={bl}/>{plzError&&<div style={{fontSize:"11px",color:"#E53E3E",fontFamily:"'DM Sans',sans-serif",marginTop:"4px"}}>{cc.plzLen} Stellen erforderlich</div>}</div><div style={{flex:1}}><label style={L}>Ort</label><input style={I} value={d.city} onChange={e=>u("city",e.target.value)} placeholder={cc.cityPh||"Ort"} onFocus={fc} onBlur={bl}/></div></div></>}
      </div>
      <div style={{marginTop:"18px",padding:"14px 16px",background:"#F0F5EE",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}>🔒 Die Adresse wird ausschliesslich für den Briefversand verwendet und nicht an Dritte weitergegeben.</div>
    </div>);}

    case"preview":{const q=assessQuality(d);const gen=genPreview(d,isSelf);if(!prevTxt&&!prevLoading)fetchAIPreview();return(<div><SH t="Dein erster Brief – Vorschau" s={prevLoading?"Brief wird von unserer KI geschrieben...":"So klingt Brief Nr. 1 – geschrieben von unserer KI. Du kannst ihn bearbeiten."}/>
      <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",background:"#fff",borderRadius:"14px",border:"1.5px solid "+q.color+"33",marginBottom:"16px"}}><div style={{fontSize:"32px"}}>{q.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:q.color}}>{q.level} – {q.score}%</div><div style={{fontSize:"12px",color:"#6B6360",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{q.message}</div></div></div>
      {q.issues.length>0&&<div style={{padding:"12px 16px",background:"#FFF5F5",borderRadius:"10px",border:"1px solid #FED7D7",marginBottom:"12px"}}>{q.issues.map((x,i)=><div key={i} style={{fontSize:"12px",color:"#C53030",fontFamily:"'DM Sans',sans-serif"}}>⚠️ {x}</div>)}</div>}
      {q.suggestions.length>0&&<div style={{padding:"12px 16px",background:"#FFF8F0",borderRadius:"10px",border:"1px solid #F0E4D4",marginBottom:"12px"}}><div style={{fontSize:"12px",color:"#8B6914",fontFamily:"'DM Sans',sans-serif"}}>💡 Noch persönlicher: {q.suggestions.map((sg,si)=>{const stepMap={"Erinnerungen":"memories","Erinnerungen vertiefen":"memories","Erinnerungen ausführlicher":"memories","Hobbies":"personality","Stärken":"personality","Bezugspersonen":"personality","Ziel":"context","Humor-Typ":"style"};const target=Object.entries(stepMap).find(([k])=>sg.includes(k));const idx=target?STEPS.indexOf(target[1]):-1;return(<span key={si}>{si>0?", ":""}{idx>=0?<span onClick={()=>goToStep(idx)} style={{textDecoration:"underline",cursor:"pointer",fontWeight:600}}>{sg}</span>:sg}</span>);})}</div></div>}
      <div style={{background:d.paperOption==="standard"?"#fff":"#FFFDF7",borderRadius:"8px",boxShadow:"0 8px 32px rgba(0,0,0,0.06)",border:"1px solid #EBE7E2",minHeight:"200px"}}>
        {editing?<textarea value={prevTxt} onChange={e=>setPrevTxt(e.target.value)} style={{width:"100%",minHeight:"300px",border:"none",outline:"none",background:"transparent",fontFamily:d.paperOption==="handwritten"?"'Caveat',cursive":"'Lora',Georgia,serif",fontSize:d.paperOption==="handwritten"?"17px":"15px",lineHeight:1.85,color:"#3A3A3A",resize:"vertical",padding:"36px 32px",boxSizing:"border-box"}}/>
        :<div style={{padding:"36px 32px",fontFamily:d.paperOption==="handwritten"?"'Caveat',cursive":"'Lora',Georgia,serif",fontSize:d.paperOption==="handwritten"?"17px":"15px",lineHeight:1.85,color:"#3A3A3A",whiteSpace:"pre-wrap"}}>{prevLoading?<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:"32px",marginBottom:"12px",animation:"pulse 1.5s infinite"}}>✉️</div><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480"}}>Dein Brief wird geschrieben...</div><div style={{fontSize:"12px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3",marginTop:"6px"}}>Unsere KI erstellt deinen persönlichen ersten Brief</div><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style></div>:prevTxt||gen}</div>}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginTop:"10px"}}>
        <button onClick={()=>setEditing(!editing)} style={{padding:"8px 18px",borderRadius:"8px",border:"1.5px solid #5B7B6A",background:editing?"#5B7B6A":"transparent",color:editing?"#fff":"#5B7B6A",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>{editing?"✓ Übernehmen":"✏️ Brief bearbeiten"}</button>
        {editing&&<button onClick={()=>{setPrevTxt(gen);setEditing(false);}} style={{padding:"8px 18px",borderRadius:"8px",border:"1.5px solid #D6CFC8",background:"transparent",color:"#7A7470",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>↺ Zurücksetzen</button>}
      </div>
      <div style={{marginTop:"16px",padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>✅ Volle Kontrolle:</strong> Jeden Brief vor Versand per E-Mail einsehen, bearbeiten oder stoppen.</div></div>);}

    case"summary":{const pk=PKG.find(q=>q.id===d.package);const oc=OCC.find(o=>o.id===d.occasion);const st=Array.isArray(d.style)?d.style.map(s=>STY.find(x=>x.id===s)?.label).join(", "):"";const fr=FREQ.find(f=>f.id===d.frequency);const pa=PAP.find(q=>q.id===d.paperOption);const pe=isSelf?PERS.find(q=>q.id===d.persona):null;
      const rows=[["Typ",isSelf?"Für mich selbst":"Geschenk"],["Empfänger",d.recipientName+(d.nickname?" ("+d.nickname+")":"")],
        ...(!isSelf&&d.relationship?[["Beziehung",d.relationship]]:[]),
        ...(isSelf&&pe?[["Briefschreiber",pe.label+(d.personaName?" – "+d.personaName:"")]]:[]),
        ...(!isSelf?[["Absender",d.senderName||"–"]]:[]),
        ["Anlass",oc?.label||"–"],["Stil",st||"–"],["Paket",pk?(pk.id==="trial"?"Trial · 1 Brief":pk.name+" · "+pk.letters+" Briefe"):"–"],...(isTrial?[]:[["Frequenz",fr?.label||"–"]]),["Papier",pa?.label||"Standard"],["Adresse",d.street+", "+d.zip+" "+d.city]];
      return(<div><div style={{textAlign:"center",marginBottom:"22px"}}><div style={{fontSize:"40px",marginBottom:"6px"}}>✉️</div><h2 style={{fontSize:"24px",fontWeight:400,margin:"0 0 6px",fontFamily:"'Lora',Georgia,serif"}}>Fast geschafft!</h2></div>
        <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>{rows.map(([l,v],i)=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"11px 14px",background:i%2===0?"#F6F3EF":"transparent",borderRadius:"8px"}}><span style={{fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</span><span style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",textAlign:"right",maxWidth:"60%"}}>{v}</span></div>)}</div>
        <div style={{marginTop:"20px",padding:"18px 20px",background:"#F6F3EF",borderRadius:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>{pk?.name}</span><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>CHF {pk?.price.toFixed(2)}</span></div>
          {pa?.price>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>{pa.label}</span><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>CHF {pa.price.toFixed(2)}</span></div>}
          <div style={{borderTop:"1px solid #E0DAD4",paddingTop:"8px",marginTop:"4px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontSize:"20px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:"#3D5A4C"}}>CHF {tp().toFixed(2)}</span></div></div>
        <div style={{marginTop:"16px"}}><label style={{display:"block",fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",letterSpacing:"0.08em",marginBottom:"7px",textTransform:"uppercase"}}>E-Mail (für Bestellbestätigung)</label><input style={{width:"100%",padding:"14px 18px",border:"1.5px solid #D6CFC8",borderRadius:"12px",fontSize:"15px",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",background:"#FDFCFA",outline:"none",boxSizing:"border-box"}} type="email" value={d.email||""} onChange={e=>u("email",e.target.value)} placeholder="deine@email.ch"/></div>
        <button onClick={async()=>{if(!d.email){alert("Bitte E-Mail eingeben");return;}setLoading(true);try{const res=await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||"")+"/functions/v1/create-checkout",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"")},body:JSON.stringify({orderData:{...d,previewLetter:prevTxt||null}})});const data=await res.json();if(data.url)window.location.href=data.url;else{alert("Fehler: "+JSON.stringify(data));setLoading(false);}}catch(err){alert("Fehler: "+err.message);setLoading(false);}}} disabled={loading} style={{width:"100%",marginTop:"20px",padding:"18px",background:loading?"#999":"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:loading?"wait":"pointer"}}>{loading?"⏳ Wird vorbereitet...":"✉️ "+(isTrial?"Trial-Brief bestellen":isSelf?"Briefserie starten":"Verschenken")+" – CHF "+tp().toFixed(2)}</button>
        <p style={{fontSize:"11px",color:"#B0A9A3",fontFamily:"'DM Sans',sans-serif",textAlign:"center",marginTop:"10px"}}>Stripe · Zufriedenheitsgarantie · Jederzeit pausierbar</p></div>);}
    default:return null;}
  };

  return(<div style={{minHeight:"100vh",background:"linear-gradient(165deg,#FBF8F5 0%,#F3EDE7 100%)",fontFamily:"'Lora',Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:"660px",padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",boxSizing:"border-box"}}>
      <div onClick={()=>{setView("landing");setStep(0);setEditing(false);setPrevTxt("");}} style={{fontSize:"18px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",cursor:"pointer"}}>✉️ LetterLift</div>
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>{STEPS.map((s,i)=><div key={s} onClick={()=>goToStep(i)} style={{width:i===step?"auto":"7px",height:"7px",borderRadius:i===step?"10px":"50%",background:i<step?"#5B7B6A":i===step?"#3D5A4C":"#D6CFC8",cursor:i<step?"pointer":"default",padding:i===step?"2px 10px":"0",fontSize:"11px",fontFamily:"'DM Sans',sans-serif",color:"#fff",fontWeight:600,lineHeight:"7px",transition:"all 0.3s",display:"flex",alignItems:"center"}}>{i===step?STEP_LABELS[s]:""}</div>)}</div></div>
    <div style={{width:"88%",maxWidth:"580px",height:"3px",background:"#E0DAD4",borderRadius:"100px",overflow:"hidden",marginBottom:"28px"}}><div style={{height:"100%",width:prog+"%",background:"linear-gradient(90deg,#5B7B6A,#7C9885)",borderRadius:"100px",transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)"}}/></div>
    <div style={{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(20px)",borderRadius:"22px",boxShadow:"0 8px 40px rgba(0,0,0,0.05)",padding:"38px 36px",maxWidth:"580px",width:"88%",opacity:vis&&!anim?1:0,transform:vis&&!anim?"translateY(0)":"translateY("+dir*14+"px)",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)"}}>{renderStep()}</div>
    {sid!=="summary"&&<div style={{display:"flex",justifyContent:"space-between",maxWidth:"580px",width:"88%",marginTop:"18px",marginBottom:"40px"}}>
      <button onClick={step>0?back:()=>setView("landing")} style={{background:"transparent",color:"#7A7470",border:"none",padding:"14px 20px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← {step>0?"Zurück":"Startseite"}</button>
      <button onClick={()=>{setEditing(false);next();}} disabled={!canGo()} style={{background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"12px",padding:"14px 32px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:canGo()?"pointer":"default",opacity:canGo()?1:0.35}}>Weiter →</button></div>}
    {sid==="summary"&&<div style={{marginBottom:"40px"}}><button onClick={back} style={{background:"transparent",color:"#7A7470",border:"none",padding:"14px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← Bearbeiten</button></div>}
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Caveat:wght@400;600&display=swap');`}</style>
  </div>);
}

function SH({t,s}){return(<div style={{marginBottom:"22px"}}><h2 style={{fontSize:"22px",fontWeight:400,margin:"0 0 6px",fontFamily:"'Lora',Georgia,serif",lineHeight:1.3}}>{t}</h2><p style={{fontSize:"13.5px",color:"#8A7F76",fontFamily:"'DM Sans',sans-serif",margin:0,lineHeight:1.6}}>{s}</p></div>);}

function Landing({go}){
  const[hR,hV]=useInView(0.1);const[wR,wV]=useInView();const[tR,tV]=useInView();const[fR,fV]=useInView();const[oF,setOF]=useState(null);const[heroOcc,setHeroOcc]=useState(0);
  const sa=v=>({opacity:v?1:0,transform:v?"translateY(0)":"translateY(30px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"});
  return(<div style={{minHeight:"100vh",background:"#FBF8F5",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",overflowX:"hidden"}}>
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 6%",maxWidth:"1200px",margin:"0 auto"}}><div style={{display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"20px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>✉️ LetterLift</span><span style={{fontSize:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#5B7B6A",background:"#EEF4F0",padding:"4px 10px",borderRadius:"100px",letterSpacing:"0.05em"}}>BETA</span></div><button onClick={()=>go("gift")} style={{background:"#3D5A4C",color:"#fff",border:"none",borderRadius:"10px",padding:"10px 22px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Jetzt starten</button></nav>
    <section ref={hR} style={{...sa(hV),maxWidth:"1200px",margin:"0 auto",padding:"80px 6% 60px",display:"flex",alignItems:"center",gap:"60px",flexWrap:"wrap"}}>
      <div style={{flex:"1 1 460px",minWidth:"300px"}}><h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:400,lineHeight:1.15,margin:"0 0 20px"}}>Briefe, die<br/>wirklich <span style={{fontStyle:"italic",color:"#5B7B6A"}}>ankommen</span>.</h1><p style={{fontSize:"18px",lineHeight:1.7,color:"#6B6360",margin:"0 0 36px",maxWidth:"480px",fontFamily:"'DM Sans',sans-serif"}}>Manchmal fehlen uns die Worte – genau dann, wenn sie am meisten zählen. LetterLift schreibt sie für dich.</p>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><button onClick={()=>go("gift")} style={{background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",padding:"18px 34px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 20px rgba(61,90,76,0.25)"}}>🎁 Als Geschenk</button><button onClick={()=>go("self")} style={{background:"transparent",color:"#3D5A4C",border:"2px solid #5B7B6A",borderRadius:"14px",padding:"16px 30px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Für mich selbst</button></div>
        <div style={{marginTop:"24px",display:"flex",gap:"8px",flexWrap:"wrap"}}>{[{e:"💔",l:"Schwere Zeiten"},{e:"🎯",l:"Motivation"},{e:"💪",l:"Selbstvertrauen"},{e:"🙏",l:"Wertschätzung"},{e:"🎉",l:"Meilensteine"},{e:"🌱",l:"Neuanfang"}].map((t,i)=><span key={i} onClick={()=>setHeroOcc(i)} style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:heroOcc===i?"#fff":"#5B7B6A",background:heroOcc===i?"#5B7B6A":"#EEF4F0",padding:"6px 14px",borderRadius:"100px",cursor:"pointer",transition:"all 0.2s"}}>{t.e} {t.l}</span>)}</div></div>
      <div style={{flex:"1 1 340px",minWidth:"280px",display:"flex",justifyContent:"center"}}><div style={{position:"relative",width:"340px",height:"420px"}}>{(()=>{const previews=[{g:"Liebe Lauri,",t:"ich denke an dich. Nicht weil ich muss – sondern weil du mir wichtig bist. Erinnerst du dich an Portugal? Als wir uns komplett verfahren haben und du einfach aus dem Auto gestiegen bist? Keine gemeinsame Sprache, aber du hast mit Händen und Füssen geredet, bis die ganze Familie uns zum Essen eingeladen hat. Das bist du – du findest immer einen Weg. Auch jetzt. Zürich, neue Arbeit, Mila und Noah – du wuppst das. Nicht weil es leicht ist. Sondern weil du du bist.",s:"Deine Natalie"},{g:"Hey Sandro,",t:"hier spricht dein zukünftiges Ich. Der, der den Marathon geschafft hat. Ich weiss, bei Kilometer 25 wird dein Kopf sagen: Hör auf. Erinnerst du dich an deinen ersten 10er vor zwei Jahren? Seitenstechen ab Kilometer 6. Du wolltest aufhören. Dann lief eine Fremde neben dir und sagte: Wir laufen zusammen ins Ziel. Du hast im Ziel geweint. Dein Körper kann es – das sagt Marco, das weisst du. Jetzt muss dein Kopf folgen.",s:"Sandro nach dem Marathon"},{g:"Liebe Simi,",t:"ich sehe, wie du zweifelst. Ob der Schritt richtig war, ob du gut genug bist. Aber weisst du was? Letztes Jahr hat dir ein ehemaliger Schüler geschrieben. Er ist jetzt 19 und hat gesagt: Ohne Sie hätte ich das Gymnasium nie geschafft. Du hast an mich geglaubt, als niemand sonst es tat. Du hast den ganzen Abend geweint. Das bist du, Simi. Du veränderst Leben. Und jetzt ist es Zeit, dein eigenes zu verändern.",s:"Dein Thomas"},{g:"Lieber Papi,",t:"ich sage es zu selten. Aber wenn ich an Sonntagmorgen denke, rieche ich frischen Zopf. Seit ich denken kann, bist du in der Küche gestanden. Und das Puppenhaus – mit den funktionierenden Fensterläden und der kleinen Veranda. Drei Monate hast du daran gearbeitet, abends in der Werkstatt. Ich habe es bis heute. Du machst nie grosses Aufheben. Aber ich möchte, dass du weisst: Wir haben es gesehen. Alles.",s:"Deine Sarah"},{g:"Liebste Lena,",t:"40! Erinnerst du dich an die Liste, die wir mit 20 geschrieben haben? Einmal ans Meer ziehen, ein Buch lesen pro Woche, irgendwann den Mut haben, Nein zu sagen. Du hast mehr geschafft als draufstand – und das meiste davon stand gar nicht auf der Liste. Die Dinge, die wirklich zählen, plant man nicht. Man lebt sie einfach.",s:"Deine Anna"},{g:"Liebe Ayla,",t:"neue Stadt, neues Leben. Ich kenne dieses Gefühl – halb Angst, halb Vorfreude. Erinnerst du dich an unseren letzten Abend auf dem Lindenhof? Wir haben auf Zürich geschaut und ich habe gesagt: In einem Jahr sitzen wir auf einem Dach in Lissabon und lachen darüber. Das machen wir. Und bis dahin: Wenn das Geld knapp wird und du dich einsam fühlst – erinnere dich daran, warum du gegangen bist. Das Licht am Morgen. Das Gefühl, frei zu sein.",s:"Deine Mira"}];const p=previews[heroOcc];return(<div style={{position:"absolute",top:"10px",left:"10px",width:"300px",background:"#fff",borderRadius:"4px",padding:"32px 28px",boxShadow:"0 12px 40px rgba(0,0,0,0.08)",transform:"rotate(-1.5deg)",fontSize:"14px",lineHeight:1.8,color:"#3A3A3A",transition:"opacity 0.3s"}}><div style={{marginBottom:"12px",color:"#5B7B6A",fontStyle:"italic",fontSize:"15px"}}>{p.g}</div><div>{p.t}</div><div style={{marginTop:"16px",color:"#5B7B6A",fontSize:"14px"}}>{p.s}</div></div>);})()}
        <div style={{position:"absolute",bottom:"10px",right:"0px",width:"240px",background:"#F6F3EF",borderRadius:"8px",padding:"16px 20px",boxShadow:"0 8px 24px rgba(0,0,0,0.06)",transform:"rotate(1.5deg)",display:"flex",alignItems:"center",gap:"12px"}}><div style={{fontSize:"20px"}}>✏️</div><div><div style={{fontWeight:600,color:"#3D5A4C",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Brief bearbeiten</div><div style={{fontSize:"11px",color:"#7A7470",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>Vor dem Versand anpassen</div></div></div></div></div></section>
    <section style={{background:"#fff",padding:"80px 6%"}}><div style={{maxWidth:"640px",margin:"0 auto"}}><h2 style={{fontSize:"28px",fontWeight:400,margin:"0 0 48px",lineHeight:1.3,textAlign:"center"}}>Ein Umschlag. Dein Name.</h2>
      <div style={{display:"flex",flexDirection:"column",gap:"0",position:"relative",paddingLeft:"36px"}}>
        <div style={{position:"absolute",left:"11px",top:"24px",bottom:"24px",width:"2px",background:"linear-gradient(to bottom, #D6CFC8, #5B7B6A, #3D5A4C)",zIndex:0}}/>
        {[
          {day:"Der erste Brief",icon:"📬",desc:"Zwischen Rechnungen und Werbung liegt ein Umschlag. Dein Name darauf. Du öffnest ihn – und jemand hat an dich gedacht. Richtig gedacht. Mit Worten, die sitzen. Du liest ihn zweimal."},
          {day:"Ein paar Tage später",icon:"💌",desc:"Noch einer. Diesmal geht es um etwas, das nur ihr zwei wisst. Eine Erinnerung, ein Insider. Du musst lachen – und dann kurz schlucken."},
          {day:"Du merkst es selbst",icon:"✨",desc:"Du ertappst dich dabei, wie du beim Heimkommen zuerst den Briefkasten checkst. Der Brief heute trifft dich. Jemand sieht dich wirklich. Nicht oberflächlich. Wirklich."},
          {day:"Wochen später",icon:"🤍",desc:"Die Briefe liegen auf deinem Nachttisch. Du liest sie nochmal – an Tagen, wo du es brauchst. Kein Feed, das weiterschrollt. Kein Chat, der untergeht. Diese Worte bleiben."}
        ].map((s,i)=><div key={i} style={{position:"relative",zIndex:1,paddingBottom:i<3?"36px":"0",paddingLeft:"28px"}}>
          <div style={{position:"absolute",left:"-36px",top:"2px",width:"24px",height:"24px",borderRadius:"50%",background:i===3?"#3D5A4C":"#fff",border:i===3?"none":"2px solid #5B7B6A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",zIndex:2}}>{i===3&&<span style={{color:"#fff",fontSize:"12px"}}>♡</span>}</div>
          <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#5B7B6A",marginBottom:"6px"}}>{s.day}</div>
          <div style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:i===3?"#2D2926":"#4A4540",lineHeight:1.8,fontWeight:i===3?500:400}}>{s.desc}</div>
        </div>)}</div>
      <div style={{textAlign:"center"}}><button onClick={()=>go("gift")} style={{marginTop:"48px",background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",padding:"16px 32px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 20px rgba(61,90,76,0.2)"}}>Jemandem diese Erfahrung schenken →</button></div></div></section>
    <section ref={wR} style={{...sa(wV),maxWidth:"1000px",margin:"0 auto",padding:"80px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 40px"}}>So funktioniert's</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"20px"}}>{[{i:"💬",t:"Du erzählst",d:"Erinnerungen, Insider-Witze, gemeinsame Momente. 5-10 Minuten – alles was diese Person besonders macht."},{i:"✍️",t:"Wir schreiben, du kontrollierst",d:"Unsere KI macht aus deinen Worten eine Briefserie mit Dramaturgie. Du liest jeden Brief vorab und gibst ihn frei."},{i:"✉️",t:"Echte Post, die bleibt",d:"Gedruckt auf echtem Papier, verschickt per Post. Kein Screen, kein Algorithmus. Ein Brief, den man in der Hand hält."}].map((s,i)=><div key={i} style={{background:"#fff",borderRadius:"16px",padding:"24px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",textAlign:"center"}}><div style={{fontSize:"28px",marginBottom:"10px"}}>{s.i}</div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:"6px"}}>{s.t}</div><div style={{fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",color:"#7A7470",lineHeight:1.6}}>{s.d}</div></div>)}</div></section>
    <section style={{maxWidth:"1000px",margin:"0 auto",padding:"80px 6% 40px"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 12px"}}>Wähle dein Paket</h2><p style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",textAlign:"center",margin:"0 0 40px"}}>Jedes Paket ist eine durchkomponierte Briefserie – kein Brief wie der andere.</p>
      <div style={{background:"#fff",borderRadius:"16px",border:"1.5px dashed #D6CFC8",padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"16px",marginBottom:"24px"}}><div><div style={{fontSize:"17px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C"}}>🔍 Erstmal testen?</div><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",marginTop:"4px"}}>Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.</div></div><button onClick={()=>go("gift")} style={{background:"transparent",color:"#3D5A4C",border:"2px solid #5B7B6A",borderRadius:"12px",padding:"12px 28px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Trial-Brief · CHF 9.90</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"20px"}}>{[
        {name:"Impuls",briefe:5,preis:"34.90",pro:"6.98",desc:"Kurz und kraftvoll. Perfekt für einen klaren Anlass.",pop:false},
        {name:"Classic",briefe:10,preis:"59.90",pro:"5.99",desc:"Der ideale Bogen. 10 Briefe mit Dramaturgie – unser Bestseller.",pop:true},
        {name:"Journey",briefe:15,preis:"79.90",pro:"5.33",desc:"Für tiefe Begleitung. 15 Briefe über Wochen oder Monate.",pop:false}
      ].map((p,i)=><div key={i} style={{background:"#fff",borderRadius:"18px",padding:"32px 24px",border:p.pop?"2px solid #5B7B6A":"1.5px solid #E0DAD4",boxShadow:p.pop?"0 4px 24px rgba(91,123,106,0.12)":"0 2px 12px rgba(0,0,0,0.04)",position:"relative",textAlign:"center"}}>
        {p.pop&&<div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#5B7B6A",color:"#fff",fontSize:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,padding:"4px 16px",borderRadius:"100px",letterSpacing:"0.05em"}}>BELIEBTESTE WAHL</div>}
        <div style={{fontSize:"22px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",marginBottom:"4px"}}>{p.name}</div>
        <div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"16px"}}>{p.briefe} Briefe</div>
        <div style={{fontSize:"36px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",marginBottom:"4px"}}>CHF {p.preis}</div>
        <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"16px"}}>CHF {p.pro} pro Brief</div>
        <p style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.6,margin:"0 0 20px",minHeight:"40px"}}>{p.desc}</p>
        <button onClick={()=>go("gift")} style={{width:"100%",padding:"14px",background:p.pop?"linear-gradient(135deg,#3D5A4C,#5B7B6A)":"transparent",color:p.pop?"#fff":"#3D5A4C",border:p.pop?"none":"2px solid #5B7B6A",borderRadius:"12px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Jetzt starten</button>
      </div>)}</div>
      <div style={{marginTop:"32px"}}><p style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#2C2C2C",textAlign:"center",margin:"0 0 16px"}}>Mach es besonders – Premium-Upgrades</p>
        <div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap"}}>{[
          {icon:"📜",name:"Premium-Papier",desc:"Schweres, hochwertiges Premiumpapier",price:"+CHF 9.90"},
          {icon:"✒️",name:"Handschrift-Edition",desc:"Premium-Papier + eleganter Handschrift-Font",price:"+CHF 19.90"},
          {icon:"📸",name:"Foto-Edition",desc:"Deine Fotos passend in die Briefe integriert",price:"+CHF 19.90",soon:true}
        ].map((u,i)=><div key={i} style={{background:"#fff",border:"1.5px solid #E0DAD4",borderRadius:"14px",padding:"18px 22px",display:"flex",alignItems:"center",gap:"14px",minWidth:"260px",flex:"1",maxWidth:"360px",position:"relative",opacity:u.soon?0.7:1}}><div style={{fontSize:"28px"}}>{u.icon}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{u.name}{u.soon&&<span style={{marginLeft:"8px",fontSize:"10px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#fff",background:"#B0A9A3",borderRadius:"6px",padding:"2px 8px",verticalAlign:"middle"}}>COMING SOON</span>}</div><div style={{fontSize:"12px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginTop:"2px"}}>{u.desc}</div></div><div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:u.soon?"#B0A9A3":"#3D5A4C",whiteSpace:"nowrap"}}>{u.price}</div></div>)}</div></div>
      <p style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3",textAlign:"center",marginTop:"20px"}}>Einmalzahlung · Kein Abo · Upgrades im Bestellprozess wählbar</p>
    </section>
    <section ref={tR} style={{...sa(tV),maxWidth:"800px",margin:"0 auto",padding:"60px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 36px"}}>Unser Versprechen</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"16px"}}>{[
        {icon:"🔒",title:"Volle Kontrolle",desc:"Du siehst jeden Brief bevor er verschickt wird. Nichts geht raus ohne dein OK. Jederzeit anpassen oder stoppen."},
        {icon:"🇨🇭",title:"Schweizer Service",desc:"Entwickelt und betrieben in der Schweiz. Deine Daten bleiben geschützt."},
        {icon:"💳",title:"Kein Abo, kein Risiko",desc:"Einmalzahlung. Keine versteckten Kosten, keine automatische Verlängerung."},
        {icon:"✍️",title:"Deine Worte, unsere Feder",desc:"Du erzählst, was diese Person besonders macht. Wir verwandeln es in Briefe, die klingen, als hättest du sie selbst geschrieben."}
      ].map((p,i)=><div key={i} style={{background:"#fff",borderRadius:"14px",padding:"24px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",textAlign:"center"}}><div style={{fontSize:"28px",marginBottom:"10px"}}>{p.icon}</div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:"6px"}}>{p.title}</div><div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.7}}>{p.desc}</div></div>)}</div></section>
    <section ref={fR} style={{...sa(fV),maxWidth:"700px",margin:"0 auto",padding:"60px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 32px"}}>Häufige Fragen</h2>
      {[["Kann ich die Briefe bearbeiten?","Ja – immer. Du erhältst jeden Brief vor Versand per E-Mail und kannst ihn freigeben, anpassen oder stoppen."],["Merkt der Empfänger die KI?","Nein. Die Briefe klingen wie von einem echten Menschen."],["Kann ich Briefe an mich selbst schicken?","Ja! Du wählst sogar, wer schreibt – ein Freund, Mentor, eine verstorbene Person oder dein zukünftiges Ich."],["Wie persönlich sind die Briefe?","Hängt von deinem Input ab. Unser Qualitäts-Score zeigt dir live, wie viel Material die KI hat."],["Wohin liefert ihr?","Schweiz, Deutschland, Österreich. Weitere EU-Länder folgen."]].map(([q,a],i)=><div key={i} style={{borderBottom:"1px solid #E0DAD4"}}><div onClick={()=>setOF(oF===i?null:i)} style={{padding:"16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><span style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{q}</span><span style={{fontSize:"20px",color:"#B0A9A3",transition:"transform 0.2s",transform:oF===i?"rotate(45deg)":"none"}}>+</span></div><div style={{maxHeight:oF===i?"200px":"0",overflow:"hidden",transition:"max-height 0.3s ease"}}><p style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.7,margin:"0 0 16px"}}>{a}</p></div></div>)}</section>
    <section style={{background:"linear-gradient(135deg,#3D5A4C,#2C4038)",padding:"80px 6%",textAlign:"center"}}><h2 style={{fontSize:"32px",fontWeight:400,color:"#fff",margin:"0 0 12px"}}>Wer fällt dir gerade ein?</h2><p style={{fontSize:"16px",fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,0.7)",margin:"0 0 32px"}}>Diese eine Person, die gerade einen Brief verdient hätte. Du weisst, wen.</p>
      <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}><button onClick={()=>go("gift")} style={{background:"#fff",color:"#3D5A4C",border:"none",borderRadius:"14px",padding:"18px 36px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>🎁 Verschenken</button><button onClick={()=>go("self")} style={{background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,0.4)",borderRadius:"14px",padding:"16px 32px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Für mich selbst</button></div></section>
    <footer style={{padding:"28px 6%",textAlign:"center",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3"}}><div>© 2026 LetterLift – ein Service der Virtue Compliance GmbH, Uznach</div><div style={{marginTop:"8px",display:"flex",gap:"16px",justifyContent:"center"}}><a href="/datenschutz" style={{color:"#B0A9A3",textDecoration:"none"}}>Datenschutz</a><a href="/agb" style={{color:"#B0A9A3",textDecoration:"none"}}>AGB</a><a href="/impressum" style={{color:"#B0A9A3",textDecoration:"none"}}>Impressum</a></div></footer>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Caveat:wght@400;600&display=swap');*{box-sizing:border-box;}body{margin:0;}`}</style>
  </div>);
}
