import type { TranslationStrings } from './types';

export const en: TranslationStrings = {
  ui: {
    siteTitle: 'Baltic Sea',
    chooseChapter: 'Choose a chapter',
    speciesGuides: 'Species Guides',
    aboutTitle: 'About',
    aboutText:
      'An interactive underwater experience exploring the Baltic Sea — one of the most threatened seas on Earth. Dive beneath the surface to discover who lives here, what\u2019s going wrong, and what you can do to help.',
    modeLinear: 'Linear Narrative',
    modeAiGuided: 'AI Guide',
    chatPlaceholder: 'Ask your guide a question...',
    chatSend: 'Send',
  },
  ai: {
    coreSystemPrompt:
      'You are a friendly marine biologist named Dr. Anna Igefj\u00e4rd, a Baltic Sea expert guiding visitors through an interactive 3D underwater experience near Ask\u00f6, Sweden. Your audience is around 10 years old \u2014 curious, smart, but not scientists. Speak in a warm, engaging way. Use comparisons to things kids know (school rulers, backpacks, swimming pools). Keep answers concise (2\u20133 sentences) unless the visitor asks for more detail. Always respond in the same language as these instructions. Always end your response with an engaging question that invites the visitor to think, guess, or respond \u2014 for example \u201cCan you guess how long a pike can get?\u201d or \u201cWhat do you think happens when all the big fish disappear?\u201d. You have a navigate_to_stage tool to move the camera to different scenes. Use it when relevant to illustrate your points, and only then. Only navigate to one scene per response. CRITICAL RULE: You must ALWAYS include dialogue text in your response, even when using the navigate_to_stage tool. Never return only a tool call with no text. When you navigate to a new scene, describe what the visitor is now seeing in vivid detail and continue the story with a follow-up question. When a visitor navigates to a new scene themselves, comment on what they are looking at and ask an engaging question. If a visitor asks something you don\u2019t know, be honest and say so \u2014 real scientists do that too. You also have access to the narrative text for each scene \u2014 do not repeat it, but use it as context. Your job is to add depth, answer questions, and guide exploration beyond what the narrative already says.',
  },
  chapters: {
    intro: {
      title: 'Intro to the Baltic',
      subtitle: 'Dive into one of the most threatened seas on Earth.',
      aiPrompt:
        'Chapter overview: Introduction to the Baltic Sea anchored at Ask\u00f6 Laboratory. Arc: welcome \u2192 underwater habitats \u2192 species collapse \u2192 dead zones \u2192 cultural heritage \u2192 hope. The Baltic is brackish (~6 PSU vs 35 for oceans), formed ~10,000 years ago, surrounded by 9 countries and 85 million people. Guide the visitor through the scenes using concrete comparisons a 10-year-old would understand.',
      stages: {
        'intro-welcome': {
          name: 'Welcome to the Baltic',
          narrative:
            'When was the last time you swam in the Baltic Sea? That water felt different, right \u2014 not quite salty, not quite fresh. You were swimming in the youngest sea on Earth, and one of the most threatened. This is Ask\u00f6, south of Stockholm, where scientists have been watching this sea change for over 60 years. Let\u2019s dive in.',
          aiPrompt:
            'Scene: Shallow underwater near Ask\u00f6. Sunlight through green-tinged water. Bladderwrack and rocks on seabed. Extra context: Ask\u00f6 Lab run by Stockholm University Baltic Sea Centre. Salinity ~6 PSU (ocean 35). Water takes 25\u201330 years to fully exchange with the North Sea, so pollutants accumulate.',
        },
        'intro-underwater-forest': {
          name: 'The Underwater Forest',
          narrative:
            'This is bladderwrack \u2014 the Baltic\u2019s version of a forest. Tiny crabs, snails and fish hide in its branches, just like animals in a real forest. But look closer: slimy green threads are choking it. Too many nutrients from farms and cities feed these fast-growing algae, and they\u2019re stealing the light the bladderwrack needs to survive. In some places, these forests have already disappeared.',
          aiPrompt:
            'Scene: Bladderwrack (Fucus vesiculosus) forest on rocks, filamentous algae smothering parts. Barren rock face adjacent. Extra context: Takes 4\u20135 years to mature, so recovery is very slow. 97% of the Baltic affected by eutrophication. Historically grew to 15m depth; now only 2\u20134m in some areas. Hosts isopods (Idotea), snails (Littorina), tube worms, black gobies.',
        },
        'intro-stickleback-swarm': {
          name: 'The Stickleback Swarm',
          narrative:
            'Meet the three-spined stickleback \u2014 barely the length of your finger, but there are billions of them. Their numbers have exploded fifty times over since your parents were kids. Why? Because the big fish that used to eat them \u2014 like cod \u2014 are mostly gone. Now these tiny fish swarm into the bays every spring and devour the eggs of pike and perch, making the problem even worse.',
          aiPrompt:
            'Scene: Massive stickleback swarm like a silver wall. Pike lurks in reeds in background. Extra context: Now ~10% of all Baltic fish biomass. Technical term: \u201cmesopredator release.\u201d Males build nests from plant fibres glued with kidney secretions, do zigzag courtship dances. SLU Aqua researcher Ulf Bergstr\u00f6m described them as devastating to shallow bays.',
        },
        'intro-shrinking-cod': {
          name: 'The Shrinking Cod',
          narrative:
            'This is the Atlantic cod \u2014 or what\u2019s left of it. Thirty years ago, a Baltic cod could grow as long as your arm and weigh more than your backpack. Today, most never get bigger than a school ruler. Scientists have banned all cod fishing in the Baltic, but the population still isn\u2019t recovering. The water they need to lay their eggs in \u2014 salty enough and with enough oxygen \u2014 has shrunk to just one deep spot near Bornholm.',
          aiPrompt:
            'Scene: Deep, dark water. Small thin cod with ghost outline of 1980s-sized cod (2x larger) superimposed. Lifeless mud seabed. Extra context: Peak catches ~400,000 tonnes mid-1980s. Total ban since 2019 incl. recreational. Now mature at ~20 cm instead of 35\u201340 cm. Many infested with nematode Contracaecum osculatum. Cod collapse triggered the stickleback explosion.',
        },
        'intro-dead-zone': {
          name: 'The Dead Zone',
          narrative:
            'Below us is a dead zone \u2014 an area bigger than Denmark where nothing can live. Fertilisers from farms wash into rivers, then into the sea, feeding huge algae blooms. When the algae die and sink, bacteria consume all the oxygen down here. Right now, one-third of the Baltic seafloor doesn\u2019t have enough oxygen for any animal to survive. And in 2024, scientists measured the worst oxygen levels ever recorded here.',
          aiPrompt:
            'Scene: Pitch-black below halocline shimmer. Barren grey-brown mud, no life, faint particle drift. Extra context: ~18\u201319% fully anoxic, ~15% hypoxic. SMHI April 2025 report: all-time record hydrogen sulphide at Gotland Deep (BY15) Nov 2024. Vicious cycle: anoxic sediments release phosphorus, fuelling more blooms. Dead zone has grown tenfold since the 1950s.',
        },
        'intro-shipwreck': {
          name: 'The Shipwreck',
          narrative:
            'The Baltic holds around 100,000 shipwrecks \u2014 Viking longships, warships, medieval traders \u2014 preserved for centuries because the cold, low-salt water kept wood-eating shipworms away. But as the sea warms, shipworms are spreading further north. They\u2019re not actually worms \u2014 they\u2019re clams that tunnel into wood and eat it from the inside. A whole underwater museum is slowly being eaten alive.',
          aiPrompt:
            'Scene: Wooden shipwreck on seabed, hull intact, draped in blue mussels. Close-up: shipworm boreholes. Extra context: Vasa survived 333 years in Stockholm harbour due to low salinity. Shipworms (Teredo navalis) need >5 PSU to survive, >8 to reproduce. Breeding season extended ~26 days vs 1970s. ~100 wrecks infested by 2010. EU WreckProtect project (Univ. Gothenburg) developed geotextile coverings. Vrak Museum opened 2021.',
        },
        'intro-what-you-can-do': {
          name: 'What You Can Do',
          narrative:
            'The Baltic Sea isn\u2019t a lost cause \u2014 when people act, it actually recovers. Scientists are replanting underwater meadows by hand. Sweden moved its trawling border to protect coastal fish. Over 600,000 Swedish kids pick up litter from beaches every year. You can help too: skip single-use plastic, ask where your fish comes from, and if you see trash near water \u2014 pick it up. This sea is yours. It\u2019s the one you swim in.',
          aiPrompt:
            'Scene: Bright shallow water, camera up toward sunlit surface. Optimistic closing. Extra context: Univ. Gothenburg ZORRO planted 3M+ eelgrass shoots, one site 26-fold increase. HELCOM Baltic Sea Action Plan ~200 actions targeting 2030. Pelagic trawl ban <12 nm Swedish coast from Feb 2025. Additional kid actions: phosphate-free detergents, sustainable fish (no eel, no Baltic cod), citizen science (Stockholm Uni algae project).',
        },
      },
    },
    pike: {
      title: 'The Pike',
      subtitle: 'Follow the fate of the Baltic\u2019s biggest shallow-water hunter.',
      aiPrompt:
        'Chapter overview: Northern pike (Esox lucius) as keystone predator of Baltic shallow bays. Arc: meet \u2192 importance \u2192 threats (habitat loss, sticklebacks, seals) \u2192 ecosystem collapse \u2192 restoration hope. Same underwater environment as intro chapter, different story. Guide the visitor so a 10-year-old can follow the cause-and-effect chain.',
      stages: {
        'pike-meet': {
          name: 'Meet the Pike',
          narrative:
            'This is the pike \u2014 the biggest hunter in the shallow bays of the Baltic Sea. It can grow as long as a metre and live for twenty years. See how it hides? That spotted pattern makes it almost invisible in the reeds. It waits perfectly still, then \u2014 snap! It\u2019s one of the fastest hunters in the water.',
          aiPrompt:
            'Scene: Large pike motionless among tall reeds and eelgrass in sunlit bay. Dark green with pale spots, camouflaged. Small perch nearby. Extra context: Max 130 cm. Can eat fish up to half its body length. Strike speed in milliseconds. Trophy pike (>12 kg) common until mid-1990s, now very rare.',
        },
        'pike-why-it-matters': {
          name: 'Why the Pike Matters',
          narrative:
            'When pike are around, the whole bay stays healthy. They keep smaller fish in check, which protects the plants and algae on the seafloor. Think of the pike like a guard \u2014 without it, everything gets out of balance. Scientists call it a \u2018keystone species.\u2019 That means it holds the whole ecosystem together, like the top stone in an arch.',
          aiPrompt:
            'Scene: Wide healthy bay. Pike patrol among bladderwrack/reeds. Moderate perch, roach. Clear water, lush vegetation, sunlight to sandy bottom. Extra context: Mechanism is \u201ctrophic cascade\u201d \u2014 pike controls small fish \u2192 protects grazers \u2192 controls algae. Stockholm Resilience Centre (2024): bays with healthy pike far more resistant to stickleback takeover. Connected neighbouring bays help each other \u2014 pike move between them.',
        },
        'pike-lost-nurseries': {
          name: 'The Lost Nurseries',
          narrative:
            'Every spring, pike swim up into small streams and flooded wetlands to lay their eggs. The babies need warm, shallow water with lots of plants to hide in. But over the years, many of these wetlands have been drained to make farmland, and streams have been straightened into ditches. The pike come back to where they were born \u2014 but the nursery isn\u2019t there anymore.',
          aiPrompt:
            'Scene: Split \u2014 healthy flooded wetland (warm, shallow, fry visible) vs drained ditched field with straightened channel. Extra context: ~50% of coastal pike are anadromous (sea-dwelling, freshwater-spawning). Show natal homing \u2014 return to exact birthplace. Wetland loss = sub-population loss. Century+ of drainage across Sweden.',
        },
        'pike-stickleback-invasion': {
          name: 'The Stickleback Invasion',
          narrative:
            'Remember these? The three-spined stickleback \u2014 barely as long as your little finger. There used to be a normal number of them, but now there are billions. Without enough pike to eat them, their numbers exploded. And here\u2019s the cruel part: sticklebacks love to eat pike eggs. So the fewer pike there are, the more sticklebacks hatch, and the more pike eggs get eaten. It\u2019s a vicious circle.',
          aiPrompt:
            'Scene: Dense stickleback swarm. Bottom: translucent pike eggs on vegetation being eaten. Extra context: Technical term: \u201cpredator-prey role reversal.\u201d Nilsson et al. (2019) documented this as major cause of pike recruitment failure. Fishing bans alone can\u2019t fix this \u2014 the stickleback cycle is now the bigger barrier to pike recovery.',
        },
        'pike-seal-in-bay': {
          name: 'The Seal in the Bay',
          narrative:
            'Grey seals are amazing animals \u2014 they were nearly wiped out in the 1970s but have made a strong comeback, from around 3,600 to over 55,000 in the Baltic today. That\u2019s great news for seals. But as they\u2019ve moved into the inner bays where pike live, they\u2019ve become one of the pike\u2019s biggest threats. In the Stockholm archipelago, seals and cormorants together now eat many times more pike than fishermen catch. It\u2019s nature \u2014 but it\u2019s tipping the balance.',
          aiPrompt:
            'Scene: Grey seal in shallow inner-archipelago bay. Pike and reeds visible. Seal chases pike. Extra context: Crash caused by hunting + PCB/DDT. Recovery after bans 1974/1978. Outer archipelago: pike <5% of seal diet. Inner/central Stockholm: pike ~20% by biomass. SLU: seals + cormorants take 5\u201318x more pike than fisheries (Stockholm archipelago 2014\u20132017). Not seals\u2019 fault \u2014 protected, important species. Challenge is ecosystem-level management. Cormorants also significant pike/perch predators.',
        },
        'pike-chain-reaction': {
          name: 'The Chain Reaction',
          narrative:
            'This is what a bay looks like when the pike disappear. Without pike, sticklebacks take over. They eat the tiny creatures that keep algae under control. So the algae grows wild, the water turns green, and the plants on the bottom die from lack of light. Scientists call this a \u2018regime shift\u2019 \u2014 the bay flips from healthy to sick, and it\u2019s very hard to flip it back.',
          aiPrompt:
            'Scene: Degraded bay \u2014 murky green, no pike, sticklebacks everywhere, filamentous algae on rocks, bladderwrack gone. Cormorant dives through murk. Contrast with pike-why-it-matters scene. Extra context: Called \u201cthe stickleback wave\u201d \u2014 spreads bay to bay along Swedish coast. Full chain: pike gone \u2192 sticklebacks \u2192 grazers eaten \u2192 algae unchecked \u2192 plants smothered \u2192 murky \u2192 more death. Once flipped, extremely hard to reverse.',
        },
        'pike-bringing-back': {
          name: 'Bringing the Pike Back',
          narrative:
            'The good news? When people help, it works. Along the Swedish coast, over a hundred wetlands have been restored as \u2018pike nurseries\u2019 \u2014 and where they have, pike fry numbers went from 3,000 to over 300,000 in just a few years. You can help too: if you fish, always release pike carefully. Choose food that doesn\u2019t come from overfished seas. And tell people about the pike \u2014 because a fish this important shouldn\u2019t disappear without anyone noticing.',
          aiPrompt:
            'Scene: Restored wetland, fish passage, flooded grassy area. Pike fry among stems. Adult pike in wider bay. Extra context: Kronob\u00e4ck (Kalmar): 3,000 \u2192 300,000+ fry in 5 years. Tibblin et al. (2023): 90% higher pike abundance near restored wetlands. Swedish rules: 3 pike/day, slot 40\u201375 cm. Trawl ban <12 nm from Feb 2025. Kid actions: release pike, pick up litter, tell others, support wetland orgs.',
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
            'Scene: Close-up European perch (Perca fluviatilis), dark stripes, reddish-orange fins. Extra context: Can live 15+ years. Declining alongside pike since 1990s \u2014 same stickleback/seal pressures. Egg ribbons over 1m long. Also prey for seals and cormorants.',
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