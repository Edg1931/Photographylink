// -----------------------------------------------------------------------------
// Mock data layer for the Photographylink prototype.
//
// Everything the prototype renders comes from here. When we wire up Supabase,
// these types become the table schemas and these functions become queries.
// -----------------------------------------------------------------------------

export type Specialty =
  | "Real Estate"
  | "Architecture"
  | "Drone / Aerial"
  | "3D / Virtual Tours"
  | "Interiors"
  | "Video"
  | "Twilight";

export type EquipmentPolicy = "provided" | "byo" | "either";

export interface Photographer {
  slug: string;
  name: string;
  avatar: string;
  cover: string;
  location: string;
  radiusMiles: number;
  headline: string;
  bio: string;
  specialties: Specialty[];
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  onTimeRate: number; // 0-100
  responseHours: number;
  dayRate: number; // advertised rate the photographer will work for
  halfDayRate: number;
  availableNow: boolean;
  ownsGear: string[];
  networks: string[]; // company slugs this photographer shoots for
  portfolio: { src: string; label: string }[];
}

export interface QueueSlot {
  photographerSlug: string;
  status: "trained" | "onboarding";
}

export interface Company {
  slug: string;
  name: string;
  logoMark: string; // single letter/emoji mark
  cover: string;
  location: string;
  markets: string[];
  tagline: string;
  about: string;
  accent: string; // brand accent color for their templated micro-site
  specialties: Specialty[];
  rating: number;
  reviewCount: number;
  shootsPerMonth: number;
  baseDayRate: number;
  equipmentPolicy: EquipmentPolicy;
  equipmentNotes: string;
  perks: string[];
  bench: QueueSlot[]; // the "stable" of trained photographers
  showcase: { src: string; label: string }[];
}

export type JobStatus = "open" | "claimed" | "scheduled" | "delivered";

export interface Job {
  id: string;
  companySlug: string;
  title: string;
  type: Specialty;
  address: string;
  neighborhood: string;
  shootAt: string; // human readable
  postedAgo: string;
  durationHours: number;
  payout: number;
  deliverables: string;
  equipment: EquipmentPolicy;
  status: JobStatus;
  claimedBySlug?: string;
  // When set, the job is a DIRECT OFFER to one photographer — only they can
  // accept it. They can decline, which releases it back to the whole bench.
  assignedToSlug?: string;
  urgency: "standard" | "rush" | "flexible";
}

// -----------------------------------------------------------------------------
// Photographers
// -----------------------------------------------------------------------------

const U = "https://images.unsplash.com/";
const img = (id: string, w = 900) =>
  `${U}${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photographers: Photographer[] = [
  {
    slug: "maya-okafor",
    name: "Maya Okafor",
    avatar: "https://i.pravatar.cc/240?img=47",
    cover: img("photo-1600585154340-be6161a56a0c", 1600),
    location: "Austin, TX",
    radiusMiles: 40,
    headline: "Real estate & twilight specialist with a same-day turnaround",
    bio: "Ten years shooting listings from studio condos to $4M ranches. I light for mood, deliver flambient edits within 12 hours, and I have never missed a scheduled shoot. Happy to shoot on a company's brand guidelines.",
    specialties: ["Real Estate", "Twilight", "Interiors"],
    rating: 4.97,
    reviewCount: 214,
    jobsCompleted: 1180,
    onTimeRate: 99,
    responseHours: 1,
    dayRate: 425,
    halfDayRate: 250,
    availableNow: true,
    ownsGear: ["Sony A7R V", "16-35 GM", "Godox strobes", "DJI Mavic 3"],
    networks: ["lumen-estates", "summit-media"],
    portfolio: [
      { src: img("photo-1600607687939-ce8a6c25118c"), label: "Hillside living room" },
      { src: img("photo-1600566753086-00f18fb6b3ea"), label: "Kitchen, natural light" },
      { src: img("photo-1600585154526-990dced4db0d"), label: "Twilight exterior" },
      { src: img("photo-1600047509807-ba8f99d2cdde"), label: "Primary suite" },
    ],
  },
  {
    slug: "diego-navarro",
    name: "Diego Navarro",
    avatar: "https://i.pravatar.cc/240?img=12",
    cover: img("photo-1600566753190-17f0baa2a6c3", 1600),
    location: "Austin, TX",
    radiusMiles: 60,
    headline: "FAA-certified drone pilot + architectural interiors",
    bio: "Part 107 certified. I pair ground and aerial coverage so a listing feels like a film. Fast, quiet on-site, and easy to fold into an existing crew workflow.",
    specialties: ["Drone / Aerial", "Architecture", "Real Estate"],
    rating: 4.9,
    reviewCount: 138,
    jobsCompleted: 640,
    onTimeRate: 97,
    responseHours: 2,
    dayRate: 500,
    halfDayRate: 300,
    availableNow: true,
    ownsGear: ["Canon R5", "DJI Air 3", "Tilt-shift 24mm", "Gimbal"],
    networks: ["lumen-estates"],
    portfolio: [
      { src: img("photo-1580587771525-78b9dba3b914"), label: "Aerial estate" },
      { src: img("photo-1512917774080-9991f1c4c750"), label: "Modern facade" },
      { src: img("photo-1600585152220-90363fe7e115"), label: "Open plan" },
      { src: img("photo-1568605114967-8130f3a36994"), label: "Dusk aerial" },
    ],
  },
  {
    slug: "harper-lin",
    name: "Harper Lin",
    avatar: "https://i.pravatar.cc/240?img=32",
    cover: img("photo-1567767292278-a4f21aa2d36e", 1600),
    location: "Round Rock, TX",
    radiusMiles: 30,
    headline: "Interiors & 3D virtual tour operator (Matterport certified)",
    bio: "I make small spaces feel large and large spaces feel warm. Matterport + Zillow 3D certified, so I can bundle stills, floor plans, and a dollhouse tour in one visit.",
    specialties: ["3D / Virtual Tours", "Interiors", "Real Estate"],
    rating: 4.88,
    reviewCount: 96,
    jobsCompleted: 410,
    onTimeRate: 98,
    responseHours: 3,
    dayRate: 380,
    halfDayRate: 220,
    availableNow: false,
    ownsGear: ["Matterport Pro3", "Sony A7 IV", "14mm", "Aputure lights"],
    networks: ["summit-media"],
    portfolio: [
      { src: img("photo-1616486338812-3dadae4b4ace"), label: "Staged loft" },
      { src: img("photo-1616137466211-f939a420be84"), label: "Dining nook" },
      { src: img("photo-1617104678098-de229db51175"), label: "Reading corner" },
      { src: img("photo-1615529182904-14819c35db37"), label: "Sunlit bath" },
    ],
  },
  {
    slug: "sam-whitfield",
    name: "Sam Whitfield",
    avatar: "https://i.pravatar.cc/240?img=68",
    cover: img("photo-1600210492486-724fe5c67fb0", 1600),
    location: "San Marcos, TX",
    radiusMiles: 50,
    headline: "Listing video + reels that actually sell the lifestyle",
    bio: "Cinematic listing films, agent branding reels, and vertical social cutdowns. I shoot, I edit, I deliver graded footage in 48 hours. Great fit for teams that want video without adding a full-time editor.",
    specialties: ["Video", "Real Estate", "Drone / Aerial"],
    rating: 4.94,
    reviewCount: 121,
    jobsCompleted: 520,
    onTimeRate: 96,
    responseHours: 2,
    dayRate: 650,
    halfDayRate: 400,
    availableNow: true,
    ownsGear: ["Sony FX3", "Ronin gimbal", "DJI Mavic 3 Cine", "Wireless audio"],
    networks: ["summit-media", "lumen-estates"],
    portfolio: [
      { src: img("photo-1600596542815-ffad4c1539a9"), label: "Lifestyle frame" },
      { src: img("photo-1600607687920-4e2a09cf159d"), label: "Golden hour pull" },
      { src: img("photo-1600573472550-8090b5e0745e"), label: "Pool reveal" },
      { src: img("photo-1600566752355-35792bedcfea"), label: "Detail macro" },
    ],
  },
  {
    slug: "priya-raman",
    name: "Priya Raman",
    avatar: "https://i.pravatar.cc/240?img=45",
    cover: img("photo-1600585153490-76fb20a32601", 1600),
    location: "Cedar Park, TX",
    radiusMiles: 35,
    headline: "High-volume listing photographer — reliable at scale",
    bio: "Built for volume brokerages. I can shoot four to six standard listings a day at a consistent look, follow a shot list to the letter, and I never leave a gallery incomplete.",
    specialties: ["Real Estate", "Interiors"],
    rating: 4.85,
    reviewCount: 178,
    jobsCompleted: 1420,
    onTimeRate: 98,
    responseHours: 1,
    dayRate: 350,
    halfDayRate: 200,
    availableNow: true,
    ownsGear: ["Nikon Z6 II", "14-30 f/4", "Speedlights", "Tripod rig"],
    networks: ["lumen-estates"],
    portfolio: [
      { src: img("photo-1600047509358-9dc75507daeb"), label: "Bright kitchen" },
      { src: img("photo-1600121848594-d8644e57abab"), label: "Neutral living" },
      { src: img("photo-1600566752229-250ed79470f8"), label: "Entryway" },
      { src: img("photo-1600585154084-4e5fe7c39198"), label: "Backyard" },
    ],
  },
  {
    slug: "theo-brandt",
    name: "Theo Brandt",
    avatar: "https://i.pravatar.cc/240?img=15",
    cover: img("photo-1580587771525-78b9dba3b914", 1600),
    location: "Georgetown, TX",
    radiusMiles: 45,
    headline: "Architecture-first shooter for luxury & new construction",
    bio: "Former architectural photographer for a design magazine. I obsess over verticals, light, and the one frame that makes a builder proud. Best on high-end and new-construction work.",
    specialties: ["Architecture", "Real Estate", "Twilight"],
    rating: 4.99,
    reviewCount: 87,
    jobsCompleted: 360,
    onTimeRate: 100,
    responseHours: 4,
    dayRate: 700,
    halfDayRate: 425,
    availableNow: false,
    ownsGear: ["Sony A7R V", "Tilt-shift 17/24", "Profoto B10", "Ladder kit"],
    networks: ["summit-media"],
    portfolio: [
      { src: img("photo-1600585154340-be6161a56a0c"), label: "Atrium" },
      { src: img("photo-1600585154526-990dced4db0d"), label: "Facade study" },
      { src: img("photo-1600566753086-00f18fb6b3ea"), label: "Material detail" },
      { src: img("photo-1600607687939-ce8a6c25118c"), label: "Great room" },
    ],
  },
];

// -----------------------------------------------------------------------------
// Companies
// -----------------------------------------------------------------------------

export const companies: Company[] = [
  {
    slug: "lumen-estates",
    name: "Lumen Estates Media",
    logoMark: "L",
    cover: img("photo-1600596542815-ffad4c1539a9", 1600),
    location: "Austin, TX",
    markets: ["Austin", "Round Rock", "Cedar Park", "Georgetown"],
    tagline: "Listing media for brokerages that move fast.",
    about:
      "We shoot 300+ listings a month across Central Texas. Our edge is turnaround and consistency — every gallery looks like it came from the same photographer, because our whole bench is trained on one style guide. We're always adding vetted shooters to keep pace with demand.",
    accent: "#e8a94b",
    specialties: ["Real Estate", "Drone / Aerial", "Twilight", "Video"],
    rating: 4.92,
    reviewCount: 340,
    shootsPerMonth: 320,
    baseDayRate: 425,
    equipmentPolicy: "either",
    equipmentNotes:
      "We provide strobes, tripods, and a loaner A7 IV kit if you need it. Prefer you bring your own body + wide lens; we'll cover drone rental for aerial jobs.",
    perks: [
      "Guaranteed 3+ shoots/week for trained shooters",
      "Paid weekly, every Friday",
      "We handle all client comms & scheduling",
      "Editing done in-house — you just shoot",
    ],
    bench: [
      { photographerSlug: "maya-okafor", status: "trained" },
      { photographerSlug: "diego-navarro", status: "trained" },
      { photographerSlug: "priya-raman", status: "trained" },
      { photographerSlug: "sam-whitfield", status: "onboarding" },
    ],
    showcase: [
      { src: img("photo-1600585154340-be6161a56a0c"), label: "Signature twilight" },
      { src: img("photo-1600566753086-00f18fb6b3ea"), label: "Kitchen standard" },
      { src: img("photo-1580587771525-78b9dba3b914"), label: "Aerial coverage" },
      { src: img("photo-1600607687939-ce8a6c25118c"), label: "Living, styled" },
      { src: img("photo-1600047509807-ba8f99d2cdde"), label: "Suite detail" },
      { src: img("photo-1600585152220-90363fe7e115"), label: "Open plan" },
    ],
  },
  {
    slug: "summit-media",
    name: "Summit Property Media",
    logoMark: "S",
    cover: img("photo-1600573472550-8090b5e0745e", 1600),
    location: "Austin, TX",
    markets: ["Austin", "San Marcos", "Dripping Springs"],
    tagline: "Cinematic listing media for luxury & new construction.",
    about:
      "Boutique studio focused on the top of the market. We pair architectural stills with listing films and 3D tours. We keep a small, elite bench and pay accordingly — quality over volume.",
    accent: "#7c9cf5",
    specialties: ["Architecture", "Video", "3D / Virtual Tours", "Twilight"],
    rating: 4.96,
    reviewCount: 152,
    shootsPerMonth: 90,
    baseDayRate: 600,
    equipmentPolicy: "byo",
    equipmentNotes:
      "Bring your own kit — we're looking for shooters who already own pro bodies, tilt-shift glass, and (for video) a gimbal + drone. We provide lighting on set for twilight work.",
    perks: [
      "Premium day rates ($600+)",
      "Luxury & new-construction portfolio",
      "Creative freedom within brand guides",
      "Direct line to the studio lead",
    ],
    bench: [
      { photographerSlug: "theo-brandt", status: "trained" },
      { photographerSlug: "harper-lin", status: "trained" },
      { photographerSlug: "sam-whitfield", status: "trained" },
    ],
    showcase: [
      { src: img("photo-1600573472550-8090b5e0745e"), label: "Pool reveal" },
      { src: img("photo-1512917774080-9991f1c4c750"), label: "Modern facade" },
      { src: img("photo-1616486338812-3dadae4b4ace"), label: "Staged loft" },
      { src: img("photo-1600596542815-ffad4c1539a9"), label: "Lifestyle" },
      { src: img("photo-1568605114967-8130f3a36994"), label: "Dusk aerial" },
      { src: img("photo-1615529182904-14819c35db37"), label: "Sunlit bath" },
    ],
  },
];

// -----------------------------------------------------------------------------
// Jobs — the live queue
// -----------------------------------------------------------------------------

export const jobs: Job[] = [
  {
    id: "job-3391",
    companySlug: "lumen-estates",
    title: "3-bed ranch, full listing package",
    type: "Real Estate",
    address: "1420 Wildflower Pass",
    neighborhood: "Dripping Springs",
    shootAt: "Tomorrow · 10:00 AM",
    postedAgo: "8 min ago",
    durationHours: 2,
    payout: 220,
    deliverables: "35 HDR stills + 6 twilight composites",
    equipment: "byo",
    status: "open",
    urgency: "standard",
  },
  {
    id: "job-3389",
    companySlug: "summit-media",
    title: "Client requested Theo — luxury new build",
    type: "Architecture",
    address: "18 Enclave Ct",
    neighborhood: "Westlake",
    shootAt: "Sat · 9:00 AM",
    postedAgo: "35 min ago",
    durationHours: 3,
    payout: 700,
    deliverables: "40 architectural stills + 4 twilight",
    equipment: "byo",
    status: "open",
    assignedToSlug: "theo-brandt",
    urgency: "standard",
  },
  {
    id: "job-3390",
    companySlug: "lumen-estates",
    title: "Downtown condo + drone exterior",
    type: "Drone / Aerial",
    address: "88 Rainey St, Unit 2104",
    neighborhood: "Rainey District",
    shootAt: "Today · 4:30 PM",
    postedAgo: "22 min ago",
    durationHours: 1.5,
    payout: 275,
    deliverables: "25 stills + 8 aerial frames",
    equipment: "byo",
    status: "open",
    urgency: "rush",
  },
  {
    id: "job-3388",
    companySlug: "summit-media",
    title: "New-construction hero + listing film",
    type: "Video",
    address: "701 Vista Ridge",
    neighborhood: "West Lake Hills",
    shootAt: "Fri · 8:00 AM",
    postedAgo: "1 hr ago",
    durationHours: 4,
    payout: 640,
    deliverables: "90s listing film + 40 architectural stills",
    equipment: "byo",
    status: "open",
    urgency: "flexible",
  },
  {
    id: "job-3385",
    companySlug: "lumen-estates",
    title: "Standard 4-bed, quick turnaround",
    type: "Real Estate",
    address: "312 Meadowlark Ln",
    neighborhood: "Cedar Park",
    shootAt: "Today · 1:00 PM",
    postedAgo: "2 hrs ago",
    durationHours: 1.5,
    payout: 185,
    deliverables: "30 HDR stills",
    equipment: "either",
    status: "claimed",
    claimedBySlug: "priya-raman",
    urgency: "standard",
  },
  {
    id: "job-3382",
    companySlug: "summit-media",
    title: "Luxury interiors + Matterport tour",
    type: "3D / Virtual Tours",
    address: "24 Barton Creek Blvd",
    neighborhood: "Barton Creek",
    shootAt: "Thu · 11:00 AM",
    postedAgo: "3 hrs ago",
    durationHours: 3,
    payout: 480,
    deliverables: "45 stills + full 3D tour + floor plan",
    equipment: "byo",
    status: "scheduled",
    claimedBySlug: "harper-lin",
    urgency: "standard",
  },
  {
    id: "job-3379",
    companySlug: "lumen-estates",
    title: "Twilight exterior add-on",
    type: "Twilight",
    address: "9 Lakeshore Dr",
    neighborhood: "Lakeway",
    shootAt: "Yesterday · 8:15 PM",
    postedAgo: "1 day ago",
    durationHours: 1,
    payout: 150,
    deliverables: "6 twilight composites",
    equipment: "either",
    status: "delivered",
    claimedBySlug: "maya-okafor",
    urgency: "standard",
  },
];

// -----------------------------------------------------------------------------
// Lookups
// -----------------------------------------------------------------------------

export const getPhotographer = (slug: string) =>
  photographers.find((p) => p.slug === slug);

export const getCompany = (slug: string) =>
  companies.find((c) => c.slug === slug);

export const jobsForCompany = (slug: string) =>
  jobs.filter((j) => j.companySlug === slug);

export const openJobs = () => jobs.filter((j) => j.status === "open");

export const allSpecialties: Specialty[] = [
  "Real Estate",
  "Architecture",
  "Drone / Aerial",
  "3D / Virtual Tours",
  "Interiors",
  "Video",
  "Twilight",
];
