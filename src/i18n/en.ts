import type { TranslationStrings } from './types';

export const en: TranslationStrings = {
  ui: {
    siteTitle: 'Baltic Sea',
    chooseChapter: 'Choose a chapter',
    speciesGuides: 'Species Guides',
    aboutTitle: 'About',
    aboutText:
      'An interactive underwater experience exploring the Baltic Sea — one of the most threatened seas on Earth. Dive beneath the surface to discover who lives here, what\u2019s going wrong, and what you can do to help.',
    referencesTitle: 'References',
    referencesSubtitle:
      'Studies and reports cited in the Baltic Sea interactive experience.',
    modeLinear: 'Linear Narrative',
    modeAiGuided: 'AI Guide',
    chatPlaceholder: 'Ask your guide a question...',
    chatSend: 'Send',
  },
  ai: {
    coreSystemPrompt:
      'You are a friendly marine biologist named Dr. Anna Igefjärd, a Baltic Sea expert guiding visitors through an interactive 3D underwater experience near Askö, Sweden. Your audience is around 10 years old — curious, smart, but not scientists. Speak in a warm, engaging way. Use comparisons to things kids know (school rulers, backpacks, swimming pools). Keep answers concise (2–3 sentences) unless the visitor asks for more detail. Always respond in the same language as these instructions.\n\nNARRATIVE PROGRESSION RULES:\n- Your primary job is to shepherd the visitor through the narrative arc of this chapter. Each scene has NARRATIVE BEATS — cover them in order, roughly one per exchange.\n- Cover ONE beat per response — do not combine multiple beats into one message. Let the visitor absorb and react.\n- Aim to cover each scene in 2–4 exchanges. After 4+ messages on the same scene without active visitor questions, suggest moving to the next scene.\n- End each response with a question that leads toward the NEXT narrative beat or the next scene — not an open-ended tangent. For example, instead of "What do you think about algae?", ask "Want to see what happens when these forests disappear?" or "Ready to meet the fish that\'s taking over?"\n- If the visitor asks something off-topic, give a brief honest answer (1 sentence), then steer back: "Great question! But first, let me show you something important…" and return to the next uncovered beat.\n- When all beats for a scene are covered, use the NEXT SCENE hook to transition. Navigate to the next scene using the tool call.\n- Do NOT repeat what the narrative text already says — paraphrase, add depth, and make it vivid.\n\nTOOL USE RULES:\n- You have a navigate_to_stage function call (tool call) to move the camera to different scenes. Use it as a tool call only — NEVER write "navigate_to_stage" or "*Navigating to...*" in your text. The visitor must never see tool names.\n- Use it when relevant to illustrate your points or to transition to the next scene, and only then. Only navigate to one scene per response.\n- CRITICAL: You must ALWAYS include dialogue text in your response, even when making a function call. Never return only a tool call with no text.\n- When you navigate to a new scene, describe what the visitor is now seeing in vivid detail and continue the story.\n- When a visitor navigates to a new scene themselves, comment on what they are looking at and start covering that scene\'s narrative beats.\n\nIf a visitor asks something you don\'t know, be honest and say so — real scientists do that too.',
  },
  chapters: {
    intro: {
      title: 'Intro to the Baltic',
      subtitle: 'Dive into one of the most threatened seas on Earth.',
      aiPrompt:
        'Chapter overview: Introduction to the Baltic Sea anchored at Ask\u00f6 Laboratory. Arc: welcome \u2192 underwater habitats \u2192 species collapse \u2192 dead zones \u2192 cultural heritage \u2192 hope. The Baltic is brackish (~6 PSU vs 35 for oceans), formed ~10,000 years ago, surrounded by 9 countries and 85 million people. Guide the visitor through the scenes using concrete comparisons a 10-year-old would understand.',
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
          linkText: 'University of Gothenburg — Eelgrass Restoration',
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
          name: 'Welcome to the Baltic',
          narrative:
            'When was the last time you swam in the Baltic Sea? That water felt different, right \u2014 not quite salty, not quite fresh. You were swimming in the youngest sea on Earth, and one of the most threatened. This is Ask\u00f6, south of Stockholm, where scientists have been watching this sea change for over 60 years. Let\u2019s dive in.',
          aiPrompt:
            'Scene: Shallow underwater near Ask\u00f6. Sunlight through green-tinged water. Bladderwrack and rocks on seabed. Extra context: Ask\u00f6 Lab run by Stockholm University Baltic Sea Centre. Salinity ~6 PSU (ocean 35). Water takes 25\u201330 years to fully exchange with the North Sea, so pollutants accumulate.',
          narrativeBeats: [
            'Welcome the visitor — they\'re diving into the youngest sea on Earth',
            'Explain what makes the Baltic special: brackish water, not quite salty, not quite fresh',
            'Introduce Askö as a research station that\'s watched this sea for 60+ years',
            '→ Transition: let\'s explore what lives beneath the surface (next: The Underwater Forest)',
          ],
          nextSceneHook: 'Next scene: "The Underwater Forest" — discover the Baltic\'s hidden habitat and what\'s threatening it',
        },
        'intro-underwater-forest': {
          name: 'The Underwater Forest',
          narrative:
            'This is bladderwrack \u2014 the Baltic\u2019s version of a forest. Tiny crabs, snails and fish hide in its branches, just like animals in a real forest. But look closer: slimy green threads are choking it. Too many nutrients from farms and cities feed these fast-growing algae, and they\u2019re stealing the light the bladderwrack needs to survive. In some places, these forests have already disappeared.',
          aiPrompt:
            'Scene: Bladderwrack (Fucus vesiculosus) forest on rocks, filamentous algae smothering parts. Barren rock face adjacent. Extra context: Takes 4\u20135 years to mature, so recovery is very slow. 97% of the Baltic affected by eutrophication. Historically grew to 15m depth; now only 2\u20134m in some areas. Hosts isopods (Idotea), snails (Littorina), tube worms, black gobies.',
          narrativeBeats: [
            'Introduce bladderwrack as the Baltic\'s underwater forest — a habitat full of life (crabs, snails, fish)',
            'Point out the slimy green algae threads choking it — caused by nutrient runoff from farms and cities',
            'Explain the consequence: these forests are disappearing, and they take 4–5 years to regrow',
            '→ Transition: what happens when the ecosystem loses its big predators? (next: Stickleback Swarm)',
          ],
          nextSceneHook: 'Next scene: "The Stickleback Swarm" — the algae problem connects to an explosion of tiny fish',
          refs: [
            { refId: 'helcom-2023', description: 'Bladderwrack depth retreat, eutrophication affecting 97% of the Baltic' },
          ],
        },
        'intro-stickleback-swarm': {
          name: 'The Stickleback Swarm',
          narrative:
            'Meet the three-spined stickleback \u2014 barely the length of your finger, but there are billions of them. Their numbers have exploded fifty times over since your parents were kids. Why? Because the big fish that used to eat them \u2014 like cod \u2014 are mostly gone. Now these tiny fish swarm into the bays every spring and devour the eggs of pike and perch, making the problem even worse.',
          aiPrompt:
            'Scene: Massive stickleback swarm like a silver wall. Pike lurks in reeds in background. Extra context: Now ~10% of all Baltic fish biomass. Technical term: \u201cmesopredator release.\u201d Males build nests from plant fibres glued with kidney secretions, do zigzag courtship dances. SLU Aqua researcher Ulf Bergstr\u00f6m described them as devastating to shallow bays.',
          narrativeBeats: [
            'Introduce the three-spined stickleback — tiny, finger-sized, but billions of them',
            'Explain why they exploded: the big fish (cod) that ate them are mostly gone',
            'The cruel twist: sticklebacks eat pike and perch eggs, making the predator decline even worse',
            '→ Transition: but what happened to the cod? (next: The Shrinking Cod)',
          ],
          nextSceneHook: 'Next scene: "The Shrinking Cod" — the fish that once ruled the Baltic is barely hanging on',
          refs: [
            { refId: 'eklof-2020', description: 'Stickleback population explosion (~50-fold), regime shift from predator to prey dominance' },
          ],
        },
        'intro-shrinking-cod': {
          name: 'The Shrinking Cod',
          narrative:
            'This is the Atlantic cod \u2014 or what\u2019s left of it. Thirty years ago, a Baltic cod could grow as long as your arm and weigh more than your backpack. Today, most never get bigger than a school ruler. Scientists have banned all cod fishing in the Baltic, but the population still isn\u2019t recovering. The water they need to lay their eggs in \u2014 salty enough and with enough oxygen \u2014 has shrunk to just one deep spot near Bornholm.',
          aiPrompt:
            'Scene: Deep, dark water. Small thin cod with ghost outline of 1980s-sized cod (2x larger) superimposed. Lifeless mud seabed. Extra context: Peak catches ~400,000 tonnes mid-1980s. Total ban since 2019 incl. recreational. Now mature at ~20 cm instead of 35\u201340 cm. Many infested with nematode Contracaecum osculatum. Cod collapse triggered the stickleback explosion.',
          narrativeBeats: [
            'Introduce Baltic cod — once as long as your arm, now smaller than a ruler',
            'Fishing ban since 2019, but still not recovering — explain why',
            'The problem: cod need salty, oxygen-rich deep water to breed, and there\'s only one spot left (Bornholm)',
            '→ Transition: let\'s go deeper and see why the oxygen disappeared (next: The Dead Zone)',
          ],
          nextSceneHook: 'Next scene: "The Dead Zone" — dive into the lifeless depths where oxygen has vanished',
          refs: [
            { refId: 'casini-2016', description: 'Cod stock collapse, fishing ban, parasitic infestation, spawning volume contraction' },
            { refId: 'eero-2015', description: 'Eastern Baltic cod in distress — biological changes' },
          ],
        },
        'intro-dead-zone': {
          name: 'The Dead Zone',
          narrative:
            'Below us is a dead zone \u2014 an area bigger than Denmark where nothing can live. Fertilisers from farms wash into rivers, then into the sea, feeding huge algae blooms. When the algae die and sink, bacteria consume all the oxygen down here. Right now, one-third of the Baltic seafloor doesn\u2019t have enough oxygen for any animal to survive. And in 2024, scientists measured the worst oxygen levels ever recorded here.',
          aiPrompt:
            'Scene: Pitch-black below halocline shimmer. Barren grey-brown mud, no life, faint particle drift. Extra context: ~18\u201319% fully anoxic, ~15% hypoxic. SMHI April 2025 report: all-time record hydrogen sulphide at Gotland Deep (BY15) Nov 2024. Vicious cycle: anoxic sediments release phosphorus, fuelling more blooms. Dead zone has grown tenfold since the 1950s.',
          narrativeBeats: [
            'Explain what a dead zone is — an area bigger than Denmark where nothing can live',
            'The cause: fertilizers → rivers → algae blooms → bacteria consume all oxygen',
            'The scale: one-third of the Baltic seafloor is oxygen-starved, 2024 saw worst levels ever recorded',
            '→ Transition: the Baltic holds secrets beyond ecology (next: The Shipwreck)',
          ],
          nextSceneHook: 'Next scene: "The Shipwreck" — the Baltic preserves 100,000 shipwrecks, but that\'s changing too',
          refs: [
            { refId: 'hansson-2025', description: 'Record hydrogen sulphide at Gotland Deep (BY15) November 2024, oxygen time series 1960–2024' },
            { refId: 'helcom-2023', description: 'Dead zone area ~1.5× Denmark, one-third of seafloor hypoxic/anoxic' },
          ],
        },
        'intro-shipwreck': {
          name: 'The Shipwreck',
          narrative:
            'The Baltic holds around 100,000 shipwrecks \u2014 Viking longships, warships, medieval traders \u2014 preserved for centuries because the cold, low-salt water kept wood-eating shipworms away. But as the sea warms, shipworms are spreading further north. They\u2019re not actually worms \u2014 they\u2019re clams that tunnel into wood and eat it from the inside. A whole underwater museum is slowly being eaten alive.',
          aiPrompt:
            'Scene: Wooden shipwreck on seabed, hull intact, draped in blue mussels. Close-up: shipworm boreholes. Extra context: Vasa survived 333 years in Stockholm harbour due to low salinity. Shipworms (Teredo navalis) need >5 PSU to survive, >8 to reproduce. Breeding season extended ~26 days vs 1970s. ~100 wrecks infested by 2010. EU WreckProtect project (Univ. Gothenburg) developed geotextile coverings. Vrak Museum opened 2021.',
          narrativeBeats: [
            'The Baltic holds ~100,000 shipwrecks — Vikings, warships, medieval traders — preserved for centuries',
            'Why they survived: cold, low-salt water kept shipworms away',
            'The new threat: warming water lets shipworms spread north, eating wrecks from the inside',
            '→ Transition: it sounds bad, but there\'s real hope (next: What You Can Do)',
          ],
          nextSceneHook: 'Next scene: "What You Can Do" — ending on hope, with real actions that are making a difference',
          refs: [
            { refId: 'appelqvist-2015', description: 'Shipworm breeding season extended ~26 days, climate envelope modeling' },
            { refId: 'bjordal-2012', description: 'WreckProtect project — strategies for protecting wooden underwater cultural heritage' },
          ],
        },
        'intro-what-you-can-do': {
          name: 'What You Can Do',
          narrative:
            'The Baltic Sea isn\u2019t a lost cause \u2014 when people act, it actually recovers. Scientists are replanting underwater meadows by hand. Sweden moved its trawling border to protect coastal fish. Over 600,000 Swedish kids pick up litter from beaches every year. You can help too: skip single-use plastic, ask where your fish comes from, and if you see trash near water \u2014 pick it up. This sea is yours. It\u2019s the one you swim in.',
          aiPrompt:
            'Scene: Bright shallow water, camera up toward sunlit surface. Optimistic closing. Extra context: Univ. Gothenburg ZORRO planted 3M+ eelgrass shoots, one site 26-fold increase. HELCOM Baltic Sea Action Plan ~200 actions targeting 2030. Pelagic trawl ban <12 nm Swedish coast from Feb 2025. Additional kid actions: phosphate-free detergents, sustainable fish (no eel, no Baltic cod), citizen science (Stockholm Uni algae project).',
          narrativeBeats: [
            'Good news: when people act, the Baltic recovers — scientists replanting meadows, trawling bans',
            'Real numbers: 600,000 Swedish kids picking up beach litter every year',
            'What you can do: skip single-use plastic, ask where your fish comes from, pick up litter near water',
            'Wrap up: this sea is yours — it\'s the one you swim in',
          ],
          refs: [
            { refId: 'gu-eelgrass', description: 'ZORRO eelgrass restoration programme — 3M+ shoots planted, 26-fold increase' },
            { refId: 'helcom-2021', description: 'HELCOM Baltic Sea Action Plan (~200 actions targeting 2030)' },
            { refId: 'hsr-cleanup', description: 'Håll Sverige Rent — 600,000–800,000 children annually' },
          ],
        },
      },
    },
    pike: {
      title: 'The Pike',
      subtitle: 'Follow the fate of the Baltic\u2019s biggest shallow-water hunter.',
      aiPrompt:
        'Chapter overview: Northern pike (Esox lucius) as keystone predator of Baltic shallow bays. Arc: meet \u2192 importance \u2192 threats (habitat loss, sticklebacks, seals) \u2192 ecosystem collapse \u2192 restoration hope. Same underwater environment as intro chapter, different story. Guide the visitor so a 10-year-old can follow the cause-and-effect chain.',
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
          linkText: 'SU Baltic Sea Centre (2025), Policy Brief',
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
          linkText: 'Baltic Conservation Foundation — Pike Factories',
        },
        'olsson-2023': {
          citation:
            'Olsson, J. et al. (2023). A pan-Baltic assessment of temporal trends in coastal pike populations. Fisheries Research, 260, 106594.',
          url: 'https://www.sciencedirect.com/science/article/pii/S016578362200371X',
          linkText: 'Olsson et al. (2023), Fisheries Research',
        },
      },
      chapterRefs: {
        title: 'Pan-Baltic Pike Assessment',
        refs: [
          { refId: 'olsson-2023', description: 'Regional decline of pike across 8 Baltic countries, 59 time series' },
        ],
      },
      stages: {
        'pike-meet': {
          name: 'Meet the Pike',
          narrative:
            'This is the pike \u2014 the biggest hunter in the shallow bays of the Baltic Sea. It can grow as long as a metre and live for twenty years. See how it hides? That spotted pattern makes it almost invisible in the reeds. It waits perfectly still, then \u2014 snap! It\u2019s one of the fastest hunters in the water.',
          aiPrompt:
            'Scene: Large pike motionless among tall reeds and eelgrass in sunlit bay. Dark green with pale spots, camouflaged. Small perch nearby. Extra context: Max 130 cm. Can eat fish up to half its body length. Strike speed in milliseconds. Trophy pike (>12 kg) common until mid-1990s, now very rare.',
          narrativeBeats: [
            'Introduce the pike — biggest hunter in the shallow bays, up to a metre long',
            'Highlight its camouflage — spotted pattern makes it invisible in the reeds',
            'Its hunting style: perfectly still, then strikes in milliseconds',
            '→ Transition: but the pike isn\'t just impressive — it\'s vital (next: Why the Pike Matters)',
          ],
          nextSceneHook: 'Next scene: "Why the Pike Matters" — this fish holds the whole ecosystem together',
          refs: [
            { refId: 'larsson-2015', description: 'Pike ecology, evolution and management — natal homing, ~50% anadromous' },
            { refId: 'olin-2024', description: 'Bays with healthy pike are more resilient to stickleback takeover' },
          ],
        },
        'pike-why-it-matters': {
          name: 'Why the Pike Matters',
          narrative:
            'When pike are around, the whole bay stays healthy. They keep smaller fish in check, which protects the plants and algae on the seafloor. Think of the pike like a guard \u2014 without it, everything gets out of balance. Scientists call it a \u2018keystone species.\u2019 That means it holds the whole ecosystem together, like the top stone in an arch.',
          aiPrompt:
            'Scene: Wide healthy bay. Pike patrol among bladderwrack/reeds. Moderate perch, roach. Clear water, lush vegetation, sunlight to sandy bottom. Extra context: Mechanism is \u201ctrophic cascade\u201d \u2014 pike controls small fish \u2192 protects grazers \u2192 controls algae. Stockholm Resilience Centre (2024): bays with healthy pike far more resistant to stickleback takeover. Connected neighbouring bays help each other \u2014 pike move between them.',
          narrativeBeats: [
            'When pike are around, the whole bay stays healthy — they keep smaller fish in check',
            'Think of the pike like a guard or keystone — remove it and everything collapses',
            'Scientists call this a "trophic cascade" — pike controls the whole food chain',
            '→ Transition: so what\'s threatening the pike\'s nurseries? (next: The Lost Nurseries)',
          ],
          nextSceneHook: 'Next scene: "The Lost Nurseries" — the places where pike are born are disappearing',
          refs: [
            { refId: 'larsson-2015', description: 'Keystone role, trophic cascades in Baltic coastal ecosystems' },
            { refId: 'olin-2024', description: 'Predation and spatial connectivity shape ecosystem resilience to regime shift' },
          ],
        },
        'pike-lost-nurseries': {
          name: 'The Lost Nurseries',
          narrative:
            'You\u2019re looking at a creek outlet \u2014 freshwater trickling into the bay. Every spring, pike follow that scent back to the streams where they were born, driven by instinct to spawn in the same warm, plant-filled wetlands where they once hatched. But this creek is blocked. A concrete culvert with metal bars sits where the water flows out, and the pike can\u2019t pass. Even if they could, the nursery upstream is gone \u2014 drained decades ago to make farmland. The pike still come here, season after season, drawn to a home that no longer exists.',
          aiPrompt:
            'Scene: Underwater view of a creek outlet flowing into a Baltic bay. A round concrete culvert with metal bars blocks the passage. A pike hovers near the outflow, drawn by the freshwater current but unable to enter. Murky, silty water flows through the culvert. Extra context: ~50% of coastal pike are anadromous (sea-dwelling, freshwater-spawning). Natal homing \u2014 pike return to exact birthplace. Upstream wetland nursery was drained for agriculture. Culvert + bars = physical barrier preventing spawning migration. Century+ of drainage and channelization across Sweden. Loss of one creek = loss of an entire local sub-population.',
          narrativeBeats: [
            'You\u2019re looking at a creek outlet \u2014 every spring, pike follow the freshwater scent back to streams where they were born',
            'But this passage is blocked: a concrete culvert with metal bars stops the pike from entering',
            'Even if they could pass, the nursery upstream is gone \u2014 drained for farmland decades ago',
            '\u2192 Transition: and it gets worse \u2014 meet the stickleback invasion (next: Stickleback Invasion)',
          ],
          nextSceneHook: 'Next scene: "The Stickleback Invasion" \u2014 the tiny fish that turned the tables on the pike',
          refs: [
            { refId: 'nilsson-2014', description: 'Wetland fry emigration: 3,000 → 100,000+ after restoration, 300,000 after five years' },
          ],
        },
        'pike-stickleback-invasion': {
          name: 'The Stickleback Invasion',
          narrative:
            'Remember these? The three-spined stickleback \u2014 barely as long as your little finger. There used to be a normal number of them, but now there are billions. Without enough pike to eat them, their numbers exploded. And here\u2019s the cruel part: sticklebacks love to eat pike eggs. So the fewer pike there are, the more sticklebacks hatch, and the more pike eggs get eaten. It\u2019s a vicious circle.',
          aiPrompt:
            'Scene: Dense stickleback swarm. Bottom: translucent pike eggs on vegetation being eaten. Extra context: Technical term: \u201cpredator-prey role reversal.\u201d Nilsson et al. (2019) documented this as major cause of pike recruitment failure. Fishing bans alone can\u2019t fix this \u2014 the stickleback cycle is now the bigger barrier to pike recovery.',
          narrativeBeats: [
            'Without enough pike, stickleback numbers exploded to billions',
            'The cruel twist: sticklebacks eat pike eggs — a vicious circle that feeds itself',
            'Fishing bans alone can\'t fix this — the stickleback cycle is now the bigger barrier',
            '→ Transition: and there\'s another new threat in the bays (next: The Seal in the Bay)',
          ],
          nextSceneHook: 'Next scene: "The Seal in the Bay" — a conservation success story with an unexpected twist',
          refs: [
            { refId: 'nilsson-2019', description: 'Predator-prey role reversal: stickleback predation on pike larvae as major cause of recruitment failure' },
          ],
        },
        'pike-seal-in-bay': {
          name: 'The Seal in the Bay',
          narrative:
            'Grey seals are amazing animals \u2014 they were nearly wiped out in the 1970s but have made a strong comeback, from around 3,600 to over 55,000 in the Baltic today. That\u2019s great news for seals. But as they\u2019ve moved into the inner bays where pike live, they\u2019ve become one of the pike\u2019s biggest threats. In the Stockholm archipelago, seals and cormorants now eat many times more pike than fishermen catch. It\u2019s nature \u2014 but it\u2019s tipping the balance.',
          aiPrompt:
            'Scene: Grey seal in shallow inner-archipelago bay. Pike and reeds visible. Seal chases pike. Extra context: Crash caused by hunting + PCB/DDT. Recovery after bans 1974/1978. Outer archipelago: pike <5% of seal diet. Inner/central Stockholm: pike ~20% by biomass. SLU: seals take 5\u201318x more pike than fisheries (Stockholm archipelago 2014\u20132017). Not seals\u2019 fault \u2014 protected, important species. Challenge is ecosystem-level management.',
          narrativeBeats: [
            'Grey seals — amazing comeback from 3,600 to 55,000 (that\'s great news for seals!)',
            'But as they\'ve moved into inner bays, they\'ve become one of the pike\'s biggest threats',
            'In Stockholm archipelago, seals eat many times more pike than fishermen catch',
            '→ Transition: let\'s see what happens to a whole bay when pike disappear (next: Chain Reaction)',
          ],
          nextSceneHook: 'Next scene: "The Chain Reaction" — what a bay looks like when the pike are gone',
          refs: [
            { refId: 'bergstrom-2022', description: 'Pike population decline since 1990s, seals + cormorants consume 5–18× more pike than fisheries in Stockholm archipelago' },
            { refId: 'svensson-2021', description: 'Grey seal diet in inner Stockholm archipelago: pike ~20% by biomass' },
            { refId: 'su-seal-2025', description: 'Grey seal population recovery from ~3,600 (1970s) to 55,000–73,000 (2025)' },
          ],
        },
        'pike-chain-reaction': {
          name: 'The Chain Reaction',
          narrative:
            'This is what a bay looks like when the pike disappear. Without pike, sticklebacks take over. They eat the tiny creatures that keep algae under control. So the algae grows wild, the water turns green, and the plants on the bottom die from lack of light. Scientists call this a \u2018regime shift\u2019 \u2014 the bay flips from healthy to sick, and it\u2019s very hard to flip it back.',
          aiPrompt:
            'Scene: Degraded bay \u2014 murky green, no pike, sticklebacks everywhere, filamentous algae on rocks, bladderwrack gone. Contrast with pike-why-it-matters scene. Extra context: Called \u201cthe stickleback wave\u201d \u2014 spreads bay to bay along Swedish coast. Full chain: pike gone \u2192 sticklebacks \u2192 grazers eaten \u2192 algae unchecked \u2192 plants smothered \u2192 murky \u2192 more death. Once flipped, extremely hard to reverse.',
          narrativeBeats: [
            'Without pike: sticklebacks take over → eat grazers → algae grows wild → water turns green',
            'Plants on the bottom die from lack of light — scientists call this a "regime shift"',
            'Once a bay flips from healthy to sick, it\'s very hard to flip it back',
            '→ Transition: but there\'s real hope — people are bringing the pike back (next: Bringing the Pike Back)',
          ],
          nextSceneHook: 'Next scene: "Bringing the Pike Back" — real restoration projects that are working right now',
          refs: [
            { refId: 'eklof-2020', description: '"Stickleback wave" — spatial regime shift spreading bay to bay along Swedish coast' },
          ],
        },
        'pike-bringing-back': {
          name: 'Bringing the Pike Back',
          narrative:
            'The good news? When people help, it works. Along the Swedish coast, over a hundred wetlands have been restored as \u2018pike nurseries\u2019 \u2014 and where they have, pike fry numbers went from 3,000 to over 300,000 in just a few years. You can help too: if you fish, always release pike carefully. Choose food that doesn\u2019t come from overfished seas. And tell people about the pike \u2014 because a fish this important shouldn\u2019t disappear without anyone noticing.',
          aiPrompt:
            'Scene: Restored wetland, fish passage, flooded grassy area. Pike fry among stems. Adult pike in wider bay. Extra context: Kronob\u00e4ck (Kalmar): 3,000 \u2192 300,000+ fry in 5 years. Tibblin et al. (2023): 90% higher pike abundance near restored wetlands. Swedish rules: 3 pike/day, slot 40\u201375 cm. Trawl ban <12 nm from Feb 2025. Kid actions: release pike, pick up litter, tell others, support wetland orgs.',
          narrativeBeats: [
            'Over 100 wetlands restored as "pike nurseries" along the Swedish coast — it works!',
            'Real numbers: pike fry went from 3,000 to 300,000+ in just a few years',
            'What you can do: release pike carefully, choose sustainable food, tell people about the pike',
            'Wrap up: a fish this important shouldn\'t disappear without anyone noticing',
          ],
          refs: [
            { refId: 'tibblin-2023', description: 'Pike abundance 90% higher in bays adjacent to restored wetlands' },
            { refId: 'bcf-pike', description: 'Pike Factories — wetland restoration project in Blekinge' },
          ],
        },
      },
    },
    'fish-species': {
      title: 'Baltic Fish Species',
      subtitle: 'A close-up guide to the fish of the Baltic Sea.',
      aiPrompt:
        'Species guide. Each scene is a close-up of one fish. Narrative covers basics. Add depth only when asked. Don\u2019t repeat what narrative says.',
      stages: {
        'fish-species-perch': {
          name: 'Perch',
          narrative:
            'European perch. Size: 15\u201345 cm. The perch is a stripy hunter of the shallows \u2014 its dark bands and bright orange fins make it one of the prettiest fish in the Baltic. It uses its big eyes to find prey in murky water. Perch eat smaller fish, shrimps and insect larvae. Fun fact: perch eggs come out in long, jelly-like ribbons that drape over plants like underwater streamers.',
          aiPrompt:
            'Scene: Close-up European perch (Perca fluviatilis), dark stripes, reddish-orange fins. Extra context: Can live 15+ years. Declining alongside pike since 1990s \u2014 same stickleback/seal pressures. Egg ribbons over 1m long. Also prey for seals.',
        },
        'fish-species-pike': {
          name: 'Pike',
          narrative:
            'Northern pike. Size: 40\u2013100 cm (sometimes over a metre!). The top predator of the Baltic\u2019s shallow bays. Pike are ambush hunters \u2014 they lie completely still among reeds until prey comes close, then strike faster than you can blink. A single pike can eat hundreds of sticklebacks in one season. Fun fact: pike always return to the exact spot where they were born to lay their own eggs.',
          aiPrompt:
            'Scene: Close-up pike (Esox lucius), reeds, spotted camouflage, large jaws. Extra context: Max 130 cm, 20+ years. ~50% anadromous. Declined since 1990s \u2014 habitat loss, sticklebacks, seals, overfishing. Trophy >12 kg now very rare. See pike chapter for full story.',
        },
        'fish-species-stickleback': {
          name: 'Three-spined Stickleback',
          narrative:
            'Three-spined stickleback. Size: 4\u20138 cm. Tiny but mighty. This little fish has three sharp spines on its back for protection. The male builds a nest from plant fibres and does a zigzag dance to attract females. After she lays eggs, the dad guards them fiercely. Fun fact: stickleback numbers in the Baltic have exploded fifty times over since the 1990s \u2014 there are now billions of them.',
          aiPrompt:
            'Scene: Extreme close-up stickleback (Gasterosteus aculeatus), three dorsal spines visible. Extra context: ~10% of all Baltic fish biomass. Nest glue is kidney secretion. Cause: mesopredator release. In swarms eat pike/perch eggs = predator-prey role reversal. One of biggest ecological problems in Baltic coastal waters.',
        },
        'fish-species-cod': {
          name: 'Atlantic Cod',
          narrative:
            'Atlantic cod. Size: 20\u201330 cm today (they used to grow up to 100 cm!). Cod were once the kings of the Baltic \u2014 huge, powerful fish that ruled the deep water. But decades of too much fishing and shrinking oxygen zones have left only small, thin fish behind. All cod fishing in the Baltic has been banned since 2019, but they\u2019re still not recovering. Fun fact: cod need a special mix of salty, oxygen-rich water to lay their eggs, and there\u2019s only one spot left in the Baltic where that works.',
          aiPrompt:
            'Scene: Small thin cod (Gadus morhua) mid-depth, ghost outline of historical size (2x). Extra context: Peak ~400,000 tonnes mid-1980s. Mature at ~20 cm now vs 35\u201340 cm. Many infested with nematode Contracaecum osculatum. Only spawning: Bornholm Deep (>11 PSU + O\u2082). Cod collapse triggered stickleback explosion.',
        },
      },
    },
  },
};