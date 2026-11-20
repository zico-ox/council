// SSF Students Council Portal - Official Constants & Event Configurations

export const CPB_BLOCKS = [
  {
    id: "block_qadisiyya",
    name: "Block Qadisiyya",
    shortName: "Qadisiyya",
    subtext: "Mundakkal Road",
    code: "Q",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    ribbonColor: "from-emerald-600 to-green-500"
  },
  {
    id: "block_khalidiyya",
    name: "Block Khalidiyya",
    shortName: "Khalidiyya",
    subtext: "Vavoor Road",
    code: "K",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ribbonColor: "from-teal-600 to-emerald-500"
  },
  {
    id: "block_maqdoomiyya",
    name: "Block Maqdoomiyya",
    shortName: "Maqdoomiyya",
    subtext: "Vilayil Road",
    code: "M",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ribbonColor: "from-cyan-600 to-teal-500"
  }
];

export const EVENTS = {
  vlm: {
    id: "vlm",
    slug: "",
    title: "Students Council 2026",
    fullTitle: "SSF Velimukku Sector Students Council 2026",
    organization: "SSF Velimukku Sector",
    shortOrg: "Velimukku Sector",
    level: "Sector",
    date: "November 20, 2026",
    day: "Friday",
    time: "Full Day",
    venue: "Koofa",
    office: "Students' Center Muttichira",
    email: "ssfvelimukksector@gmail.com",
    theme: "Sweetness of Life",
    centenary: "Samastha 100 Light Years",
    centenaryConference: "Samastha Centenary Conference - January 28, 29, 30, 31, 2027 • Wadi Taybah, Malappuram",
    posterUrl: "/assets/poster.jpg",
    accentColor: "cyan",
    firebaseNode: "council_delegates",
    storageKey: "ssf_velimukku_council_registrations_v2",
    passPrefix: "SSF-VLM-2026",
    deskPasswords: ["ssfvlm"],
    hasUnits: true,
    hasDesignation: true,
    hasBlocks: false,
  },
  cpb: {
    id: "cpb",
    slug: "cpb",
    title: "Students Council 2026",
    fullTitle: "SSF Cheriyaparamb Unit Students Council 2026",
    organization: "SSF Cheriyaparamb Unit",
    shortOrg: "Cheriyaparamb Unit",
    level: "Unit",
    date: "November 20, 2026",
    day: "Friday",
    time: "06:00 PM",
    venue: "@SSF Office Cheriyaparamb",
    office: "Students Centre Cheriyaparamb",
    email: "ssfcheriyaparamb@gmail.com",
    theme: "Sweetness of Life (ജീവിത മാധുര്യം)",
    centenary: "Samastha 100 Light Years",
    centenaryConference: "Samastha Centenary Conference - January 28, 29, 30, 31, 2027 • Wadi Taybah, Malappuram",
    posterUrl: "/assets/poster-cpb.jpg",
    accentColor: "emerald",
    firebaseNode: "council_cpb_delegates",
    storageKey: "ssf_cpb_council_registrations_v1",
    passPrefix: "SSF-CPB-2026",
    deskPasswords: ["ssfcpb", "ssfvlm"],
    hasUnits: false,
    hasDesignation: false,
    hasBlocks: true,
  }
};

// Default export for backward compatibility
export const EVENT_DETAILS = EVENTS.vlm;

// 10 Official Units (for Velimukku Sector)
export const UNITS = [
  { id: 1, name: "Velimukku Koofa", code: "VK" },
  { id: 2, name: "Mh Nagar", code: "MH" },
  { id: 3, name: "Velimukku Alungal", code: "VA" },
  { id: 4, name: "U H Nagar", code: "UH" },
  { id: 5, name: "Kaliyatta Mukku", code: "KM" },
  { id: 6, name: "Velimukku", code: "VM" },
  { id: 7, name: "Palakkal", code: "PK" },
  { id: 8, name: "Thalappara", code: "TP" },
  { id: 9, name: "Muttichira", code: "MC" },
  { id: 10, name: "Velimukk East", code: "VE" }
];

// 6 Official Designations (for Velimukku Sector)
export const DESIGNATIONS = [
  {
    id: "president",
    name: "President",
    roleDescription: "Unit President",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ribbonColor: "from-amber-600 to-yellow-500"
  },
  {
    id: "gen_secretary",
    name: "General Secretary",
    roleDescription: "Unit General Secretary",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ribbonColor: "from-cyan-600 to-blue-500"
  },
  {
    id: "exe_secretary",
    name: "Executive Secretary",
    roleDescription: "Unit Executive Secretary",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    ribbonColor: "from-emerald-600 to-teal-500"
  },
  {
    id: "secretary",
    name: "Secretary",
    roleDescription: "Unit Secretary",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    ribbonColor: "from-blue-600 to-indigo-500"
  },
  {
    id: "secretariat_member",
    name: "Secretariat Member",
    roleDescription: "Unit Secretariat Member",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    ribbonColor: "from-purple-600 to-pink-500"
  },
  {
    id: "sector_secretariat",
    name: "Sector Secretariat / Executive Member",
    roleDescription: "Sector Leadership",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ribbonColor: "from-rose-600 to-red-500"
  }
];

export const INITIAL_REGISTRATIONS = [];
