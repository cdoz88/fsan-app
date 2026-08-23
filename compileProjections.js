const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const cleanNum = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/,/g, '').trim()) || 0;
};

// 🚀 NEW: The Name Normalizer (Strips suffixes, punctuation, and hyphens for perfect matching)
const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '') // Remove suffixes
    .replace(/['.\-]/g, '') // Remove punctuation and hyphens
    .replace(/\s+/g, ' ') // Remove double spaces
    .trim();
};

const cleanNameAndTeam = (rawString, isDST = false) => {
  if (!rawString) return { name: '', team: 'fa' };
  let sanitized = rawString.replace(/\u00a0/g, ' ').trim();
  
  if (isDST) {
    const nameMap = {
      'houston texans': 'hou', 'denver broncos': 'den', 'minnesota vikings': 'min',
      'pittsburgh steelers': 'pit', 'seattle seahawks': 'sea', 'detroit lions': 'det',
      'atlanta falcons': 'atl', 'los angeles chargers': 'lac', 'baltimore ravens': 'bal',
      'buffalo bills': 'buf', 'philadelphia eagles': 'phi', 'new orleans saints': 'no',
      'tennessee titans': 'ten', 'cincinnati bengals': 'cin', 'new england patriots': 'ne',
      'cleveland browns': 'cle', 'dallas cowboys': 'dal', 'green bay packers': 'gb',
      'jacksonville jaguars': 'jac', 'kansas city chiefs': 'kc', 'las vegas raiders': 'lv',
      'los angeles rams': 'lar', 'miami dolphins': 'mia', 'new york giants': 'nyg',
      'new york jets': 'nyj', 'san francisco 49ers': 'sf', 'tampa bay buccaneers': 'tb',
      'washington commanders': 'was', 'chicago bears': 'chi', 'carolina panthers': 'car',
      'arizona cardinals': 'ari', 'indianapolis colts': 'ind'
    };
    const lookup = sanitized.toLowerCase();
    return { name: sanitized, team: nameMap[lookup] || 'fa' };
  }

  const parts = sanitized.split(' ');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart === lastPart.toUpperCase() && lastPart.length >= 2 && lastPart.length <= 3) {
      const team = parts.pop().toLowerCase();
      return { name: parts.join(' '), team };
    }
  }
  return { name: sanitized, team: 'fa' };
};

function compile() {
  console.log("🚀 Starting Vegas Engine projection compiler...");
  const compiledPlayers = [];
  const dataDir = path.join(__dirname, 'Data');

  // 🛡️ REWRITTEN: Bulletproof parser that automatically finds headers and adapts to structural changes
  const parsePositionFile = (filename, position, rowCallback) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}. Skipping ${position}...`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse ALL rows as raw arrays first, relaxing limits to avoid crashing on misaligned data
    const rawRecords = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true
    });

    // 1. Auto-detect the header row (look for 'Player')
    let headerRowIndex = -1;
    for (let i = 0; i < rawRecords.length; i++) {
        if (rawRecords[i].some(cell => typeof cell === 'string' && cell.trim() === 'Player')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.log(`⚠️ Header row not found in ${filename}`);
        return;
    }

    const rawHeaders = rawRecords[headerRowIndex].map(h => h ? h.trim() : 'UNKNOWN');
    
    // 2. De-duplicate headers (e.g., YDS becomes YDS_2 for rushing)
    const counts = {};
    const dynamicHeaders = rawHeaders.map(h => {
        if (counts[h]) {
            counts[h] += 1;
            return `${h}_${counts[h]}`;
        }
        counts[h] = 1;
        return h;
    });

    // 3. Process the data rows
    let loadedCount = 0;
    for (let i = headerRowIndex + 1; i < rawRecords.length; i++) {
        const rowArr = rawRecords[i];
        if (rowArr.length < 3) continue; // Skip junk rows
        
        // Convert array to object using our dynamic headers
        const row = {};
        dynamicHeaders.forEach((h, idx) => {
            row[h] = rowArr[idx];
        });

        if (!row.Player || row.Player.trim() === '') continue;
        
        // 4. Handle both OLD and NEW CSV formats
        let playerName = row.Player;
        let team = 'fa';

        if (row.Team) {
            team = row.Team.toLowerCase();
            playerName = playerName.trim(); 
        } else {
            const extracted = cleanNameAndTeam(row.Player, position === 'DST');
            playerName = extracted.name;
            team = extracted.team;
        }
      
        const playerObj = {
          name: playerName, 
          team: team, 
          position,
          pass_yds: 0, pass_tds: 0, ints: 0,
          rush_yds: 0, rush_tds: 0,
          receptions: 0, rec_yds: 0, rec_tds: 0,
          fumbles: 0, age: 26, years_exp: 3 
        };

        rowCallback(row, playerObj);
        compiledPlayers.push(playerObj);
        loadedCount++;
    }

    console.log(`✅ Loaded ${loadedCount} items from ${filename}`);
  };

  // 1. QBs
  parsePositionFile('QB 2026 Proj Stats.csv', 'QB', (row, obj) => {
    obj.pass_yds = cleanNum(row.YDS);
    obj.pass_tds = cleanNum(row.TDS);
    obj.ints = cleanNum(row.INTS);
    obj.rush_yds = cleanNum(row.YDS_2);
    obj.rush_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 2. RBs
  parsePositionFile('RB 2026 Proj Stats.csv', 'RB', (row, obj) => {
    obj.rush_yds = cleanNum(row.YDS);
    obj.rush_tds = cleanNum(row.TDS);
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS_2);
    obj.rec_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 3. WRs
  parsePositionFile('WR 2026 Proj Stats.csv', 'WR', (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.rush_yds = cleanNum(row.YDS_2);
    obj.rush_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 4. TEs
  parsePositionFile('TE 2026 Proj Stats.csv', 'TE', (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.fumbles = cleanNum(row.FL);
  });

  // 5. Kickers 
  parsePositionFile('K 2026 Proj Stats.csv', 'K', (row, obj) => {
    obj.fg_made = cleanNum(row.FG);
    obj.fg_att = cleanNum(row.FGA);
    obj.xp_made = cleanNum(row.XPT);
  });

  // 6. Defenses 
  parsePositionFile('DST 2026 Proj Stats.csv', 'DST', (row, obj) => {
    obj.dst_sacks = cleanNum(row.SACK);
    obj.dst_ints = cleanNum(row.INT);
    obj.dst_fumbles_rec = cleanNum(row.FR);
    obj.dst_tds = cleanNum(row.TD);
    obj.dst_pts_allowed = cleanNum(row.PA);
  });

  // 7. Market Value Blending (Phase 3 Integration)
  const adpFilePath = path.join(dataDir, '2026 ADP Rankings PPR.csv');
  const marketData = {};

  if (fs.existsSync(adpFilePath)) {
    const adpContent = fs.readFileSync(adpFilePath, 'utf-8');
    
    // Auto-detect ADP format dynamically 
    const adpRecords = parse(adpContent, {
      columns: headers => headers.map(h => h ? h.trim() : ''), 
      skip_empty_lines: true,
      relax_column_count: true 
    });

    adpRecords.forEach(row => {
      // Check for 'Player' or the new 'Player (Bye)' column
      let playerName = row.Player || row['Player (Bye)'];
      const adpVal = row.AVG || row.ADP;

      if (playerName && adpVal) {
        // Strip off the "   TEAM (BYE)" using the triple-space divider (New Format)
        if (playerName.includes('   ')) {
           playerName = playerName.split('   ')[0].trim();
        } else {
           // Fallback regex to clean the team/bye just in case it exports with single spaces
           playerName = playerName.replace(/\s+[A-Z]{2,3}\s+\(\d+\)$/i, '').trim();
        }

        // Run the clean ADP name through the Normalizer
        const cleanName = normalizeName(playerName);
        marketData[cleanName] = parseFloat(adpVal) || 300;
      }
    });
    console.log(`✅ Loaded ${adpRecords.length} Market ADP records from 2026 ADP Rankings PPR.csv`);
  } else {
    console.log(`⚠️ ADP File not found. Skipping market value injection.`);
  }

  // Inject ADP into the final array
  const finalPlayers = compiledPlayers.map(p => {
    // Run the Projection Database name through the Normalizer before checking the dictionary
    const cleanPName = normalizeName(p.name);
    return {
      ...p,
      adp: marketData[cleanPName] || 300 // Defaults to undrafted value if no ADP found
    };
  });

  const outputPath = path.join(__dirname, 'src', 'utils', 'offseasonData.js');
  const fileTemplate = `// This file is auto-generated by compileProjections.js. Do not edit manually.\nexport const OFFSEASON_FUTURES_DATABASE = ${JSON.stringify(finalPlayers, null, 2)};\n`;

  fs.writeFileSync(outputPath, fileTemplate, 'utf-8');
  console.log(`\n✨ Success! Compiled and rewrote ${outputPath}. Ready to deploy.`);
}

compile();