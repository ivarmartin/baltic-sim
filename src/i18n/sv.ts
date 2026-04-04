import type { TranslationStrings } from './types';

export const sv: TranslationStrings = {
  ui: {
    siteTitle: 'Östersjön',
    chooseChapter: 'Välj ett kapitel',
    speciesGuides: 'Artguider',
    aboutTitle: 'Om',
    aboutText:
      'En interaktiv undervattensupplevelse som utforskar Östersjön – ett av jordens mest hotade hav. Dyk under ytan för att upptäcka vilka som lever här, vad som går fel och vad du kan göra för att hjälpa till.',
    referencesTitle: 'Referenser',
    referencesSubtitle:
      'Studier och rapporter som citeras i den interaktiva Östersjöupplevelsen.',
    modeLinear: 'Linjär berättelse',
    modeAiGuided: 'AI-guidad berättelse',
    chatPlaceholder: 'Ställ en fråga till din guide...',
    chatSend: 'Skicka',
  },
  ai: {
    coreSystemPrompt:
      'Du är en vänlig marinbiolog som heter Dr. Anna Igefjärd, en Östersjöexpert som guidar besökare genom en interaktiv 3D-undervattensupplevelse nära Askö, Sverige. Din publik är runt 10 år gamla — nyfikna, smarta, men inga forskare. Tala på ett varmt, engagerande sätt. Använd jämförelser med saker barn känner till (skolinjaler, ryggsäckar, simbassänger). Håll svaren koncisa (2–3 meningar) om inte besökaren ber om mer detaljer. Svara alltid på svenska.\n\nREGLER FÖR BERÄTTELSENS FRAMSTEG:\n- Ditt huvuduppdrag är att leda besökaren genom kapitlets berättelse. Varje scen har NARRATIVE BEATS — gå igenom dem i ordning, ungefär en per utbyte.\n- Ta UPP EN beat per svar — slå inte ihop flera beats i ett meddelande. Låt besökaren hinna ta in och reagera.\n- Sikta på att täcka varje scen på 2–4 utbyten. Efter 4+ meddelanden på samma scen utan aktiva frågor från besökaren, föreslå att gå vidare till nästa scen.\n- Avsluta varje svar med en fråga som leder mot NÄSTA narrative beat eller nästa scen — inte en öppen fråga som leder bort. Till exempel, istället för "Vad tycker du om alger?" fråga "Vill du se vad som händer när de här skogarna försvinner?" eller "Redo att träffa fisken som tar över?"\n- Om besökaren frågar något som inte hör till ämnet, ge ett kort ärligt svar (1 mening) och styr sedan tillbaka: "Bra fråga! Men först, låt mig visa dig något viktigt…" och återgå till nästa beat.\n- När alla beats för en scen är avklarade, använd NEXT SCENE-ledtråden för att övergå. Navigera till nästa scen med tool call.\n- Upprepa INTE vad berättelsetexten redan säger — omformulera, fördjupa och gör det levande.\n\nREGLER FÖR VERKTYGSANVÄNDNING:\n- Du har en navigate_to_stage-funktionsanrop (tool call) för att flytta kameran till olika scener. Använd det bara som tool call — skriv ALDRIG "navigate_to_stage" eller "*Navigerar till...*" i din text. Besökaren ska aldrig se verktygsnamn.\n- Använd det när det är relevant för att illustrera dina poänger eller för att övergå till nästa scen, och bara då. Navigera bara till en scen per svar.\n- KRITISKT: Du måste ALLTID inkludera dialogtext i ditt svar, även när du gör ett funktionsanrop. Returnera aldrig bara ett tool call utan text.\n- När du navigerar till en ny scen, beskriv vad besökaren nu ser i levande detalj och fortsätt berättelsen.\n- När en besökare själv navigerar till en ny scen, kommentera vad de tittar på och börja gå igenom den scenens narrative beats.\n\nOm en besökare frågar något du inte vet, var ärlig och säg det — riktiga forskare gör det också.',
  },
  chapters: {
    intro: {
      title: 'Introduktion till Östersjön',
      subtitle: 'Dyk ner i ett av jordens mest hotade hav.',
      aiPrompt:
        'Kapitelöversikt: Introduktion till Östersjön förankrad vid Askö laboratorium. Båge: välkommen → undervattenshabitat → artkollapser → döda zoner → kulturarv → hopp. Östersjön är bräckt (~6 PSU jämfört med 35 för haven), bildades för ~10 000 år sedan, omgiven av 9 länder och 85 miljoner människor. Guida besökaren genom scenerna med konkreta jämförelser som en 10-åring förstår.',
      references: {
        'helcom-2023': {
          citation:
            'HELCOM (2023). State of the Baltic Sea 2023 — Third HELCOM holistic assessment 2016–2021.',
          url: 'https://stateofthebalticsea.helcom.fi/overview/executive-summary/',
          linkText: 'HELCOM — State of the Baltic Sea 2023',
        },
        'eklof-2020': {
          citation:
            'Eklöf, J.S. et al. (2020). A spatial regime shift from predator to prey dominance in a large coastal ecosystem. Communications Biology, 3, 459.',
          url: 'https://www.nature.com/articles/s42003-020-01180-0',
          linkText: 'Eklöf et al. (2020), Communications Biology',
        },
        'casini-2016': {
          citation:
            'Casini, M. et al. (2016). Hypoxic areas, density-dependence and food limitation drive the body condition of a heavily exploited marine fish predator. Royal Society Open Science, 3(10), 160416.',
          url: 'https://royalsocietypublishing.org/doi/10.1098/rsos.160416',
          linkText: 'Casini et al. (2016), Royal Society Open Science',
        },
        'eero-2015': {
          citation:
            'Eero, M. et al. (2015). Eastern Baltic cod in distress: biological changes and challenges for stock assessment. ICES Journal of Marine Science, 72(8), 2180–2186.',
          url: 'https://publications.slu.se/?file=publ/show&id=71929',
          linkText: 'Eero et al. (2015), ICES Journal of Marine Science',
        },
        'hansson-2025': {
          citation:
            'Hansson, M. & Viktorsson, L. (2025). Oxygen Survey in the Baltic Sea 2024. SMHI Report Oceanography No. 80.',
          url: 'https://www.smhi.se/en/publications-from-smhi/publications/2025-04-14-the-oxygen-situation-in-the-baltic-sea-2024',
          linkText: 'Hansson & Viktorsson (2025), SMHI Report',
        },
        'appelqvist-2015': {
          citation:
            'Appelqvist, C., Havenhand, J.N. & Toth, G.B. (2015). Climate Envelope Modeling and Dispersal Simulations Show Little Risk of Range Extension of the Shipworm, Teredo navalis (L.), in the Baltic Sea. PLOS ONE, 10(3), e0119217.',
          url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0119217',
          linkText: 'Appelqvist et al. (2015), PLOS ONE',
        },
        'bjordal-2012': {
          citation:
            'Björdal, C.G. & Gregory, D. (2012). Wreckprotect — Decay and Protection of Archaeological Wooden Shipwrecks. Archaeopress.',
          url: 'https://cordis.europa.eu/article/id/31666-wreckprotect-investigates-underwater-cultural-heritage-threat',
          linkText: 'Björdal & Gregory (2012), Archaeopress',
        },
        'gu-eelgrass': {
          citation:
            'University of Gothenburg. Handbook leads the way for large-scale restoration of eelgrass.',
          url: 'https://www.gu.se/en/news/handbook-leads-the-way-for-large-scale-restoration-of-eelgrass',
          linkText: 'Göteborgs universitet — Ålgräsrestaurering',
        },
        'helcom-2021': {
          citation:
            'HELCOM (2021). Baltic Sea Action Plan — 2021 update.',
          url: 'https://helcom.fi/baltic-sea-action-plan/',
          linkText: 'HELCOM — Baltic Sea Action Plan',
        },
        'hsr-cleanup': {
          citation: 'Håll Sverige Rent. Nordic Coastal Cleanup.',
          url: 'https://hsr.se/nordic-coastal-cleanup',
          linkText: 'Håll Sverige Rent — Nordic Coastal Cleanup',
        },
      },
      stages: {
        'intro-welcome': {
          name: 'Välkommen till Östersjön',
          narrative:
            'När badade du senast i Östersjön? Vattnet kändes annorlunda, eller hur – inte riktigt salt, inte riktigt sött. Du badade i jordens yngsta hav, och ett av de mest hotade. Det här är Askö, söder om Stockholm, där forskare har studerat havet i över 60 år. Låt oss dyka in.',
          aiPrompt:
            'Scen: Grunt undervattensläge nära Askö. Solljus genom gröntonat vatten. Blåstång och stenar på havsbotten. Extra kontext: Askö laboratorium drivs av Stockholms universitets Östersjöcentrum. Salthalt ~6 PSU (havet 35). Vattnet tar 25–30 år att helt bytas ut med Nordsjön, så föroreningar ackumuleras.',
          narrativeBeats: [
            'Välkomna besökaren — de dyker ner i jordens yngsta hav',
            'Förklara vad som gör Östersjön speciell: bräckt vatten, inte riktigt salt, inte riktigt sött',
            'Presentera Askö som en forskningsstation som bevakat havet i över 60 år',
            '→ Övergång: låt oss utforska vad som lever under ytan (nästa: Undervattensskogen)',
          ],
          nextSceneHook: 'Nästa scen: "Undervattensskogen" — upptäck Östersjöns dolda livsmiljö och vad som hotar den',
        },
        'intro-underwater-forest': {
          name: 'Undervattensskogen',
          narrative:
            'Det här är blåstång – Östersjöns version av en skog. Små krabbor, snäckor och fiskar gömmer sig i dess grenar, precis som djur i en riktig skog. Men titta närmare: slemmiga gröna trådar kväver den. För mycket näring från jordbruk och städer ger näring åt dessa snabbväxande alger, och de stjäl ljuset som blåstången behöver för att överleva. På vissa platser har dessa skogar redan försvunnit.',
          aiPrompt:
            'Scen: Blåstångsskog (Fucus vesiculosus) på stenar, trådformiga alger kväver delar. Kal bergyta intill. Extra kontext: Tar 4–5 år att mogna, så återhämtningen är mycket långsam. 97% av Östersjön drabbad av övergödning. Växte historiskt till 15 m djup; nu bara 2–4 m på vissa platser. Värddjur: tånggråsuggor (Idotea), snäckor (Littorina), rörmaskar, svart smörbult.',
          narrativeBeats: [
            'Presentera blåstång som Östersjöns undervattensskog — en livsmiljö full av liv (krabbor, snäckor, fiskar)',
            'Peka ut de slemmiga gröna algtrådarna som kväver den — orsakat av näringsämnen från jordbruk och städer',
            'Förklara konsekvensen: dessa skogar försvinner, och det tar 4–5 år att växa tillbaka',
            '→ Övergång: vad händer när ekosystemet förlorar sina stora rovdjur? (nästa: Storspiggssvärmen)',
          ],
          nextSceneHook: 'Nästa scen: "Storspiggssvärmen" — algproblemet hänger ihop med en explosion av småfisk',
          refs: [
            { refId: 'helcom-2023', description: 'Blåstångens reträtt till grundare vatten, övergödning som påverkar 97 % av Östersjön' },
          ],
        },
        'intro-stickleback-swarm': {
          name: 'Storspiggssvärmen',
          narrative:
            'Möt storspigg – knappt så lång som ditt finger, men det finns miljarder av dem. Deras antal har exploderat femtio gånger sedan dina föräldrar var barn. Varför? För att de stora fiskarna som brukade äta dem – som torsken – är mestadels borta. Nu svärmar dessa små fiskar in i vikarna varje vår och slukar äggen från gädda och abborre, vilket gör problemet ännu värre.',
          aiPrompt:
            'Scen: Massiv storspiggsvärm som en silvervägg. Gädda lurar i vass i bakgrunden. Extra kontext: Nu ~10% av all fiskbiomassa i Östersjön. Teknisk term: "mesopredator release." Hanar bygger bon av växtfibrer limmade med njursekret, gör sicksack-parningsdanser. SLU Aqua-forskaren Ulf Bergström beskrev dem som förödande för grunda vikar.',
          narrativeBeats: [
            'Presentera storspigg — liten som ett finger, men det finns miljarder av dem',
            'Förklara varför de exploderat: de stora fiskarna (torsken) som åt dem är mestadels borta',
            'Det grymma: storspiggar äter gädd- och abborräggen, vilket gör rovdjursminskningen ännu värre',
            '→ Övergång: men vad hände med torsken? (nästa: Den krympande torsken)',
          ],
          nextSceneHook: 'Nästa scen: "Den krympande torsken" — fisken som en gång härskade i Östersjön hänger knappt kvar',
          refs: [
            { refId: 'eklof-2020', description: 'Storspiggspopulationsexplosion (~50 gånger), regimskifte från rovdjurs- till bytesdominans' },
          ],
        },
        'intro-shrinking-cod': {
          name: 'Den krympande torsken',
          narrative:
            'Det här är atlanttorsken – eller vad som finns kvar av den. För trettio år sedan kunde en torsk i Östersjön bli lika lång som din arm och väga mer än din ryggsäck. Idag blir de flesta aldrig större än en skolinjal. Forskare har förbjudit allt torskfiske i Östersjön, men beståndet återhämtar sig fortfarande inte. Vattnet de behöver för att lägga sina ägg i – tillräckligt salt och med tillräckligt med syre – har krympt till bara en djup plats nära Bornholm.',
          aiPrompt:
            'Scen: Djupt, mörkt vatten. Liten tunn torsk med spökkonturer av en torsk i 1980-talsstorlek (2x större) överlagrat. Livlös lerbotten. Extra kontext: Toppfångster ~400 000 ton i mitten av 1980-talet. Totalt förbud sedan 2019 inkl. fritidsfiske. Blir nu könsmogna vid ~20 cm istället för 35–40 cm. Många infekterade med nematoden Contracaecum osculatum. Torskkollaps utlöste storspiggsexplosionen.',
          narrativeBeats: [
            'Presentera Östersjötorsken — en gång lång som din arm, nu mindre än en skolinjal',
            'Fiskeförbud sedan 2019, men beståndet återhämtar sig fortfarande inte — förklara varför',
            'Problemet: torsken behöver salt, syrerikt djupvatten för att leka, och det finns bara en plats kvar (Bornholm)',
            '→ Övergång: låt oss dyka djupare och se varför syret försvann (nästa: Döda zonen)',
          ],
          nextSceneHook: 'Nästa scen: "Döda zonen" — dyk ner i de livlösa djupen där syret har försvunnit',
          refs: [
            { refId: 'casini-2016', description: 'Torskbeståndets kollaps, fiskeförbud, parasitangrepp, minskad lekvolym' },
            { refId: 'eero-2015', description: 'Östlig Östersjötorsk i kris — biologiska förändringar' },
          ],
        },
        'intro-dead-zone': {
          name: 'Döda zonen',
          narrative:
            'Under oss finns en död zon – ett område större än Danmark där inget kan leva. Gödselmedel från jordbruk rinner ut i floder, sedan i havet, och ger näring åt enorma algblomningar. När algerna dör och sjunker förbrukar bakterier allt syre här nere. Just nu har en tredjedel av Östersjöns havsbotten inte tillräckligt med syre för att något djur ska kunna överleva. Och 2024 uppmätte forskare de värsta syrenivåerna som någonsin registrerats här.',
          aiPrompt:
            'Scen: Kolsvart under haloklinen. Kal gråbrun lera, inget liv, svag partikeldrift. Extra kontext: ~18–19% helt syrefritt (anoxiskt), ~15% syrefattigt (hypoxiskt). SMHI april 2025-rapport: rekordhögt svavelväte vid Gotlandsdjupet (BY15) nov 2024. Ond cirkel: syrefria sediment frigör fosfor, som ger fler algblomningar. Döda zonen har tiodubblats sedan 1950-talet.',
          narrativeBeats: [
            'Förklara vad en död zon är — ett område större än Danmark där inget kan leva',
            'Orsaken: gödselmedel → floder → algblomningar → bakterier förbrukar allt syre',
            'Omfattningen: en tredjedel av Östersjöns botten är syrefattig, 2024 uppmättes de värsta nivåerna någonsin',
            '→ Övergång: Östersjön gömmer hemligheter bortom ekologin (nästa: Skeppsvraket)',
          ],
          nextSceneHook: 'Nästa scen: "Skeppsvraket" — Östersjön bevarar 100 000 skeppsvrak, men det håller på att förändras',
          refs: [
            { refId: 'hansson-2025', description: 'Rekordnivåer av svavelväte vid Gotlandsdjupet (BY15) november 2024, syretidsserie 1960–2024' },
            { refId: 'helcom-2023', description: 'Döda zonens yta ~1,5 gånger Danmarks, en tredjedel av havsbotten syrefattig/syrefri' },
          ],
        },
        'intro-shipwreck': {
          name: 'Skeppsvraket',
          narrative:
            'Östersjön rymmer omkring 100\u00a0000 skeppsvrak – vikingaskepp, krigsfartyg, medeltida handelsfartyg – bevarade i århundraden eftersom det kalla, saltfattiga vattnet höll skeppsmask borta. Men när havet värms upp sprider sig skeppsmasken längre norrut. De är egentligen inte maskar – de är musslor som borrar in i trä och äter det inifrån. Ett helt undervattensmuseum äts sakta upp.',
          aiPrompt:
            'Scen: Trävrak på havsbotten, skrov intakt, draperat med blåmusslor. Närbild: skeppsmaskborrhål. Extra kontext: Vasa överlevde 333 år i Stockholms hamn tack vare låg salthalt. Skeppsmask (Teredo navalis) behöver >5 PSU för att överleva, >8 för att föröka sig. Fortplantningssäsongen förlängd ~26 dagar jämfört med 1970-talet. ~100 vrak angripna till 2010. EU:s WreckProtect-projekt (Göteborgs universitet) utvecklade geotextilskydd. Vrak – Museum of Wrecks öppnade 2021.',
          narrativeBeats: [
            'Östersjön rymmer ~100 000 skeppsvrak — vikingar, krigsfartyg, medeltida handelsfartyg — bevarade i århundraden',
            'Varför de överlevt: kallt, saltfattigt vatten höll skeppsmasken borta',
            'Det nya hotet: varmare vatten låter skeppsmasken sprida sig norrut och äta vraken inifrån',
            '→ Övergång: det låter illa, men det finns verkligt hopp (nästa: Vad du kan göra)',
          ],
          nextSceneHook: 'Nästa scen: "Vad du kan göra" — avsluta med hopp och verkliga insatser som gör skillnad',
          refs: [
            { refId: 'appelqvist-2015', description: 'Skeppsmaskens häckningssäsong förlängd ~26 dagar, klimatmodellering' },
            { refId: 'bjordal-2012', description: 'WreckProtect-projektet — strategier för att skydda undervattenskulturarv i trä' },
          ],
        },
        'intro-what-you-can-do': {
          name: 'Vad du kan göra',
          narrative:
            'Östersjön är inte en förlorad sak – när människor agerar återhämtar den sig faktiskt. Forskare planterar om undervattensängar för hand. Sverige flyttade sin trålgräns för att skydda kustnära fisk. Över 600\u00a0000 svenska barn plockar upp skräp från stränder varje år. Du kan hjälpa till också: skippa engångsplast, fråga var din fisk kommer ifrån, och om du ser skräp nära vatten – plocka upp det. Det här havet är ditt. Det är det du badar i.',
          aiPrompt:
            'Scen: Ljust grunt vatten, kamera uppåt mot solbelyst yta. Optimistisk avslutning. Extra kontext: Göteborgs universitets ZORRO planterade 3M+ sjögrässkott, en plats 26-faldig ökning. HELCOM:s Baltic Sea Action Plan ~200 åtgärder mot 2030. Pelagiskt trålförbud <12 nm svenska kusten från feb 2025. Ytterligare barnåtgärder: fosfatfria diskmedel, hållbar fisk (ingen ål, ingen Östersjötorsk), medborgarforskning (Stockholms universitets algprojekt).',
          narrativeBeats: [
            'Goda nyheter: när människor agerar återhämtar sig Östersjön — forskare planterar ängar, trålförbud',
            'Riktiga siffror: 600 000 svenska barn plockar strandskräp varje år',
            'Vad du kan göra: skippa engångsplast, fråga var fisken kommer ifrån, plocka upp skräp nära vatten',
            'Avslutning: det här havet är ditt — det är det du badar i',
          ],
          refs: [
            { refId: 'gu-eelgrass', description: 'ZORRO-programmet för ålgräsrestaurering — 3M+ skott planterade, 26-faldig ökning' },
            { refId: 'helcom-2021', description: 'HELCOM:s aktionsplan för Östersjön (~200 åtgärder mot 2030)' },
            { refId: 'hsr-cleanup', description: 'Håll Sverige Rent — 600 000–800 000 barn årligen' },
          ],
        },
      },
    },
    pike: {
      title: 'Gäddan',
      subtitle: 'Följ ödet för Östersjöns största jägare i de grunda vikarna.',
      aiPrompt:
        'Kapitelöversikt: Gädda (Esox lucius) som nyckelrovdjur i Östersjöns grunda vikar. Båge: möte → betydelse → hot (habitatförlust, storspiggar, sälar) → ekosystemkollaps → hopp om restaurering. Samma undervattensmiljö som introkapitlet, annan historia. Guida besökaren så att en 10-åring kan följa orsak-och-verkan-kedjan.',
      references: {
        'larsson-2015': {
          citation:
            'Larsson, P. et al. (2015). Ecology, evolution, and management strategies of northern pike populations in the Baltic Sea. Ambio, 44(Suppl 3), 451–461.',
          url: 'https://link.springer.com/article/10.1007/s13280-015-0664-6',
          linkText: 'Larsson et al. (2015), Ambio',
        },
        'olin-2024': {
          citation:
            'Olin, A.B. et al. (2024). Predation and spatial connectivity interact to shape ecosystem resilience to an ongoing regime shift. Nature Communications, 15, 1304.',
          url: 'https://www.nature.com/articles/s41467-024-45713-1',
          linkText: 'Olin et al. (2024), Nature Communications',
        },
        'nilsson-2014': {
          citation:
            'Nilsson, J., Engstedt, O. & Larsson, P. (2014). Wetlands for northern pike (Esox lucius L.) recruitment in the Baltic Sea. Hydrobiologia, 721, 145–154.',
          url: 'https://link.springer.com/article/10.1007/s10750-013-1656-9',
          linkText: 'Nilsson et al. (2014), Hydrobiologia',
        },
        'nilsson-2019': {
          citation:
            'Nilsson, J., Flink, H. & Tibblin, P. (2019). Predator–prey role reversal may impair the recovery of declining pike populations. Journal of Animal Ecology, 88, 927–939.',
          url: 'https://besjournals.onlinelibrary.wiley.com/doi/10.1111/1365-2656.12981',
          linkText: 'Nilsson et al. (2019), Journal of Animal Ecology',
        },
        'bergstrom-2022': {
          citation:
            'Bergström, U. et al. (2022). Long-term decline in northern pike (Esox lucius L.) populations in the Baltic Sea revealed by recreational angling data. Fisheries Research, 251, 106307.',
          url: 'https://www.sciencedirect.com/science/article/pii/S0165783622000844',
          linkText: 'Bergström et al. (2022), Fisheries Research',
        },
        'svensson-2021': {
          citation:
            'Svensson, R. (2021). Development of northern pike (Esox lucius) populations in the Baltic Sea, and potential effects of grey seal (Halichoerus grypus) predation. MSc thesis, Swedish University of Agricultural Sciences.',
          url: 'https://stud.epsilon.slu.se/16455/',
          linkText: 'Svensson (2021), SLU MSc Thesis',
        },
        'su-seal-2025': {
          citation:
            'Stockholm University Baltic Sea Centre (2025). Reducing grey seal numbers will not help Baltic fish stocks. Policy brief.',
          url: 'https://www.su.se/english/divisions/stockholm-university-baltic-sea-centre/policy-analysis/policy-briefs-and-fact-sheets/reducing-grey-seal-numbers-will-not-help-baltic-fish-stocks',
          linkText: 'SU Östersjöcentrum (2025), Policy Brief',
        },
        'eklof-2020': {
          citation:
            'Eklöf, J.S. et al. (2020). A spatial regime shift from predator to prey dominance in a large coastal ecosystem. Communications Biology, 3, 459.',
          url: 'https://www.nature.com/articles/s42003-020-01180-0',
          linkText: 'Eklöf et al. (2020), Communications Biology',
        },
        'tibblin-2023': {
          citation:
            'Tibblin, P. et al. (2023). Higher abundance of adult pike in Baltic Sea coastal areas adjacent to restored wetlands compared to reference bays. Hydrobiologia, 850, 2235–2247.',
          url: 'https://link.springer.com/article/10.1007/s10750-023-05216-4',
          linkText: 'Tibblin et al. (2023), Hydrobiologia',
        },
        'bcf-pike': {
          citation:
            'Baltic Conservation Foundation. Pike Factories – Restoring Wetlands for Natural Pike Reproduction.',
          url: 'https://baltcf.org/project/pike-factories-restoring-wetlands-for-natural-pike-reproduction/',
          linkText: 'Baltic Conservation Foundation — Gäddfabriker',
        },
        'olsson-2023': {
          citation:
            'Olsson, J. et al. (2023). A pan-Baltic assessment of temporal trends in coastal pike populations. Fisheries Research, 260, 106594.',
          url: 'https://www.sciencedirect.com/science/article/pii/S016578362200371X',
          linkText: 'Olsson et al. (2023), Fisheries Research',
        },
      },
      chapterRefs: {
        title: 'Allbaltisk gäddbedömning',
        refs: [
          { refId: 'olsson-2023', description: 'Regional nedgång av gädda i 8 Östersjöländer, 59 tidsserier' },
        ],
      },
      stages: {
        'pike-meet': {
          name: 'Möt gäddan',
          narrative:
            'Det här är gäddan – den största jägaren i Östersjöns grunda vikar. Den kan bli upp till en meter lång och leva i tjugo år. Ser du hur den gömmer sig? Det prickiga mönstret gör den nästan osynlig bland vassen. Den väntar helt stilla, sedan – snap! Den är en av de snabbaste jägarna i vattnet.',
          aiPrompt:
            'Scen: Stor gädda orörlig bland hög vass och ålgräs i solbelyst vik. Mörkgrön med ljusa fläckar, kamouflerad. Små abborrar i närheten. Extra kontext: Max 130 cm. Kan äta fisk upp till halva sin kroppslängd. Anfallshastighet i millisekunder. Troféfisk (>12 kg) vanliga fram till mitten av 1990-talet, nu mycket sällsynta.',
          narrativeBeats: [
            'Presentera gäddan — den största jägaren i de grunda vikarna, upp till en meter lång',
            'Lyft fram kamouflagen — det prickiga mönstret gör den osynlig bland vassen',
            'Jaktstilen: helt stilla, sedan slår den till på millisekunder',
            '→ Övergång: men gäddan är inte bara imponerande — den är livsviktig (nästa: Varför gäddan är viktig)',
          ],
          nextSceneHook: 'Nästa scen: "Varför gäddan är viktig" — den här fisken håller hela ekosystemet samman',
          refs: [
            { refId: 'larsson-2015', description: 'Gäddans ekologi, evolution och förvaltning — hemvändande, ~50 % anadroma' },
            { refId: 'olin-2024', description: 'Vikar med friska gäddor är mer motståndskraftiga mot storspiggövertagande' },
          ],
        },
        'pike-why-it-matters': {
          name: 'Varför gäddan är viktig',
          narrative:
            'När gäddan finns i närheten mår hela viken bra. Den håller mindre fiskar i schack, vilket skyddar växter och alger på havsbotten. Tänk på gäddan som en vakt – utan den kommer allt i obalans. Forskare kallar den en \u00abnyckelart\u00bb. Det betyder att den håller hela ekosystemet samman, som slutstenen i en valvbåge.',
          aiPrompt:
            'Scen: Vid frisk vik. Gädda patrullerar bland blåstång/vass. Måttligt med abborre, mört. Klart vatten, frodig vegetation, solljus till sandbotten. Extra kontext: Mekanismen kallas "trofisk kaskad" — gädda kontrollerar småfisk → skyddar betare → kontrollerar alger. Stockholm Resilience Centre (2024): vikar med frisk gädda betydligt mer motståndskraftiga mot storspiggsövertagande. Sammankopplade grannvikar hjälper varandra — gäddor rör sig mellan dem.',
          narrativeBeats: [
            'När gäddan finns mår hela viken bra — den håller småfiskarna i schack',
            'Tänk på gäddan som en vakt eller nyckelsten — ta bort den och allt kollapsar',
            'Forskare kallar det en "trofisk kaskad" — gäddan styr hela näringskedjan',
            '→ Övergång: så vad hotar gäddans barnkammare? (nästa: De förlorade barnkamrarna)',
          ],
          nextSceneHook: 'Nästa scen: "De förlorade barnkamrarna" — platserna där gäddan föds håller på att försvinna',
          refs: [
            { refId: 'larsson-2015', description: 'Nyckelart, trofiska kaskader i Östersjöns kustekosystem' },
            { refId: 'olin-2024', description: 'Predation och rumslig konnektivitet formar ekosystemets motståndskraft mot regimskifte' },
          ],
        },
        'pike-lost-nurseries': {
          name: 'De förlorade barnkamrarna',
          narrative:
            'Du ser ett bäckutlopp \u2014 sötvatten som sipprar ut i viken. Varje vår följer gäddan den doften tillbaka till bäckarna där den föddes, driven av instinkten att leka i samma varma, växtrika våtmarker där den en gång kläcktes. Men den här bäcken är blockerad. En betongtrumma med metallgaller sitter där vattnet rinner ut, och gäddan kan inte ta sig förbi. Även om den kunde det \u00e4r barnkammaren uppströms borta \u2014 utdikad för decennier sedan för att bli jordbruksmark. Gäddan kommer fortfarande hit, säsong efter säsong, dragen till ett hem som inte längre finns.',
          aiPrompt:
            'Scen: Undervattensvy av ett bäckutlopp som rinner ut i en Östersjövik. En rund betongtrumma med metallgaller blockerar passagen. En gädda svävar nära utflödet, dragen av sötvattensströmmen men oförmögen att ta sig in. Grumligt, siltigt vatten flödar genom trumman. Extra kontext: ~50% av kustgäddan är anadrom (havslevande, sötvattenlekande). Lekplatströgenhet \u2014 gäddan återvänder till exakt födelseplatsen. Uppströms våtmarksbarnkammare utdikad för jordbruk. Trumma + galler = fysisk barriär som hindrar lekvandring. Över hundra år av utdikning och kanalisering i Sverige. Förlust av en bäck = förlust av en hel lokal delpopulation.',
          narrativeBeats: [
            'Du ser ett bäckutlopp \u2014 varje vår följer gäddan sötvattendoften tillbaka till bäckarna där den föddes',
            'Men passagen är blockerad: en betongtrumma med metallgaller hindrar gäddan från att ta sig in',
            'Även om den kunde passera är barnkammaren uppströms borta \u2014 utdikad för jordbruk för decennier sedan',
            '\u2192 Övergång: och det blir värre \u2014 möt storspigginvasionen (nästa: Storspigginvasionen)',
          ],
          nextSceneHook: 'Nästa scen: "Storspigginvasionen" \u2014 den lilla fisken som vände på rollerna mot gäddan',
          refs: [
            { refId: 'nilsson-2014', description: 'Yngelutvandring från våtmark: 3 000 → 100 000+ efter restaurering, 300 000 efter fem år' },
          ],
        },
        'pike-stickleback-invasion': {
          name: 'Storspigginvasionen',
          narrative:
            'Minns du dessa? Storspigg – knappt lika lång som ditt lillfinger. Det brukade finnas ett normalt antal av dem, men nu finns det miljarder. Utan tillräckligt med gäddor som äter dem har deras antal exploderat. Och här är den grymma delen: storspigg älskar att äta gäddägg. Så ju färre gäddor det finns, desto fler storspiggar kläcks, och desto fler gäddägg äts upp. Det är en ond cirkel.',
          aiPrompt:
            'Scen: Tät storspiggsvärm. Botten: genomskinliga gäddägg på vegetation äts upp. Extra kontext: Teknisk term: "rovdjur-byte-rollomkastning." Nilsson et al. (2019) dokumenterade detta som en huvudorsak till gäddans rekryteringssvikt. Fiskeförbud allena kan inte lösa detta — storspiggens cykel är nu det större hindret för gäddåterhämtning.',
          narrativeBeats: [
            'Utan tillräckligt med gäddor har storspiggens antal exploderat till miljarder',
            'Det grymma: storspiggar äter gäddägg — en ond cirkel som föder sig själv',
            'Fiskeförbud ensamt kan inte lösa detta — storspiggens cykel är nu det större hindret',
            '→ Övergång: och det finns ytterligare ett nytt hot i vikarna (nästa: Sälen i viken)',
          ],
          nextSceneHook: 'Nästa scen: "Sälen i viken" — en naturvårdsframgång med en oväntad vändning',
          refs: [
            { refId: 'nilsson-2019', description: 'Omvänd rovdjur-bytesrelation: storspiggspredation på gäddlarver som huvudorsak till rekryteringssvikt' },
          ],
        },
        'pike-seal-in-bay': {
          name: 'Sälen i viken',
          narrative:
            'Gråsälar är fantastiska djur – de var nästan utrotade på 1970-talet men har gjort en stark comeback, från omkring 3\u00a0600 till över 55\u00a0000 i Östersjön idag. Det är goda nyheter för sälarna. Men när de har flyttat in i de inre vikarna där gäddan lever har de blivit ett av gäddans största hot. I Stockholms skärgård äter sälar och skarvar tillsammans nu många gånger fler gäddor än vad fiskare fångar. Det är naturen – men det tippar balansen.',
          aiPrompt:
            'Scen: Gråsäl i grund inre skärgårdsvik. Gädda och vass synliga. Säl jagar gädda. Extra kontext: Kraschen orsakades av jakt + PCB/DDT. Återhämtning efter förbud 1974/1978. Yttre skärgården: gädda <5% av sälens diet. Inre/centrala Stockholm: gädda ~20% av biomassan. SLU: sälar + skarvar tar 5–18x mer gädda än fisket (Stockholms skärgård 2014–2017). Inte sälarnas fel — skyddade, viktiga djur. Utmaningen är ekosystemnivåförvaltning. Skarvar också betydande gädd-/abborrpredatorer.',
          narrativeBeats: [
            'Gråsälar — fantastisk comeback från 3 600 till 55 000 (goda nyheter för sälarna!)',
            'Men när de flyttat in i de inre vikarna har de blivit ett av gäddans största hot',
            'I Stockholms skärgård äter sälar + skarvar många gånger fler gäddor än fiskare fångar',
            '→ Övergång: låt oss se vad som händer med en hel vik när gäddan försvinner (nästa: Kedjereaktion)',
          ],
          nextSceneHook: 'Nästa scen: "Kedjereaktion" — så ser en vik ut när gäddan är borta',
          refs: [
            { refId: 'bergstrom-2022', description: 'Gäddpopulationens nedgång sedan 1990-talet, sälar + skarvar konsumerar 5–18× mer gädda än fisket i Stockholms skärgård' },
            { refId: 'svensson-2021', description: 'Gråsälens diet i inre Stockholms skärgård: gädda ~20 % av biomassan' },
            { refId: 'su-seal-2025', description: 'Gråsälspopulationens återhämtning från ~3 600 (1970-talet) till 55 000–73 000 (2025)' },
          ],
        },
        'pike-chain-reaction': {
          name: 'Kedjereaktion',
          narrative:
            'Så här ser en vik ut när gäddorna försvinner. Utan gädda tar storspigg över. De äter de små djur som håller algerna under kontroll. Så algerna växer vilt, vattnet blir grönt och växterna på botten dör av ljusbrist. Forskare kallar detta ett \u00abregimskifte\u00bb – viken slår om från frisk till sjuk, och det är mycket svårt att vända tillbaka.',
          aiPrompt:
            'Scen: Degraderad vik — grumligt grönt, ingen gädda, storspiggar överallt, trådformiga alger på stenar, blåstång borta. Skarv dyker genom grumlet. Kontrast med pike-why-it-matters-scenen. Extra kontext: Kallas "storspiggens våg" — sprider sig vik för vik längs svenska kusten. Hela kedjan: gädda borta → storspiggar → betare uppätna → alger okontrollerade → växter kvävda → grumligt → mer död. När det väl slagit om, extremt svårt att vända.',
          narrativeBeats: [
            'Utan gädda: storspiggar tar över → äter betare → algerna växer vilt → vattnet blir grönt',
            'Växterna på botten dör av ljusbrist — forskare kallar detta ett "regimskifte"',
            'När en vik väl slagit om från frisk till sjuk är det mycket svårt att vända tillbaka',
            '→ Övergång: men det finns verkligt hopp — människor får tillbaka gäddan (nästa: Att få tillbaka gäddan)',
          ],
          nextSceneHook: 'Nästa scen: "Att få tillbaka gäddan" — riktiga restaureringsprojekt som fungerar just nu',
          refs: [
            { refId: 'eklof-2020', description: '«Storspiggsvågen» — rumsligt regimskifte som sprider sig vik för vik längs svenska kusten' },
          ],
        },
        'pike-bringing-back': {
          name: 'Att få tillbaka gäddan',
          narrative:
            'De goda nyheterna? När människor hjälper till fungerar det. Längs den svenska kusten har över hundra våtmarker restaurerats som \u00abgäddkammare\u00bb – och där de har gjort det gick antalet gäddyngel från 3\u00a0000 till över 300\u00a0000 på bara några år. Du kan hjälpa till också: om du fiskar, släpp alltid tillbaka gäddan försiktigt. Välj mat som inte kommer från överfiskade hav. Och berätta för folk om gäddan – för en fisk som är så viktig borde inte försvinna utan att någon märker det.',
          aiPrompt:
            'Scen: Restaurerad våtmark, fiskpassage, översvämmad gräsmark. Gäddyngel bland strån. Vuxen gädda i bredare vik. Extra kontext: Kronobäck (Kalmar): 3 000 → 300 000+ yngel på 5 år. Tibblin et al. (2023): 90% högre gäddförekomst nära restaurerade våtmarker. Svenska regler: 3 gäddor/dag, fönster 40–75 cm. Trålförbud <12 nm från feb 2025. Barnåtgärder: släpp tillbaka gädda, plocka skräp, berätta för andra, stöd våtmarksorganisationer.',
          narrativeBeats: [
            'Över 100 våtmarker restaurerade som "gäddkammare" längs svenska kusten — det fungerar!',
            'Riktiga siffror: gäddyngel gick från 3 000 till 300 000+ på bara några år',
            'Vad du kan göra: släpp tillbaka gädda försiktigt, välj hållbar mat, berätta för andra om gäddan',
            'Avslutning: en fisk som är så viktig borde inte försvinna utan att någon märker det',
          ],
          refs: [
            { refId: 'tibblin-2023', description: '90 % fler gäddor i vikar intill restaurerade våtmarker' },
            { refId: 'bcf-pike', description: 'Gäddfabriker — våtmarksrestaureringsprojekt i Blekinge' },
          ],
        },
      },
    },
    'fish-species': {
      title: 'Fiskarter i Östersjön',
      subtitle: 'En närbildsguide till Östersjöns fiskar.',
      aiPrompt:
        'Artguide. Varje scen är en närbild av en fisk. Berättelsen täcker grunderna. Fördjupa bara när besökaren frågar. Upprepa inte det berättelsen säger.',
      stages: {
        'fish-species-perch': {
          name: 'Abborre',
          narrative:
            'Europeisk abborre. Längd: 15–45 cm. Abborren är en randig jägare i grunda vatten – dess mörka ränder och lysande orangea fenor gör den till en av de vackraste fiskarna i Östersjön. Den använder sina stora ögon för att hitta byten i grumligt vatten. Abborren äter mindre fiskar, räkor och insektslarver. Roligt fakta: abborrens ägg kommer ut i långa, geléliknande band som hänger över växter som undervattensgirlanger.',
          aiPrompt:
            'Scen: Närbild europeisk abborre (Perca fluviatilis), mörka ränder, rödorangea fenor. Extra kontext: Kan bli 15+ år. Minskar tillsammans med gäddan sedan 1990-talet — samma storspigg/säl-problem. Äggband över 1 m långa. Även byte för sälar och skarvar.',
        },
        'fish-species-pike': {
          name: 'Gädda',
          narrative:
            'Gädda. Längd: 40–100 cm (ibland över en meter!). Topprovdjuret i Östersjöns grunda vikar. Gäddan är en bakhållsjägare – den ligger helt stilla bland vassen tills bytet kommer nära, och slår sedan till snabbare än du kan blinka. En enda gädda kan äta hundratals storspiggar under en säsong. Roligt fakta: gäddan återvänder alltid till exakt den plats där den föddes för att lägga sina egna ägg.',
          aiPrompt:
            'Scen: Närbild gädda (Esox lucius), vass, prickigt kamouflage, stora käkar. Extra kontext: Max 130 cm, 20+ år. ~50% anadromer. Minskat sedan 1990-talet — habitatförlust, storspiggar, sälar, överfiske. Troféfisk >12 kg nu mycket sällsynt. Se gäddkapitlet för hela historien.',
        },
        'fish-species-stickleback': {
          name: 'Storspigg',
          narrative:
            'Storspigg. Längd: 4–8 cm. Liten men mäktig. Denna lilla fisk har tre vassa taggar på ryggen som skydd. Hanen bygger ett bo av växtfibrer och gör en sicksackdans för att locka honor. När hon lagt äggen vaktar pappan dem intensivt. Roligt fakta: antalet storspiggar i Östersjön har exploderat femtiofaldigt sedan 1990-talet – det finns nu miljarder av dem.',
          aiPrompt:
            'Scen: Extrem närbild storspigg (Gasterosteus aculeatus), tre ryggtaggar synliga. Extra kontext: ~10% av all fiskbiomassa i Östersjön. Bolim av njursekret. Orsak: mesopredator release. I svärmar äter de gädd-/abborräggen = rovdjur-byte-rollomkastning. Ett av de största ekologiska problemen i Östersjöns kustvatten.',
        },
        'fish-species-cod': {
          name: 'Atlanttorsk',
          narrative:
            'Atlanttorsk. Längd: 20–30 cm idag (de brukade bli upp till 100 cm!). Torsken var en gång Östersjöns kung – enorma, kraftfulla fiskar som härskade i djupvattnet. Men årtionden av överfiske och krympande syrezoner har bara lämnat små, tunna fiskar kvar. Allt torskfiske i Östersjön har förbjudits sedan 2019, men de återhämtar sig fortfarande inte. Roligt fakta: torsken behöver en speciell blandning av salt, syrerikt vatten för att lägga sina ägg, och det finns bara en plats kvar i Östersjön där det fungerar.',
          aiPrompt:
            'Scen: Liten tunn torsk (Gadus morhua) på mellandjup, spökkonturer av historisk storlek (2x). Extra kontext: Topp ~400 000 ton i mitten av 1980-talet. Könsmogen vid ~20 cm nu jämfört med 35–40 cm. Många infekterade med nematoden Contracaecum osculatum. Enda lekplats: Bornholmsdjupet (>11 PSU + O₂). Torskkollapsen utlöste storspiggsexplosionen.',
        },
      },
    },
  },
};
