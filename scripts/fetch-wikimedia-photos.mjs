/**
 * Fetch player photos from DBpedia (Wikipedia data mirror)
 * Only processes players where photo === null or photo is undefined
 * 
 * Uses DBpedia's structured data endpoint which mirrors Wikipedia's
 * article data including thumbnail images from Wikimedia Commons.
 */

import fs from 'fs';
import path from 'path';
import { updateDataMeta } from './lib/update-data-meta.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const teamsDir = path.join(__dirname, '..', 'data', 'teams');

// Rate limiting: 1s between requests (DBpedia is generous but let's be safe)
const DELAY_MS = 1000;
const TIMEOUT_MS = 12000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Remove diacritics/accents from a string
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert player name to Wikipedia-style page title
 */
function nameToPageTitle(name) {
  return name.replace(/\s+/g, '_');
}

/**
 * Query DBpedia for a player's thumbnail image
 * @param {string} pageTitle - Wikipedia-style page title (underscores)
 * @returns {string|null} Image URL or null
 */
async function queryDBpediaImage(pageTitle) {
  const url = `https://dbpedia.org/data/${encodeURIComponent(pageTitle)}.json`;
  
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) return null;
    
    const data = await response.json();
    const resourceKey = `http://dbpedia.org/resource/${pageTitle}`;
    const resource = data[resourceKey];
    
    if (!resource) return null;
    
    // Check if this is actually a person (has birth date or is a footballer)
    const birthDate = resource['http://dbpedia.org/ontology/birthDate'];
    const occupation = resource['http://dbpedia.org/ontology/occupation'];
    const position = resource['http://dbpedia.org/ontology/position'];
    const isPerson = birthDate || occupation || position;
    
    if (!isPerson) return null;
    
    // Get thumbnail
    const thumbnail = resource['http://dbpedia.org/ontology/thumbnail'];
    if (thumbnail && thumbnail.length > 0) {
      let thumbUrl = thumbnail[0].value;
      // Convert to HTTPS and increase width to 500
      thumbUrl = thumbUrl.replace('http://', 'https://');
      thumbUrl = thumbUrl.replace(/\?width=\d+/, '?width=500');
      if (!thumbUrl.includes('?width=')) {
        thumbUrl += '?width=500';
      }
      return thumbUrl;
    }
    
    // Fallback: check foaf:depiction (full-size images)
    const depiction = resource['http://xmlns.com/foaf/0.1/depiction'];
    if (depiction && depiction.length > 0) {
      // Find the first image that looks like a portrait/photo (not SVG, not a logo)
      for (const img of depiction) {
        const imgUrl = img.value;
        if (imgUrl.match(/\.(jpg|jpeg|png)$/i) && !imgUrl.includes('Flag_of_') && !imgUrl.includes('.svg')) {
          return imgUrl.replace('http://', 'https://');
        }
      }
    }
    
    return null;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      console.error(`  Timeout querying "${pageTitle}"`);
    } else {
      console.error(`  Error querying "${pageTitle}": ${err.message}`);
    }
    return null;
  }
}

/**
 * Search for a player's photo using multiple strategies
 */
async function searchPlayerImage(playerName) {
  const pageTitle = nameToPageTitle(playerName);
  
  // Strategy 1: Direct name match
  let imageUrl = await queryDBpediaImage(pageTitle);
  if (imageUrl) return imageUrl;
  
  await sleep(DELAY_MS);
  
  // Strategy 2: Name + (footballer) disambiguation
  imageUrl = await queryDBpediaImage(`${pageTitle}_(footballer)`);
  if (imageUrl) return imageUrl;
  
  await sleep(DELAY_MS);
  
  // Strategy 3: Try without diacritics
  const cleanName = removeDiacritics(playerName);
  const cleanTitle = nameToPageTitle(cleanName);
  if (cleanTitle !== pageTitle) {
    imageUrl = await queryDBpediaImage(cleanTitle);
    if (imageUrl) return imageUrl;
    
    await sleep(DELAY_MS);
    
    imageUrl = await queryDBpediaImage(`${cleanTitle}_(footballer)`);
    if (imageUrl) return imageUrl;
    
    await sleep(DELAY_MS);
  }
  
  // Strategy 4: Try with (soccer) disambiguation (used for some players)
  imageUrl = await queryDBpediaImage(`${pageTitle}_(soccer)`);
  if (imageUrl) return imageUrl;
  
  await sleep(DELAY_MS);

  // Strategy 5: Try with (football) disambiguation  
  imageUrl = await queryDBpediaImage(`${pageTitle}_(football)`);
  if (imageUrl) return imageUrl;
  
  return null;
}

async function main() {
  console.log('=== DBpedia/Wikimedia Photo Fetcher for Missing Player Photos ===\n');
  
  // Read all team JSON files
  const teamFiles = fs.readdirSync(teamsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${teamFiles.length} team files\n`);
  
  // Collect all players missing photos
  const missingPlayers = [];
  
  for (const file of teamFiles) {
    const filePath = path.join(teamsDir, file);
    const teamData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!teamData.squad) continue;
    
    for (let i = 0; i < teamData.squad.length; i++) {
      const player = teamData.squad[i];
      if (!player.photo) {
        missingPlayers.push({
          name: player.name,
          teamFile: file,
          teamName: teamData.nameEn,
          index: i
        });
      }
    }
  }
  
  console.log(`Total players missing photos: ${missingPlayers.length}\n`);
  
  let found = 0;
  let notFound = 0;
  const results = [];
  const notFoundList = [];
  
  for (let i = 0; i < missingPlayers.length; i++) {
    const player = missingPlayers[i];
    console.log(`[${i + 1}/${missingPlayers.length}] Searching: ${player.name} (${player.teamName})...`);
    
    const imageUrl = await searchPlayerImage(player.name);
    
    if (imageUrl) {
      found++;
      console.log(`  ✓ Found: ${imageUrl.substring(0, 100)}...`);
      results.push({ ...player, imageUrl });
      
      // Update the team JSON immediately
      const filePath = path.join(teamsDir, player.teamFile);
      const teamData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      teamData.squad[player.index].photo = imageUrl;
      teamData.squad[player.index].photoThumb = imageUrl;
      // photoCutout stays null - wiki images are not transparent cutouts
      fs.writeFileSync(filePath, JSON.stringify(teamData, null, 2), 'utf-8');
    } else {
      notFound++;
      notFoundList.push(`${player.name} (${player.teamName})`);
      console.log(`  ✗ Not found`);
    }
    
    // Rate limiting between players
    if (i < missingPlayers.length - 1) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log('\n=== RESULTS ===');
  console.log(`Total missing: ${missingPlayers.length}`);
  console.log(`Found:         ${found}`);
  console.log(`Not found:     ${notFound}`);
  console.log(`Success rate:  ${((found / missingPlayers.length) * 100).toFixed(1)}%`);
  
  if (results.length > 0) {
    console.log('\n--- Players with photos found ---');
    for (const r of results) {
      console.log(`  ✓ ${r.name} (${r.teamName})`);
    }
  }
  
  if (notFoundList.length > 0) {
    console.log(`\n--- Players NOT found (${notFoundList.length}) ---`);
    for (const p of notFoundList) {
      console.log(`  ✗ ${p}`);
    }
  }

  if (found > 0) {
    updateDataMeta(['squadsLastUpdated'], 'fetch-wikimedia-photos');
  }
}

main().catch(console.error);
