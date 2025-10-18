// data.js — Alphaverse 20 categories
const QUESTION_SETS = {
  "Tools & Tinkering": [
    { q:"Proper order for tightening wheel nuts?", options:["Any","Clockwise","Criss-cross (star)"], correct:2 },
    { q:"WD-40 is for…", options:["Rust & loosening","Shaving","Cooking"], correct:0 },
    { q:"Torque wrench purpose:", options:["Break bolts loose","Precise tightness","Decoration"], correct:1 },
    { q:"When drilling metal, first…", options:["Max RPM","Center-punch","Use wood bit"], correct:1 }
  ],
  "Style & Swagger": [
    { q:"Best test of cologne:", options:["Wrist","Walk-through","Ask your ex"], correct:2 },
    { q:"Wardrobe rule:", options:["Trends define you","Fit + feel > trend","Only black"], correct:1 },
    { q:"Leather care starts with:", options:["Conditioning","Gentle cleaning","More cologne"], correct:1 },
    { q:"Good haircut is:", options:["Your whole personality","A frame, not the art","Pointless"], correct:1 }
  ],
  "Fire & Food": [
    { q:"Medium-rare equals:", options:["Balance","Overcomplicate","Undercooked"], correct:0 },
    { q:"Braai tongs also for:", options:["Click like weapon","Point at guests","Sword fight"], correct:0 },
    { q:"Fire won’t start, add:", options:["Patience","Petrol","More swearing"], correct:2 },
    { q:"Resting meat:", options:["Dries it","Redistributes juices","Myth"], correct:1 }
  ],
  "Grit & Growth": [
    { q:"Strength is:", options:["Deadlift PR","Getting up when you don’t want to","Bench numbers"], correct:1 },
    { q:"Best habit change:", options:["All at once","Tiny daily steps","Only when motivated"], correct:1 },
    { q:"Confidence sounds like:", options:["Watch this","I got this","Hold my beer"], correct:1 },
    { q:"When life gets messy:", options:["Build","Burn","Breathe, fix, repeat"], correct:2 }
  ],
  "Legends & Lore": [
    { q:"'Man in the Arena' author:", options:["T. Roosevelt","M. Aurelius","J. Rogan"], correct:0 },
    { q:"MacGyver vs Batman (no prep):", options:["MacGyver","Batman","Bear Grylls steals gear"], correct:0 },
    { q:"Soundtrack for grit:", options:["AC/DC","Hans Zimmer","80s montage"], correct:1 },
    { q:"'Man up' means:", options:["Hide emotion","Do what's needed","Pretend you're fine"], correct:1 }
  ],
  "Medical & Body": [
    { q:"RICE stands for:", options:["Rest, Ice, Compress, Elevate","Run, Ice, Carry, Eat","Rest, Inject, Cool, Ease"], correct:0 },
    { q:"Normal resting heart rate (adult):", options:["30–50 bpm","60–100 bpm","110–140 bpm"], correct:1 },
    { q:"Hydration indicator:", options:["Dark urine","Light urine","No sweat"], correct:1 }
  ],
  "TV & Film": [
    { q:"'I'll be back' is from:", options:["Predator","Terminator","Die Hard"], correct:1 },
    { q:"Director of Inception:", options:["Nolan","Fincher","Villeneuve"], correct:0 }
  ],
  "Sport & Strength": [
    { q:"Soccer: players per side on field:", options:["9","10","11"], correct:2 },
    { q:"Deadlift primarily targets:", options:["Quads","Posterior chain","Biceps"], correct:1 }
  ],
  "History & Warfare": [
    { q:"WWII ended:", options:["1943","1945","1947"], correct:1 },
    { q:"Hannibal crossed which mountains:", options:["Andes","Alps","Atlas"], correct:1 }
  ],
  "Ladies & Love": [
    { q:"Best apology includes:", options:["Excuse","Ownership + impact + ask","Silence"], correct:1 },
    { q:"Good first date rule:", options:["Monologue","Ask, listen, pace","Overshare exes"], correct:1 }
  ],
  "Psychology": [
    { q:"Confirmation bias is:", options:["Seeking disconfirming info","Favoring beliefs-confirming info","Memory loss"], correct:1 },
    { q:"Attachment styles include:", options:["Secure, anxious, avoidant","Fixed, growth","Intro, extro"], correct:0 }
  ],
  "Language & Literature": [
    { q:"'To be, or not to be' author:", options:["Marlowe","Shakespeare","Chaucer"], correct:1 },
    { q:"A sonnet has:", options:["10 lines","12 lines","14 lines"], correct:2 }
  ],
  "Geography": [
    { q:"Capital of South Africa (executive):", options:["Cape Town","Pretoria","Johannesburg"], correct:1 },
    { q:"Largest ocean:", options:["Atlantic","Indian","Pacific"], correct:2 }
  ],
  "Arts & Culture": [
    { q:"Mona Lisa painter:", options:["Michelangelo","da Vinci","Raphael"], correct:1 },
    { q:"Jazz originated mainly in:", options:["USA","France","Brazil"], correct:0 }
  ],
  "Science & Technology": [
    { q:"H2O is:", options:["Hydrogen peroxide","Water","Ozone"], correct:1 },
    { q:"Earth orbits the sun in:", options:["24h","365 days","30 days"], correct:1 }
  ],
  "Religion & Belief": [
    { q:"Sikh place of worship:", options:["Temple","Gurdwara","Mosque"], correct:1 },
    { q:"Five Pillars belong to:", options:["Hinduism","Islam","Judaism"], correct:1 }
  ],
  "Mythology": [
    { q:"Norse thunder god:", options:["Odin","Thor","Loki"], correct:1 },
    { q:"Greek underworld ruler:", options:["Zeus","Hades","Ares"], correct:1 }
  ],
  "Fantasy & Fiction": [
    { q:"Ring-bearer in LOTR:", options:["Frodo","Aragorn","Gandalf"], correct:0 },
    { q:"Valyrian steel is from:", options:["Wheel of Time","Game of Thrones","The Witcher"], correct:1 }
  ],
  "Sex & Relationships": [
    { q:"Consent is:", options:["Assumed if dating","Clear, enthusiastic, ongoing","Only verbal"], correct:1 },
    { q:"Aftercare is:", options:["Unnecessary","Part of responsible intimacy","Only for injuries"], correct:1 }
  ],
  "Mixed (All)": []
};
