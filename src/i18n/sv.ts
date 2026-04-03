import type { TranslationStrings } from './types';

export const sv: TranslationStrings = {
  ui: {
    siteTitle: 'Östersjön',
    chooseChapter: 'Välj ett kapitel',
    speciesGuides: 'Artguider',
    aboutTitle: 'Om',
    aboutText:
      'En interaktiv undervattensupplevelse som utforskar Östersjön – ett av jordens mest hotade hav. Dyk under ytan för att upptäcka vilka som lever här, vad som går fel och vad du kan göra för att hjälpa till.',
    modeLinear: 'Linjär berättelse',
    modeAiGuided: 'AI-guide',
    chatPlaceholder: 'Ställ en fråga till din guide...',
    chatSend: 'Skicka',
  },
  ai: {
    coreSystemPrompt:
      'Du är en vänlig marinbiolog som heter Dr. Anna Igefjärd, en Östersjöexpert som guidar besökare genom en interaktiv 3D-undervattensupplevelse nära Askö, Sverige. Din publik är runt 10 år gamla — nyfikna, smarta, men inga forskare. Tala på ett varmt, engagerande sätt. Använd jämförelser med saker barn känner till (skolinjaler, ryggsäckar, simbassänger). Håll svaren koncisa (2–3 meningar) om inte besökaren ber om mer detaljer. Svara alltid på samma språk som dessa instruktioner. Avsluta alltid ditt svar med en engagerande fråga som bjuder in besökaren att tänka, gissa eller svara — till exempel "Kan du gissa hur lång en gädda kan bli?" eller "Vad tror du händer när alla stora fiskar försvinner?". Du har ett navigate_to_stage-verktyg för att flytta kameran till olika scener. Använd det när det är relevant för att illustrera dina poänger, och bara då. Navigera bara till en scen per svar. KRITISK REGEL: Du måste ALLTID inkludera dialogtext i ditt svar, även när du använder navigate_to_stage-verktyget. Returnera aldrig bara ett verktygsanrop utan text. När du navigerar till en ny scen, beskriv vad besökaren nu ser i levande detalj och fortsätt berättelsen med en uppföljningsfråga. När en besökare själv navigerar till en ny scen, kommentera vad de tittar på och ställ en engagerande fråga. Om en besökare frågar något du inte vet, var ärlig och säg det — riktiga forskare gör det också. Du har även tillgång till berättelsetexten för varje scen — upprepa den inte, men använd den som kontext. Ditt jobb är att fördjupa, svara på frågor och guida utforskandet bortom det som berättelsen redan säger.',
  },
  chapters: {
    intro: {
      title: 'Introduktion till Östersjön',
      subtitle: 'Dyk ner i ett av jordens mest hotade hav.',
      aiPrompt:
        'Besökaren utforskar en introduktion till Östersjön. Detta kapitel täcker de viktigaste hoten: övergödning, överfiske, döda zoner, invasiva arter och klimatförändringar. Guida dem genom de tillgängliga scenerna för att berätta historien om detta hotade hav.',
      stages: {
        'intro-welcome': {
          name: 'Välkommen till Östersjön',
          narrative:
            'När badade du senast i Östersjön? Vattnet kändes annorlunda, eller hur – inte riktigt salt, inte riktigt sött. Du badade i jordens yngsta hav, och ett av de mest hotade. Det här är Askö, söder om Stockholm, där forskare har studerat havet i över 60 år. Låt oss dyka in.',
          aiPrompt:
            'Scen: En grund undervattensvy nära Askö, söder om Stockholm. Solljus filtreras genom grönt vatten. Blåstång och stenar syns på havsbotten.',
        },
        'intro-underwater-forest': {
          name: 'Undervattensskogen',
          narrative:
            'Det här är blåstång – Östersjöns version av en skog. Små krabbor, snäckor och fiskar gömmer sig i dess grenar, precis som djur i en riktig skog. Men titta närmare: slemmiga gröna trådar kväver den. För mycket näring från jordbruk och städer ger näring åt dessa snabbväxande alger, och de stjäl ljuset som blåstången behöver för att överleva. På vissa platser har dessa skogar redan försvunnit.',
          aiPrompt:
            'Scen: En blåstångsskog med synliga trådformiga alger som växer över den. Algerna kväver blåstången. Scenen illustrerar övergödning och näringsutsläpp.',
        },
        'intro-stickleback-swarm': {
          name: 'Storspiggssvärmen',
          narrative:
            'Möt storspigg – knappt så lång som ditt finger, men det finns miljarder av dem. Deras antal har exploderat femtio gånger sedan dina föräldrar var barn. Varför? För att de stora fiskarna som brukade äta dem – som torsken – är mestadels borta. Nu svärmar dessa små fiskar in i vikarna varje vår och slukar äggen från gädda och abborre, vilket gör problemet ännu värre.',
          aiPrompt:
            'Scen: En svärm av små storspiggar fyller vattnet. En gädda lurar bland vass i bakgrunden. Scenen visar storspiggspopulationens explosion.',
        },
        'intro-shrinking-cod': {
          name: 'Den krympande torsken',
          narrative:
            'Det här är atlanttorsken – eller vad som finns kvar av den. För trettio år sedan kunde en torsk i Östersjön bli lika lång som din arm och väga mer än din ryggsäck. Idag blir de flesta aldrig större än en skolinjal. Forskare har förbjudit allt torskfiske i Östersjön, men beståndet återhämtar sig fortfarande inte. Vattnet de behöver för att lägga sina ägg i – tillräckligt salt och med tillräckligt med syre – har krympt till bara en djup plats nära Bornholm.',
          aiPrompt:
            'Scen: En djup, mörk undervattenmiljö där en liten torsk simmar. Torsken ser förkrympt ut jämfört med sin historiska storlek.',
        },
        'intro-dead-zone': {
          name: 'Döda zonen',
          narrative:
            'Under oss finns en död zon – ett område större än Danmark där inget kan leva. Gödselmedel från jordbruk rinner ut i floder, sedan i havet, och ger näring åt enorma algblomningar. När algerna dör och sjunker förbrukar bakterier allt syre här nere. Just nu har en tredjedel av Östersjöns havsbotten inte tillräckligt med syre för att något djur ska kunna överleva. Och 2024 uppmätte forskare de värsta syrenivåerna som någonsin registrerats här.',
          aiPrompt:
            'Scen: En extremt mörk, livlös djupvattenzon. Ett haloklint lager syns ovanför. Inget liv existerar här på grund av syrebrist.',
        },
        'intro-shipwreck': {
          name: 'Skeppsvraket',
          narrative:
            'Östersjön rymmer omkring 100\u00a0000 skeppsvrak – vikingaskepp, krigsfartyg, medeltida handelsfartyg – bevarade i århundraden eftersom det kalla, saltfattiga vattnet höll skeppsmask borta. Men när havet värms upp sprider sig skeppsmasken längre norrut. De är egentligen inte maskar – de är musslor som borrar in i trä och äter det inifrån. Ett helt undervattensmuseum äts sakta upp.',
          aiPrompt:
            'Scen: Ett skeppsvrak på havsbotten med musslor och skeppsmaskskador synliga. Östersjön bevarar vrak unikt väl, men varmare vatten hotar detta.',
        },
        'intro-what-you-can-do': {
          name: 'Vad du kan göra',
          narrative:
            'Östersjön är inte en förlorad sak – när människor agerar återhämtar den sig faktiskt. Forskare planterar om undervattensängar för hand. Sverige flyttade sin trålgräns för att skydda kustnära fisk. Över 600\u00a0000 svenska barn plockar upp skräp från stränder varje år. Du kan hjälpa till också: skippa engångsplast, fråga var din fisk kommer ifrån, och om du ser skräp nära vatten – plocka upp det. Det här havet är ditt. Det är det du badar i.',
          aiPrompt:
            'Scen: En ljus, grund scen som tittar uppåt mot vattenytan. En optimistisk avslutningsvy. Denna scen handlar om bevarandeinsatser.',
        },
      },
    },
    pike: {
      title: 'Gäddan',
      subtitle: 'Följ ödet för Östersjöns största jägare i de grunda vikarna.',
      aiPrompt:
        'Besökaren lär sig om gäddan (Esox lucius) – Östersjöns nyckelrovdjur i de grunda vikarna. Kapitlet handlar om varför gäddan är viktig, vad som hotar den (habitatförlust, storspigg, sälar), och hur våtmarksrestaurering hjälper.',
      stages: {
        'pike-meet': {
          name: 'Möt gäddan',
          narrative:
            'Det här är gäddan – den största jägaren i Östersjöns grunda vikar. Den kan bli upp till en meter lång och leva i tjugo år. Ser du hur den gömmer sig? Det prickiga mönstret gör den nästan osynlig bland vassen. Den väntar helt stilla, sedan – snap! Den är en av de snabbaste jägarna i vattnet.',
          aiPrompt:
            'Scen: En gädda syns lurkande bland vass, kamouflerad med sitt prickiga mönster. Små fiskar simmar i närheten.',
        },
        'pike-why-it-matters': {
          name: 'Varför gäddan är viktig',
          narrative:
            'När gäddan finns i närheten mår hela viken bra. Den håller mindre fiskar i schack, vilket skyddar växter och alger på havsbotten. Tänk på gäddan som en vakt – utan den kommer allt i obalans. Forskare kallar den en \u00abnyckelart\u00bb. Det betyder att den håller hela ekosystemet samman, som slutstenen i en valvbåge.',
          aiPrompt:
            'Scen: En vidare vy av viken som visar gäddan patrullerande bland vass med småfisk i bakgrunden.',
        },
        'pike-lost-nurseries': {
          name: 'De förlorade barnkamrarna',
          narrative:
            'Varje vår simmar gäddan upp i små bäckar och översvämmade våtmarker för att lägga sina ägg. Ungarna behöver varmt, grunt vatten med massor av växter att gömma sig i. Men under åren har många av dessa våtmarker dikats ut för att bli jordbruksmark, och bäckar har rätats ut till diken. Gäddan kommer tillbaka till platsen där den föddes – men barnkammaren finns inte längre.',
          aiPrompt:
            'Scen: Ett degraderat våtmarksområde där gäddan historiskt lekte. Habitatet har dikats ut och förenklats.',
        },
        'pike-stickleback-invasion': {
          name: 'Storspigginvasionen',
          narrative:
            'Minns du dessa? Storspigg – knappt lika lång som ditt lillfinger. Det brukade finnas ett normalt antal av dem, men nu finns det miljarder. Utan tillräckligt med gäddor som äter dem har deras antal exploderat. Och här är den grymma delen: storspigg älskar att äta gäddägg. Så ju färre gäddor det finns, desto fler storspiggar kläcks, och desto fler gäddägg äts upp. Det är en ond cirkel.',
          aiPrompt:
            'Scen: En svärm av storspiggar nära gäddägg på havsbotten bland vass. Storspiggen jagar äggen.',
        },
        'pike-seal-in-bay': {
          name: 'Sälen i viken',
          narrative:
            'Gråsälar är fantastiska djur – de var nästan utrotade på 1970-talet men har gjort en stark comeback, från omkring 3\u00a0600 till över 55\u00a0000 i Östersjön idag. Det är goda nyheter för sälarna. Men när de har flyttat in i de inre vikarna där gäddan lever har de blivit ett av gäddans största hot. I Stockholms skärgård äter sälar och skarvar tillsammans nu många gånger fler gäddor än vad fiskare fångar. Det är naturen – men det tippar balansen.',
          aiPrompt:
            'Scen: En gråsäl simmar i en grund vik där gädda och vass syns. Scenen visar sälåterhämtningens påverkan på gäddpopulationen.',
        },
        'pike-chain-reaction': {
          name: 'Kedjereaktion',
          narrative:
            'Så här ser en vik ut när gäddorna försvinner. Utan gädda tar storspigg över. De äter de små djur som håller algerna under kontroll. Så algerna växer vilt, vattnet blir grönt och växterna på botten dör av ljusbrist. Forskare kallar detta ett \u00abregimskifte\u00bb – viken slår om från frisk till sjuk, och det är mycket svårt att vända tillbaka.',
          aiPrompt:
            'Scen: En degraderad vik med grumligt grönt vatten, övervuxen med trådformiga alger. Storspiggar svärmar och en skarv syns.',
        },
        'pike-bringing-back': {
          name: 'Att få tillbaka gäddan',
          narrative:
            'De goda nyheterna? När människor hjälper till fungerar det. Längs den svenska kusten har över hundra våtmarker restaurerats som \u00abgäddkammare\u00bb – och där de har gjort det gick antalet gäddyngel från 3\u00a0000 till över 300\u00a0000 på bara några år. Du kan hjälpa till också: om du fiskar, släpp alltid tillbaka gäddan försiktigt. Välj mat som inte kommer från överfiskade hav. Och berätta för folk om gäddan – för en fisk som är så viktig borde inte försvinna utan att någon märker det.',
          aiPrompt:
            'Scen: En restaurerad våtmark med frisk vegetation, gäddyngel som simmar och en vuxen gädda. En hoppfull scen om lyckad naturvård.',
        },
      },
    },
    'fish-species': {
      title: 'Fiskarter i Östersjön',
      subtitle: 'En närbildsguide till Östersjöns fiskar.',
      aiPrompt:
        'Besökaren bläddrar i en artguide för Östersjöns fiskar. Varje scen visar en närbild av en annan art. Ge detaljerad biologisk information om varje art när du tillfrågas.',
      stages: {
        'fish-species-perch': {
          name: 'Abborre',
          narrative:
            'Europeisk abborre. Längd: 15–45 cm. Abborren är en randig jägare i grunda vatten – dess mörka ränder och lysande orangea fenor gör den till en av de vackraste fiskarna i Östersjön. Den använder sina stora ögon för att hitta byten i grumligt vatten. Abborren äter mindre fiskar, räkor och insektslarver. Roligt fakta: abborrens ägg kommer ut i långa, geléliknande band som hänger över växter som undervattensgirlanger.',
          aiPrompt:
            'Scen: Närbild av en europeisk abborre (Perca fluviatilis) i grunt vatten. Abborren visar tydliga mörka vertikala ränder och rödaktiga fenor.',
        },
        'fish-species-pike': {
          name: 'Gädda',
          narrative:
            'Gädda. Längd: 40–100 cm (ibland över en meter!). Topprovdjuret i Östersjöns grunda vikar. Gäddan är en bakhållsjägare – den ligger helt stilla bland vassen tills bytet kommer nära, och slår sedan till snabbare än du kan blinka. En enda gädda kan äta hundratals storspiggar under en säsong. Roligt fakta: gäddan återvänder alltid till exakt den plats där den föddes för att lägga sina egna ägg.',
          aiPrompt:
            'Scen: Närbild av en gädda (Esox lucius) bland vass. Gäddans prickiga kamouflagemönster och avlånga kropp syns tydligt.',
        },
        'fish-species-stickleback': {
          name: 'Storspigg',
          narrative:
            'Storspigg. Längd: 4–8 cm. Liten men mäktig. Denna lilla fisk har tre vassa taggar på ryggen som skydd. Hanen bygger ett bo av växtfibrer och gör en sicksackdans för att locka honor. När hon lagt äggen vaktar pappan dem intensivt. Roligt fakta: antalet storspiggar i Östersjön har exploderat femtiofaldigt sedan 1990-talet – det finns nu miljarder av dem.',
          aiPrompt:
            'Scen: Extrem närbild av en storspigg (Gasterosteus aculeatus). Denna lilla fisk (4-8 cm) har tre synliga ryggtaggar.',
        },
        'fish-species-cod': {
          name: 'Atlanttorsk',
          narrative:
            'Atlanttorsk. Längd: 20–30 cm idag (de brukade bli upp till 100 cm!). Torsken var en gång Östersjöns kung – enorma, kraftfulla fiskar som härskade i djupvattnet. Men årtionden av överfiske och krympande syrezoner har bara lämnat små, tunna fiskar kvar. Allt torskfiske i Östersjön har förbjudits sedan 2019, men de återhämtar sig fortfarande inte. Roligt fakta: torsken behöver en speciell blandning av salt, syrerikt vatten för att lägga sina ägg, och det finns bara en plats kvar i Östersjön där det fungerar.',
          aiPrompt:
            'Scen: En liten atlanttorsk (Gadus morhua) i mellandomsvatten. Torsken ser tunn och förkrympt ut jämfört med sin historiska storlek.',
        },
      },
    },
  },
};
