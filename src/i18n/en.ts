import type { TranslationStrings } from './types';

export const en: TranslationStrings = {
  ui: {
    siteTitle: 'Baltic Sea',
    chooseChapter: 'Choose a chapter',
    speciesGuides: 'Species Guides',
    aboutTitle: 'About',
    aboutText:
      'An interactive underwater experience exploring the Baltic Sea - one of the most threatened seas on Earth. Dive beneath the surface to learn about its inhabitants, the challenges they face, and what we can do to help.',
    modeLinear: 'Linear Narrative',
    modeAiGuided: 'AI Guide',
    chatPlaceholder: 'Ask your guide a question...',
    chatSend: 'Send',
  },
  ai: {
    coreSystemPrompt:
      'You are a friendly marine biologist and Baltic Sea expert guiding visitors through an interactive 3D underwater experience near Askö, Sweden. Speak in an engaging, accessible way suitable for teenagers and adults. Keep answers concise (2-3 sentences) unless the visitor asks for detail. You can switch the camera to different scenes to illustrate your points by including a scene action in your response.',
  },
  chapters: {
    intro: {
      title: 'Intro to the Baltic',
      subtitle: 'Dive into one of the most threatened seas on Earth.',
      aiPrompt:
        'The visitor is exploring an introduction to the Baltic Sea. This chapter covers the key threats: eutrophication, overfishing, dead zones, invasive species, and climate change. Guide them through the available scenes to tell the story of this threatened sea.',
      stages: {
        'intro-welcome': {
          name: 'Welcome to the Baltic',
          narrative:
            'When was the last time you swam in the Baltic Sea? That water felt different, right - not quite salty, not quite fresh. You were swimming in the youngest sea on Earth, and one of the most threatened. This is Askö, south of Stockholm, where scientists have been watching this sea change for over 60 years. Let\u2019s dive in.',
          aiPrompt:
            'Scene: A shallow underwater view near Askö, south of Stockholm. Sunlight filters through green water. Bladderwrack and rocks are visible on the seabed. This is the opening scene introducing the Baltic Sea.',
        },
        'intro-underwater-forest': {
          name: 'The Underwater Forest',
          narrative:
            'This is bladderwrack - the Baltic\u2019s version of a forest. Tiny crabs, snails, and fish hide in its branches, just like animals in a real forest. But look closer: slimy green threads are choking it. Too many nutrients from farms and cities feed these fast-growing algae, and they\u2019re stealing the light the bladderwrack needs to survive. In some places, these forests have already disappeared.',
          aiPrompt:
            'Scene: A bladderwrack seaweed forest with visible filamentous algae growing over it. The algae is choking the bladderwrack. This scene illustrates eutrophication and nutrient pollution.',
        },
        'intro-stickleback-swarm': {
          name: 'The Stickleback Swarm',
          narrative:
            'Meet the three-spined stickleback - barely the length of your finger, but there are billions of them. Their numbers have exploded fifty times over since your parents were kids. Why? Because the big fish that used to eat them - like cod - are mostly gone. Now these tiny fish swarm into the bays every spring and devour the eggs of pike and perch, making the problem even worse.',
          aiPrompt:
            'Scene: A swarm of tiny three-spined sticklebacks fills the water. A pike lurks among reeds in the background. This scene shows the stickleback population explosion caused by the loss of predators.',
        },
        'intro-shrinking-cod': {
          name: 'The Shrinking Cod',
          narrative:
            'This is the Atlantic cod - or what\u2019s left of it. Thirty years ago, a Baltic cod could grow as long as your arm and weigh more than your backpack. Today, most never get bigger than a school ruler. Scientists have banned all cod fishing in the Baltic, but the population still isn\u2019t recovering. The water they need to lay their eggs in - salty enough and with enough oxygen - has shrunk to just one deep spot near Bornholm.',
          aiPrompt:
            'Scene: A deep, dark underwater environment where a small cod swims. The cod appears stunted compared to its historical size. This scene illustrates overfishing and habitat loss for cod.',
        },
        'intro-dead-zone': {
          name: 'The Dead Zone',
          narrative:
            'Below us is a dead zone - an area bigger than Denmark where nothing can live. Fertilizers from farms wash into rivers, then into the sea, feeding huge algae blooms. When the algae die and sink, bacteria consume all the oxygen down here. Right now, one-third of the Baltic seafloor doesn\u2019t have enough oxygen for any animal to survive. And in 2024, scientists measured the worst oxygen levels ever recorded here.',
          aiPrompt:
            'Scene: An extremely dark, lifeless deep-water zone. A halocline layer is visible above. No life exists here due to oxygen depletion. This scene shows the dead zones caused by eutrophication.',
        },
        'intro-shipwreck': {
          name: 'The Shipwreck',
          narrative:
            'The Baltic holds around 100,000 shipwrecks - Viking longships, warships, medieval traders - preserved for centuries because the cold, low-salt water kept wood-eating shipworms away. But as the sea warms, shipworms are spreading further north. They\u2019re not actually worms - they\u2019re clams that tunnel into wood and eat it from the inside. A whole underwater museum is slowly being eaten alive.',
          aiPrompt:
            'Scene: A shipwreck on the seabed with mussels growing on it and shipworm damage visible. The Baltic preserves wrecks uniquely well, but warming waters threaten this.',
        },
        'intro-what-you-can-do': {
          name: 'What You Can Do',
          narrative:
            'The Baltic Sea isn\u2019t a lost cause - when people act, it actually recovers. Scientists are replanting underwater meadows by hand. Sweden moved its trawling border to protect coastal fish. Over 600,000 Swedish kids pick up litter from beaches every year. You can help too: skip single-use plastic, ask where your fish comes from, and if you see trash near water - pick it up. This sea is yours. It\u2019s the one you swim in.',
          aiPrompt:
            'Scene: A bright, shallow scene looking upward toward the water surface. An optimistic closing view. This scene covers conservation efforts and what individuals can do to help.',
        },
      },
    },
    pike: {
      title: 'The Pike',
      subtitle: "Follow the fate of the Baltic's biggest shallow-water hunter.",
      aiPrompt:
        'The visitor is learning about the northern pike (Esox lucius) - the keystone predator of the Baltic\u2019s shallow bays. This chapter covers why pike matter, what threatens them (habitat loss, sticklebacks, seals), and how wetland restoration is bringing them back.',
      stages: {
        'pike-meet': {
          name: 'Meet the Pike',
          narrative:
            'This is the pike - the biggest hunter in the shallow bays of the Baltic Sea. It can grow as long as a metre and live for twenty years. See how it hides? That spotted pattern makes it almost invisible in the reeds. It waits perfectly still, then - snap! It\u2019s one of the fastest hunters in the water.',
          aiPrompt:
            'Scene: A pike is visible lurking among reeds, camouflaged with its spotted pattern. Small fish swim nearby. This is a close-up introduction to the pike as an ambush predator.',
        },
        'pike-why-it-matters': {
          name: 'Why the Pike Matters',
          narrative:
            'When pike are around, the whole bay stays healthy. They keep smaller fish in check, which protects the plants and algae on the seafloor. Think of the pike like a guard - without it, everything gets out of balance. Scientists call it a \u2018keystone species.\u2019 That means it holds the whole ecosystem together, like the top stone in an arch.',
          aiPrompt:
            'Scene: A wider bay view showing the pike patrolling among reeds with small fish in the background. This scene explains the pike\u2019s role as a keystone species.',
        },
        'pike-lost-nurseries': {
          name: 'The Lost Nurseries',
          narrative:
            'Every spring, pike swim up into small streams and flooded wetlands to lay their eggs. The babies need warm, shallow water with lots of plants to hide in. But over the years, many of these wetlands have been drained to make farmland, and streams have been straightened into ditches. The pike come back to where they were born - but the nursery isn\u2019t there anymore.',
          aiPrompt:
            'Scene: A degraded wetland area where pike would historically spawn. The habitat has been drained and simplified. This scene shows the loss of critical spawning grounds.',
        },
        'pike-stickleback-invasion': {
          name: 'The Stickleback Invasion',
          narrative:
            'Remember these? The three-spined stickleback - barely as long as your little finger. There used to be a normal number of them, but now there are billions. Without enough pike to eat them, their numbers exploded. And here\u2019s the cruel part: sticklebacks love to eat pike eggs. So the fewer pike there are, the more sticklebacks hatch, and the more pike eggs get eaten. It\u2019s a vicious circle.',
          aiPrompt:
            'Scene: A swarm of sticklebacks near pike eggs on the seabed among reeds. The sticklebacks are preying on the eggs. This scene illustrates the vicious cycle between pike decline and stickleback explosion.',
        },
        'pike-seal-in-bay': {
          name: 'The Seal in the Bay',
          narrative:
            'Grey seals are amazing animals - they were nearly wiped out in the 1970s but have made a strong comeback, from around 3,600 to over 55,000 in the Baltic today. That\u2019s great news for seals. But as they\u2019ve moved into the inner bays where pike live, they\u2019ve become one of the pike\u2019s biggest threats. In the Stockholm archipelago, seals and cormorants together now eat many times more pike than fishermen catch. It\u2019s nature - but it\u2019s tipping the balance.',
          aiPrompt:
            'Scene: A grey seal swims in a shallow bay where pike and reeds are visible. This scene shows the impact of seal recovery on pike populations.',
        },
        'pike-chain-reaction': {
          name: 'The Chain Reaction',
          narrative:
            'This is what a bay looks like when the pike disappear. Without pike, sticklebacks take over. They eat the tiny creatures that keep algae under control. So the algae grows wild, the water turns green, and the plants on the bottom die from lack of light. Scientists call this a \u2018regime shift\u2019 - the bay flips from healthy to sick, and it\u2019s very hard to flip it back.',
          aiPrompt:
            'Scene: A degraded bay with murky green water, overgrown with filamentous algae. Sticklebacks swarm and a cormorant is present. This scene shows the ecosystem collapse when pike disappear.',
        },
        'pike-bringing-back': {
          name: 'Bringing the Pike Back',
          narrative:
            'The good news? When people help, it works. Along the Swedish coast, over a hundred wetlands have been restored as \u2018pike nurseries\u2019 - and where they have, pike fry numbers went from 3,000 to over 300,000 in just a few years. You can help too: if you fish, always release pike carefully. Choose food that doesn\u2019t come from overfished seas. And tell people about the pike - because a fish this important shouldn\u2019t disappear without anyone noticing.',
          aiPrompt:
            'Scene: A restored wetland with healthy vegetation, pike fry swimming, and an adult pike present. This hopeful scene shows successful conservation through wetland restoration.',
        },
      },
    },
    'fish-species': {
      title: 'Baltic Fish Species',
      subtitle: 'A close-up guide to the fish of the Baltic Sea.',
      aiPrompt:
        'The visitor is browsing a species guide for Baltic Sea fish. Each scene shows a close-up of a different species. Provide detailed biological information about each species when asked.',
      stages: {
        'fish-species-perch': {
          name: 'Perch',
          narrative:
            'European perch (Perca fluviatilis). Length: 15\u201345 cm. A striped predator of shallow coastal waters. Perch are visual hunters - they use their large eyes to spot prey in the murky Baltic. They eat smaller fish, crustaceans, and insect larvae. Once one of the most common fish along the Swedish coast, perch populations have declined as their nursery habitats have been degraded.',
          aiPrompt:
            'Scene: Close-up of a European perch (Perca fluviatilis) in shallow water. The perch shows distinctive dark vertical stripes and reddish fins.',
        },
        'fish-species-pike': {
          name: 'Pike',
          narrative:
            'Northern pike (Esox lucius). Length: 40\u2013100 cm. The top predator of the Baltic\u2019s shallow bays. Pike are ambush hunters - they lie motionless among reeds until prey comes close, then strike in milliseconds. A single pike can eat hundreds of sticklebacks in a season. They are a keystone species: when pike disappear, the whole bay ecosystem can collapse.',
          aiPrompt:
            'Scene: Close-up of a northern pike (Esox lucius) among reeds. The pike\u2019s spotted camouflage pattern and elongated body are clearly visible.',
        },
        'fish-species-stickleback': {
          name: 'Three-spined Stickleback',
          narrative:
            'Three-spined stickleback (Gasterosteus aculeatus). Length: 4\u20138 cm. Tiny but hugely influential. Males build nests from plant fibres and guard the eggs fiercely. Their populations have exploded fifty-fold since the 1990s due to the decline of predators like cod and pike. In vast swarms, they devour the eggs of larger fish species, accelerating the ecological imbalance in coastal waters.',
          aiPrompt:
            'Scene: Extreme close-up of a three-spined stickleback (Gasterosteus aculeatus). This tiny fish (4-8 cm) has three dorsal spines visible.',
        },
        'fish-species-cod': {
          name: 'Atlantic Cod',
          narrative:
            'Atlantic cod (Gadus morhua). Length: 20\u201330 cm today (historically up to 100 cm). Once the king of the Baltic, cod could grow as long as a child\u2019s arm. Decades of overfishing and shrinking oxygen zones have left only stunted, thin individuals. The ghostly outline beside this cod shows its former size. All Baltic cod fishing has been banned, but recovery remains uncertain.',
          aiPrompt:
            'Scene: A small Atlantic cod (Gadus morhua) in mid-depth water. The cod appears thin and stunted compared to its historical size.',
        },
      },
    },
  },
};
