import { db, memoriesTable } from "@workspace/db";

async function main() {
  const existing = await db.select().from(memoriesTable).limit(1);
  if (existing.length > 0) {
    console.log("Memories already seeded, skipping.");
    process.exit(0);
  }

  const today = new Date();
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return isoDate(d);
  };
  const yearsAgoToday = (n: number) => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - n);
    return isoDate(d);
  };

  const seed = [
    {
      title: "The morning we decided",
      body:
        "Coffee on the back porch. The light was that soft blue color it gets just before the sun is really awake. We were talking about nothing — and then suddenly, about everything. By the time the cups were empty we knew this was the year. I'll never forget the way you looked at me over the rim of your mug.",
      memoryDate: yearsAgoToday(1),
      location: "Our kitchen",
      mood: "peaceful",
      author: "self" as const,
      tags: ["morning", "us", "decisions"],
      photos: [],
      favorite: true,
    },
    {
      title: "Sunday market in the rain",
      body:
        "The sky opened up the second we got out of the car. We ducked under the flower stall's awning and ended up buying way too many ranunculus from a woman who insisted we were 'clearly newlyweds.' We didn't correct her. Walked home with soaked shoes and laughing the whole way.",
      memoryDate: daysAgo(12),
      location: "Saturday Market, downtown",
      mood: "joyful",
      author: "both" as const,
      tags: ["weekend", "rain", "flowers"],
      photos: [],
      favorite: false,
    },
    {
      title: "Pasta night, attempt #3",
      body:
        "We finally cracked the dough. The trick was less water than every recipe said. You rolled, I cut, we both got flour everywhere. Ate it standing at the counter because we couldn't wait to sit down.",
      memoryDate: daysAgo(34),
      location: "Home",
      mood: "silly",
      author: "partner" as const,
      tags: ["cooking", "kitchen-wins"],
      photos: [],
      favorite: false,
    },
    {
      title: "First night in the new place",
      body:
        "Boxes everywhere. We ordered takeout and ate on the floor with the candles you brought from the old apartment. You said 'this already feels like us' and I knew exactly what you meant.",
      memoryDate: daysAgo(78),
      location: "The new apartment",
      mood: "nostalgic",
      author: "both" as const,
      tags: ["home", "milestones", "new-beginnings"],
      photos: [],
      favorite: true,
    },
    {
      title: "The hike that almost wasn't",
      body:
        "We almost turned back at the second switchback. So glad we didn't. The clearing at the top was the prettiest place I've ever stood with you. We didn't talk for a long time, just sat and watched the wind move through the pines.",
      memoryDate: daysAgo(140),
      location: "Granite Ridge",
      mood: "adventurous",
      author: "self" as const,
      tags: ["hiking", "outdoors", "quiet"],
      photos: [],
      favorite: true,
    },
    {
      title: "Tiny tradition",
      body:
        "Started writing each other a one-sentence note before bed. Tonight's was 'Thank you for laughing at my joke even though it wasn't funny.' Yours was sweeter than mine, as usual.",
      memoryDate: daysAgo(3),
      location: "Bedroom",
      mood: "grateful",
      author: "partner" as const,
      tags: ["traditions", "small-things"],
      photos: [],
      favorite: false,
    },
    {
      title: "Beach trip — day two",
      body:
        "You found a sand dollar that was completely intact and acted like you'd discovered gold. To be fair, you kind of had. We're keeping it on the windowsill.",
      memoryDate: daysAgo(220),
      location: "Cannon Beach",
      mood: "joyful",
      author: "both" as const,
      tags: ["travel", "beach", "souvenirs"],
      photos: [],
      favorite: false,
    },
    {
      title: "A quiet evening after a hard week",
      body:
        "No words for a long time. Just tea, the window cracked open, and your hand on mine. Sometimes that's the entire memory.",
      memoryDate: daysAgo(56),
      location: "Living room",
      mood: "bittersweet",
      author: "self" as const,
      tags: ["quiet", "rest", "us"],
      photos: [],
      favorite: false,
    },
    {
      title: "Anniversary dinner",
      body:
        "We dressed up for no one but each other. You wore the navy dress. I wore the tie you picked out two anniversaries ago. The waiter brought us a candle 'on the house.' We stayed until they were stacking chairs.",
      memoryDate: yearsAgoToday(2),
      location: "Bistro on 4th",
      mood: "romantic",
      author: "both" as const,
      tags: ["anniversary", "us", "milestones"],
      photos: [],
      favorite: true,
    },
    {
      title: "The dog we almost adopted",
      body:
        "Big brown eyes, a name tag that just said 'Pancake.' We talked about him the entire drive home. We're not quite ready, but we're closer than we were yesterday.",
      memoryDate: daysAgo(19),
      location: "Adoption fair",
      mood: "bittersweet",
      author: "partner" as const,
      tags: ["dreams", "future", "animals"],
      photos: [],
      favorite: false,
    },
  ];

  await db.insert(memoriesTable).values(seed);
  console.log(`Seeded ${seed.length} memories.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
