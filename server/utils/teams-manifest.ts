// 璇ユ枃浠惰仛鍚堟墍鏈夌悆闃熻鎯?JSON锛屼娇鐢ㄩ潤鎬?import 璁╂墦鍖呭伐鍏凤紙Vite/Nitro锛?
// 鍦ㄧ紪璇戞湡鍐呰仈锛岄伩寮€ import.meta.glob 鍦?Nitro 杩愯鏃朵笉鍙敤锛屼互鍙?
// 鍔ㄦ€?import 妯℃澘璺緞鍦?.nuxt/dev/index.mjs 涓嬭В鏋愰敊璇殑闂銆?
//
// 鏂板/鍒犻櫎鐞冮槦 JSON 鏃讹紝璇峰悓姝ョ淮鎶や笅闈㈢殑 import 涓?teamsManifest銆?
import type { TeamDetail } from '~/types'

import algeria from '../../data/teams/algeria.json'
import argentina from '../../data/teams/argentina.json'
import australia from '../../data/teams/australia.json'
import austria from '../../data/teams/austria.json'
import belgium from '../../data/teams/belgium.json'
import bosniaHerzegovina from '../../data/teams/bosnia-herzegovina.json'
import brazil from '../../data/teams/brazil.json'
import canada from '../../data/teams/canada.json'
import capeVerdeIslands from '../../data/teams/cape-verde-islands.json'
import colombia from '../../data/teams/colombia.json'
import congoDr from '../../data/teams/congo-dr.json'
import croatia from '../../data/teams/croatia.json'
import curacao from '../../data/teams/cura-ao.json'
import czechia from '../../data/teams/czechia.json'
import ecuador from '../../data/teams/ecuador.json'
import egypt from '../../data/teams/egypt.json'
import england from '../../data/teams/england.json'
import france from '../../data/teams/france.json'
import germany from '../../data/teams/germany.json'
import ghana from '../../data/teams/ghana.json'
import haiti from '../../data/teams/haiti.json'
import iran from '../../data/teams/iran.json'
import iraq from '../../data/teams/iraq.json'
import ivoryCoast from '../../data/teams/ivory-coast.json'
import japan from '../../data/teams/japan.json'
import jordan from '../../data/teams/jordan.json'
import mexico from '../../data/teams/mexico.json'
import morocco from '../../data/teams/morocco.json'
import netherlands from '../../data/teams/netherlands.json'
import newZealand from '../../data/teams/new-zealand.json'
import norway from '../../data/teams/norway.json'
import panama from '../../data/teams/panama.json'
import paraguay from '../../data/teams/paraguay.json'
import portugal from '../../data/teams/portugal.json'
import qatar from '../../data/teams/qatar.json'
import saudiArabia from '../../data/teams/saudi-arabia.json'
import scotland from '../../data/teams/scotland.json'
import senegal from '../../data/teams/senegal.json'
import southAfrica from '../../data/teams/south-africa.json'
import southKorea from '../../data/teams/south-korea.json'
import spain from '../../data/teams/spain.json'
import sweden from '../../data/teams/sweden.json'
import switzerland from '../../data/teams/switzerland.json'
import tunisia from '../../data/teams/tunisia.json'
import turkey from '../../data/teams/turkey.json'
import unitedStates from '../../data/teams/united-states.json'
import uruguay from '../../data/teams/uruguay.json'
import uzbekistan from '../../data/teams/uzbekistan.json'

export const teamsManifest: Record<string, TeamDetail> = {
  'algeria': algeria as unknown as TeamDetail,
  'argentina': argentina as unknown as TeamDetail,
  'australia': australia as unknown as TeamDetail,
  'austria': austria as unknown as TeamDetail,
  'belgium': belgium as unknown as TeamDetail,
  'bosnia-herzegovina': bosniaHerzegovina as unknown as TeamDetail,
  'brazil': brazil as unknown as TeamDetail,
  'canada': canada as unknown as TeamDetail,
  'cape-verde-islands': capeVerdeIslands as unknown as TeamDetail,
  'colombia': colombia as unknown as TeamDetail,
  'congo-dr': congoDr as unknown as TeamDetail,
  'croatia': croatia as unknown as TeamDetail,
  'cura-ao': curacao as unknown as TeamDetail,
  'czechia': czechia as unknown as TeamDetail,
  'ecuador': ecuador as unknown as TeamDetail,
  'egypt': egypt as unknown as TeamDetail,
  'england': england as unknown as TeamDetail,
  'france': france as unknown as TeamDetail,
  'germany': germany as unknown as TeamDetail,
  'ghana': ghana as unknown as TeamDetail,
  'haiti': haiti as unknown as TeamDetail,
  'iran': iran as unknown as TeamDetail,
  'iraq': iraq as unknown as TeamDetail,
  'ivory-coast': ivoryCoast as unknown as TeamDetail,
  'japan': japan as unknown as TeamDetail,
  'jordan': jordan as unknown as TeamDetail,
  'mexico': mexico as unknown as TeamDetail,
  'morocco': morocco as unknown as TeamDetail,
  'netherlands': netherlands as unknown as TeamDetail,
  'new-zealand': newZealand as unknown as TeamDetail,
  'norway': norway as unknown as TeamDetail,
  'panama': panama as unknown as TeamDetail,
  'paraguay': paraguay as unknown as TeamDetail,
  'portugal': portugal as unknown as TeamDetail,
  'qatar': qatar as unknown as TeamDetail,
  'saudi-arabia': saudiArabia as unknown as TeamDetail,
  'scotland': scotland as unknown as TeamDetail,
  'senegal': senegal as unknown as TeamDetail,
  'south-africa': southAfrica as unknown as TeamDetail,
  'south-korea': southKorea as unknown as TeamDetail,
  'spain': spain as unknown as TeamDetail,
  'sweden': sweden as unknown as TeamDetail,
  'switzerland': switzerland as unknown as TeamDetail,
  'tunisia': tunisia as unknown as TeamDetail,
  'turkey': turkey as unknown as TeamDetail,
  'united-states': unitedStates as unknown as TeamDetail,
  'uruguay': uruguay as unknown as TeamDetail,
  'uzbekistan': uzbekistan as unknown as TeamDetail,
}

export function getTeamDetail(id: string): TeamDetail | undefined {
  return teamsManifest[id]
}
