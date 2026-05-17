// 48支参赛球队配色方案（用于球迷身份卡背景渐变）
// 球队 id 与 data/teams/ 目录下文件名一一对应

export interface TeamColors {
  primary: string
  secondary: string
  text: string
  accent: string
}

export const DEFAULT_TEAM_COLORS: TeamColors = {
  primary: '#000F49',
  secondary: '#FFD700',
  text: '#FFFFFF',
  accent: '#FFD700',
}

export const TEAM_COLORS: Record<string, TeamColors> = {
  // ── 南美 ──
  'argentina': { primary: '#75AADB', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#F6B40E' },
  'brazil': { primary: '#009C3B', secondary: '#FFDF00', text: '#FFFFFF', accent: '#002776' },
  'uruguay': { primary: '#5CBFEB', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#F7D117' },
  'colombia': { primary: '#FCD116', secondary: '#003893', text: '#FFFFFF', accent: '#CE1126' },
  'ecuador': { primary: '#FFD100', secondary: '#034EA2', text: '#FFFFFF', accent: '#E8112D' },
  'paraguay': { primary: '#D52B1E', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#0038A8' },

  // ── 欧洲 ──
  'france': { primary: '#002395', secondary: '#ED2939', text: '#FFFFFF', accent: '#FFFFFF' },
  'germany': { primary: '#000000', secondary: '#DD0000', text: '#FFFFFF', accent: '#FFCE00' },
  'spain': { primary: '#AA151B', secondary: '#F1BF00', text: '#FFFFFF', accent: '#FFFFFF' },
  'england': { primary: '#FFFFFF', secondary: '#CF081F', text: '#1A237E', accent: '#002395' },
  'portugal': { primary: '#006600', secondary: '#FF0000', text: '#FFFFFF', accent: '#FFFF00' },
  'netherlands': { primary: '#FF6600', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#21468B' },
  'belgium': { primary: '#ED2939', secondary: '#FAE042', text: '#FFFFFF', accent: '#000000' },
  'croatia': { primary: '#FF0000', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#171796' },
  'switzerland': { primary: '#FF0000', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#FF0000' },
  'austria': { primary: '#ED2939', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#ED2939' },
  'scotland': { primary: '#003399', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#CF142B' },
  'turkey': { primary: '#E30A17', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#E30A17' },
  'czechia': { primary: '#11457E', secondary: '#D7141A', text: '#FFFFFF', accent: '#FFFFFF' },
  'norway': { primary: '#EF2B2D', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#002868' },
  'sweden': { primary: '#006AA7', secondary: '#FECC02', text: '#FFFFFF', accent: '#FECC02' },

  // ── 非洲 ──
  'morocco': { primary: '#006233', secondary: '#C1272D', text: '#FFFFFF', accent: '#FFD700' },
  'senegal': { primary: '#00853F', secondary: '#FDEF42', text: '#FFFFFF', accent: '#E31B23' },
  'nigeria': { primary: '#008751', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#008751' },
  'egypt': { primary: '#CE1126', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#000000' },
  'south-africa': { primary: '#007749', secondary: '#FFB81C', text: '#FFFFFF', accent: '#002395' },
  'ivory-coast': { primary: '#FF8200', secondary: '#009A44', text: '#FFFFFF', accent: '#FFFFFF' },
  'algeria': { primary: '#006233', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#D21034' },
  'ghana': { primary: '#006B3F', secondary: '#FCD116', text: '#FFFFFF', accent: '#CE1126' },
  'tunisia': { primary: '#E70013', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#E70013' },
  'congo-dr': { primary: '#007FFF', secondary: '#CE1126', text: '#FFFFFF', accent: '#F7D618' },
  'cape-verde-islands': { primary: '#003893', secondary: '#CF2027', text: '#FFFFFF', accent: '#F7D116' },

  // ── 亚洲 ──
  'japan': { primary: '#BC002D', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#000080' },
  'south-korea': { primary: '#CD2E3A', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#0047A0' },
  'australia': { primary: '#FFCD00', secondary: '#00843D', text: '#1A237E', accent: '#002B7F' },
  'saudi-arabia': { primary: '#006C35', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#006C35' },
  'iran': { primary: '#239F40', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#DA0000' },
  'qatar': { primary: '#8D1B3D', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#8D1B3D' },
  'iraq': { primary: '#007A3D', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#CE1126' },
  'uzbekistan': { primary: '#1EB53A', secondary: '#0099B5', text: '#FFFFFF', accent: '#CE1126' },
  'jordan': { primary: '#007A3D', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#CE1126' },

  // ── 中北美 ──
  'mexico': { primary: '#006847', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#CE1126' },
  'united-states': { primary: '#002868', secondary: '#BF0A30', text: '#FFFFFF', accent: '#FFFFFF' },
  'canada': { primary: '#FF0000', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#FF0000' },
  'panama': { primary: '#005293', secondary: '#D21034', text: '#FFFFFF', accent: '#FFFFFF' },
  'haiti': { primary: '#00209F', secondary: '#D21034', text: '#FFFFFF', accent: '#FFFFFF' },
  'jamaica': { primary: '#009B3A', secondary: '#000000', text: '#FFFFFF', accent: '#FED100' },
  'cura-ao': { primary: '#002B7F', secondary: '#F9E814', text: '#FFFFFF', accent: '#F9E814' },

  // ── 其他 ──
  'bosnia-herzegovina': { primary: '#002395', secondary: '#FECB00', text: '#FFFFFF', accent: '#FECB00' },
  'new-zealand': { primary: '#000000', secondary: '#FFFFFF', text: '#FFFFFF', accent: '#C8102E' },
}
