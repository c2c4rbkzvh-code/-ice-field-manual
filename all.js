
const VERSION="1.0.0-rc8", STORE="iceFieldManualV3", DEVICE_PROFILE_KEY="iceDeviceProfileV1";
const defaults={
 dog:{name:"ILO",breed:"Belgisk Malinois",sex:"Hane",photo:"ice-photo.jpg"},
 birthDate:"2026-06-04",pickupDate:"2026-08-05",currentWorkMode:"ledig",
 shifts:[{date:"2026-08-25",type:"dag",start:"08:00",end:"17:30",note:""},{date:"2026-08-26",type:"natt",start:"17:30",end:"08:00",note:""},{date:"2026-08-31",type:"natt",start:"17:30",end:"08:00",note:""}],
 journal:[],completedMissions:{},milestones:{},environments:{},sarCompleted:{},
 favoriteExercises:[],commandProgress:{},activeProfile:"marcus",profiles:[{id:"marcus",name:"Marcus",role:"driver",icon:"👨"},{id:"anna-lena",name:"Anna-Lena",role:"family",icon:"👩"},{id:"elliot",name:"Elliot",role:"family",icon:"👤"},{id:"rasmus",name:"Rasmus",role:"family",icon:"👤"},{id:"benjamin",name:"Benjamin",role:"family",icon:"👤"}],familyTasks:[],lifeEvents:[],notificationPermissionAsked:false,activeTrainingSession:null,equipmentStatus:{},dailyCheckins:{},dailyChecklist:{},dailySchedule:{outings:["07:30","10:00","12:30","15:30","18:30","22:00"]},academyCompleted:{},physicalProgress:{},recoveryLogs:[],missionHistory:[],competenceTargets:{},nutrition:{currentFood:"Standardt Original Normal",gramsPerMeal:100,mealsPerDay:3,mealTimes:["07:00","12:00","18:00"],mealLog:{},appetiteLog:{},weights:[],plannedFood:"",switchDate:"",kcalPerKg:0,manufacturerGrams:0,protein:24,fat:0,calcium:1.65,phosphorus:0,completePuppy:false,foodPhotos:{},calculatedDailyGrams:300},crate:{sessions:[],level:1},health:{daily:{},care:[]},education:{courses:{},notes:""}
};
const equipmentLibrary=[
{id:"line5",name:"Non-stop Line Harness 5.0",category:"Sele",phase:"Valp",price:550,priority:1,note:"Lätt sele för vardag, miljö och tidigt sökarbete."},
{id:"treatpouch",name:"Belöningspouch",category:"Belöning",phase:"Nu",price:300,priority:1,note:"Snabb åtkomst till godis och liten leksak."},
{id:"longline5",name:"Långlina 5–10 meter",category:"Lina",phase:"Valp",price:350,priority:1,note:"För inkallning, miljöträning och kontrollerad frihet."},
{id:"toy",name:"Kamptrasa eller mjuk belöningsleksak",category:"Belöning",phase:"Nu",price:200,priority:1,note:"Bygger lek, relation och framtida sökbelöning."},
{id:"water",name:"Vattenflaska och hopfällbar skål",category:"Bas",phase:"Nu",price:250,priority:1,note:"Alltid med under miljö- och träningspass."},
{id:"firstaid",name:"Första hjälpen-kit för hund",category:"Säkerhet",phase:"Valp",price:500,priority:2,note:"Kompress, självhäftande linda, tasskydd och fästingverktyg."},
{id:"trackingline",name:"Spårlina 10 meter",category:"Lina",phase:"Senare valp",price:450,priority:2,note:"För mer strukturerat spår- och nosarbete."},
{id:"headlamp",name:"Pannlampa",category:"Förare",phase:"Höst/vinter",price:700,priority:2,note:"För mörkerträning och sök i terräng."},
{id:"gps",name:"GPS-halsband",category:"Teknik",phase:"Unghund",price:3500,priority:3,note:"Aktuellt när sökområden och avstånd ökar."},
{id:"linewd",name:"Non-stop Line Harness Grip WD",category:"Sele",phase:"Vuxen",price:1000,priority:3,note:"Operativ arbetssele när ILO är färdigväxt."}
];
let state=load(), pendingPhoto="";
const storedDeviceProfile=localStorage.getItem(DEVICE_PROFILE_KEY);if(storedDeviceProfile&&state.profiles.some(p=>p.id===storedDeviceProfile))state.activeProfile=storedDeviceProfile;
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const p=JSON.parse(localStorage.getItem(STORE)||"null");return p?{...clone(defaults),...p}:clone(defaults)}catch(e){return clone(defaults)}}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));renderAll()}catch(e){alert("Lagringen är full. Exportera en backup och ta bort några bilder.")}}
function dateOnly(s){return new Date(s+"T12:00:00")}function isoToday(){return new Date().toISOString().slice(0,10)}
function svDate(s){return dateOnly(s).toLocaleDateString("sv-SE",{day:"numeric",month:"long",year:"numeric"})}
function daysBetween(a,b){return Math.round((dateOnly(b)-dateOnly(a))/86400000)}
function ageParts(){const total=Math.max(0,Math.floor((new Date()-dateOnly(state.birthDate))/86400000));return{days:total,weeks:Math.floor(total/7),rest:total%7}}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function phase(){const w=ageParts().weeks;if(new Date()<dateOnly(state.pickupDate))return["Förberedelse","Hemmet, rutiner och planering."];if(w<12)return["Trygg start","Relation, sömn, lek och lugn miljö."];if(w<16)return["Grundperiod","Inkallning, följsamhet och enkel nos."];if(w<24)return["Upptäckarperiod","Miljö, personsök som lek och återhämtning."];if(w<40)return["Unghund","Självkontroll, uthållighet och progression."];return["Fortsatt utveckling","Individanpassad SAR-träning."]}
function shiftForDate(d){return state.shifts.find(s=>s.date===d)||null}
function effectiveMode(){const s=shiftForDate(isoToday());return s?s.type:state.currentWorkMode}
function workAdvice(m){return{ledig:"Ledig: fördela korta pass över dagen och lämna gott om sömn.",dag:"Dagpass: ett kort pass före jobbet. Familjen prioriterar rastning, lugn och sömn.",natt:"Nattpass: håll förmiddagen lugn och gör bara ett kort kvalitetspass före arbetet.",dygn:"Dygnspass: planera ansvarig person, rastning och återhämtning. Undvik långvarig onödig burvistelse.",annat:"Anpassa träningen till frånvarons längd och kvaliteten på tillsynen."}[m]||""}
function shiftLabel(s){if(!s)return"Inget pass registrerat idag.";const n={ledig:"Ledig",dag:"Dagpass",natt:"Nattpass",dygn:"Dygnspass",annat:"Annat pass"};return`${n[s.type]||s.type}${s.start||s.end?` · ${s.start||"–"}–${s.end||"–"}`:""}${s.note?" · "+s.note:""}`}
function recentJournal(days=7){const cut=new Date();cut.setDate(cut.getDate()-days);return state.journal.filter(j=>dateOnly(j.date)>=cut)}
function workload(){const r=recentJournal(3),mins=r.reduce((a,j)=>a+(+j.minutes||0),0),poor=r.filter(j=>+j.rating<=2).length;let level="Låg",score=88,text="Bra utrymme för ett kort kvalitetspass.";if(mins>45||poor>=1){level="Måttlig";score=70;text="Välj kort träning och prioritera återhämtning."}if(mins>80||poor>=2){level="Hög";score=48;text="Planera en lugn dag med vila, relation och mycket låg belastning."}if(["natt","dygn"].includes(effectiveMode())){score-=12;text+=" Arbetspasset sänker dagens rekommenderade belastning."}return{level,score:Math.max(30,score),text}}
const environments=["Trädgård","Bil","Skog","Grus","Asfalt","Trapphus","Hiss","Bro","Tågstation","Centrum","Butiksmiljö","Hamnområde","Vattenkant","Mörker","Höga ljud","Brandstation","Veterinär","Nya vuxna hundar"];
const milestones=[["home","Trygg hemma","Äter, sover och återhämtar sig."],["name","Namnet fungerar","Orienterar sig snabbt mot föraren."],["recall","Första säkra inkallningen","Kommer glatt i lätt miljö."],["play","Aktiv förarlek","Leker och stannar i relationen."],["nose","Första nosuppgiften","Söker självständigt efter foder eller föremål."],["person","Första personsöket","Hittar en lätt gömd figurant."],["mark","Tydlig markering","Visar konsekvent beteende vid fynd."]];
const sarSteps=[
 ["foundation","1. Relation och belöning","ILO väljer föraren, kan leka och återhämta sig."],
 ["nose","2. Nosintresse","Självständiga godissök och enkla föremålssök."],
 ["runner","3. Springfigurant","Synlig figurant springer bort och belönar kraftigt."],
 ["hidden","4. Enkel dold figurant","Kort avstånd, lätt vind och tydlig belöning."],
 ["indication","5. Markering","Utveckla skall, återgång eller annan vald markering."],
 ["wind","6. Vindarbete","Förstå vindriktning och låt ILO lösa vittringen."],
 ["search","7. Söksystem","Korta systematiska sök med hög lyckandefrekvens."],
 ["duration","8. Uthållighet","Öka tid, terräng och svårighet gradvis."],
 ["operational","9. Operativ generalisering","Mörker, buller, ruiner och realistiska figuranter."]
];
const courseRoadmap=[
 {id:"puppy",title:"Valpkurs",age:"Planera 10–12 veckor · start ca 12–16 veckor",planWeek:10,startWeek:12,detail:"Boka i god tid. Fokus på relation, belöning, miljö, hantering och vardagsfärdigheter – inte prestationskrav."},
 {id:"basic",title:"Grund-/allmänlydnad",age:"Efter valpkurs · ungefär 4–8 månader",planWeek:18,startWeek:22,detail:"Bygg följsamhet, inkallning, stadga och samarbete. Anpassa belastningen till unghunden."},
 {id:"search_intro",title:"Sök / nosarbete",age:"Lekfull grund från valp · mer strukturerat under unghundstiden",planWeek:16,startWeek:24,detail:"Skogssök, figurantintresse och nosarbete ska utvecklas med hög motivation och låg press."},
 {id:"obedience",title:"Kurs inför lydnadsprov",age:"Planeras under unghundstiden",planWeek:36,startWeek:44,detail:"Skånes förkrav anger påbörjad/genomförd kurs inför lydnadsprov. Sikta på stabil vardagslydnad först."},
 {id:"mhbph",title:"MH / BPH",age:"Planera när ILO närmar sig lämplig provålder",planWeek:48,startWeek:52,detail:"Mental status ska vara känd enligt de krav som gäller när ansökan görs."},
 {id:"hde",title:"HD / ED-röntgen",age:"Planera kring rekommenderad ålder",planWeek:48,startWeek:52,detail:"Höfter och armbågar behöver vara röntgade med godtagbart resultat enligt aktuella krav."},
 {id:"rescue_course",title:"Ansökan räddningshundutbildning",age:"Lämplig kursstart enligt SBK: ca 1–3 år",planWeek:52,startWeek:60,detail:"När förkraven är på plats: följ aktuell kursstart i Skåne och kontrollera samtliga krav före ansökan."}
];
const rescueRequirements=[
 ["mental","MH/BPH","Känd mental status enligt aktuella SBK-krav"],
 ["hde","HD/ED","Röntgen och godtagbart resultat enligt aktuella krav"],
 ["obedience","Lydnadsprov","Förbered kurs/prov enligt Skånes aktuella förkrav"],
 ["search","Sökerfarenhet","Erfarenhet av exempelvis skogssök eller specialsök"],
 ["idhealth","ID, försäkring & hälsa","Kontrolleras inför formell utbildning/prov"],
 ["environment","Miljö & höjd","Trygg och arbetsbar i krävande miljöer"],
 ["gun","Skottfasthet","Krav bedöms enligt aktuella provregler"]
];
const exerciseLibrary=[
 {id:"rel_name",cat:"relation",title:"Namnleken",minWeeks:8,maxWeeks:20,duration:2,load:1,goal:"Snabb orientering mot föraren.",steps:["Säg ILO en gång.","Belöna omedelbart när han vänder huvudet.","Avsluta efter 4–6 lyckade repetitioner."],mistake:"Upprepa inte namnet flera gånger.",progress:"Respons inom en sekund i lugn miljö."},
 {id:"rel_follow",cat:"relation",title:"Följ mig",minWeeks:8,maxWeeks:24,duration:3,load:1,goal:"Bygga frivillig följsamhet.",steps:["Backa några steg.","Belöna när ILO följer.","Byt riktning mjukt."],mistake:"Dra inte i kopplet.",progress:"Följer 5–10 meter frivilligt."},
 {id:"recall_short",cat:"inkallning",title:"Kort inkallning",minWeeks:8,maxWeeks:40,duration:3,load:1,goal:"Skapa hög fart mot föraren.",steps:["Låt en hjälpare hålla lätt.","Backa och kalla en gång.","Belöna nära kroppen."],mistake:"Kalla inte när du tror att han kommer misslyckas.",progress:"Fem säkra repetitioner i lätt miljö."},
 {id:"nose_food",cat:"nos",title:"Godissök i gräs",minWeeks:8,maxWeeks:52,duration:5,load:1,goal:"Utveckla självständigt nosarbete.",steps:["Strö 5–10 små bitar.","Säg ett konsekvent sökord.","Låt ILO lösa uppgiften utan hjälp."],mistake:"Peka inte ut varje bit.",progress:"Söker lugnt och systematiskt."},
 {id:"nose_boxes",cat:"nos",title:"Kartongsök",minWeeks:10,maxWeeks:80,duration:5,load:2,goal:"Söka bland enkla behållare.",steps:["Placera tre kartonger.","Göm belöning i en.","Låt ILO undersöka fritt."],mistake:"Öka inte antalet för snabbt.",progress:"Söker alla kartonger utan stress."},
 {id:"env_surface",cat:"miljo",title:"Nytt underlag",minWeeks:8,maxWeeks:60,duration:4,load:1,goal:"Trygghet på olika underlag.",steps:["Låt ILO närma sig frivilligt.","Belöna nyfikenhet.","Gå av innan osäkerhet växer."],mistake:"Locka inte över vid tydlig rädsla.",progress:"Kan stanna, äta och återhämta sig."},
 {id:"env_sound",cat:"miljo",title:"Ljud på avstånd",minWeeks:10,maxWeeks:70,duration:4,load:2,goal:"Neutralitet till vardagsljud.",steps:["Starta på långt avstånd.","Belöna lugn orientering.","Avsluta tidigt."],mistake:"Gå inte närmare bara för att han är tyst.",progress:"Kan ta belöning och återgå till kontakt."},
 {id:"sar_runner",cat:"sar",title:"Springfigurant",minWeeks:14,maxWeeks:120,duration:6,load:2,goal:"Skapa stark motivation att hitta människa.",steps:["Figurant leker kort.","Figuranten springer synligt 20–30 meter.","Släpp ILO och låt figuranten belöna."],mistake:"Försvåra inte gömman för tidigt.",progress:"Springer direkt och stannar engagerad hos figuranten."},
 {id:"sar_hidden",cat:"sar",title:"Enkel dold figurant",minWeeks:20,maxWeeks:160,duration:8,load:3,goal:"Första självständiga personsöket.",steps:["Låt figuranten försvinna bakom enkel skärm.","Vänta kort.","Skicka ILO mot vinden."],mistake:"Undvik långa söktider.",progress:"Hittar snabbt och förblir engagerad."},
 {id:"recovery_mat",cat:"aterhamtning",title:"Lugn på filt",minWeeks:8,maxWeeks:200,duration:5,load:1,goal:"Träna aktiv återhämtning.",steps:["Lägg ut filten.","Belöna lugna beteenden.","Ge något att tugga på och avsluta utan signal."],mistake:"Kräv inte lång liggtid.",progress:"Kan varva ner inom några minuter."}
];

const academyLessons=[
{id:"a_home",phase:"8–10 veckor",minWeeks:8,title:"Trygg hemkomst",cat:"Relation",minutes:8,goal:"ILO kan äta, vila och söka stöd i den nya miljön.",why:"Trygghet och återhämtning är förutsättningar för inlärning.",steps:["Skapa en fast sovplats och lugn rastningsväg.","Låt ILO själv initiera kontakt.","Håll besök och nya intryck korta."],mistakes:["För många besök första dagarna","Att väcka valpen för träning","Att pressa fram kontakt"],test:"ILO kan somna, äta och återhämta sig efter ett milt nytt intryck.",path:["Trygghet","Relation","Förarförtroende","Operativ återhämtning"],sources:["AVSAB socialisering","SKK valputveckling"]},
{id:"a_reward",phase:"8–12 veckor",minWeeks:8,title:"Belöningssystem",cat:"Motivation",minutes:6,goal:"Bygga värde i mat, lek och social belöning.",why:"En arbetshund behöver flera fungerande belöningar som kan användas i olika miljöer.",steps:["Testa små mjuka matbitar.","Lek kort med trasa nära kroppen.","Avsluta medan intresset är högt."],mistakes:["För långa kamppass","Att ta leksaken utan byte","Samma belöning i alla situationer"],test:"ILO väljer minst två belöningstyper och återgår snabbt till föraren.",path:["Belöning","Engagemang","Träningsuthållighet","Sökbelöning"],sources:["Positiv förstärkning","Arbetshundspraktik"]},
{id:"a_name",phase:"8–12 veckor",minWeeks:8,title:"Namn och orientering",cat:"Kontakt",minutes:4,goal:"Snabb frivillig orientering mot föraren.",why:"Orientering är grunden för inkallning, följsamhet och säkerhet.",steps:["Säg ILO en gång.","Belöna direkt när huvudet vänds.","Gör 4–6 repetitioner och sluta."],mistakes:["Upprepa namnet","Använda namnet som tillsägelse","Träna i för svår miljö"],test:"8 av 10 responser inom en sekund i lugn miljö.",path:["Orientering","Kontakt","Inkallning","Operativ styrbarhet"],sources:["Inlärningsteori","Belöningsbaserad träning"]},
{id:"a_crate",phase:"8–16 veckor",minWeeks:8,title:"Bur och bilvila",cat:"Återhämtning",minutes:8,goal:"Frivillig trygghet i buren hemma och i bilen.",why:"Räddningshundar behöver kunna vänta och återhämta sig mellan arbetspass.",steps:["Mata nära och sedan inne i öppen bur.","Stäng luckan en sekund och öppna innan oro.","Öka tid före avstånd och störning."],mistakes:["Långa första pass","Bara använda buren när ni lämnar","Släppa ut mitt i panik utan att backa planen"],test:"ILO går in frivilligt och kan vila lugnt 10 minuter med förare nära.",path:["Bustrygghet","Passivitet","Återhämtning","Operativ väntan"],sources:["Gradvis desensitisering","Veterinär beteendemedicin"]},
{id:"a_env",phase:"8–16 veckor",minWeeks:8,title:"Miljökompetens",cat:"Miljö",minutes:10,goal:"Nyfiken och återhämtningsbar i nya miljöer.",why:"Kvaliteten på socialisering är viktigare än antal exponeringar.",steps:["Välj en mild ny miljö.","Ge valpen valmöjlighet och avstånd.","Belöna undersökande och avsluta tidigt."],mistakes:["Tvinga över underlag","Stanna tills valpen ger upp","Flera svåra miljöer samma dag"],test:"ILO kan ta belöning, undersöka och återgå till kontakt.",path:["Nyfikenhet","Miljöstabilitet","Terrängarbete","Ruin- och skogsök"],sources:["AVSAB","Fear Free-principer"]},
{id:"a_nose",phase:"10–20 veckor",minWeeks:10,title:"Nosens självständighet",cat:"Nos",minutes:8,goal:"Lösa enkla doftproblem utan handhjälp.",why:"Självständigt nosarbete bygger problemlösning utan att minska förarsamarbetet.",steps:["Strö foder i kort gräs.","Ge en konsekvent startsignal.","Stå still och låt ILO lösa uppgiften."],mistakes:["Peka ut fynd","För stora sökområden","För lång tid utan framgång"],test:"Systematiskt sök i 1–2 minuter med lugn intensitet.",path:["Nosintresse","Självständighet","Vindarbete","Personsök"],sources:["Detection dog development","Bruksprovstradition"]},
{id:"a_mark",phase:"5–9 månader",minWeeks:20,title:"Markeringsgrund – rulle",cat:"SAR",minutes:8,goal:"Frivilligt gripa och bära rulle tillbaka till föraren.",why:"Markeringen byggs som en separat beteendekedja innan den kopplas till figurant.",steps:["Belöna blick och gripande av rullen.","Bygg kort bärande mot föraren.","Byt mot belöning och skicka tillbaka till lek."],mistakes:["Koppla figurant för tidigt","Kräva långt bärande","Korrigera tappad rulle"],test:"Tar rullen och kommer 3–5 meter till föraren i lätt miljö.",path:["Gripa","Bära tillbaka","Påvisning","Räddningshundsmarkering"],sources:["Beteendekedjor","SBK räddningshund"]}
];
academyLessons.push(
{id:"a_home",phase:"8–9 veckor",minWeeks:8,title:"Hemkomsten – första 72 timmarna",cat:"Trygghet",minutes:5,goal:"Skapa förutsägbarhet, vila och trygg anknytning.",why:"En lugn start minskar onödig belastning och gör det lättare för valpen att knyta an till familjen.",steps:["Visa sovplats, vatten och rastningsväg.","Håll besök och utflykter mycket begränsade.","Belöna frivillig kontakt och låt ILO sova ostört."],mistakes:["För många besök","För långa vakna perioder","Krav på lydnad första dygnen"],test:"ILO kan äta, sova och söka kontakt i hemmet utan ihållande stress.",path:["Trygghet","Relation","Inlärning","Arbetshund"],sources:["Valputveckling","Etablerad praktik"]},
{id:"a_reward",phase:"8–10 veckor",minWeeks:8,title:"Belöningssystemet",cat:"Relation",minutes:4,goal:"Kartlägga mat, lek och social belöning.",why:"En arbetshund behöver flera belöningar som fungerar i olika situationer.",steps:["Testa tre mjuka godbitar separat.","Testa kort kamp eller jaktlek.","Notera vad som ger högst och lugnast engagemang."],mistakes:["För lång lek","Samma belöning överallt","Belöning efter att fokus tappats"],test:"ILO väljer tydligt minst två belöningstyper och återgår snabbt till föraren.",path:["Belöning","Motivation","Samarbete","Sök"],sources:["Inlärningsteori","Working dog practice"]},
{id:"a_crate",phase:"8–12 veckor",minWeeks:8,title:"Bur och bil – frivillig vila",cat:"Vardag",minutes:5,goal:"Bygga lugn och trygghet i buren utan isolering.",why:"Frivillig burvila är en viktig säkerhets- och återhämtningsfärdighet för framtida resor och insatser.",steps:["Servera delar av måltiden i öppen bur.","Belöna att ILO går in och lägger sig.","Stäng kort när han redan är lugn och öppna innan oro."],mistakes:["Lång tid för tidigt","Bara använda buren när ni lämnar","Öppna mitt i kraftig aktivitet"],test:"Vilar lugnt 5–10 minuter med föraren nära.",path:["Burtrygghet","Bilvila","Väntan","Operativ återhämtning"],sources:["Gradvis tillvänjning","Etablerad praktik"]},
{id:"a_handling",phase:"8–12 veckor",minWeeks:8,title:"Kooperativ hantering",cat:"Hälsa",minutes:3,goal:"ILO deltar frivilligt i kontroll av tassar, öron och mun.",why:"Kooperativ hantering minskar konflikt och underlättar veterinärvård och skadebedömning.",steps:["Rör en tass kort och belöna.","Låt ILO lämna och återkomma frivilligt.","Bygg en kroppsdel i taget."],mistakes:["Hålla fast","Träna när valpen är övertrött","Gå vidare trots undanmanöver"],test:"Accepterar 3–5 sekunders lugn kontroll av varje tass.",path:["Hantering","Hälsokontroll","Första hjälpen","Operativ säkerhet"],sources:["Kooperativ vård","Fear Free principles"]},
{id:"a_recall_game",phase:"9–12 veckor",minWeeks:9,title:"Inkallning som lek",cat:"Inkallning",minutes:4,goal:"Skapa reflexmässig rörelse mot föraren.",why:"Tidiga lyckade inkallningar bygger fart och känslomässigt värde innan störningarna ökar.",steps:["Två personer sitter nära varandra.","Kalla en gång och belöna nära kroppen.","Skicka tillbaka till nästa person som en lek."],mistakes:["Kalla från svår störning","Fånga och avsluta varje gång","Upprepa signalen"],test:"Fem snabba raka inkallningar på 3–5 meter.",path:["Namnrespons","Inkallning","Följsamhet","Säkerhet"],sources:["Positiv förstärkning","Brukshundsträning"]},
{id:"a_settle",phase:"9–14 veckor",minWeeks:9,title:"Av-knapp på filt",cat:"Återhämtning",minutes:5,goal:"Lära kroppen växla från aktivitet till vila.",why:"Förmågan att återhämta sig är central för hållbar träning och framtida väntan mellan arbetsuppgifter.",steps:["Placera en filt i lugn miljö.","Belöna spontant liggande och mjuka rörelser.","Minska belöningsfrekvensen när andningen blir lugn."],mistakes:["Kommendera plats upprepade gånger","Träna efter överstimulering","Kräva lång tid"],test:"Ligger avslappnat 2 minuter med föraren stilla.",path:["Passivitet","Återhämtning","Väntan","Operativ uthållighet"],sources:["Arousal regulation","Etablerad praktik"]},
{id:"a_environment",phase:"10–14 veckor",minWeeks:10,title:"Miljötriangeln",cat:"Miljö",minutes:8,goal:"Träna underlag, ljud och social miljö utan att överbelasta.",why:"Kontrollerad variation bygger generalisering bättre än många intensiva exponeringar.",steps:["Välj endast en ny huvudfaktor.","Börja på avstånd där ILO kan äta och tänka.","Avsluta efter en tydlig återhämtning."],mistakes:["Tre svåra faktorer samtidigt","Locka förbi rädsla","Stanna tills valpen vänjer sig"],test:"Kan orientera, ta belöning och återgå till normal aktivitet.",path:["Miljötrygghet","Generalisering","Terräng","SAR"],sources:["Habituering","Valpsocialisering"]},
{id:"a_play_return",phase:"10–16 veckor",minWeeks:10,title:"Lek och återgång",cat:"Relation",minutes:4,goal:"Bygga intensiv lek som kan avslutas och startas om.",why:"Kontrollerbar lek blir senare en kraftfull belöning i sök och markering.",steps:["Starta 5–10 sekunders kamp.","Byt lugnt mot godis eller ny leksak.","Starta om leken som belöning för återgång."],mistakes:["Rycka högt i valpens nacke","Ta leksaken och avsluta alltid","För långa kamper"],test:"Kan leka, släppa och direkt återengagera tre gånger.",path:["Lek","Belöningskontroll","Figurantbelöning","Personsök"],sources:["Belöningsutveckling","Working dog play"]},
{id:"a_body",phase:"10–16 veckor",minWeeks:10,title:"Kroppsmedvetenhet",cat:"Fysik",minutes:4,goal:"Utveckla tassplacering, balans och lugn rörelsekvalitet.",why:"Tidigt fokus på kontroll snarare än styrka skapar en bättre grund för ojämn terräng.",steps:["Gå över tre markbommar på marken.","Pausa på en stabil låg matta.","Låt ILO gå i egen takt."],mistakes:["Höga hinder","Fart","Många repetitioner"],test:"Fyra lugna passager utan att rusa eller snubbla upprepade gånger.",path:["Koordination","Balans","Terräng","Framkomlighet"],sources:["Canine conditioning","Valpsäker träning"]},
{id:"a_alone",phase:"10–16 veckor",minWeeks:10,title:"Ensamhet i mikrodoser",cat:"Vardag",minutes:4,goal:"Bygga trygghet när människor kort lämnar synfältet.",why:"Gradvis ensamhetsträning förebygger att frånvaro först blir en stor och svår händelse.",steps:["Lämna rummet 1–3 sekunder när ILO är lugn.","Kom tillbaka innan oro.","Variera tid mycket långsamt."],mistakes:["Träna när ILO är uppvarvad","Öka efter ett enda lyckat försök","Låta honom skrika sig trött"],test:"Kan vara lugn 30–60 sekunder med trygg aktivitet.",path:["Trygg frånvaro","Vardag","Familjelogistik","Arbetsliv"],sources:["Gradvis desensitisering","Separation prevention"]},
{id:"a_person",phase:"12–18 veckor",minWeeks:12,title:"Första springfiguranten",cat:"SAR",minutes:8,goal:"Skapa maximal glädje i att hitta en människa.",why:"En tydlig synlig flykt bygger sökmotivation utan att kräva avancerad problemlösning.",steps:["Figuranten leker kort och visar belöningen.","Figuranten springer 15–25 meter och gömmer sig lätt.","Släpp ILO och låt figuranten belöna direkt."],mistakes:["För svår gömma","För många repetitioner","Krav på markering"],test:"Springer självständigt och engagerar sig hos figuranten.",path:["Figurantintresse","Springfigurant","Dold figurant","Personsök"],sources:["Räddningshundspraktik","Motivationssök"]},
{id:"a_generalize",phase:"14–20 veckor",minWeeks:14,title:"Generalisera utan att försvåra",cat:"Inlärning",minutes:6,goal:"Flytta kända färdigheter till nya lätta miljöer.",why:"Hundar generaliserar inte automatiskt; samma beteende måste tränas i flera sammanhang.",steps:["Välj en välkänd övning.","Byt endast plats, inte svårighetsnivå.","Sänk kriteriet och belöna tidigt."],mistakes:["Ny plats och hög störning samtidigt","Förvänta samma precision","Långa pass"],test:"Klarar färdigheten i tre olika lätta miljöer.",path:["Färdighet","Generalisering","Stabilitet","Operativ användning"],sources:["Stimulus generalization","Inlärningsteori"]}
);
const physicalExercises=[
{id:"p_surfaces",area:"Balans",title:"Olika underlag",minWeeks:8,load:1,dose:"2–4 minuter",goal:"Stabiliserande muskulatur och proprioception.",steps:["Gå långsamt över gräs, matta och låg presenning.","Låt ILO välja tempo.","Avsluta efter några lugna passager."],avoid:"Hala eller höga underlag."},
{id:"p_poles",area:"Koordination",title:"Låga markbommar",minWeeks:10,load:1,dose:"2 × 4 passager",goal:"Kontrollerad tassplacering och rörelsekvalitet.",steps:["Lägg 3–4 bommar direkt på marken.","Gå i skritt med gott avstånd.","Belöna framåt och lågt."],avoid:"Höga bommar eller trav i fart."},
{id:"p_hill",area:"Bakdel",title:"Lugn uppförsbacke",minWeeks:12,load:1,dose:"2–3 korta backar",goal:"Aktivera lår, höftsträckare och bål naturligt.",steps:["Välj svag lutning och fast underlag.","Gå i lugn skritt.","Vänd eller vila före trötthet."],avoid:"Brant backe, drag eller långa repetitioner."},
{id:"p_stand",area:"Bål",title:"Stå stabilt",minWeeks:12,load:1,dose:"3 × 5–10 sek",goal:"Postural kontroll genom bål och bog.",steps:["Locka till jämnt stående.","Belöna mellan framtassarna.","Håll bara några sekunder."],avoid:"Instabil utrustning eller lång statisk tid."},
{id:"p_reverse",area:"Bakdel",title:"Ett steg bakåt",minWeeks:16,load:1,dose:"3–5 repetitioner",goal:"Medveten bakbensanvändning och lårkontroll.",steps:["Stå nära framför ILO.","Flytta dig mjukt mot honom.","Belöna första frivilliga baksteget."],avoid:"Press, många steg eller halt golv."},
{id:"p_cavaletti",area:"Bog",title:"Cavaletti i skritt",minWeeks:24,load:2,dose:"2 × 4 passager",goal:"Kontrollerad bogrörlighet, bål och diagonal koordination.",steps:["Använd låga jämna bommar.","Skritta rakt och långsamt.","Filma gärna från sidan för rörelsekvalitet."],avoid:"Fart, hopp eller trött hund."},
{id:"p_sitstand",area:"Lår",title:"Sitt–stå med kvalitet",minWeeks:32,load:2,dose:"2 × 3 repetitioner",goal:"Funktionell styrka i lår och höft.",steps:["Sitt rakt på halkfritt underlag.","Locka fram till ett kontrollerat stå.","Pausa mellan repetitionerna."],avoid:"Sneda sitt, många repetitioner eller smärta."},
{id:"p_hill_adult",area:"Bog & lår",title:"Backintervaller i skritt",minWeeks:52,load:3,dose:"3–5 × 30–60 sek",goal:"Arbetsstyrka i bog, bål och bakdel.",steps:["Värm upp 10 minuter.","Gå kontrollerat uppför.","Vila helt på vägen ned."],avoid:"Tung dragbelastning utan professionell bedömning."}
];
const commandLibrary=[
 {id:"name",name:"ILO",cat:"kontakt",meaning:"Vänd uppmärksamheten mot föraren.",signal:"Ingen fast handgest.",who:"Alla",steps:["Säg namnet en gång.","Belöna omedelbar orientering.","Använd inte namnet som tillsägelse."],activities:["Namnleken","Följ mig"]},
 {id:"hit",name:"Hit",cat:"inkallning",meaning:"Kom snabbt hela vägen till föraren.",signal:"Öppna armar eller hand nära kroppen.",who:"Alla",steps:["Träna först på mycket kort avstånd.","Belöna nära kroppen.","Säkra situationen så signalen lyckas."],activities:["Kort inkallning"]},
 {id:"sitt",name:"Sitt",cat:"position",meaning:"Sätt dig och behåll positionen kort.",signal:"Handflata uppåt.",who:"Alla",steps:["Fånga frivilliga sitt.","Lägg på ordet när beteendet är tydligt.","Öka tid före störning."],activities:["Lugn på filt"]},
 {id:"ligg",name:"Ligg",cat:"position",meaning:"Lägg dig ner.",signal:"Handen förs lugnt nedåt.",who:"Alla",steps:["Belöna lågt mellan framtassarna.","Undvik att trycka hunden ner.","Träna på flera underlag."],activities:["Lugn på filt"]},
 {id:"vanta",name:"Vänta",cat:"kontroll",meaning:"Pausa och invänta ny information.",signal:"Öppen handflata mot hunden.",who:"Alla",steps:["Börja med en halv sekund.","Frikommendera tydligt.","Öka en variabel åt gången."],activities:["Nytt underlag"]},
 {id:"varsa",name:"Varsågod",cat:"frikommando",meaning:"Du får lämna positionen eller ta belöningen.",signal:"Mjuk handrörelse framåt.",who:"Alla",steps:["Använd alltid samma ord.","Säg det innan hunden bryter.","Gör skillnad mot söksignal."],activities:["Godissök i gräs"]},
 {id:"loss",name:"Loss",cat:"vardag",meaning:"Släpp föremålet i munnen.",signal:"Öppen hand under föremålet.",who:"Alla",steps:["Byt mot likvärdig eller bättre belöning.","Belöna släppandet.","Ge ibland tillbaka föremålet."],activities:["Följ mig"]},
 {id:"av",name:"Av",cat:"grans",meaning:"Avsluta kontakt med person eller föremål.",signal:"Lugn handrörelse bort från objektet.",who:"Alla",steps:["Lär in med låg störning.","Belöna för att vända bort.","Använd inte som allmän utskällning."],activities:["Ljud på avstånd"]},
 {id:"sok",name:"Sök",cat:"sar",meaning:"Starta ett definierat sökarbete.",signal:"Riktningsvisning med armen.",who:"Marcus",steps:["Koppla ordet till enkla säkra fynd.","Låt ILO lösa med nosen.","Använd signalen sparsamt och konsekvent."],activities:["Godissök i gräs","Kartongsök","Springfigurant"]}
];
function completedExerciseIds(days=5){
 const cut=new Date();cut.setDate(cut.getDate()-days);
 return state.journal.filter(j=>dateOnly(j.date)>=cut).map(j=>j.exerciseId).filter(Boolean);
}
function selectDailyExercises(forceSeed=0){
 const weeks=ageParts().weeks,mode=effectiveMode(),recent=completedExerciseIds(4);
 let maxLoad=mode==="dygn"?2:mode==="natt"?3:mode==="dag"?4:6;
 const intel=intelligenceAnalysis();if(intel.load==="low")maxLoad=Math.min(maxLoad,2);
 const eligible=exerciseLibrary.filter(x=>weeks>=x.minWeeks&&weeks<=x.maxWeeks&&!recent.includes(x.id));
 const categories=["relation","inkallning","nos","miljo","sar","aterhamtning"];
 const selected=[];
 const categoryPriority=categories.sort((a,b)=>{
   const ca=recentJournal(7).filter(j=>j.exerciseCategory===a).length;
   const cb=recentJournal(7).filter(j=>j.exerciseCategory===b).length;
   return ca-cb;
 });
 for(const cat of categoryPriority){
   const pool=eligible.filter(x=>x.cat===cat&&x.load<=maxLoad);
   if(pool.length){
     const idx=(new Date().getDate()+forceSeed+selected.length)%pool.length;
     selected.push(pool[idx]);maxLoad-=pool[idx].load;
   }
   if(selected.length>=3||maxLoad<=1)break;
 }
 if(intel.load==="low"){
   const recovery=exerciseLibrary.find(x=>x.id==="recovery_mat");
   selected.splice(0,selected.length);if(recovery)selected.push(recovery);
 }
 if(!selected.length) selected.push(exerciseLibrary[0],exerciseLibrary[9]);
 return selected.slice(0,3);
}
function getDailyPlan(){
 const key="dailyPlan_"+isoToday();
 if(!state[key]) state[key]=selectDailyExercises(0).map(x=>x.id);
 return state[key].map(id=>exerciseLibrary.find(x=>x.id===id)).filter(Boolean);
}

const weekly=[["Förbered tryggheten","Sovplats, rastningsrutin och familjens ansvar."],["Relation och vila","Mikropass, sömn och spontan kontakt."],["Namn och följsamhet","Namnlek, kort inkallning och följsamhet."],["Nos och miljö","Godissök och lugna nya underlag."]]
function weekIndex(){if(new Date()<dateOnly(state.pickupDate))return 0;return Math.max(1,Math.floor((new Date()-dateOnly(state.pickupDate))/604800000)+1)}

function todayCheckin(){
 state.dailyCheckins=state.dailyCheckins||{};
 return state.dailyCheckins[isoToday()]||{sleep:"normal",energy:"normal",appetite:"normal"};
}
function intelligenceAnalysis(){
 const c=todayCheckin(),w=ageParts().weeks,mode=effectiveMode(),wl=workload(),recent=recentJournal(4);
 let score=90,reasons=[],load="normal",directive="Ett kort kvalitetspass passar idag.";
 if(c.sleep==="low"){score-=22;load="low";reasons.push(["Sömn","Låg sömn rapporterad – sänk krav och prioritera återhämtning."])}
 else if(c.sleep==="good"){score+=3;reasons.push(["Sömn","Bra sömn ger utrymme för ett kort fokuserat pass."])}
 if(c.energy==="low"){score-=18;load="low";reasons.push(["Energi","Låg energi – välj relation eller lugn på filt."])}
 else if(c.energy==="high"){reasons.push(["Energi","Hög energi – använd kort lek, inte ett längre pass."])}
 if(c.appetite==="low"){score-=20;load="low";reasons.push(["Aptit","Låg aptit – träning är sekundärt och hälsa ska följas upp."])}
 if(["natt","dygn"].includes(mode)){score-=12;load="low";reasons.push(["Arbetsschema",mode==="natt"?"Nattpass idag – bara ett mikropass före arbetet.":"Dygnspass – tillsyn och trygghet går före träning."])}
 if(w<12){reasons.push(["Ålder",`ILO är ${w} veckor – relation, sömn och trygghet prioriteras.`])}
 if(wl.level==="Hög"){score-=18;load="low";reasons.push(["Historik","Belastningen de senaste dagarna är hög."])}
 const cats={};recent.forEach(j=>cats[j.exerciseCategory||j.type]=(cats[j.exerciseCategory||j.type]||0)+1);
 const repeated=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];if(repeated&&repeated[1]>=2)reasons.push(["Variation",`${repeated[0]} har tränats flera gånger – byt fokus eller vila.`]);
 score=Math.max(25,Math.min(98,score));
 if(score<50)directive="Återhämtningsdag. Hoppa över planerad träning och välj bara lugn relation.";
 else if(score<70)directive="Sänk belastningen. Ett enda mikropass på 2–4 minuter räcker.";
 else if(score>90)directive="Bra förutsättningar. Genomför dagens korta plan men avsluta tidigt.";
 const title=score<50?"Återhämtning först":score<70?"Mikropass idag":score>90?"Redo för kvalitet":"Relation före prestation";
 const decision=load==="low"?"Planen anpassas till låg belastning och prioriterar återhämtning.":"Planen behåller normal låg valpbelastning.";
 return{score,title,directive,reasons:reasons.slice(0,4),load,decision,checkin:c};
}
function renderIntelligence(){
 const a=intelligenceAnalysis();
 const score=document.querySelector('#intelScore');if(!score)return;
 score.textContent=a.score;document.querySelector('#intelTitle').textContent=a.title;document.querySelector('#intelDirective').textContent=a.directive;
 document.querySelector('#intelReasons').innerHTML=a.reasons.map(r=>`<div class="intel-reason"><span>◆</span><div><b>${escapeHtml(r[0])}</b><br>${escapeHtml(r[1])}</div></div>`).join('');
 document.querySelector('#intelPlanDecision').innerHTML=`<b>Dagens planbeslut:</b> ${escapeHtml(a.decision)}`;
 document.querySelectorAll('[data-checkin]').forEach(b=>b.classList.toggle('on',a.checkin[b.dataset.checkin]===b.dataset.value));
}

function coach(){
 const w=ageParts().weeks,mode=effectiveMode(),r=recentJournal(5),cats={};r.forEach(j=>cats[j.type]=(cats[j.type]||0)+1);
 let title="Relation före prestation",text="Fokusera på trygghet, lek och korta positiva erfarenheter.";
 if(w>=12){const least=["Relation & lek","Inkallning","Miljö","Nosarbete"].sort((a,b)=>(cats[a]||0)-(cats[b]||0))[0];title="Balansera veckan";text=`Den minst tränade kategorin senaste dagarna är ${least}. Välj ett kort pass där idag.`}
 if(mode==="natt"){title="Låg belastning före natt";text="Gör ett enda kort kvalitetspass och prioritera sömn och lugn före arbetet."}
 if(mode==="dygn"){title="Återhämtning och tillsyn";text="Dagens huvuduppgift är en trygg tillsynsplan. Träning är sekundärt."}
 const wl=workload(),intel=intelligenceAnalysis();if(intel.score<70){title=intel.title;text=intel.directive}return{title,text,score:intel.score,warning:intel.score<50?intel.directive:(wl.level==="Hög"?wl.text:"")}
}
function mission(){
 const pre=new Date()<dateOnly(state.pickupDate),modes=effectiveMode(),base=pre?
 ["Bygg rutinen",["Kontrollera sovplats och rastningsväg.","Bekräfta foder och måltidsrytm med uppfödaren.","Planera vem som hjälper till när du arbetar."]]:
 ["Kvalitet före mängd",["Tre korta lek- eller kontaktstunder.","En enkel nosuppgift.","En lugn ny erfarenhet med möjlighet att dra sig undan."]];
 if(modes==="dag")base[1].push("Planera rastning och vila under dagpasset.");
 if(modes==="natt")base[1].push("Håll passet före jobbet mycket kort.");
 if(modes==="dygn")base[1].push("Säkerställ ansvarig person under hela dygnet.");
 return{title:base[0],tasks:base[1],number:Math.abs(daysBetween(state.birthDate,isoToday()))+1}
}

function renderDailyPlan(){
 const plan=getDailyPlan(),mode=effectiveMode(),total=plan.reduce((a,x)=>a+x.duration,0);
 const intel=intelligenceAnalysis();
 document.querySelector("#dailyPlanSummary").innerHTML=`<div class="good"><strong>${plan.length} övningar · cirka ${total} minuter</strong><br>${workAdvice(mode)}</div><div class="plan-decision"><b>Varför denna plan:</b> ${escapeHtml(intel.decision)}</div>${plan.length?`<button class="button block start-session" id="startTrainingSession">▶ Starta dagens pass</button>`:''}`;
 document.querySelector("#dailyExerciseList").innerHTML=plan.length?plan.map((x,i)=>`<div class="item"><strong>${i+1}. ${x.title}</strong><small>${x.cat} · ${x.duration} min · belastning ${x.load}/3</small><p><b>Mål:</b> ${x.goal}</p><details><summary>Visa steg för steg</summary><ol>${x.steps.map(v=>`<li>${v}</li>`).join('')}</ol><p><b>Vanligt misstag:</b> ${x.mistake}</p><p><b>Gå vidare när:</b> ${x.progress}</p></details><button class="button secondary" data-logexercise="${x.id}">Logga separat</button></div>`).join(''):'<div class="empty">Inga aktiva övningar ännu. Appen prioriterar trygghet, hemförberedelser och vila fram till vecka 8.</div>';
}
function exerciseSessions(id){return state.journal.filter(j=>j.exerciseId===id).length}
function exerciseLevel(id){const n=exerciseSessions(id);return n>=8?3:n>=4?2:n>=1?1:0}
function exerciseCard(x,status="now",locked=false){
 const favs=state.favoriteExercises||[],level=exerciseLevel(x.id),labels=["Ny","Pågående","Säker","Generaliseras"];
 return `<div class="item activity-card ${status==='now'?'recommended':status} ${locked?'locked':''}">
 <button class="favorite ${favs.includes(x.id)?'on':''}" data-favorite="${x.id}" aria-label="Favorit">★</button>
 <span class="activity-status ${status}">${status==='now'?'Rekommenderad nu':status==='soon'?`Från vecka ${x.minWeeks}`:`Senare · från vecka ${x.minWeeks}`}</span>
 <strong>${x.title}</strong><small>${x.cat} · ${x.duration} min · belastning ${x.load}/3</small>
 <div><span class="week-chip">${labels[level]}</span><span class="week-chip">${exerciseSessions(x.id)} loggade pass</span><span class="week-chip">${x.duration} min</span></div>
 <p>${x.goal}</p><details><summary>Instruktion</summary><ol>${x.steps.map(s=>`<li>${s}</li>`).join("")}</ol><p><b>Vanligt misstag:</b> ${x.mistake}</p><p><b>Kriterium:</b> ${x.progress}</p></details>
 <div class="progress-dots">${[0,1,2,3].map(i=>`<i class="${i<=level?'on':''}"></i>`).join('')}</div>
 ${locked?`<button class="button secondary" disabled>Öppnas vecka ${x.minWeeks}</button>`:`<button class="button secondary" data-logexercise="${x.id}">Logga aktiviteten</button>`}</div>`;
}
function renderWeeklyTraining(){
 const weeks=ageParts().weeks,wl=workload(),recent=completedExerciseIds(4);
 const eligible=exerciseLibrary.filter(x=>weeks>=x.minWeeks&&weeks<=x.maxWeeks);
 const categoryCounts={};recentJournal(7).forEach(j=>{const c=j.exerciseCategory||'';categoryCounts[c]=(categoryCounts[c]||0)+1});
 const recommended=[...eligible].sort((a,b)=>{
   const ar=recent.includes(a.id)?1:0,br=recent.includes(b.id)?1:0;
   return ar-br || (categoryCounts[a.cat]||0)-(categoryCounts[b.cat]||0) || a.load-b.load || a.minWeeks-b.minWeeks;
 }).slice(0,6);
 const soon=exerciseLibrary.filter(x=>x.minWeeks>weeks&&x.minWeeks<=weeks+4).sort((a,b)=>a.minWeeks-b.minWeeks).slice(0,6);
 const future=exerciseLibrary.filter(x=>x.minWeeks>weeks+4).sort((a,b)=>a.minWeeks-b.minWeeks).slice(0,6);
 document.querySelector('#weekPlanLabel').textContent=`vecka ${weeks}`;
 const focus=ageFocus();document.querySelector('#weekPlanTitle').textContent=focus.title;
 document.querySelector('#weekPlanText').textContent=`${focus.text} Appen prioriterar övningar som passar åldern och som inte nyligen tränats.`;
 document.querySelector('#weekPlanStats').innerHTML=`<span class="week-chip">${recommended.length} rekommenderade</span><span class="week-chip">belastning ${wl.level.toLowerCase()}</span><span class="week-chip">${recentJournal(7).length} pass / 7 dagar</span>`;
 document.querySelector('#recommendedExercises').innerHTML=recommended.length?recommended.map(x=>exerciseCard(x,'now',false)).join(''):'<div class="empty">Inga övningar är aktiva för den här åldern ännu. Fokusera på trygghet och förberedelser.</div>';
 document.querySelector('#soonExercises').innerHTML=soon.length?soon.map(x=>exerciseCard(x,'soon',true)).join(''):'<div class="empty">Inga nya övningar öppnas de närmaste fyra veckorna.</div>';
 document.querySelector('#futureExercises').innerHTML=future.length?future.map(x=>exerciseCard(x,'future',true)).join(''):'<div class="empty">Hela biblioteket är tillgängligt för åldern.</div>';
}
function renderExerciseLibrary(){
 const filter=document.querySelector("#exerciseFilter")?.value||"alla",q=(document.querySelector("#activitySearch")?.value||"").toLowerCase(),dur=document.querySelector("#durationFilter")?.value||"alla",view=document.querySelector("#favoriteFilter")?.value||"alla",weeks=ageParts().weeks;
 const favs=state.favoriteExercises||[];
 const list=exerciseLibrary.filter(x=>(filter==="alla"||x.cat===filter)&&(!q||(x.title+" "+x.goal).toLowerCase().includes(q))&&(dur==="alla"||x.duration<=+dur)&&(view!=="favoriter"||favs.includes(x.id))&&(view!=="alder"||(weeks>=x.minWeeks&&weeks<=x.maxWeeks)));
 document.querySelector("#exerciseCount").textContent=`${list.length} aktiviteter`;
 document.querySelector("#exerciseLibrary").innerHTML=list.length?list.map(x=>exerciseCard(x,weeks>=x.minWeeks?"now":weeks+4>=x.minWeeks?"soon":"future",weeks<x.minWeeks)).join(""):`<div class="empty">Inga aktiviteter matchar filtren.</div>`;
}
function renderCommandLibrary(){
 const q=(document.querySelector("#commandSearch")?.value||"").toLowerCase(),progress=state.commandProgress||{};
 const list=commandLibrary.filter(c=>(c.name+" "+c.meaning+" "+c.cat).toLowerCase().includes(q));
 document.querySelector("#commandCount").textContent=`${list.length} kommandon`;
 document.querySelector("#commandLibrary").innerHTML=list.map(c=>`<div class="item"><div class="command-head"><div><strong>${c.name}</strong><small>${c.cat} · ${c.who}</small></div><select class="level-select" data-commandlevel="${c.id}"><option value="0" ${(+progress[c.id]||0)===0?'selected':''}>Ej påbörjad</option><option value="1" ${+progress[c.id]===1?'selected':''}>Introducerad</option><option value="2" ${+progress[c.id]===2?'selected':''}>Under träning</option><option value="3" ${+progress[c.id]===3?'selected':''}>Stabil</option></select></div><p><b>Betydelse:</b> ${c.meaning}</p><p><b>Handsignal:</b> ${c.signal}</p><details><summary>Så tränar ni</summary><ol>${c.steps.map(x=>`<li>${x}</li>`).join('')}</ol><p><b>Kopplade aktiviteter:</b> ${c.activities.join(', ')}</p></details></div>`).join("");
}

function ageFocus(){
 const w=ageParts().weeks;
 if(w<8)return {label:"6–8 veckor",title:"Trygg start",text:"Korta, positiva stunder där relation, sömn och trygghet går före prestation.",items:["Namnrespons och följsamhet i hemmet","Mjuk miljöintroduktion utan press","Lek, vila och hantering i mycket små doser"]};
 if(w<12)return {label:"8–12 veckor",title:"Socialisering & lek",text:"Bygg nyfikenhet, trygghet och stark belöningskänsla. Avsluta alltid medan ILO vill fortsätta.",items:["Nya underlag, ljud och platser","Inkallningslek och kontakt","Kroppshantering, vila och återhämtning"]};
 if(w<26)return {label:"3–6 månader",title:"Kontakt & grunder",text:"Skapa enkla vanor och tydliga regler utan att göra passen långa eller monotona.",items:["Följsamhet och frivillig kontakt","Inkallning och loss i lek","Enkla nosövningar och miljöbanor"]};
 if(w<52)return {label:"6–12 månader",title:"Sökgrund & uthållighet",text:"Utveckla arbetslust och självförtroende, men anpassa belastningen till unghundens kropp och mognad.",items:["Figurantintresse och enkla sök","Markeringens första byggstenar","Balans mellan arbete, lek och vila"]};
 return {label:"Vuxen hund",title:"Mission Control",text:"Knyt ihop vardagslydnad, sökarbete, markering och fysisk hållbarhet mot ekipagets långsiktiga mål.",items:["Systematiska sökövningar","Stabil markering i varierad miljö","Dokumentation, tester och ekipageutveckling"]};
}


function timeGreeting(){const h=new Date().getHours();return h<5?'God natt':h<10?'God morgon':h<17?'God dag':h<22?'God kväll':'God natt'}
function dailyRecommendation(){
 const w=ageParts().weeks,wl=workload(),mode=effectiveMode(),recent=recentJournal(3),envCount=Object.values(state.environments).filter(Boolean).length;
 if(new Date()<dateOnly(state.pickupDate))return{title:'Förbered en lugn start',text:'Gör hemmet valpsäkert och bestäm familjens gemensamma ord innan ILO flyttar hem.',icon:'🏠',action:'Kontrollera sovplats, grindar och belöningar',dose:'10 minuter planering'};
 if(w<12){if(wl.level==='Hög')return{title:'Välj återhämtning idag',text:'ILO behöver främst sömn, trygghet och kort positiv kontakt. Skippa nya svåra miljöer.',icon:'💤',action:'Lugn på filt och mjuk förarlek',dose:'2–4 minuter, sedan vila'};return{title:'En ny trygg erfarenhet',text:'Låt ILO möta en ny plats, människa eller ett nytt underlag utan krav. Avsluta medan han fortfarande är nyfiken.',icon:'🌱',action:envCount<4?'Prova ett nytt underlag':'Gör ett kort miljöbesök',dose:'5–10 minuter inklusive pauser'};}
 if(w<24)return{title:'Bygg kontakt före kontroll',text:'Prioritera frivillig följsamhet, inkallning och lek framför långa lydnadskedjor.',icon:'🤝',action:'Namnlek + kort inkallning',dose:'2 pass à 2–3 minuter'};
 if(w<52)return{title:'Låt nosen lösa uppgiften',text:'Välj ett enkelt sök där ILO får arbeta självständigt och lyckas snabbt.',icon:'👃',action:'Kartongsök eller enkel springfigurant',dose:'1–3 lyckade repetitioner'};
 return{title:'Kvalitet före mängd',text:'Välj ett definierat SAR-moment och dokumentera både resultat och återhämtning.',icon:'🎯',action:'Ett fokuserat sökpass',dose:'Avsluta med tydlig lek och nedvarvning'};
}
function latestFeed(){
 const items=[];
 state.lifeEvents.filter(e=>e.source!=='journal').forEach(e=>items.push({date:e.date,created:e.created||'',icon:e.category==='Veterinär'||e.category==='Vaccination'?'❤':e.category==='Milstolpe'?'★':'🐾',title:e.title,meta:`${e.category} · ${profileById(e.person).name}`}));
 state.journal.forEach(j=>items.push({date:j.date,created:j.created||'',icon:j.photo?'📷':'✎',title:j.type||'Journalpost',meta:`${j.minutes||0} min · ${j.rating||0}/5`}));
 return items.sort((a,b)=>(b.date+b.created).localeCompare(a.date+a.created)).slice(0,4);
}


const skillDefinitions=[
 {id:'relation',name:'Relation',icon:'🤝',types:['Relation & lek'],cats:['relation'],sar:['foundation'],milestones:['home','name','play']},
 {id:'inkallning',name:'Inkallning',icon:'↩️',types:['Inkallning'],cats:['inkallning'],sar:[],milestones:['recall']},
 {id:'miljo',name:'Miljö',icon:'🌍',types:['Miljö'],cats:['miljo'],sar:['wind','operational'],milestones:[]},
 {id:'nos',name:'Nosarbete',icon:'👃',types:['Nosarbete','Sök'],cats:['nos','sar'],sar:['nose','runner','hidden','search','duration'],milestones:['nose','person']},
 {id:'markering',name:'Markering',icon:'📍',types:['Markering'],cats:['markering'],sar:['indication'],milestones:['mark']},
 {id:'aterhamtning',name:'Återhämtning',icon:'💤',types:['Vila/återhämtning'],cats:['aterhamtning'],sar:[],milestones:[]}
];

const developmentDomains=[
 {id:'relation',name:'Relation & lek',icon:'🤝',evidence:'A',types:['Relation & lek'],cats:['relation']},
 {id:'engagement',name:'Kontakt & check-in',icon:'👀',evidence:'A',types:['Relation & lek','Inkallning'],cats:['relation','inkallning']},
 {id:'recall',name:'Inkallning',icon:'↩️',evidence:'A',types:['Inkallning'],cats:['inkallning']},
 {id:'regulation',name:'Av-knapp & reglering',icon:'◐',evidence:'A',types:['Vila/återhämtning'],cats:['aterhamtning']},
 {id:'environment',name:'Miljösäkerhet',icon:'🌍',evidence:'B',types:['Miljö'],cats:['miljo']},
 {id:'nose',name:'Nos & problemlösning',icon:'👃',evidence:'A',types:['Nosarbete','Sök'],cats:['nos','sar']},
 {id:'independence',name:'Självständighet',icon:'◆',evidence:'B',types:['Sök','Nosarbete'],cats:['sar','nos']},
 {id:'body',name:'Kroppskontroll',icon:'⚙',evidence:'B',types:['Fysik'],cats:['fysik','balans']}
];
function developmentSnapshot(){
 const w=ageParts().weeks,recent=recentJournal(21),wl=workload();
 const readiness=Math.max(35,Math.min(100,wl.score+(recent.filter(j=>+j.rating>=4).length*2)-recent.filter(j=>+j.rating<=2).length*5));
 const domains=developmentDomains.map(d=>{const hits=recent.filter(j=>d.types.includes(j.type)||d.cats.includes(j.exerciseCategory));const quality=hits.reduce((n,j)=>n+Math.max(0,(+j.rating||3)-2)*7+Math.min(12,+j.minutes||0),0);const percent=Math.min(100,Math.round(quality/1.7));return {...d,hits:hits.length,percent};});
 const weakest=[...domains].sort((a,b)=>a.percent-b.percent)[0];
 let sessions=[];
 if(w<16){sessions=[
  {icon:'👀',title:'Frivillig kontakt',dose:'2–3 min',why:'Belöna spontana check-ins; inget tjat med namn.',e:'A'},
  {icon:'↩️',title:'Inkallning som lek',dose:'3–5 rep',why:'En signal, hög fart in, jackpot nära kroppen och ofta frikommando igen.',e:'A'},
  {icon:'◐',title:'Växla ned',dose:'3–5 min',why:'Efter aktivitet: lugn plats, låg stimulans och frivillig vila.',e:'A'}
 ];}else if(w<28){sessions=[
  {icon:'↩️',title:'Inkallning + lätt störning',dose:'5–8 min',why:'Öka bara en variabel: avstånd, störning eller miljö.',e:'A'},
  {icon:'🌍',title:'Ny miljö med reträtt',dose:'10–15 min',why:'Utforska utan att pressa; lämna medan kvaliteten är hög.',e:'B'},
  {icon:'👃',title:'Självständigt nosjobb',dose:'5–10 min',why:'Låt hunden lösa uppgiften utan förarhjälp.',e:'A'}
 ];}else{sessions=[
  {icon:'🎯',title:'Generalisera svagaste länken',dose:'8–12 min',why:`Prioritera ${weakest.name.toLowerCase()} i kontrollerad miljö.`,e:weakest.evidence},
  {icon:'👃',title:'Sök med progression',dose:'10–20 min',why:'Öka en svårighetsdimension i taget och behåll hög motivation.',e:'B'},
  {icon:'◐',title:'Arbete → av-knapp',dose:'5–10 min',why:'Träna aktiv växling från drift till återhämtning.',e:'B'}
 ];}
 if(readiness<60)sessions=sessions.slice(0,2).map(x=>({...x,dose:'kort · '+x.dose,why:x.why+' Håll belastningen låg idag.'}));
 return{readiness,domains,weakest,sessions};
}
function renderDevelopmentEngine(){const d=developmentSnapshot();const a=ageParts();const title=a.weeks<16?'Bygg systemet – inte perfekta moment':a.weeks<28?'Generalisera utan att jaga svårighet':'Kvalitet före belastning';document.querySelector('#devReadiness').textContent=d.readiness;document.querySelector('#devMainTitle').textContent=title;document.querySelector('#devMainText').textContent=`${a.weeks} veckor: dagens plan prioriterar utveckling, motivation och återhämtning. ${d.weakest.hits?'Minst dokumenterat just nu: '+d.weakest.name+'.':'Börja med korta baslinjepass så motorn lär känna Dex/ILO.'}`;document.querySelector('#devDailyPlan').innerHTML=d.sessions.map(x=>`<div class="dev-session"><span style="font-size:22px">${x.icon}</span><div><strong>${escapeHtml(x.title)} · ${escapeHtml(x.dose)}</strong><small>${escapeHtml(x.why)}</small></div><span class="evidence-tag">EVIDENS ${x.e}</span></div>`).join('');document.querySelector('#devDomainGrid').innerHTML=d.domains.map(x=>`<div class="dev-domain"><strong><span>${x.icon} ${escapeHtml(x.name)}</span><span>${x.percent}%</span></strong><div class="dev-bar"><i style="width:${x.percent}%"></i></div><small>${x.hits?x.hits+' dokumenterade pass':'Baslinje saknas'} · ${x.evidence}</small></div>`).join('');}

function iceEngine(){
 const today=isoToday(),completedTasks=state.familyTasks.filter(t=>t.done).length,missions=Object.values(state.completedMissions).filter(x=>x.complete).length,envs=Object.values(state.environments).filter(Boolean).length,miles=Object.values(state.milestones).filter(Boolean).length,sar=Object.values(state.sarCompleted).filter(Boolean).length;
 const journalXp=state.journal.reduce((n,j)=>n+20+Math.min(30,(+j.minutes||0))+Math.max(0,(+j.rating||0)-2)*4+(j.photo?8:0),0);
 const xp=journalXp+completedTasks*8+missions*35+envs*6+miles*25+sar*60+state.lifeEvents.length*5;
 const level=Math.max(1,Math.floor(Math.sqrt(xp/90))+1),levelStart=90*(level-1)*(level-1),levelEnd=90*level*level,levelPct=Math.min(100,Math.round((xp-levelStart)/Math.max(1,levelEnd-levelStart)*100));
 const skills=skillDefinitions.map(def=>{let points=0,sessions=0;state.journal.forEach(j=>{if(def.types.includes(j.type)||def.cats.includes(j.exerciseCategory)){sessions++;points+=18+Math.min(22,+j.minutes||0)+Math.max(0,(+j.rating||0)-2)*3}});points+=def.sar.filter(k=>state.sarCompleted[k]).length*55;points+=def.milestones.filter(k=>state.milestones[k]).length*30;if(def.id==='miljo')points+=envs*5;return{...def,points,sessions,percent:Math.min(100,Math.round(points/260*100))}});
 const lowest=[...skills].filter(x=>x.id!=='markering'||ageParts().weeks>=20).sort((a,b)=>a.points-b.points)[0];
 const nextSar=sarSteps.find(x=>!state.sarCompleted[x[0]]);const taskToday=state.familyTasks.find(t=>t.date===today&&!t.done);const recommendation=dailyRecommendation();
 let title=recommendation.title,text=recommendation.text;if(taskToday){title=`Nästa: ${taskToday.title}`;text=taskToday.note||'Genomför uppgiften lugnt och markera den klar när den är färdig.'}else if(lowest&&state.journal.length){title=`Balansförslag: ${lowest.name}`;text=`${lowest.name} är just nu det minst dokumenterade området. Välj ett kort, enkelt pass utan att jaga poäng.`}
 return{xp,level,levelPct,levelStart,levelEnd,skills,lowest,title,text,nextSar,impact:{journal:state.journal.length>0,mission:missions>0,family:completedTasks>0,life:state.lifeEvents.length>0,environment:envs>0}};
}
function levelName(level){return level<3?'Grund':level<6?'Relation':level<10?'Utforskare':level<15?'Sökgrund':'Ekipage'}
function renderEngine(){const e=iceEngine();document.querySelector('#iceTodayTitle').textContent=e.title;document.querySelector('#iceTodayText').textContent=e.text;document.querySelector('#iceLevel').textContent=e.level;document.querySelector('#iceLevelName').textContent=levelName(e.level);document.querySelector('#iceXpText').textContent=`${e.xp} XP totalt`;document.querySelector('#iceNextXp').textContent=`${Math.max(0,e.levelEnd-e.xp)} XP till nivå ${e.level+1}`;document.querySelector('#iceXpBar').style.width=e.levelPct+'%';document.querySelector('#nextUnlockTitle').textContent=e.nextSar?`Nästa SAR-steg: ${e.nextSar[1]}`:'Grundvägen genomförd';document.querySelector('#nextUnlockText').textContent=e.nextSar?e.nextSar[2]:'Fortsätt generalisera och kvalitetssäkra färdigheterna.';document.querySelector('#skillGrid').innerHTML=e.skills.map(x=>`<div class="skill-card"><div class="skill-card-head"><strong>${x.icon} ${escapeHtml(x.name)}</strong><span class="skill-trend ${x.percent>0?'up':'flat'}">${x.percent>0?'↑':'→'} ${x.percent}%</span></div><div class="bar"><i style="width:${x.percent}%"></i></div><small>${x.sessions?`${x.sessions} pass · ${x.points} p`:'Inte påbörjad'}</small></div>`).join('');const labels=[['journal','Journal'],['mission','Uppdrag'],['family','Familj'],['life','Livsbok'],['environment','Miljö']];document.querySelector('#engineImpact').innerHTML=labels.map(([k,n])=>`<span class="impact-chip ${e.impact[k]?'on':''}">${e.impact[k]?'✓':'○'} ${n}</span>`).join('')}

function dailyChecklistState(){
 state.dailyChecklist=state.dailyChecklist||{};
 const d=state.dailyChecklist[isoToday()]||{};
 return d;
}
function checklistActual(id){return dailyChecklistState()[id]||null}
function formatActual(iso){if(!iso)return '';const d=new Date(iso);return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})}
function toggleDailyChecklist(id,checked){
 state.dailyChecklist=state.dailyChecklist||{};const day={...(state.dailyChecklist[isoToday()]||{})};
 if(checked) day[id]=new Date().toISOString(); else delete day[id];
 state.dailyChecklist[isoToday()]=day;save();renderDailyChecklist();
}
function renderDailyChecklist(){
 const host=document.querySelector('#dailyChecklist');if(!host)return;
 const n=nutritionState(),d=dailyChecklistState(),outings=(state.dailySchedule?.outings||['07:30','10:00','12:30','15:30','18:30','22:00']);
 const items=[];
 n.mealTimes.slice(0,n.mealsPerDay).forEach((t,i)=>{
   const id=`meal-${i}`,actual=n.mealLog[mealKey(i)]||checklistActual(id),done=!!actual;
   items.push({id,title:`Foder · ${i+1}`,sub:`${n.gramsPerMeal} g · ${escapeHtml(n.currentFood)}`,time:t,done,actual,kind:'meal'});
 });
 outings.forEach((t,i)=>{const id=`out-${i}`,actual=checklistActual(id);items.push({id,title:`Utgång ${i+1}`,sub:'Rastning / möjlighet till avföring',time:t,done:!!actual,actual,kind:'out'});});
 const stool=checklistActual('stool'),water=checklistActual('water'),condition=checklistActual('condition');
 items.push({id:'stool',title:'Avföring',sub:stool?'Kontrollerad idag':'Markera när avföring har observerats',time:'',done:!!stool,actual:stool,kind:'manual'});
 items.push({id:'water',title:'Vatten',sub:water?'Kontrollerat och tillgängligt':'Kontrollera skål och tillgång',time:'',done:!!water,actual:water,kind:'manual'});
 items.push({id:'condition',title:'Allmäntillstånd',sub:condition?'Normalt idag':'Pigg, kontaktbar och återhämtad?',time:'',done:!!condition,actual:condition,kind:'manual'});
 const count=items.filter(x=>x.done).length;
 const label=document.querySelector('#dailyChecklistLabel');if(label)label.textContent=`${count} / ${items.length} klara`;
 const score=document.querySelector('#dailyChecklistScore');if(score)score.textContent=`${count}/${items.length}`;
 host.innerHTML=items.map(x=>`<label class="checklist-item ${x.done?'done':''}"><input type="checkbox" data-dailycheck="${x.id}" ${x.done?'checked':''}><span class="checklist-time">${x.time||'—'}</span><span><b>${x.title}</b><small>${x.sub}</small></span>${x.done?`<span class="checklist-actual">✓ ${formatActual(x.actual)}</span>`:`<span class="checklist-status">inte klar</span>`}</label>`).join('');
}
function renderToday(){
 const a=ageParts(),p=phase(),wl=workload(),c=coach(),m=mission(),today=isoToday(),done=state.completedMissions[today]?.tasks||[];renderEngine();renderDevelopmentEngine();
 const active=activeProfile(),g=timeGreeting();document.querySelector('#greetingTitle').textContent=`${g} ${active.name} 👋`;document.querySelector('#greetingSubtitle').textContent=`${a.weeks} veckor och ${a.rest} dagar · dagens fokus på en blick.`;document.querySelector('#hqTodayLabel').textContent=new Date().toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'short'});
 const allToday=state.familyTasks.filter(t=>t.date===today),doneToday=allToday.filter(t=>t.done).length,totalToday=allToday.length,missionDone=state.completedMissions[today]?.complete?1:0,totalUnits=totalToday+1,doneUnits=doneToday+missionDone,dayPct=Math.round(doneUnits/Math.max(1,totalUnits)*100);document.querySelector('#todayProgressText').textContent=`${doneUnits} av ${totalUnits} delar klara`;document.querySelector('#todayProgressBar').style.width=dayPct+'%';
 const upcoming=allToday.filter(t=>!t.done).sort((x,y)=>(x.time||'99:99').localeCompare(y.time||'99:99'))[0];document.querySelector('#nextTaskText').textContent=upcoming?`Nästa: ${upcoming.title}${upcoming.time?' · '+upcoming.time:''}`:(missionDone?'Dagens plan är genomförd.':'Nästa: genomför dagens träningsuppdrag.');document.querySelector('#hqNextTime').textContent=upcoming?.time||'Flex';document.querySelector('#hqNextLabel').textContent=upcoming?upcoming.title:'dagens uppdrag';
 const healthRecent=state.lifeEvents.filter(e=>['Hälsa','Veterinär','Vaccination'].includes(e.category)).sort((x,y)=>(y.date+(y.created||'')).localeCompare(x.date+(x.created||'')))[0];const healthEl=document.querySelector('#hqHealth'),healthDetail=document.querySelector('#hqHealthDetail');if(healthRecent&&+healthRecent.rating<=2){healthEl.textContent='Följ upp';healthEl.className='status-watch';healthDetail.textContent=healthRecent.title}else if(healthRecent){healthEl.textContent='Allt bra';healthEl.className='status-ok';healthDetail.textContent=`senast: ${healthRecent.title}`}else{healthEl.textContent='Ingen logg';healthEl.className='status-time';healthDetail.textContent='lägg till hälsostatus'};
 const weekEntries=recentJournal(7).length+state.lifeEvents.filter(e=>daysBetween(e.date,today)<=7&&daysBetween(e.date,today)>=0).length;const weekPct=Math.min(100,Math.round(weekEntries/7*100));document.querySelector('#hqWeekPercent').textContent=weekPct+'%';
 const rec=dailyRecommendation();document.querySelector('#dailyRecommendTitle').textContent=rec.title;document.querySelector('#dailyRecommendText').textContent=rec.text;document.querySelector('#dailyRecommendIcon').textContent=rec.icon;document.querySelector('#dailyRecommendAction').textContent=rec.action;document.querySelector('#dailyRecommendDose').textContent=rec.dose;
 const sarDone=sarSteps.filter(x=>state.sarCompleted[x[0]]).length,sarPct=Math.round(sarDone/sarSteps.length*100),nextSar=sarSteps.find(x=>!state.sarCompleted[x[0]]);document.querySelector('#sarPercent').textContent=sarPct+'%';document.querySelector('#sarProgressBar').style.width=sarPct+'%';document.querySelector('#sarNextTitle').textContent=nextSar?nextSar[1]:'Alla grundsteg genomförda';document.querySelector('#sarNextText').textContent=nextSar?nextSar[2]:'Fortsätt kvalitetssäkra momenten i varierade miljöer.';document.querySelector('#sarRoadmap').innerHTML=sarSteps.slice(0,5).map((step,i)=>{const isDone=!!state.sarCompleted[step[0]],isCurrent=!isDone&&(i===0||state.sarCompleted[sarSteps[i-1][0]]),cls=isDone?'done':isCurrent?'current':'locked';return `<div class="sar-roadmap-row ${cls}"><span class="roadmap-mark">${isDone?'✓':i+1}</span><div><strong>${escapeHtml(step[1])}</strong><div class="task-meta">${escapeHtml(step[2])}</div></div><span class="roadmap-state">${isDone?'KLAR':isCurrent?'PÅGÅR':'LÅST'}</span></div>`}).join('');
 const feed=latestFeed();document.querySelector('#latestILOTimeline').innerHTML=feed.length?feed.map(x=>`<div class="feed-row"><span class="feed-icon">${x.icon}</span><div><strong>${escapeHtml(x.title)}</strong><div><small>${svDate(x.date)} · ${escapeHtml(x.meta)}</small></div></div><span class="feed-chevron">›</span></div>`).join(''):'<div class="empty"><strong>Livsboken väntar på första minnet</strong><p>Logga ett träningspass, en vikt, en hälsokontroll eller en milstolpe. Då visas den automatiskt här.</p><span class="pill">Tryck för att öppna livsboken</span></div>';

 document.querySelector("#heroAge").textContent=`${a.weeks} veckor och ${a.rest} dagar · född ${svDate(state.birthDate)}`;
 const af=ageFocus();document.querySelector("#ageStageLabel").textContent=af.label;document.querySelector("#ageFocusTitle").textContent=af.title;document.querySelector("#ageFocusText").textContent=af.text;document.querySelector("#ageFocusList").innerHTML=af.items.map(x=>`<div>✓ ${escapeHtml(x)}</div>`).join("");
 document.querySelector("#overviewAge").textContent=`${a.weeks} v ${a.rest} d`;document.querySelector("#overviewPhase").textContent=p[0];document.querySelector("#overviewJournal").textContent=recentJournal(7).length;
 const todays=state.familyTasks.filter(t=>t.date===today&&!t.done);document.querySelector("#hqTasks").textContent=todays.length;document.querySelector("#overviewTasks").textContent=todays.length;document.querySelector("#hqMinutes").textContent=recentJournal(7).reduce((n,j)=>n+(+j.minutes||0),0);const activeDays=new Set(recentJournal(14).map(j=>j.date));let streak=0,d=new Date();while(activeDays.has(d.toISOString().slice(0,10))){streak++;d.setDate(d.getDate()-1)}document.querySelector("#hqStreak").textContent=streak;
 document.querySelector("#phaseMetric").textContent=p[0];document.querySelector("#phaseText").textContent=p[1];
 document.querySelector("#loadMetric").textContent=wl.level;document.querySelector("#loadText").textContent=wl.text;
 document.querySelector("#coachScore").textContent=c.score;document.querySelector("#coachTitle").textContent=c.title;document.querySelector("#coachText").textContent=`ILO är fortfarande ${a.weeks} veckor. ${c.text} Håll passen korta och avsluta medan han fortfarande vill fortsätta.`;
 document.querySelector("#coachWarning").innerHTML=c.warning?`<div class="warning">${c.warning}</div>`:`<div class="good">Ingen tydlig överbelastningssignal i de senaste loggarna.</div>`;
 document.querySelector("#todayDate").textContent=new Date().toLocaleDateString("sv-SE",{weekday:"long",day:"numeric",month:"long"});
 document.querySelector("#missionNumber").textContent=`MISSION #${m.number}`;document.querySelector("#missionTitle").textContent=m.title;document.querySelector("#missionIntro").textContent="Avsluta medan ILO fortfarande vill fortsätta.";
 document.querySelector("#missionDose").textContent=new Date()<dateOnly(state.pickupDate)?"10–20 min planering":ageParts().weeks<12?"8–15 min aktiv träning utspritt":"12–25 min aktiv träning utspritt";
 document.querySelector("#missionTasks").innerHTML=m.tasks.map((t,i)=>`<label class="task ${done.includes(i)?"done":""}"><input type="checkbox" data-mtask="${i}" ${done.includes(i)?"checked":""}><span>${t}</span></label>`).join("");
 document.querySelector("#completeMission").textContent=state.completedMissions[today]?.complete?"Uppdraget är klart ✓":"Markera uppdraget klart";
 document.querySelector("#todayShiftSummary").innerHTML=`<strong>${svDate(today)}</strong><small>${shiftLabel(shiftForDate(today))}</small>`;
 document.querySelector("#workAdvice").textContent=workAdvice(effectiveMode());
 document.querySelectorAll(".shiftQuick").forEach(b=>b.style.outline=b.dataset.type===effectiveMode()?"2px solid var(--gold)":"none");
}
function renderPlan(){
 const wi=Math.min(weekly.length-1,weekIndex()),w=weekly[wi];document.querySelector("#weekNumber").textContent=new Date()<dateOnly(state.pickupDate)?"före hämtning":`vecka ${weekIndex()} hemma`;
 document.querySelector("#weeklyTitle").textContent=w[0];document.querySelector("#weeklyIntro").textContent=w[1];
 document.querySelector("#weeklyGoals").innerHTML=["Genomför korta pass","Prioritera sömn","Skriv minst två journalposter"].map((g,i)=>`<div class="task"><span class="pill">${i+1}</span><span>${g}</span></div>`).join("");
 const names={ledig:"Ledig",dag:"Dag 08:00–17:30",natt:"Natt 17:30–08:00",dygn:"Dygn 08:00–08:00",annat:"Annat pass"};
 const sorted=state.shifts.map((s,i)=>({...s,_i:i})).sort((a,b)=>a.date.localeCompare(b.date));
 document.querySelector("#shiftList").innerHTML=sorted.length?sorted.map(s=>`<div class="item"><strong>${svDate(s.date)}</strong><small>${names[s.type]||s.type}${s.start||s.end?` · ${s.start||"–"}–${s.end||"–"}`:""}${s.note?" · "+escapeHtml(s.note):""}</small><div class="row" style="margin-top:9px"><button class="button secondary" data-editshift="${s._i}">Ändra</button><button class="button danger" data-delshift="${s._i}">Ta bort</button></div></div>`).join(""):'<div class="empty">Inga pass sparade.</div>';
}
function renderJournal(){
 document.querySelector("#journalList").innerHTML=state.journal.length?[...state.journal].reverse().map((j,ri)=>{const i=state.journal.length-1-ri;return`<div class="item"><strong>${j.type} · ${j.rating}/5</strong><small>${svDate(j.date)} · ${j.minutes||0} min${j.weight?" · "+j.weight+" kg":""}</small><p>${escapeHtml(j.note)}</p>${j.photo?`<img class="journal-photo" src="${j.photo}" alt="">`:""}<button class="button danger" data-deljournal="${i}">Ta bort</button></div>`}).join(""):'<div class="empty">Ingen journalpost ännu.</div>';
}
function renderEnvironment(){
 const n=Object.values(state.environments).filter(Boolean).length;document.querySelector("#envProgress").textContent=`${n}/${environments.length}`;
 document.querySelector("#envGrid").innerHTML=environments.map((e,i)=>`<div class="env"><label><input type="checkbox" data-env="${i}" ${state.environments[i]?"checked":""}><span>${e}</span></label></div>`).join("");
 document.querySelector("#milestoneList").innerHTML=milestones.map(m=>`<label class="milestone"><input type="checkbox" data-milestone="${m[0]}" ${state.milestones[m[0]]?"checked":""}><span><strong>${m[1]}</strong><small>${m[2]}</small></span></label>`).join("");
}
function renderSar(){
 document.querySelector("#sarList").innerHTML=sarSteps.map((s,i)=>{const prev=i===0||state.sarCompleted[sarSteps[i-1][0]],locked=!prev;return`<div class="sar-step ${locked?"locked":""}"><label class="milestone"><input type="checkbox" data-sar="${s[0]}" ${state.sarCompleted[s[0]]?"checked":""} ${locked?"disabled":""}><span><strong>${s[1]}</strong><small>${s[2]}</small></span></label>${locked?'<small class="pill">Lås upp föregående steg först</small>':""}</div>`}).join("");
}
function educationState(){state.education=state.education||{courses:{},notes:""};state.education.courses=state.education.courses||{};return state.education}
function renderCoursePlanner(){
 const e=educationState(),w=ageParts().weeks,statusNames={none:"Ej aktuell",plan:"Planera",booked:"Bokad",active:"Pågår",done:"Uppfyllt"};
 const next=courseRoadmap.find(c=>(e.courses[c.id]||"none")!=="done")||courseRoadmap[courseRoadmap.length-1];
 const suggested=w>=next.startWeek?"Pågår":w>=next.planWeek?"Planera":"Kommer senare";
 const pa=document.querySelector('#plannerAge');if(pa)pa.textContent=w+' v'; const pn=document.querySelector('#plannerNext');if(pn)pn.textContent=next.title; const ps=document.querySelector('#plannerStatus');if(ps)ps.textContent=statusNames[e.courses[next.id]||'none']||suggested;
 const title=document.querySelector('#rescuePlannerTitle'),adv=document.querySelector('#rescuePlannerAdvice');if(title)title.textContent=w>=10&&w<16?'Planera valpkurs nu':`Nästa: ${next.title}`;if(adv)adv.textContent=w<10?'Fokusera på hemkomst och trygghet. Field Manual börjar påminna om valpkurs från cirka 10 veckor.':w<16?'ILO är i rätt fönster för att börja planera/boka valpkurs. Välj en belöningsbaserad kurs med lugnt upplägg och rimliga gruppstorlekar.':next.detail;
 const host=document.querySelector('#coursePlanner');if(host)host.innerHTML=courseRoadmap.map(c=>{const st=e.courses[c.id]||'none',now=st==='done'?'done':(w>=c.planWeek&&st==='none'?'now':'');return `<div class="card course-card ${now}" style="margin-top:10px"><div class="course-head"><div><div class="course-age">${escapeHtml(c.age)}</div><h3 style="margin:5px 0">${escapeHtml(c.title)}</h3></div><span class="course-status">${statusNames[st]}</span></div><p>${escapeHtml(c.detail)}</p><div class="course-actions">${[['plan','Planera'],['booked','Bokad'],['active','Pågår'],['done','Uppfyllt']].map(x=>`<button data-course="${c.id}" data-course-status="${x[0]}" class="${st===x[0]?'active':''}">${x[1]}</button>`).join('')}</div></div>`}).join('');
 const req=document.querySelector('#rescueRequirements');if(req)req.innerHTML=rescueRequirements.map(r=>{let done=false;if(r[0]==='mental')done=(e.courses.mhbph==='done');if(r[0]==='hde')done=(e.courses.hde==='done');if(r[0]==='obedience')done=(e.courses.obedience==='done');if(r[0]==='search')done=state.journal.some(j=>['Sök','Nosarbete'].includes(j.type));if(r[0]==='environment')done=Object.values(state.environments).filter(Boolean).length>=5;return `<div class="requirement-row"><div><strong>${escapeHtml(r[1])}</strong><small>${escapeHtml(r[2])}</small></div><span class="badge ${done?'driver':''}">${done?'PÅBÖRJAD/OK':'FRAMÅT'}</span></div>`}).join('');
}
function renderProgress(){
 const r=recentJournal(7),mins=r.reduce((a,j)=>a+(+j.minutes||0),0),cats={};r.forEach(j=>cats[j.type]=(cats[j.type]||0)+1);
 document.querySelector("#statSessions").textContent=r.length;document.querySelector("#statMinutes").textContent=mins;document.querySelector("#statMissions").textContent=Object.values(state.completedMissions).filter(x=>x.complete).length;document.querySelector("#statEnvs").textContent=Object.values(state.environments).filter(Boolean).length;
 const mx=Math.max(1,...Object.values(cats));document.querySelector("#categoryStats").innerHTML=Object.keys(cats).length?Object.entries(cats).map(([k,v])=>`<div style="margin:13px 0"><strong>${k}</strong><small style="float:right">${v}</small><div class="bar"><i style="width:${v/mx*100}%"></i></div></div>`).join(""):'<div class="empty">Ingen statistik ännu.</div>';
 const wl=workload();document.querySelector("#recoveryText").innerHTML=`<div class="${wl.level==="Hög"?"warning":"good"}"><strong>${wl.level} belastning</strong><br>${wl.text}</div>`;
 const ws=state.journal.filter(j=>j.weight);if(ws.length){const w=ws[ws.length-1];document.querySelector("#latestWeight").textContent=w.weight+" kg";document.querySelector("#latestWeightDate").textContent=svDate(w.date)}else{document.querySelector("#latestWeight").textContent="Ingen vikt";document.querySelector("#latestWeightDate").textContent=""}
}

function setDeviceProfile(id){if(!state.profiles.some(p=>p.id===id))return;state.activeProfile=id;localStorage.setItem(DEVICE_PROFILE_KEY,id);document.querySelector('#profileSetup').classList.add('hidden');save()}
function renderDeviceProfilePicker(){const target=document.querySelector('#deviceProfilePicker');if(!target)return;target.innerHTML=state.profiles.map(p=>`<button class="profile-pick ${p.role==='driver'?'driver':''}" data-device-profile="${p.id}"><b>${p.icon}</b><strong>${escapeHtml(p.name)}</strong><small>${p.role==='driver'?'Hundförare · full åtkomst':'Familj · vardagsläge'}</small></button>`).join('')}
function showProfileSetup(){renderDeviceProfilePicker();document.querySelector('#profileSetup').classList.remove('hidden')}
function applyProfileMode(){const p=activeProfile();document.body.classList.toggle('family-mode',p.role!=='driver');const text=document.querySelector('#deviceProfileText');if(text)text.textContent=`Den här telefonen öppnas automatiskt som ${p.name}.`;if(p.role!=='driver'){const active=document.querySelector('.screen.active');if(active&&['plan','sar','progress'].includes(active.id)){document.querySelectorAll('.tab,.screen').forEach(x=>x.classList.remove('active'));document.querySelector('[data-screen="today"]').classList.add('active');document.querySelector('#today').classList.add('active')}}}
function profileById(id){return state.profiles.find(p=>p.id===id)||state.profiles[0]}
function activeProfile(){return profileById(state.activeProfile)}
function profileButtons(target){
 target.innerHTML=state.profiles.map(p=>`<button class="profile ${p.id===state.activeProfile?'active':''}" data-profile="${p.id}"><b>${p.icon}</b><span class="profile-name">${escapeHtml(p.name)}</span><span class="profile-role">${p.role==='driver'?'Förare':'Familj'}</span></button>`).join('');
}
function accessBadge(a){return a==='driver'?'<span class="badge driver">Endast Marcus</span>':a==='instructor'?'<span class="badge">Instruktör</span>':a==='all'?'<span class="badge family">Alla</span>':'<span class="badge family">Familjen</span>'}
function canProfileDoTask(t,p){if(t.access==='driver')return p.id==='marcus';if(t.access==='instructor')return false;return t.assignee==='all'||t.assignee===p.id||p.id==='marcus'}
function taskVisible(t,p){return t.assignee==='all'||t.assignee===p.id||p.id==='marcus'}
function renderTask(t,index,compact=false){const who=t.completedBy?profileById(t.completedBy).name:'';return `<div class="task-card ${t.done?'done':''}"><input type="checkbox" data-familydone="${index}" ${t.done?'checked':''} ${!canProfileDoTask(t,activeProfile())&&!t.done?'disabled':''}><div><strong>${escapeHtml(t.title)}</strong><div class="task-meta">${t.date}${t.time?' · '+t.time:''} · ${t.assignee==='all'?'Alla':escapeHtml(profileById(t.assignee).name)} ${t.reminder?' · 🔔':' · 🔕'}</div>${t.note?`<div class="task-meta">${escapeHtml(t.note)}</div>`:''}<div style="margin-top:6px">${accessBadge(t.access)} ${t.done?`<span class="badge">Klar av ${escapeHtml(who)}</span>`:''}</div></div>${compact?'':`<button class="icon-btn" data-delfamily="${index}" aria-label="Ta bort">×</button>`}</div>`}
function renderFamily(){
 applyProfileMode();
 const p=activeProfile();const heroProfile=document.querySelector('#heroProfileName');if(heroProfile)heroProfile.textContent=p.name;profileButtons(document.querySelector('#todayProfiles'));profileButtons(document.querySelector('#familyProfiles'));
 document.querySelector('#activeProfileNote').innerHTML=p.role==='driver'?`<strong>${p.name} · hundförare</strong><br>Du ser hela planen och de förarunika momenten.`:`<strong>${p.name} · familjeläge</strong><br>Du ser vardagsuppgifter och invigda moment som hjälper ILO utan att störa förararbetet.`;
 document.querySelector('#familyRoleText').innerHTML=p.role==='driver'?'<strong>Förarläge</strong><br>Full åtkomst till uppgifter, livsbok och planering.':'<strong>Familjeläge</strong><br>Promenad, mat, vatten, skötsel, social samvaro och tilldelade aktiviteter.';
 const today=isoToday(),mine=state.familyTasks.map((t,i)=>({t,i})).filter(x=>x.t.date===today&&taskVisible(x.t,p));
 document.querySelector('#myTaskCount').textContent=`${mine.filter(x=>!x.t.done).length} kvar`;
 document.querySelector('#myTasksToday').innerHTML=mine.length?mine.map(x=>renderTask(x.t,x.i,true)).join(''):'<div class="empty">Inga uppgifter tilldelade idag.</div>';
 const all=state.familyTasks.map((t,i)=>({t,i})).filter(x=>x.t.date===today);
 document.querySelector('#familyDoneSummary').textContent=`${all.filter(x=>x.t.done).length}/${all.length} klara`;
 document.querySelector('#familyTaskList').innerHTML=all.length?all.map(x=>renderTask(x.t,x.i)).join(''):'<div class="empty">Inga gemensamma uppgifter idag.</div>';
 const opts='<option value="all">Alla</option>'+state.profiles.map(x=>`<option value="${x.id}">${escapeHtml(x.name)}</option>`).join('');
 document.querySelector('#taskAssignee').innerHTML=opts;document.querySelector('#lifePerson').innerHTML=state.profiles.map(x=>`<option value="${x.id}" ${x.id===state.activeProfile?'selected':''}>${escapeHtml(x.name)}</option>`).join('');
 const events=[...state.lifeEvents].sort((a,b)=>(b.date+b.created).localeCompare(a.date+a.created)).slice(0,20);
 document.querySelector('#lifeTimeline').innerHTML=events.length?events.map((e,i)=>`<div class="timeline-item"><span class="timeline-dot"></span><div><strong>${escapeHtml(e.title)}</strong><div class="task-meta">${svDate(e.date)} · ${escapeHtml(e.category)} · ${escapeHtml(profileById(e.person).name)} · ${'★'.repeat(+e.rating)}</div>${e.note?`<p>${escapeHtml(e.note)}</p>`:''}<button class="icon-btn" data-dellife="${state.lifeEvents.indexOf(e)}">Ta bort</button></div></div>`).join(''):'<div class="empty">Livsboken är tom ännu.</div>';
}
async function requestNotifications(){if(!('Notification' in window)){alert('Den här webbläsaren stöder inte systemnotiser. Uppgiften sparas ändå i appen.');return false}if(Notification.permission==='granted')return true;const r=await Notification.requestPermission();return r==='granted'}
function reminderMoment(t){if(!t.reminder||!t.time||t.done)return null;const d=new Date(`${t.date}T${t.time}:00`);d.setMinutes(d.getMinutes()-(+t.reminderOffset||0));return d}
function checkReminders(){const now=Date.now();state.familyTasks.forEach((t,i)=>{const when=reminderMoment(t);if(!when)return;const key=`${t.date}-${t.time}-${t.reminderOffset||0}`;const repeat=t.repeatReminder?30*60000:86400000;const last=t.lastNotified||0;if(now>=when.getTime()&&now-last>=repeat&&now-when.getTime()<86400000){const p=activeProfile();if(t.reminderAudience==='all'||t.assignee==='all'||t.assignee===p.id){if(Notification.permission==='granted')new Notification(`FIELD MANUAL · ${t.title}`,{body:t.note||`Ansvarig: ${t.assignee==='all'?'Alla':profileById(t.assignee).name}`,icon:'icon-192.png'});t.lastNotified=now;localStorage.setItem(STORE,JSON.stringify(state));}}})}
function seedFamilyTasks(){if(state.familyTasks.length)return;const d=isoToday();state.familyTasks=[
 {title:'Kontrollera och fyll vatten',date:d,time:'08:00',assignee:'all',access:'family',note:'Se till att skålen är ren och har friskt vatten.',reminder:false,done:false},
 {title:'Gå en lugn promenad',date:d,time:'',assignee:'anna-lena',access:'family',note:'Låt ILO nosa och håll tempot lugnt.',reminder:false,done:false},
 {title:'Kort förarpass',date:d,time:'',assignee:'marcus',access:'driver',note:'Följ dagens automatiska träningsplan.',reminder:false,done:false}
 ];localStorage.setItem(STORE,JSON.stringify(state))}

let sessionTimer=null;
function trainingSessionPlan(){const ids=(state.activeTrainingSession&&state.activeTrainingSession.exerciseIds)||getDailyPlan().map(x=>x.id);return ids.map(id=>exerciseLibrary.find(x=>x.id===id)).filter(Boolean)}
function openTrainingSession(){const plan=getDailyPlan();if(!plan.length)return alert('Det finns inga aktiva övningar i dagens pass ännu.');if(!state.activeTrainingSession||state.activeTrainingSession.date!==isoToday()||state.activeTrainingSession.finished){state.activeTrainingSession={date:isoToday(),exerciseIds:plan.map(x=>x.id),index:0,results:[],startedAt:new Date().toISOString(),finished:false}}document.querySelector('#trainingSession').classList.add('open');document.querySelector('#trainingSession').setAttribute('aria-hidden','false');renderTrainingSession()}
function closeTrainingSession(){clearInterval(sessionTimer);sessionTimer=null;document.querySelector('#trainingSession').classList.remove('open');document.querySelector('#trainingSession').setAttribute('aria-hidden','true')}
function renderTrainingSession(){clearInterval(sessionTimer);sessionTimer=null;const box=document.querySelector('#sessionContent'),ss=state.activeTrainingSession,plan=trainingSessionPlan();if(!ss||!plan.length){box.innerHTML='<div class="card">Passet kunde inte läsas.</div>';return}if(ss.finished){const done=ss.results.filter(r=>!r.skipped),mins=done.reduce((a,r)=>a+r.minutes,0);document.querySelector('#sessionHeader').textContent='Passet klart';box.innerHTML=`<div class="session-card session-summary"><div class="eyebrow">PASSET ÄR SPARAT</div><h2>Bra jobbat tillsammans</h2><div class="metric">${mins} min</div><p>${done.length} moment registrerades i journalen, livsboken, XP och statistik.</p><div class="lesson-section"><b>Snabb återhämtningskontroll</b><small>Detta justerar nästa pass.</small><label>Trötthet</label><div class="recovery-grid"><button data-recovery-field="tired" data-recovery-value="low">Låg</button><button data-recovery-field="tired" data-recovery-value="normal">Normal</button><button data-recovery-field="tired" data-recovery-value="high">Hög</button></div><label>Ville fortsätta?</label><div class="recovery-grid"><button data-recovery-field="continue" data-recovery-value="yes">Ja</button><button data-recovery-field="continue" data-recovery-value="neutral">Neutral</button><button data-recovery-field="continue" data-recovery-value="no">Nej</button></div><label>Rörelser</label><div class="recovery-grid"><button data-recovery-field="movement" data-recovery-value="normal">Normala</button><button data-recovery-field="movement" data-recovery-value="uncertain">Osäker</button><button data-recovery-field="movement" data-recovery-value="abnormal">Avvikande</button></div><div id="recoverySaved" class="good" style="margin-top:10px">Välj ett svar på varje rad.</div></div><button class="button block" id="finishSession">Tillbaka till FIELD MANUAL HQ</button></div>`;return}const i=Math.min(ss.index,plan.length-1),x=plan[i];document.querySelector('#sessionHeader').textContent=`Steg ${i+1} av ${plan.length}`;box.innerHTML=`<div class="session-card"><div class="session-counter">MOMENT ${i+1} AV ${plan.length}</div><div class="session-progress"><i style="width:${Math.round(i/plan.length*100)}%"></i></div><div class="session-meta"><span>${x.duration} min</span><span>${escapeHtml(x.cat||'Grund')}</span><span>belastning ${x.load||1}/3</span></div><h2 class="session-title">${x.title}</h2><p>${x.goal}</p><div class="session-timer" id="sessionTimer">${String(x.duration).padStart(2,'0')}:00</div><div class="session-step"><b>Gör så här</b>${x.steps.map((v,n)=>`<div>${n+1}. ${v}</div>`).join('')}</div><div class="session-step"><b>Observera</b>${x.progress}</div><div class="session-step"><b>Undvik</b>${x.mistake}</div><div class="session-actions"><button class="button secondary" id="toggleTimer">Starta timer</button><button class="button" id="completeSessionStep">Moment klart</button></div><button class="button secondary block" id="skipSessionStep" style="margin-top:10px">Hoppa över idag</button></div>`}
function startStepTimer(){const plan=trainingSessionPlan(),ss=state.activeTrainingSession,x=plan[ss.index];let sec=x.duration*60,out=document.querySelector('#sessionTimer'),btn=document.querySelector('#toggleTimer');if(sessionTimer){clearInterval(sessionTimer);sessionTimer=null;btn.textContent='Fortsätt timer';return}btn.textContent='Pausa timer';sessionTimer=setInterval(()=>{sec--;if(out)out.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;if(sec<=0){clearInterval(sessionTimer);sessionTimer=null;if(btn)btn.textContent='Tiden är klar'}},1000)}
function completeTrainingStep(skipped=false){clearInterval(sessionTimer);sessionTimer=null;const ss=state.activeTrainingSession,plan=trainingSessionPlan(),x=plan[ss.index];ss.results.push({id:x.id,title:x.title,cat:x.cat,minutes:skipped?0:x.duration,skipped,completedAt:new Date().toISOString()});ss.index++;if(ss.index>=plan.length){ss.finished=true;finalizeTrainingSession()}else{localStorage.setItem(STORE,JSON.stringify(state));renderTrainingSession()}}
function finalizeTrainingSession(){const ss=state.activeTrainingSession,done=ss.results.filter(r=>!r.skipped);if(done.length){const created=new Date().toISOString(),total=done.reduce((a,r)=>a+r.minutes,0),titles=done.map(r=>r.title).join(', ');done.forEach(r=>state.journal.push({date:ss.date,type:r.cat==='nos'?'Nosarbete':r.cat==='miljo'?'Miljö':r.cat==='inkallning'?'Inkallning':r.cat==='sar'?'Sök':r.cat==='aterhamtning'?'Vila/återhämtning':'Relation & lek',rating:5,minutes:r.minutes,note:`Guidat pass: ${r.title}`,weight:'',photo:'',exerciseId:r.id,exerciseCategory:r.cat,created}));state.lifeEvents.push({date:ss.date,category:'Träning',title:`Guidat träningspass · ${done.length} moment`,note:`${titles}. Totalt ${total} minuter.`,rating:5,person:state.activeProfile,created,source:`guided-session-${ss.startedAt}`})}localStorage.setItem(STORE,JSON.stringify(state));renderTrainingSession();renderAll()}

function renderSettings(){document.querySelector("#birthDate").value=state.birthDate;document.querySelector("#pickupDate").value=state.pickupDate}

function renderEquipment(){
 state.equipmentStatus=state.equipmentStatus||{};
 const cat=document.querySelector('#equipmentCategoryFilter');if(!cat)return;
 const categories=[...new Set(equipmentLibrary.map(x=>x.category))];const selected=cat.value||'all';cat.innerHTML='<option value="all">Alla kategorier</option>'+categories.map(x=>`<option value="${x}" ${selected===x?'selected':''}>${x}</option>`).join('');
 const sf=document.querySelector('#equipmentStatusFilter'),status=sf.value||'all',category=cat.value||'all';
 const list=equipmentLibrary.filter(x=>(category==='all'||x.category===category)&&(status==='all'||(state.equipmentStatus[x.id]||'needed')===status));
 document.querySelector('#equipmentList').innerHTML=list.length?list.map(x=>{const st=state.equipmentStatus[x.id]||'needed';return `<div class="equipment-item ${x.priority===1?'equipment-recommended':''}"><div class="equipment-top"><div><div class="equipment-title">${escapeHtml(x.name)}</div><div class="equipment-meta">${escapeHtml(x.category)} · ${escapeHtml(x.phase)} · cirka ${x.price.toLocaleString('sv-SE')} kr</div></div><select class="equipment-status" data-equipment-status="${x.id}"><option value="needed" ${st==='needed'?'selected':''}>Behövs</option><option value="planned" ${st==='planned'?'selected':''}>Planerad</option><option value="ordered" ${st==='ordered'?'selected':''}>Beställd</option><option value="owned" ${st==='owned'?'selected':''}>Inköpt</option></select></div><div class="equipment-note">${escapeHtml(x.note)}</div></div>`}).join(''):'<div class="empty">Ingen utrustning matchar filtret.</div>';
 const owned=equipmentLibrary.filter(x=>(state.equipmentStatus[x.id]||'needed')==='owned').length;const planned=equipmentLibrary.filter(x=>['planned','ordered'].includes(state.equipmentStatus[x.id]||'needed')).length;const budget=equipmentLibrary.filter(x=>(state.equipmentStatus[x.id]||'needed')!=='owned').reduce((a,x)=>a+x.price,0);
 document.querySelector('#equipmentOwned').textContent=owned;document.querySelector('#equipmentPlanned').textContent=planned;document.querySelector('#equipmentBudget').textContent=budget.toLocaleString('sv-SE')+' kr';
}
function refreshLiveGreeting(){if(document.querySelector('#greetingTitle'))renderToday()}

function academyProgress(){
 state.academyCompleted=state.academyCompleted||{};const open=academyLessons.filter(x=>ageParts().weeks>=x.minWeeks),done=open.filter(x=>state.academyCompleted[x.id]).length;return{open,done,pct:open.length?Math.round(done/open.length*100):0};
}
function lessonCard(x){const done=!!state.academyCompleted?.[x.id],locked=ageParts().weeks<x.minWeeks;return `<div class="item lesson-card ${done?'done':locked?'':'active'}"><div class="lesson-top"><div><span class="activity-status ${locked?'future':'now'}">${locked?'Från vecka '+x.minWeeks:x.phase}</span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.cat)} · ${x.minutes} min</small></div><span class="lesson-status ${done?'done':''}">${done?'Klar ✓':locked?'Låst':'Aktiv'}</span></div><p>${escapeHtml(x.goal)}</p><details><summary>Öppna lektionen</summary><div class="lesson-section"><b>Varför</b><p>${escapeHtml(x.why)}</p></div><div class="lesson-section"><b>Steg för steg</b><ol>${x.steps.map(v=>`<li>${escapeHtml(v)}</li>`).join('')}</ol></div><div class="lesson-section"><b>Vanliga misstag</b><ul>${x.mistakes.map(v=>`<li>${escapeHtml(v)}</li>`).join('')}</ul></div><div class="test-box"><b>Kompetenstest</b><p>${escapeHtml(x.test)}</p></div><div class="pathway">${x.path.map((v,i)=>`${i?'<i>→</i>':''}<span>${escapeHtml(v)}</span>`).join('')}</div><div>${x.sources.map(v=>`<span class="source-chip">${escapeHtml(v)}</span>`).join('')}</div></details>${locked?'':`<div class="academy-actions"><button class="button secondary" data-academy-toggle="${x.id}">${done?'Markera som pågående':'Markera lektion klar'}</button><button class="button" data-academy-log="${x.id}">Logga träning</button></div>`}</div>`}
function renderAcademy(){const a=academyProgress(),f=ageFocus(),next=a.open.find(x=>!state.academyCompleted?.[x.id]);document.querySelector('#academyAge').textContent=`vecka ${ageParts().weeks}`;document.querySelector('#academyPhase').textContent=f.title;document.querySelector('#academyDirective').textContent=next?`Nästa fokus: ${next.title}. ${next.goal}`:'Alla öppna lektioner är genomförda. Generalisera innan nästa fas.';document.querySelector('#academyPercent').textContent=a.pct+'%';document.querySelector('#academyRing').style.setProperty('--p',a.pct);document.querySelector('#academyPath').innerHTML=['Trygg start','Grundfärdigheter','Unghund','SAR-grund','Operativ'].map((v,i)=>`${i?'<i>→</i>':''}<span>${v}</span>`).join('');document.querySelector('#academyRecommended').innerHTML=next?lessonCard(next):'<div class="good">Bra balans. Repetera öppna lektioner i nya, lätta miljöer.</div>';document.querySelector('#academyCount').textContent=`${academyLessons.length} lektioner`;document.querySelector('#academyLessons').innerHTML=academyLessons.map(lessonCard).join('')}
function physicalScores(){const areas=['Bog','Lår','Bakdel','Bål','Balans','Koordination'];const cut=new Date();cut.setDate(cut.getDate()-30);return areas.map(area=>{const n=state.journal.filter(j=>dateOnly(j.date)>=cut&&j.exerciseCategory==='fysik'&&(j.physicalArea===area||((j.note||'').toLowerCase().includes(area.toLowerCase())))).length;return{name:area,score:Math.min(100,n*20)}})}
function physicalCard(x){const locked=ageParts().weeks<x.minWeeks;return `<div class="item physical-card ${locked?'locked':''}"><span class="activity-status ${locked?'future':'now'}">${locked?'Från vecka '+x.minWeeks:x.area}</span><strong>${escapeHtml(x.title)}</strong><div class="dose">${escapeHtml(x.dose)} · belastning ${x.load}/3</div><p>${escapeHtml(x.goal)}</p><details><summary>Instruktion och säkerhet</summary><ol>${x.steps.map(v=>`<li>${escapeHtml(v)}</li>`).join('')}</ol><p><b>Undvik:</b> ${escapeHtml(x.avoid)}</p></details>${locked?'':`<button class="button secondary" data-physical-log="${x.id}">Logga övningen</button>`}</div>`}
function renderPhysical(){const scores=physicalScores(),open=physicalExercises.filter(x=>ageParts().weeks>=x.minWeeks),lowest=[...scores].sort((a,b)=>a.score-b.score)[0],recommended=open.find(x=>x.area.includes(lowest.name))||open[0];document.querySelector('#physicalAge').textContent=`vecka ${ageParts().weeks}`;document.querySelector('#physicalMetrics').innerHTML=scores.map(x=>`<div class="physical-metric"><b>${x.name}<span>${x.score}%</span></b><div class="bar"><i style="width:${x.score}%"></i></div><div class="mini-score">${x.score?x.score/20+' pass registrerade':'Inte tränad senaste 30 dagarna'}</div></div>`).join('');document.querySelector('#physicalLoad').textContent=workload().level==='Hög'?'återhämtning idag':'låg–måttlig belastning';document.querySelector('#physicalRecommended').innerHTML=recommended?physicalCard(recommended):'<div class="empty">Fokus på fria, lugna rörelser och vardagsmiljö tills vecka 8.</div>';document.querySelector('#physicalExercises').innerHTML=physicalExercises.map(physicalCard).join('')}
function competenceProfile(){
 const defs=[
  ["Relation","relation",["Relation & lek"],"🤝"],["Inkallning","inkallning",["Inkallning"],"↩"],["Nos","nos",["Nosarbete"],"👃"],["Miljö","miljo",["Miljö"],"🌲"],["SAR","sar",["Sök"],"◎"],["Återhämtning","aterhamtning",["Vila/återhämtning"],"◷"]
 ];
 const cut=new Date();cut.setDate(cut.getDate()-30);
 const recent=state.journal.filter(j=>dateOnly(j.date)>=cut);
 const completed=Object.keys(state.academyCompleted||{}).filter(k=>state.academyCompleted[k]);
 return defs.map(([name,cat,types,icon])=>{
  const logs=recent.filter(j=>j.exerciseCategory===cat||types.includes(j.type));
  const quality=logs.reduce((a,j)=>a+(+j.rating||3),0);
  const academy=academyLessons.filter(x=>completed.includes(x.id)&&(x.cat||'').toLowerCase().includes(name.toLowerCase().slice(0,4))).length;
  const envBonus=name==='Miljö'?Object.values(state.environments||{}).filter(Boolean).length:0;
  const score=Math.min(100,Math.round(logs.length*9+quality*2+academy*8+envBonus*2));
  return{name,cat,icon,score,sessions:logs.length};
 });
}
function operationalReadiness(){const p=competenceProfile(),avg=Math.round(p.reduce((a,x)=>a+x.score,0)/p.length),intel=intelligenceAnalysis();const recoveries=(state.recoveryLogs||[]).slice(-5),poor=recoveries.filter(x=>x.movement==='abnormal'||x.tired==='high').length;const readiness=Math.max(20,Math.min(98,Math.round(avg*.55+intel.score*.45-poor*8)));const low=[...p].sort((a,b)=>a.score-b.score)[0];return{p,readiness,recovery:poor?'Följ upp':'Bra',focus:low.name}}
function renderOperationalDashboard(){const o=operationalReadiness(),box=document.querySelector('#operationalProfile');if(!box)return;box.innerHTML=o.p.slice(0,6).map(x=>`<div class="op-metric"><div class="op-metric-head"><strong>${x.icon} ${x.name}</strong><span>${x.score}%</span></div><div class="bar"><i style="width:${x.score}%"></i></div><small>${x.sessions?x.sessions+' pass / 30 dagar':'Inte påbörjad'}</small></div>`).join('');document.querySelector('#opReadiness').textContent=o.readiness+'%';document.querySelector('#opRecovery').textContent=o.recovery;document.querySelector('#opFocus').textContent=o.focus;const pb=document.querySelector('#progressCompetence');if(pb)pb.innerHTML=box.innerHTML}
function renderWeeklyReport(){const r=recentJournal(7),mins=r.reduce((a,j)=>a+(+j.minutes||0),0),cats={};r.forEach(j=>{const k=j.exerciseCategory||j.type||'Övrigt';cats[k]=(cats[k]||0)+1});const ranked=Object.entries(cats).sort((a,b)=>b[1]-a[1]);const strength=ranked[0]?.[0]||'Ingen data ännu';const profile=competenceProfile();const focus=[...profile].sort((a,b)=>a.score-b.score)[0]?.name||'Relation';const activeDays=new Set(r.map(j=>j.date)).size;document.querySelector('#weeklyReportTitle').textContent=`Vecka · ${r.length} pass på ${activeDays} dagar`;document.querySelector('#weeklyReportText').textContent=r.length?`${mins} minuter registrerade. FIELD MANUAL väger samman träningsmängd, variation och återhämtning inför nästa vecka.`:'Logga de första passen så skapas en automatisk veckorapport.';document.querySelector('#weeklyStrength').textContent=strength;document.querySelector('#weeklyFocus').textContent=focus}
function saveRecovery(field,value){state._pendingRecovery=state._pendingRecovery||{date:isoToday(),created:new Date().toISOString(),profile:state.activeProfile};state._pendingRecovery[field]=value;document.querySelectorAll(`[data-recovery-field="${field}"]`).forEach(b=>b.classList.toggle('on',b.dataset.recoveryValue===value));if(['tired','continue','movement'].every(k=>state._pendingRecovery[k])){state.recoveryLogs=state.recoveryLogs||[];state.recoveryLogs.push(state._pendingRecovery);state._pendingRecovery=null;localStorage.setItem(STORE,JSON.stringify(state));const m=document.querySelector('#recoverySaved');if(m)m.textContent='Återhämtningen är sparad och påverkar nästa rekommendation.'}}

const foundationMissions=[
 {id:"m_home",title:"Trygg hemkomst",phase:"Trygg start",minWeeks:8,maxWeeks:11,duration:12,load:1,summary:"Skapa trygghet, frivillig kontakt och en lugn avslutning i hemmiljön.",skills:{relation:4,kontakt:3,aterhamtning:3},steps:["Låt ILO undersöka ett avgränsat rum i egen takt.","Belöna frivilliga blickar och närmanden utan att kalla.","Avsluta med vila på den planerade sovplatsen."],done:"ILO kan varva ned och söker självmant kontakt."},
 {id:"m_name",title:"Namn och orientering",phase:"Trygg start",minWeeks:8,maxWeeks:16,duration:8,load:1,summary:"Bygg en snabb, positiv orientering mot föraren.",skills:{kontakt:5,relation:2,inkallning:1},steps:["Säg ILO en gång i lugn miljö.","Markera direkt när han vänder huvudet mot dig.","Gör 5–8 försök och sluta medan han vill fortsätta."],done:"8 av 10 direkta orienteringar i två miljöer."},
 {id:"m_crate",title:"Bur och bil – första lugnet",phase:"Trygg start",minWeeks:8,maxWeeks:20,duration:10,load:1,summary:"Gör buren till en trygg viloplats utan att öka tiden för fort.",skills:{aterhamtning:5,miljo:2,relation:1},steps:["Lägg frivilligt in godis eller tugg i öppen bur.","Stäng dörren 1–3 sekunder och öppna innan oro.","Sitt nära bilen och avsluta efter en lugn repetition."],done:"ILO går frivilligt in och kan vila kort med stängd dörr."},
 {id:"m_nose",title:"Första självständiga nosuppdraget",phase:"Grundperiod",minWeeks:9,maxWeeks:24,duration:10,load:2,summary:"Låt ILO lösa en enkel uppgift med nosen utan hjälp.",skills:{nos:5,sjalvstandighet:3,miljo:1},steps:["Strö 8–12 små godbitar i kort gräs.","Ge startsignal och stå stilla.","Låt honom arbeta färdigt utan pekande eller prat."],done:"Söker fokuserat i 30–60 sekunder och avslutar lugnt."},
 {id:"m_environment",title:"Ny miljö med kontroll",phase:"Grundperiod",minWeeks:10,maxWeeks:28,duration:15,load:2,summary:"Bygg miljösäkerhet genom kort exponering och egen återhämtning.",skills:{miljo:5,relation:2,balans:2},steps:["Välj en lugn ny plats med reträttväg.","Låt ILO observera och röra sig i eget tempo.","Belöna utforskande och lämna innan han blir trött."],done:"Kan äta, utforska och återgå till föraren på platsen."},
 {id:"m_body",title:"Kroppskontroll – underlag",phase:"Grundperiod",minWeeks:10,maxWeeks:32,duration:8,load:2,summary:"Utveckla balans och koordination utan hopp eller tung belastning.",skills:{balans:5,bakdel:2,bog:2},steps:["Lägg ut matta, gräs, grus och låg mjuk kudde.","Locka inte över – låt ILO välja att kliva på.","Gör 2–3 lugna varv och avsluta."],done:"Rör sig avslappnat över fyra säkra underlag."},
 {id:"m_recall",title:"Inkallning som lek",phase:"Grundperiod",minWeeks:10,maxWeeks:30,duration:8,load:2,summary:"Skapa hög fart och stark förväntan hela vägen in till föraren.",skills:{inkallning:5,kontakt:3,relation:2},steps:["En familjemedlem håller ILO lätt medan du går 3–5 meter.","Säg Hit en gång och rör dig bakåt.","Belöna nära kroppen med lek eller flera godbitar."],done:"Kommer direkt 8 av 10 gånger i lätt miljö."},
 {id:"m_runner",title:"Första springfiguranten",phase:"Upptäckarperiod",minWeeks:16,maxWeeks:40,duration:15,load:3,summary:"Bygg maximal motivation för att hitta människa – utan krav på markering.",skills:{sar:5,nos:3,sjalvstandighet:3,relation:1},steps:["Figuranten leker kort och visar belöningen.","Figuranten springer synligt 15–25 meter och gömmer sig lätt.","Släpp på Sök och låt belöningen ske direkt hos figuranten."],done:"Springer självsäkert till figuranten och stannar för belöning."}
];
function foundationCompetence(){
 const keys={relation:"Relation",kontakt:"Kontakt",inkallning:"Inkallning",miljo:"Miljö",nos:"Nos",balans:"Balans",bog:"Bog",bakdel:"Bakdel",aterhamtning:"Återhämtning",sjalvstandighet:"Självständighet",sar:"SAR"};
 const score={};Object.keys(keys).forEach(k=>score[k]=0);
 state.journal.forEach(j=>{
   const cat=(j.exerciseCategory||j.type||"").toLowerCase(); const pts=Math.max(1,Math.min(5,+j.rating||3));
   if(cat.includes("relation")||cat.includes("lek"))score.relation+=pts; if(cat.includes("kontakt"))score.kontakt+=pts; if(cat.includes("inkall"))score.inkallning+=pts; if(cat.includes("miljö")||cat.includes("miljo"))score.miljo+=pts; if(cat.includes("nos")||cat.includes("sök"))score.nos+=pts; if(cat.includes("vila")||cat.includes("åter"))score.aterhamtning+=pts; if(j.physicalArea){const a=j.physicalArea.toLowerCase();if(a.includes("balans"))score.balans+=pts;if(a.includes("bog"))score.bog+=pts;if(a.includes("bak"))score.bakdel+=pts;}
 });
 (state.missionHistory||[]).forEach(h=>{const m=foundationMissions.find(x=>x.id===h.id);if(m)Object.entries(m.skills).forEach(([k,v])=>score[k]=(score[k]||0)+v)});
 const result=Object.entries(keys).map(([id,name])=>({id,name,points:score[id]||0,percent:Math.min(100,Math.round((score[id]||0)*6))}));
 return result;
}
function recommendedFoundationMission(){
 const w=ageParts().weeks,done=new Set((state.missionHistory||[]).map(x=>x.id)),comp=foundationCompetence();
 const eligible=foundationMissions.filter(m=>w>=m.minWeeks&&w<=m.maxWeeks);
 const ranked=eligible.map(m=>{let need=0;Object.entries(m.skills).forEach(([k,v])=>{const c=comp.find(x=>x.id===k);need+=(100-(c?.percent||0))*v});if(done.has(m.id))need-=180;return{m,need}}).sort((a,b)=>b.need-a.need);
 return ranked[0]?.m||foundationMissions[0];
}
function renderMissions(){
 const host=document.querySelector('#missionLibrary');if(!host)return;state.missionHistory=state.missionHistory||[];
 const rec=recommendedFoundationMission(),ph=phase()[0],comp=foundationCompetence();
 document.querySelector('#missionPhaseLabel').textContent=ph;document.querySelector('#missionRecommendedTitle').textContent=rec.title;document.querySelector('#missionRecommendedText').textContent=rec.summary;document.querySelector('#missionRecommendedSkills').innerHTML=Object.keys(rec.skills).map(k=>`<span class="competence-chip">${escapeHtml(comp.find(x=>x.id===k)?.name||k)} +${rec.skills[k]}</span>`).join('');document.querySelector('#startRecommendedMission').dataset.startmission=rec.id;
 document.querySelector('#foundationCompetenceGrid').innerHTML=comp.slice(0,8).map(c=>`<div class="foundation-metric"><b><span>${escapeHtml(c.name)}</span><span>${c.percent}%</span></b><div class="bar"><i style="width:${c.percent}%"></i></div><small>${c.points} kompetenspoäng</small></div>`).join('');
 const weakest=[...comp].sort((a,b)=>a.percent-b.percent)[0];document.querySelector('#foundationDecision').innerHTML=`<b>FIELD MANUAL-beslut:</b> ${escapeHtml(weakest.name)} är just nu minst utvecklad. Rekommendationen väger därför upp den kompetensen utan att öka belastningen för snabbt.`;
 const done=new Set(state.missionHistory.map(x=>x.id));document.querySelector('#missionCount').textContent=foundationMissions.length+' missioner';
 host.innerHTML=foundationMissions.map(m=>`<div class="card mission-card ${m.id===rec.id?'recommended':''} ${done.has(m.id)?'complete':''}" style="margin-top:12px"><div class="lesson-top"><div><div class="eyebrow">${escapeHtml(m.phase)} · ${m.duration} MIN</div><h3>${escapeHtml(m.title)}</h3></div><span class="lesson-status ${done.has(m.id)?'done':''}">${done.has(m.id)?'KLAR':m.id===rec.id?'REKOMMENDERAD':'ÖPPEN'}</span></div><p>${escapeHtml(m.summary)}</p><div>${Object.keys(m.skills).map(k=>`<span class="competence-chip">${escapeHtml(comp.find(x=>x.id===k)?.name||k)}</span>`).join('')}</div><div class="mission-steps">${m.steps.map((st,i)=>`<div class="mission-step"><span>${i+1}</span><div>${escapeHtml(st)}</div></div>`).join('')}</div><div class="test-box"><b>Klart när</b><br>${escapeHtml(m.done)}</div><button class="button ${done.has(m.id)?'secondary':''} block" data-startmission="${m.id}" style="margin-top:12px">${done.has(m.id)?'Genomför igen':'Starta mission'}</button></div>`).join('');
 const hist=[...state.missionHistory].sort((a,b)=>b.date.localeCompare(a.date));document.querySelector('#missionHistory').innerHTML=hist.length?hist.map(h=>{const m=foundationMissions.find(x=>x.id===h.id);return`<div class="item"><strong>${escapeHtml(m?.title||h.id)}</strong><small>${svDate(h.date)} · ${h.rating}/5 · ${h.minutes} min</small>${h.note?`<p>${escapeHtml(h.note)}</p>`:''}</div>`}).join(''):'<div class="card empty">Ingen mission genomförd ännu.</div>';
}
function startFoundationMission(id){
 const m=foundationMissions.find(x=>x.id===id);if(!m)return;const rating=prompt(`Mission: ${m.title}\n\nGenomför stegen och ange sedan helhetsbetyg 1–5.`,"4");if(rating===null)return;const n=Math.max(1,Math.min(5,parseInt(rating)||4));const note=prompt('Kort anteckning (valfritt):','')||'';state.missionHistory=state.missionHistory||[];state.missionHistory.push({id,date:isoToday(),rating:n,minutes:m.duration,note,profile:state.activeProfile,created:new Date().toISOString()});state.journal.push({date:isoToday(),type:'Mission',rating:n,minutes:m.duration,note:m.title+(note?' – '+note:''),exerciseId:m.id,exerciseCategory:Object.keys(m.skills)[0],created:new Date().toISOString()});save();openScreen('missions');}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-meal-index]')){const b=e.target.closest('[data-meal-index]'),i=+b.dataset.mealIndex,n=nutritionState(),k=mealKey(i);if(n.mealLog[k])delete n.mealLog[k];else n.mealLog[k]=new Date().toISOString();save();renderDailyChecklist();return}
 if(e.target.closest('[data-appetite]')){nutritionState().appetiteLog[isoToday()]=e.target.closest('[data-appetite]').dataset.appetite;save();return}
 if(e.target.id==="saveWeight"){const raw=document.querySelector('#weightInput').value.replace(',','.'),kg=parseFloat(raw),bcs=document.querySelector('#bcsInput').value,note=document.querySelector('#weightNote').value.trim();if(!kg||kg<=0){alert('Ange en giltig vikt.');return}const n=nutritionState();n.weights=n.weights.filter(x=>x.date!==isoToday());n.weights.push({date:isoToday(),kg:+kg.toFixed(1),bcs,note,person:state.activeProfile});state.lifeEvents.push({date:isoToday(),category:'Hälsa',title:`Vikt ${kg.toFixed(1)} kg`,note:`BCS ${bcs||'ej angivet'}${note?' · '+note:''}`,rating:5,person:state.activeProfile,created:new Date().toISOString(),source:`weight-${isoToday()}`});document.querySelector('#weightInput').value='';document.querySelector('#weightNote').value='';save();return}
 if(e.target.id==="saveFoodPlan"){const n=nutritionState();n.plannedFood=document.querySelector('#plannedFood').value.trim();n.switchDate=document.querySelector('#foodSwitchDate').value;save();return}
 if(e.target.id==="editMealPlan"){const n=nutritionState(),g=prompt('Gram per måltid',n.gramsPerMeal),count=prompt('Antal måltider per dag',n.mealsPerDay),times=prompt('Tider separerade med kommatecken',n.mealTimes.join(','));if(g!==null&&count!==null&&times!==null){n.gramsPerMeal=Math.max(1,parseInt(g)||n.gramsPerMeal);n.mealsPerDay=Math.max(2,Math.min(4,parseInt(count)||n.mealsPerDay));n.mealTimes=times.split(',').map(x=>x.trim()).filter(Boolean).slice(0,n.mealsPerDay);while(n.mealTimes.length<n.mealsPerDay)n.mealTimes.push(['07:00','12:00','18:00','21:00'][n.mealTimes.length]);n.calculatedDailyGrams=n.gramsPerMeal*n.mealsPerDay;save();}return}
 if(e.target.id==="assistFoodScan"){runFoodOCR();return}
 if(e.target.id==="calculateFood"){fillFoodFormFromKnownData();const w=latestWeight(),name=document.querySelector('#scanFoodName').value.trim(),kcal=+document.querySelector('#scanFoodKcal').value,mg=+document.querySelector('#scanManufacturerGrams').value;if(!name)return alert('Fyll i fodrets namn.');if(!w)return alert('Registrera ILOs aktuella vikt först.');if(!(kcal>0||mg>0))return alert('Fyll i tillverkarens g/dag. Om tabellen inte ger ett tydligt värde kan du istället ange kcal/kg.');const daily=calculateDailyFood(w.kg,kcal,mg),meals=ageParts().weeks<16?3:2,per=Math.round(daily/meals/5)*5;scannedFoodDraft={name,kcalPerKg:kcal,manufacturerGrams:mg,protein:+document.querySelector('#scanProtein').value||0,fat:+document.querySelector('#scanFat').value||0,calcium:+document.querySelector('#scanCalcium').value||0,phosphorus:+document.querySelector('#scanPhosphorus').value||0,completePuppy:document.querySelector('#scanPuppyComplete').checked,daily,meals,per};const ratio=scannedFoodDraft.phosphorus?scannedFoodDraft.calcium/scannedFoodDraft.phosphorus:0,flags=[];if(!scannedFoodDraft.completePuppy)flags.push('Bekräfta på etiketten att fodret är ett komplett helfoder för valp/tillväxt innan planen aktiveras.');if(scannedFoodDraft.calcium>0&&!scannedFoodDraft.phosphorus)flags.push('Fosfor saknas – mineralbalansen kan inte bedömas.');const r=document.querySelector('#foodCalcResult');r.style.display='block';r.innerHTML=`<small>BERÄKNAD STARTGIVA</small><br><strong>${daily} g/dag</strong><p>${meals} mål à cirka ${per} g · baserat på ${w.kg} kg${mg?' och tillverkarens tabell':' samt '+kcal+' kcal/kg'}.</p>${ratio?`<p>Ca:P ≈ ${ratio.toFixed(2).replace('.',',')}:1</p>`:''}${flags.length?`<div class="safety-note">${flags.map(escapeHtml).join('<br>')}</div>`:''}`;document.querySelector('#activateScannedFood').style.display='block';return}
 if(e.target.id==="activateScannedFood"&&scannedFoodDraft){if(!scannedFoodDraft.completePuppy)return alert('Bekräfta först att etiketten anger komplett helfoder för valp/tillväxt.');const n=nutritionState();Object.assign(n,{currentFood:scannedFoodDraft.name,kcalPerKg:scannedFoodDraft.kcalPerKg,manufacturerGrams:scannedFoodDraft.manufacturerGrams,protein:scannedFoodDraft.protein,fat:scannedFoodDraft.fat,calcium:scannedFoodDraft.calcium,phosphorus:scannedFoodDraft.phosphorus,completePuppy:scannedFoodDraft.completePuppy,calculatedDailyGrams:scannedFoodDraft.daily,mealsPerDay:scannedFoodDraft.meals,gramsPerMeal:scannedFoodDraft.per});n.mealTimes=scannedFoodDraft.meals===3?['07:00','12:00','18:00']:['07:00','18:00'];save();alert('Ny foderplan aktiverad. Följ vikt och hull varje vecka.');return}
 if(e.target.id==="saveCrateSession"){const c=crateState(),minutes=+document.querySelector('#crateMinutes').value,rating=+document.querySelector('#crateRating').value;if(!(minutes>=0))return;c.sessions.push({date:isoToday(),context:document.querySelector('#crateContext').value,minutes,rating,note:document.querySelector('#crateNote').value.trim(),profile:state.activeProfile,created:new Date().toISOString()});state.lifeEvents.push({date:isoToday(),category:'Bur & fordon',title:`Burpass ${minutes} min`,note:document.querySelector('#crateNote').value.trim(),rating,person:state.activeProfile,created:new Date().toISOString()});save();return}
 if(e.target.id==="saveHealthCheck"){const h=healthState();h.daily[isoToday()]={appetite:document.querySelector('#healthAppetite').value,stool:document.querySelector('#healthStool').value,energy:document.querySelector('#healthEnergy').value,sleep:document.querySelector('#healthSleep').value,note:document.querySelector('#healthNote').value.trim(),created:new Date().toISOString()};save();return}
 if(e.target.id==="saveCareEvent"){const h=healthState(),date=document.querySelector('#careDate').value;if(!date)return alert('Välj datum.');h.care.push({type:document.querySelector('#careType').value,date,note:document.querySelector('#careNote').value.trim()});save();return}
 if(e.target.dataset.delcare!==undefined){healthState().care.splice(+e.target.dataset.delcare,1);save();return}

const b=e.target.closest('[data-startmission]');if(b)startFoundationMission(b.dataset.startmission)});


let scannedFoodDraft=null;
function latestWeight(){const n=nutritionState();return n.weights.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]||null}
function puppyEnergyFactor(){const m=ageParts().months||0;return m<4?3:m<12?2:1.6}
function foodPhotoCount(){const p=nutritionState().foodPhotos||{};return ['foodFrontPhoto','foodTablePhoto','foodNutritionPhoto'].filter(k=>!!p[k]).length}
function updateFoodPhotoStatus(){const el=document.querySelector('#foodPhotoStatus');if(el){const c=foodPhotoCount();el.textContent=`${c} av 3 bilder klara${c===3?' · redo för snabbifyllnad.':'.'}`;el.className=c===3?'good':'tiny-note'}}
function fillFoodFormFromKnownData(){
 const n=nutritionState(), status=document.querySelector('#foodAssistStatus');
 const name=document.querySelector('#scanFoodName'), kcal=document.querySelector('#scanFoodKcal'), mg=document.querySelector('#scanManufacturerGrams'), protein=document.querySelector('#scanProtein'), fat=document.querySelector('#scanFat'), ca=document.querySelector('#scanCalcium'), ph=document.querySelector('#scanPhosphorus'), complete=document.querySelector('#scanPuppyComplete');
 if(name&&!name.value.trim()&&n.currentFood)name.value=n.currentFood;
 if(kcal&&!kcal.value&&n.kcalPerKg)kcal.value=n.kcalPerKg;
 if(mg&&!mg.value&&n.manufacturerGrams)mg.value=n.manufacturerGrams;
 if(protein&&!protein.value&&n.protein)protein.value=n.protein;
 if(fat&&!fat.value&&n.fat)fat.value=n.fat;
 if(ca&&!ca.value&&n.calcium)ca.value=n.calcium;
 if(ph&&!ph.value&&n.phosphorus)ph.value=n.phosphorus;
 const nm=(name?.value||'').toLowerCase(); if(complete&&!complete.checked&&(n.completePuppy||/puppy|valp|junior|growth|tillväxt/.test(nm)))complete.checked=true;
 const missing=[];if(!name?.value.trim())missing.push('fodrets namn');if(!(+(kcal?.value||0)>0||+(mg?.value||0)>0))missing.push('kcal/kg eller tillverkarens g/dag');
 if(status)status.innerHTML=missing.length?`Jag fyllde i det som redan finns sparat. Bildläsningen kunde inte säkert hitta <b>${missing.join(' och ')}</b>. Kontrollera bara dessa fält.`:`Grunduppgifterna är ifyllda. Kontrollera dem mot bilderna och tryck sedan <b>Beräkna startgiva</b>.`;
 return missing.length===0;
}

function normalizeOCRText(t){return (t||'').replace(/\r/g,'\n').replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim()}
function numFromMatch(v){if(!v)return 0;v=String(v).replace(/\s/g,'').replace(',','.').replace(/[^0-9.]/g,'');const n=parseFloat(v);return Number.isFinite(n)?n:0}
function pickPercent(text, words){
 const esc=words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 const pats=[new RegExp('(?:'+esc+')\\s*[:\\-]?\\s*(\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%','i'),new RegExp('(\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%\\s*(?:'+esc+')','i')];
 for(const p of pats){const m=text.match(p);if(m)return numFromMatch(m[1])}return 0
}
function parseFoodOCR(front,table,nutrition){
 const all=normalizeOCRText([front,table,nutrition].join(' '));
 const lower=all.toLowerCase();
 let name='';
 if(/purina\s+pro\s+plan/i.test(all)){
   name='Purina Pro Plan';
   if(/large\s+athletic/i.test(all))name+=' Large Athletic';
   if(/puppy|welpe|junior|valp/i.test(all))name+=' Puppy';
 } else {
   const lines=(front||'').split(/\n+/).map(x=>x.trim()).filter(x=>x.length>3&&x.length<70);
   name=lines.find(x=>/[A-Za-zÅÄÖåäö]{4}/.test(x))||'';
 }
 let kcal=0;
 const kcalPatterns=[/(\d{3,5})\s*kcal\s*\/\s*kg/i,/kcal\s*\/\s*kg\s*[:\-]?\s*(\d{3,5})/i,/metaboli[sz](?:able|able\s+energy|ierbare\s+energie)?[^0-9]{0,30}(\d{3,5})\s*kcal/i];
 for(const p of kcalPatterns){const m=all.match(p);if(m){const n=numFromMatch(m[1]);if(n>=2500&&n<=6000){kcal=n;break}}}
 let manufacturer=0;
 const gPats=[/(?:g\s*\/\s*day|g\s*\/\s*dag|g\s+per\s+day|grams?\s+per\s+day|daily\s+(?:amount|ration))\s*[:\-]?\s*(\d{2,4})/i,/(\d{2,4})\s*(?:g\s*\/\s*day|g\s*\/\s*dag|g\s+per\s+day)/i];
 for(const p of gPats){const m=all.match(p);if(m){const n=numFromMatch(m[1]);if(n>=40&&n<=1500){manufacturer=n;break}}}
 const protein=pickPercent(all,['protein','crude protein','råprotein','rohprotein']);
 const fat=pickPercent(all,['fat','crude fat','råfett','fett','rohfett']);
 const calcium=pickPercent(all,['calcium','kalcium','kalzium']);
 const phosphorus=pickPercent(all,['phosphorus','phosphor','fosfor']);
 const complete=/(complete\s+(?:pet\s+)?food[^.]{0,30}(?:puppy|growth)|complete\s+feed[^.]{0,30}(?:puppy|growth)|helfoder[^.]{0,30}(?:valp|tillväxt))/i.test(all);
 return {name,kcal,manufacturer,protein,fat,calcium,phosphorus,complete,raw:all}
}
async function runFoodOCR(){
 const n=nutritionState(), status=document.querySelector('#foodAssistStatus'), btn=document.querySelector('#assistFoodScan'), review=document.querySelector('#foodOcrReview');
 const imgs=n.foodPhotos||{}; const ids=['foodFrontPhoto','foodTablePhoto','foodNutritionPhoto'];
 if(ids.some(id=>!imgs[id])){status.innerHTML='Ta eller välj <b>alla tre bilderna</b> först.';return}
 if(!navigator.onLine){status.innerHTML='Bildläsningen behöver internet. Bilderna är sparade — prova igen när du är online.';return}
 if(!window.Tesseract){status.innerHTML='Bildläsaren kunde inte laddas. Kontrollera internetanslutningen och prova igen.';return}
 btn.disabled=true; const old=btn.textContent; btn.textContent='Läser bilder…';
 try{
   const texts=[];
   for(let i=0;i<ids.length;i++){
     status.textContent=`Läser bild ${i+1} av 3… första analysen kan ta en stund.`;
     const r=await Tesseract.recognize(imgs[ids[i]],'eng',{logger:m=>{if(m.status==='recognizing text'&&typeof m.progress==='number')status.textContent=`Läser bild ${i+1} av 3 · ${Math.round(m.progress*100)} %`}});
     texts.push(r?.data?.text||'');
   }
   const d=parseFoodOCR(texts[0],texts[1],texts[2]);
   const fields={
     name:['#scanFoodName',d.name], kcal:['#scanFoodKcal',d.kcal], manufacturer:['#scanManufacturerGrams',d.manufacturer],
     protein:['#scanProtein',d.protein], fat:['#scanFat',d.fat], calcium:['#scanCalcium',d.calcium], phosphorus:['#scanPhosphorus',d.phosphorus]
   };
   const oldName=(document.querySelector('#scanFoodName')?.value||'').trim();
   const newProduct=!!(d.name && oldName && d.name.toLowerCase()!==oldName.toLowerCase());
   // A newly recognised product must never inherit nutrition values from the previous food.
   if(newProduct){
     ['#scanFoodKcal','#scanManufacturerGrams','#scanProtein','#scanFat','#scanCalcium','#scanPhosphorus'].forEach(sel=>{const el=document.querySelector(sel);if(el){el.value='';el.classList.remove('ocr-changed')}});
     const c=document.querySelector('#scanPuppyComplete');if(c)c.checked=false;
   }
   const changed=[];
   Object.entries(fields).forEach(([key,[sel,val]])=>{
     const el=document.querySelector(sel); if(!el)return;
     el.classList.remove('ocr-changed');
     if(val){
       const before=String(el.value||'').trim();
       el.value=val;
       if(String(val)!==before){el.classList.add('ocr-changed');changed.push(key)}
     }
   });
   const completeEl=document.querySelector('#scanPuppyComplete');
   if(completeEl){
     if(d.complete){completeEl.checked=true;changed.push('complete')}
     else if(newProduct)completeEl.checked=false;
   }
   // Only use stored data as fallback when OCR did NOT identify a different product.
   if(!newProduct) fillFoodFormFromKnownData();
   const found=[];if(d.name)found.push('namn');if(d.kcal)found.push('energi');if(d.manufacturer)found.push('g/dag');if(d.protein)found.push('protein');if(d.fat)found.push('fett');if(d.calcium)found.push('kalcium');if(d.phosphorus)found.push('fosfor');if(d.complete)found.push('valp/helfoder');
   const rows=[
     ['Foder',d.name||'Inte säkert läst',!!d.name],['Energi',d.kcal?`${d.kcal} kcal/kg`:'Inte säkert läst',!!d.kcal],
     ['Tillverkarens g/dag',d.manufacturer?`${d.manufacturer} g`:'Inte säkert läst',!!d.manufacturer],['Protein',d.protein?`${d.protein} %`:'Inte säkert läst',!!d.protein],
     ['Fett',d.fat?`${d.fat} %`:'Inte säkert läst',!!d.fat],['Kalcium',d.calcium?`${d.calcium} %`:'Inte säkert läst',!!d.calcium],
     ['Fosfor',d.phosphorus?`${d.phosphorus} %`:'Inte säkert läst',!!d.phosphorus],['Komplett valpfoder',d.complete?'Ja, text hittad':'Ej säkert bekräftat',d.complete]
   ];
   if(review){
     review.style.display='block';
     review.innerHTML=`<h4>Läst från de nya bilderna</h4><div class="ocr-grid">${rows.map(r=>`<div class="ocr-cell ${r[2]?'':'missing'}"><span>${escapeHtml(r[0])}</span><b>${escapeHtml(r[1])}</b></div>`).join('')}</div><p class="tiny-note" style="margin:10px 0 0">Gulmarkerade formulärfält har ändrats av bildläsningen. ”Inte säkert läst” lämnas tomt när ett nytt foder identifierats, så gamla värden inte råkar följa med.</p>`;
   }
   status.innerHTML=found.length?`Bildläsning klar. <b>${found.length} uppgifter hittades</b>${changed.length?` och ${changed.length} fält uppdaterades`:''}. Kontrollera resultatet nedan innan du beräknar.`:'Bilderna gick att läsa men inga säkra foderuppgifter kunde extraheras. Ta närmare, skarpare bilder av tabellen och näringsrutan.';
 }catch(err){console.error(err);status.textContent='Bildläsningen misslyckades. Ta en rak, skarp närbild av etiketten och prova igen.'}
 finally{btn.disabled=false;btn.textContent=old}
}

function calculateDailyFood(kg,kcalPerKg,manufacturerGrams){if(manufacturerGrams>0)return Math.round(manufacturerGrams);if(!(kg>0&&kcalPerKg>0))return 0;const rer=70*Math.pow(kg,.75),kcal=rer*puppyEnergyFactor();return Math.round((kcal/(kcalPerKg/1000))/5)*5}
function mealNames(count){return count===4?['Frukost','Förmiddag','Eftermiddag','Kväll']:count===2?['Morgon','Kväll']:['Frukost','Lunch','Kväll']}
function drawWeightChart(){const c=document.querySelector('#weightChart');if(!c)return;const ctx=c.getContext('2d'),arr=nutritionState().weights.slice().sort((a,b)=>a.date.localeCompare(b.date));ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#07130f';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=1;for(let i=1;i<5;i++){const y=i*c.height/5;ctx.beginPath();ctx.moveTo(35,y);ctx.lineTo(c.width-15,y);ctx.stroke()}if(arr.length<2){ctx.fillStyle='#9dafA7';ctx.font='24px sans-serif';ctx.fillText('Minst två vägningar behövs för kurvan',55,125);return}const vals=arr.map(x=>x.kg),min=Math.min(...vals)*.92,max=Math.max(...vals)*1.08;ctx.strokeStyle='#f0c75e';ctx.lineWidth=5;ctx.lineJoin='round';ctx.beginPath();arr.forEach((x,i)=>{const px=35+i*(c.width-55)/(arr.length-1),py=c.height-25-(x.kg-min)/(max-min||1)*(c.height-55);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();arr.forEach((x,i)=>{const px=35+i*(c.width-55)/(arr.length-1),py=c.height-25-(x.kg-min)/(max-min||1)*(c.height-55);ctx.fillStyle='#f0c75e';ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill()})}
function renderWeightAnalysis(){const el=document.querySelector('#weightAnalysis');if(!el)return;const a=nutritionState().weights.slice().sort((x,y)=>x.date.localeCompare(y.date));if(a.length<2){el.textContent='Registrera minst två veckovikter för trendanalys.';return}const p=a[a.length-2],n=a[a.length-1],days=Math.max(1,daysBetween(p.date,n.date)),weekly=(n.kg-p.kg)*7/days;el.textContent=`Senaste trend: ${weekly>=0?'+':''}${weekly.toFixed(2).replace('.',',')} kg/vecka. Bedöm tillsammans med hull och allmäntillstånd – inte siffran ensam.`}
function crateState(){state.crate=state.crate||clone(defaults.crate);state.crate.sessions=state.crate.sessions||[];return state.crate}
const crateSteps=[['Frivilligt in','Går in och stannar kort med öppen dörr.'],['Stängd dörr','Lugn 1–5 minuter hemma.'],['Bil motor av','Vilar i bilbur utan körning.'],['Motor igång','Lugn med ljud och vibration.'],['Kort körning','Klarar 5–15 min körning.'],['Vänta kort','Vilar när föraren lämnar synfältet kort.'],['Träningsplats','Kan återhämta sig trots aktivitet runt bilen.'],['Längre väntan','Byggs gradvis och väder-/temperatursäkert.']];
function inferCrateLevel(){const s=crateState().sessions;if(!s.length)return 1;const best=k=>Math.max(0,...s.filter(x=>x.context===k&&x.rating>=4).map(x=>x.minutes));if(best('waiting')>=20)return 8;if(best('waiting')>=5)return 7;if(best('drive')>=10)return 6;if(best('drive')>=3)return 5;if(best('car_on')>=3)return 4;if(best('car_off')>=5)return 3;if(best('home')>=3)return 2;return 1}
function renderCrate(){const c=crateState(),level=inferCrateLevel();c.level=level;const lab=document.querySelector('#crateLevelLabel');if(lab)lab.textContent=`nivå ${level} av ${crateSteps.length}`;const host=document.querySelector('#crateProgress');if(host)host.innerHTML=crateSteps.map((x,i)=>`<div class="progress-step ${i<level-1?'done':i===level-1?'active':''}"><span class="step-dot">${i<level-1?'✓':i+1}</span><div><b>${escapeHtml(x[0])}</b><small>${escapeHtml(x[1])}</small></div><span>${i<level-1?'Klar':i===level-1?'Nu':'Senare'}</span></div>`).join('');const bestHome=Math.max(0,...c.sessions.filter(x=>x.context==='home'&&x.rating>=4).map(x=>x.minutes)),bestCar=Math.max(0,...c.sessions.filter(x=>x.context!=='home'&&x.rating>=4).map(x=>x.minutes));document.querySelector('#crateBestHome')&&(document.querySelector('#crateBestHome').textContent=bestHome+' min');document.querySelector('#crateBestCar')&&(document.querySelector('#crateBestCar').textContent=bestCar+' min');document.querySelector('#crateSessions')&&(document.querySelector('#crateSessions').textContent=c.sessions.length);const advice=document.querySelector('#crateAdvice');if(advice)advice.textContent=c.sessions.length?`Nästa pass: upprepa nivå ${level} och öka högst en sak om ILO var avslappnad.`:'Börja med frivilliga korta besök i öppen bur. Ingen tidsjakt.'}
function healthState(){state.health=state.health||clone(defaults.health);state.health.daily=state.health.daily||{};state.health.care=state.health.care||[];return state.health}
function renderHealth(){const h=healthState(),d=h.daily[isoToday()],s=document.querySelector('#healthStatus');if(s)s.textContent=d?`Sparat idag: aptit ${d.appetite.toLowerCase()}, energi ${d.energy.toLowerCase()}, sömn ${d.sleep.toLowerCase()}.`:'Ingen hälsokoll sparad idag.';const list=document.querySelector('#careList');if(list){const a=h.care.slice().sort((x,y)=>x.date.localeCompare(y.date));list.innerHTML=a.length?a.map((x,i)=>`<div class="item"><strong>${escapeHtml(x.type)}</strong><small>${svDate(x.date)}${x.note?' · '+escapeHtml(x.note):''}</small><button class="mini danger" data-delcare="${i}">Ta bort</button></div>`).join(''):'<p>Inga kommande vårdhändelser.</p>'}}
function renderNutritionPlan(){const n=nutritionState(),host=document.querySelector('#nutritionPlanStats'),title=document.querySelector('#currentFoodTitle');if(title)title.textContent=n.currentFood;const daily=n.calculatedDailyGrams||n.gramsPerMeal*n.mealsPerDay;if(host)host.innerHTML=`<div class="nutrition-stat"><small>Per mål</small><b>${n.gramsPerMeal} g</b></div><div class="nutrition-stat"><small>Per dag</small><b>${daily} g</b></div><div class="nutrition-stat"><small>Måltider</small><b>${n.mealsPerDay}</b></div><div class="nutrition-stat"><small>Energi</small><b>${n.kcalPerKg||'–'}${n.kcalPerKg?' kcal/kg':''}</b></div>`}
function nutritionState(){
 state.nutrition=state.nutrition||clone(defaults.nutrition);
 state.nutrition.mealLog=state.nutrition.mealLog||{};state.nutrition.appetiteLog=state.nutrition.appetiteLog||{};state.nutrition.weights=state.nutrition.weights||[];state.nutrition.foodPhotos=state.nutrition.foodPhotos||{};state.nutrition.calculatedDailyGrams=state.nutrition.calculatedDailyGrams||state.nutrition.gramsPerMeal*state.nutrition.mealsPerDay;
 return state.nutrition;
}
function mealKey(i){return `${isoToday()}-${i}`}
function nextMealInfo(){const n=nutritionState(),now=new Date(),mins=now.getHours()*60+now.getMinutes();for(let i=0;i<n.mealTimes.length;i++){const [h,m]=n.mealTimes[i].split(':').map(Number);if(h*60+m>=mins&&!n.mealLog[mealKey(i)])return `${n.mealTimes[i]} · ${n.gramsPerMeal} g`}return n.mealLog[mealKey(n.mealsPerDay-1)]?'Klart idag':'Nästa mål'}
function renderHomecoming(){
 const day=Math.max(1,daysBetween(state.pickupDate,isoToday())+1),n=nutritionState(),done=n.mealTimes.filter((_,i)=>n.mealLog[mealKey(i)]).length,w=n.weights.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
 const d=document.querySelector('#homecomingDayLabel');if(d)d.textContent=`dag ${day}`;
 const nm=document.querySelector('#homeNextMeal');if(nm)nm.textContent=nextMealInfo();
 const md=document.querySelector('#homeMealsDone');if(md)md.textContent=`${done} / ${n.mealsPerDay}`;
 const lw=document.querySelector('#homeLastWeight');if(lw)lw.textContent=w?`${String(w.kg).replace('.',',')} kg`:'Ej vägd';
 const nw=document.querySelector('#homeNextWeigh');if(nw){if(!w)nw.textContent='Väg idag';else{const days=daysBetween(w.date,isoToday());nw.textContent=days>=7?'Dags idag':`om ${7-days} dagar`}}
 const adv=document.querySelector('#homecomingAdvice');if(adv)adv.textContent=day<=3?'Lugn introduktion. Prioritera sömn, mat, rastning och trygg kontakt med familjen.':day<=21?'Bygg fasta rutiner och korta positiva erfarenheter. Undvik att fylla dagarna med för många intryck.':'Hemkomstfasen är genomförd. Fortsätt följa sömn, aptit, vikt och återhämtning.';
 const dfs=document.querySelector('#dailyFoodStatus');if(dfs)dfs.textContent=`${done} / ${n.mealsPerDay} mål`;const dfn=document.querySelector('#dailyFoodNext');if(dfn)dfn.textContent=nextMealInfo();
 const dws=document.querySelector('#dailyWeightStatus');if(dws)dws.textContent=w?`${String(w.kg).replace('.',',')} kg`:'Ej vägd';const dwn=document.querySelector('#dailyWeightNext');if(dwn)dwn.textContent=!w?'Väg idag':(daysBetween(w.date,isoToday())>=7?'Väg idag':`Nästa om ${7-daysBetween(w.date,isoToday())} dagar`);
 const cs=state.crate?.sessions||[],car=cs.filter(x=>String(x.context||'').startsWith('car')).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0],dcs=document.querySelector('#dailyCrateStatus'),dcn=document.querySelector('#dailyCrateNext');if(dcs)dcs.textContent=car?`${car.minutes||0} min senast`:'Inte startad';if(dcn)dcn.textContent=car?'Fortsätt lugnt från senaste nivå':'Öppna progression';
}
function renderNutrition(){
 const n=nutritionState(),a=ageParts();const age=document.querySelector('#nutritionAge');if(age)age.textContent=`${a.weeks} v ${a.rest} d`;renderNutritionPlan();
 const names=mealNames(n.mealsPerDay),ml=document.querySelector('#mealList');if(ml)ml.innerHTML=n.mealTimes.slice(0,n.mealsPerDay).map((t,i)=>{const done=n.mealLog[mealKey(i)];return `<div class="meal-row ${done?'done':''}"><div><strong>${names[i]||`Mål ${i+1}`} · ${t}</strong><small>${n.gramsPerMeal} g ${escapeHtml(n.currentFood)}</small></div><button class="button ${done?'secondary':''} meal-check" data-meal-index="${i}">${done?'Ångra':'Serverad'}</button></div>`}).join('');
 const ap=document.querySelector('#appetiteStatus'),av=n.appetiteLog[isoToday()];if(ap)ap.textContent=av?`Dagens aptit: ${{good:'bra',partial:'åt delvis',poor:'åt dåligt'}[av]||av}.`:'Ingen aptitnotering idag.';
 const wh=document.querySelector('#weightHistory');if(wh){const arr=n.weights.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);wh.innerHTML=arr.length?arr.map(x=>`<div class="weight-item"><span>${svDate(x.date)}${x.bcs?` · BCS ${x.bcs}`:''}</span><strong>${String(x.kg).replace('.',',')} kg</strong></div>`).join(''):'<p>Ingen vikt registrerad ännu. Väg ILO idag för att starta tillväxtkurvan.</p>'}
 const pf=document.querySelector('#plannedFood');if(pf)pf.value=n.plannedFood||'';const sd=document.querySelector('#foodSwitchDate');if(sd)sd.value=n.switchDate||'';const fs=document.querySelector('#foodPlanStatus');if(fs)fs.textContent=n.plannedFood?`Plan: ${n.plannedFood}${n.switchDate?` från ${svDate(n.switchDate)}`:''}.`:'Ingen ny fodersort planerad ännu.';drawWeightChart();renderWeightAnalysis();renderHomecoming();updateFoodPhotoStatus();
}
function renderAll(){renderCoursePlanner();updateILOTopProfile();renderToday();renderOperationalDashboard();renderWeeklyReport();renderIntelligence();renderDailyPlan();renderPlan();renderJournal();renderEnvironment();renderSar();renderWeeklyTraining();renderExerciseLibrary();renderProgress();renderSettings();renderFamily();renderEquipment();renderAcademy();renderPhysical();renderMissions();renderNutrition();renderDailyChecklist();renderCrate();renderHealth()}
function defaultsForShift(t){return{ledig:["",""],dag:["08:00","17:30"],natt:["17:30","08:00"],dygn:["08:00","08:00"],annat:["",""]}[t]||["",""]}
function clearShift(){document.querySelector("#shiftEditIndex").value="";document.querySelector("#shiftDate").value=isoToday();document.querySelector("#shiftType").value="dag";const p=defaultsForShift("dag");document.querySelector("#shiftStart").value=p[0];document.querySelector("#shiftEnd").value=p[1];document.querySelector("#shiftNote").value="";document.querySelector("#cancelShiftEdit").style.display="none";document.querySelector("#saveShift").textContent="Spara pass"}
function editShift(i){const s=state.shifts[i];document.querySelector("#shiftEditIndex").value=i;document.querySelector("#shiftDate").value=s.date;document.querySelector("#shiftType").value=s.type;document.querySelector("#shiftStart").value=s.start||"";document.querySelector("#shiftEnd").value=s.end||"";document.querySelector("#shiftNote").value=s.note||"";document.querySelector("#cancelShiftEdit").style.display="inline-block";document.querySelector("#saveShift").textContent="Spara ändring"}

async function compressFoodImage(file){return new Promise((resolve,reject)=>{const img=new Image(),r=new FileReader();r.onload=e=>img.src=e.target.result;img.onload=()=>{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.86))};r.onerror=reject;r.readAsDataURL(file)})}
async function compressImage(file){return new Promise((resolve,reject)=>{const img=new Image(),r=new FileReader();r.onload=e=>img.src=e.target.result;img.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=img.width*scale;c.height=img.height*scale;c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.7))};r.onerror=reject;r.readAsDataURL(file)})}

const screenNames={today:'Idag',plan:'Plan',journal:'Journal',environment:'Miljö',sar:'SAR-program',progress:'Utveckling',equipment:'Utrustning',nutrition:'Foder & vikt',crate:'Bur & fordon',health:'Hälsa',family:'Familj',settings:'Inställningar'};
let screenHistory=['today'];
function activeScreenId(){return document.querySelector('.screen.active')?.id||'today'}
function openScreen(id,push=true){
 const target=document.getElementById(id);if(!target)return;
 const prev=activeScreenId();
 document.querySelectorAll('.tab,.screen').forEach(x=>x.classList.remove('active'));
 document.querySelector(`[data-screen="${id}"]`)?.classList.add('active');target.classList.add('active');
 if(push&&prev!==id)screenHistory.push(id);
 document.querySelector('#iceCurrentView').textContent=screenNames[id]||'FIELD MANUAL';
 document.body.classList.toggle('home-view',id==='today');
 document.querySelector('#iceDrawer').classList.remove('open');scrollTo(0,0);
}
function goBackScreen(){if(screenHistory.length>1){screenHistory.pop();openScreen(screenHistory[screenHistory.length-1],false)}else openScreen('today',false)}

function configureILO40Dashboard(){
 const today=document.querySelector('#today'); if(!today||today.classList.contains('dashboard-ready'))return;
 const keepTitles=['FIELD MANUAL idag','FIELD MANUAL Intelligence','Smart coach','Idag med ILO','Färdighetsmotor'];
 [...today.children].forEach(el=>el.classList.add('dashboard-hidden'));
 const welcome=today.querySelector('.hq-welcome'); if(welcome)welcome.classList.remove('dashboard-hidden');
 const notice=today.querySelector('#updateNotice'); if(notice)notice.classList.remove('dashboard-hidden');
 const ordered=[];
 keepTitles.forEach(name=>{
   const title=[...today.querySelectorAll(':scope > .section-title')].find(x=>x.querySelector('h2')?.textContent.trim()===name);
   if(title){title.classList.remove('dashboard-hidden');ordered.push(title);const content=title.nextElementSibling;if(content){content.classList.remove('dashboard-hidden');ordered.push(content)}}
 });
 ordered.forEach(el=>today.appendChild(el));
 today.classList.add('dashboard-ready');
 const sub=document.querySelector('#greetingSubtitle'); if(sub)sub.textContent='Dagens analys, beslut och nästa bästa steg.';
 const current=document.querySelector('#iceCurrentView'); if(current)current.textContent='FIELD MANUAL';
 const skillTitle=[...today.querySelectorAll(':scope > .section-title')].find(x=>x.querySelector('h2')?.textContent.trim()==='Färdighetsmotor');
 if(skillTitle){skillTitle.classList.add('click-card');skillTitle.dataset.goto='progress'}
}

function updateILOTopProfile(){const p=state.profiles.find(x=>x.id===state.activeProfile)||state.profiles[0];const initials=p.name.split(/[- ]/).map(x=>x[0]).join('').slice(0,2).toUpperCase();document.querySelector('#iceTopProfile').textContent=initials}
document.querySelector('#iceHome').addEventListener('click',()=>openScreen('today'));
document.querySelector('#iceMenuButton').addEventListener('click',()=>document.querySelector('#iceDrawer').classList.add('open'));
document.querySelector('#iceDrawerClose').addEventListener('click',()=>document.querySelector('#iceDrawer').classList.remove('open'));
document.querySelector('#iceDrawer').addEventListener('click',e=>{if(e.target.id==='iceDrawer')e.currentTarget.classList.remove('open')});
document.querySelector('#iceStartPass').addEventListener('click',()=>{document.querySelector('#iceDrawer').classList.remove('open');document.querySelector('#startTrainingFromHQ')?.click()});
document.querySelector('#homeStartPass')?.addEventListener('click',()=>document.querySelector('#startTrainingFromHQ')?.click());
document.querySelector('#homeOpenILO')?.addEventListener('click',()=>document.querySelector('#iceDrawer').classList.add('open'));
let edgeStart=null;document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t.clientX<28)edgeStart={x:t.clientX,y:t.clientY}}, {passive:true});document.addEventListener('touchend',e=>{if(!edgeStart)return;const t=e.changedTouches[0],dx=t.clientX-edgeStart.x,dy=Math.abs(t.clientY-edgeStart.y);edgeStart=null;if(dx>75&&dy<70&&activeScreenId()!=='today')goBackScreen()},{passive:true});

document.addEventListener("click",async e=>{
 const recoveryBtn=e.target.closest('[data-recovery-field]');if(recoveryBtn){saveRecovery(recoveryBtn.dataset.recoveryField,recoveryBtn.dataset.recoveryValue);return}
 const academyToggle=e.target.closest('[data-academy-toggle]');if(academyToggle){state.academyCompleted=state.academyCompleted||{};const id=academyToggle.dataset.academyToggle;state.academyCompleted[id]=!state.academyCompleted[id];save();return}
 const academyLog=e.target.closest('[data-academy-log]');if(academyLog){const x=academyLessons.find(v=>v.id===academyLog.dataset.academyLog);openScreen('journal');document.querySelector('#journalType').value='Relation & lek';document.querySelector('#journalMinutes').value=x.minutes;document.querySelector('#journalNote').value=x.title+' – ';document.querySelector('#journalNote').dataset.exerciseCategory='academy';return}
 const physicalLog=e.target.closest('[data-physical-log]');if(physicalLog){const x=physicalExercises.find(v=>v.id===physicalLog.dataset.physicalLog);openScreen('journal');document.querySelector('#journalType').value='Fysisk utveckling';document.querySelector('#journalMinutes').value=parseInt(x.dose)||3;document.querySelector('#journalNote').value=x.title+' – ';document.querySelector('#journalNote').dataset.exerciseId=x.id;document.querySelector('#journalNote').dataset.exerciseCategory='fysik';document.querySelector('#journalNote').dataset.physicalArea=x.area;return}
 const checkin=e.target.closest('[data-checkin]');if(checkin){state.dailyCheckins=state.dailyCheckins||{};const current=todayCheckin();state.dailyCheckins[isoToday()]={...current,[checkin.dataset.checkin]:checkin.dataset.value};delete state['dailyPlan_'+isoToday()];save();return}
 const dailyCheck=e.target.closest('[data-dailycheck]');if(dailyCheck){const id=dailyCheck.dataset.dailycheck;toggleDailyChecklist(id,dailyCheck.checked);return}
 if(e.target.id==='startTrainingSession'||e.target.closest('#startTrainingFromHQ')){openTrainingSession();return}
 if(e.target.id==='closeSession'){closeTrainingSession();return}
 if(e.target.id==='toggleTimer'){startStepTimer();return}
 if(e.target.id==='completeSessionStep'){completeTrainingStep(false);return}
 if(e.target.id==='skipSessionStep'){completeTrainingStep(true);return}
 if(e.target.id==='finishSession'){closeTrainingSession();state.activeTrainingSession=null;localStorage.setItem(STORE,JSON.stringify(state));renderAll();document.querySelectorAll('.tab,.screen').forEach(x=>x.classList.remove('active'));document.querySelector('[data-screen="today"]').classList.add('active');document.querySelector('#today').classList.add('active');scrollTo(0,0);return}
 const tab=e.target.closest(".tab");if(tab){document.querySelectorAll(".tab,.screen").forEach(x=>x.classList.remove("active"));tab.classList.add("active");document.querySelector("#"+tab.dataset.screen).classList.add("active");scrollTo(0,0)}
 const go=e.target.closest("[data-goto]");if(go){openScreen(go.dataset.goto)} if(e.target.closest("[data-back]")){goBackScreen();return}
 if(e.target.dataset.equipmentStatus){state.equipmentStatus=state.equipmentStatus||{};state.equipmentStatus[e.target.dataset.equipmentStatus]=e.target.value;save();return}
 if(e.target.dataset.favorite){state.favoriteExercises=state.favoriteExercises||[];const id=e.target.dataset.favorite;state.favoriteExercises=state.favoriteExercises.includes(id)?state.favoriteExercises.filter(x=>x!==id):[...state.favoriteExercises,id];save()}
 if(e.target.id==="randomActivity"){const weeks=ageParts().weeks,pool=exerciseLibrary.filter(x=>weeks>=x.minWeeks&&weeks<=x.maxWeeks);const x=pool[Math.floor(Math.random()*pool.length)]||exerciseLibrary[0];alert(`${x.title} · ${x.duration} min\n\n${x.goal}\n\n${x.steps.join(" → ")}`)}
 const profileChoice=e.target.closest('[data-profile]');if(profileChoice){setDeviceProfile(profileChoice.dataset.profile)}
 const deviceChoice=e.target.closest('[data-device-profile]');if(deviceChoice){setDeviceProfile(deviceChoice.dataset.deviceProfile)}
 if(e.target.closest('[data-change-device-profile]')){showProfileSetup()}
 if(e.target.dataset.openFamily!==undefined){document.querySelectorAll('.tab,.screen').forEach(x=>x.classList.remove('active'));document.querySelector('[data-screen="family"]').classList.add('active');document.querySelector('#family').classList.add('active');scrollTo(0,0)}
 if(e.target.dataset.openSettings!==undefined){document.querySelectorAll('.tab,.screen').forEach(x=>x.classList.remove('active'));document.querySelector('#settings').classList.add('active');scrollTo(0,0)}
 if(e.target.dataset.familydone!==undefined){const i=+e.target.dataset.familydone,t=state.familyTasks[i];if(!canProfileDoTask(t,activeProfile())&&!t.done){alert('Den här uppgiften är inte tilldelad den valda profilen.');return}t.done=e.target.checked;t.completedBy=t.done?state.activeProfile:'';t.completedAt=t.done?new Date().toISOString():'';save()}
 if(e.target.dataset.delfamily!==undefined&&confirm('Ta bort uppgiften?')){state.familyTasks.splice(+e.target.dataset.delfamily,1);save()}
 if(e.target.dataset.dellife!==undefined&&confirm('Ta bort händelsen ur livsboken?')){state.lifeEvents.splice(+e.target.dataset.dellife,1);save()}
 if(e.target.id==='saveFamilyTask'){const title=(document.querySelector('#taskTitle').value.trim()||document.querySelector('#taskTemplate').value),date=document.querySelector('#taskDate').value;if(!title||!date)return alert('Välj uppgift/rubrik och datum.');const reminder=document.querySelector('#taskReminder').checked;if(reminder&&document.querySelector('#taskTime').value)await requestNotifications();state.familyTasks.push({title,date,time:document.querySelector('#taskTime').value,assignee:document.querySelector('#taskAssignee').value,access:document.querySelector('#taskAccess').value,note:document.querySelector('#taskNote').value.trim(),reminder,reminderOffset:+document.querySelector('#taskReminderOffset').value,reminderAudience:document.querySelector('#taskReminderAudience').value,repeatReminder:document.querySelector('#taskRepeatReminder').checked,done:false,created:new Date().toISOString()});document.querySelector('#taskTitle').value='';document.querySelector('#taskTemplate').value='';document.querySelector('#taskNote').value='';document.querySelector('#taskTime').value='';document.querySelector('#taskReminder').checked=false;document.querySelector('#reminderOptions').classList.add('hidden');save()}
 if(e.target.id==='saveLifeEvent'){const title=document.querySelector('#lifeTitle').value.trim(),date=document.querySelector('#lifeDate').value;if(!title||!date)return alert('Fyll i datum och rubrik.');state.lifeEvents.push({date,category:document.querySelector('#lifeCategory').value,title,rating:+document.querySelector('#lifeRating').value,note:document.querySelector('#lifeNote').value.trim(),person:document.querySelector('#lifePerson').value,created:new Date().toISOString()});document.querySelector('#lifeTitle').value='';document.querySelector('#lifeNote').value='';save()}

 if(e.target.matches(".shiftQuick")){state.currentWorkMode=e.target.dataset.type;save()}
 if(e.target.dataset.mtask!==undefined){const t=isoToday();state.completedMissions[t]||={tasks:[],complete:false};const i=+e.target.dataset.mtask;state.completedMissions[t].tasks=e.target.checked?[...new Set([...state.completedMissions[t].tasks,i])]:state.completedMissions[t].tasks.filter(x=>x!==i);save()}
 if(e.target.id==="completeMission"){const t=isoToday();state.completedMissions[t]||={tasks:[],complete:false};const becomingComplete=!state.completedMissions[t].complete;state.completedMissions[t].complete=becomingComplete;if(becomingComplete&&!state.lifeEvents.some(x=>x.source===`mission-${t}`)){const mm=mission();state.lifeEvents.push({date:t,category:"Milstolpe",title:`Dagens uppdrag: ${mm.title}`,note:"Uppdraget genomfördes och räknas in i FIELD MANUAL-motorn.",rating:5,person:state.activeProfile,created:new Date().toISOString(),source:`mission-${t}`})}save()}
 if(e.target.id==="refreshDailyPlan"){state["dailyPlan_"+isoToday()]=selectDailyExercises(Date.now()%97).map(x=>x.id);save()}
 if(e.target.dataset.logexercise!==undefined){
   const x=exerciseLibrary.find(v=>v.id===e.target.dataset.logexercise);
   document.querySelectorAll(".tab,.screen").forEach(v=>v.classList.remove("active"));
   document.querySelector('[data-screen="journal"]').classList.add("active");
   document.querySelector("#journal").classList.add("active");
   document.querySelector("#journalType").value=x.cat==="nos"?"Nosarbete":x.cat==="miljo"?"Miljö":x.cat==="inkallning"?"Inkallning":x.cat==="sar"?"Sök":x.cat==="aterhamtning"?"Vila/återhämtning":"Relation & lek";
   document.querySelector("#journalMinutes").value=x.duration;
   document.querySelector("#journalNote").value=x.title+" – ";
   document.querySelector("#journalNote").dataset.exerciseId=x.id;
   document.querySelector("#journalNote").dataset.exerciseCategory=x.cat;
   scrollTo(0,0);
 }
 if(e.target.id==="saveShift"){const d=document.querySelector("#shiftDate").value;if(!d)return alert("Välj datum.");const s={date:d,type:document.querySelector("#shiftType").value,start:document.querySelector("#shiftStart").value,end:document.querySelector("#shiftEnd").value,note:document.querySelector("#shiftNote").value.trim()},i=document.querySelector("#shiftEditIndex").value;i===""?state.shifts.push(s):state.shifts[+i]=s;clearShift();save()}
 if(e.target.id==="cancelShiftEdit")clearShift();
 if(e.target.dataset.editshift!==undefined)editShift(+e.target.dataset.editshift);
 if(e.target.dataset.delshift!==undefined&&confirm("Ta bort passet?")){state.shifts.splice(+e.target.dataset.delshift,1);save()}
 if(e.target.dataset.env!==undefined){state.environments[e.target.dataset.env]=e.target.checked;save()}
 if(e.target.dataset.milestone!==undefined){state.milestones[e.target.dataset.milestone]=e.target.checked;save()}
 if(e.target.dataset.course){const ed=educationState();ed.courses[e.target.dataset.course]=e.target.dataset.courseStatus;save();return}
 if(e.target.dataset.sar!==undefined){state.sarCompleted[e.target.dataset.sar]=e.target.checked;save()}
 if(e.target.id==="saveJournal"){const d=document.querySelector("#journalDate").value,n=document.querySelector("#journalNote").value.trim();if(!d||!n)return alert("Fyll i datum och anteckning.");const journalType=document.querySelector("#journalType").value,created=new Date().toISOString();state.journal.push({date:d,type:journalType,rating:+document.querySelector("#journalRating").value,minutes:+document.querySelector("#journalMinutes").value||0,note:n,weight:document.querySelector("#journalWeight").value.trim().replace(",","."),photo:pendingPhoto,exerciseId:document.querySelector("#journalNote").dataset.exerciseId||"",exerciseCategory:document.querySelector("#journalNote").dataset.exerciseCategory||"",physicalArea:document.querySelector("#journalNote").dataset.physicalArea||"",created});state.lifeEvents.push({date:d,category:'Träning',title:journalType,note:n.slice(0,120),rating:+document.querySelector("#journalRating").value,person:state.activeProfile,created,source:'journal'});pendingPhoto="";document.querySelector("#journalNote").dataset.exerciseId="";document.querySelector("#journalNote").dataset.exerciseCategory="";document.querySelector("#journalNote").dataset.physicalArea="";document.querySelector("#journalNote").value="";document.querySelector("#journalMinutes").value="";document.querySelector("#journalWeight").value="";document.querySelector("#journalPhoto").value="";document.querySelector("#photoPreview").style.display="none";save()}
 if(e.target.dataset.deljournal!==undefined&&confirm("Ta bort journalposten?")){state.journal.splice(+e.target.dataset.deljournal,1);save()}
 if(e.target.id==="saveSettings"){state.birthDate=document.querySelector("#birthDate").value;state.pickupDate=document.querySelector("#pickupDate").value;save();alert("Sparat.")}
 if(e.target.id==="exportData"){const b=new Blob([JSON.stringify({version:VERSION,exported:new Date().toISOString(),data:state},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="Field-Manual-backup-"+isoToday()+".json";a.click();URL.revokeObjectURL(a.href)}
 if(e.target.id==="importButton")document.querySelector("#importData").click();
 if(e.target.id==="forceUpdate"){navigator.serviceWorker?.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.update()))).finally(()=>location.reload(true))}
 if(e.target.id==="resetData"&&confirm("Nollställa all lokal data?")){localStorage.removeItem(STORE);localStorage.removeItem(DEVICE_PROFILE_KEY);state=clone(defaults);save();showProfileSetup()}
});
document.querySelector('#equipmentCategoryFilter').addEventListener('change',renderEquipment);document.querySelector('#equipmentStatusFilter').addEventListener('change',renderEquipment);
document.querySelector("#exerciseFilter").addEventListener("change",renderExerciseLibrary);
document.querySelector("#durationFilter").addEventListener("change",renderExerciseLibrary);
document.querySelector("#favoriteFilter").addEventListener("change",renderExerciseLibrary);
document.querySelector("#activitySearch").addEventListener("input",renderExerciseLibrary);
document.querySelector("#commandSearch").addEventListener("input",renderCommandLibrary);
document.addEventListener("change",e=>{if(e.target.dataset.commandlevel){state.commandProgress=state.commandProgress||{};state.commandProgress[e.target.dataset.commandlevel]=+e.target.value;save()}});
document.querySelector("#taskReminder").addEventListener("change",e=>document.querySelector("#reminderOptions").classList.toggle("hidden",!e.target.checked));
document.querySelector("#taskTemplate").addEventListener("change",e=>{if(e.target.value)document.querySelector("#taskTitle").value=e.target.value});
document.querySelector("#shiftType").addEventListener("change",e=>{const p=defaultsForShift(e.target.value);document.querySelector("#shiftStart").value=p[0];document.querySelector("#shiftEnd").value=p[1]});
document.querySelector("#journalPhoto").addEventListener("change",async e=>{if(!e.target.files[0])return;pendingPhoto=await compressImage(e.target.files[0]);const p=document.querySelector("#photoPreview");p.src=pendingPhoto;p.style.display="block"});

document.querySelector("#importData").addEventListener("change",async e=>{try{const j=JSON.parse(await e.target.files[0].text());state={...clone(defaults),...(j.data||j)};save();alert("Importerad.")}catch(err){alert("Filen kunde inte läsas.")}});
document.querySelector("#journalDate").value=isoToday();const careDateEl=document.querySelector("#careDate");if(careDateEl)careDateEl.value=isoToday();document.querySelector("#taskDate").value=isoToday();document.querySelector("#lifeDate").value=isoToday();clearShift();seedFamilyTasks();
if(localStorage.getItem("iceAppVersion")!==VERSION){localStorage.setItem("iceAppVersion",VERSION);document.querySelector("#updateNotice").style.display="block";setTimeout(()=>document.querySelector("#updateNotice").style.display="none",5000)}
configureILO40Dashboard();renderAll();updateILOTopProfile();if(!localStorage.getItem(DEVICE_PROFILE_KEY))showProfileSetup();checkReminders();setInterval(checkReminders,60000);setInterval(refreshLiveGreeting,60000);window.addEventListener('focus',refreshLiveGreeting);window.addEventListener('pageshow',refreshLiveGreeting);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLiveGreeting()});if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js?v=1.0-rc4",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{});
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!sessionStorage.getItem("fm_rc2_reloaded")){
      sessionStorage.setItem("fm_rc2_reloaded","1");
      location.reload();
    }
  });
}
