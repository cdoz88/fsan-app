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

  const parsePositionFile = (filename, position, fromLine, rowCallback) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}. Skipping ${position}...`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const dynamicColumns = (headers) => {
        const counts = {};
        return headers.map(h => {
            const cleanH = h ? h.trim() : 'UNKNOWN';
            if (counts[cleanH]) {
                counts[cleanH] += 1;
                return `${cleanH}_${counts[cleanH]}`;
            }
            counts[cleanH] = 1;
            return cleanH;
        });
    };

    const records = parse(fileContent, {
      columns: dynamicColumns,
      skip_empty_lines: true,
      from_line: fromLine
    });

    records.forEach(row => {
      if (!row.Player || row.Player.trim() === '' || row.Player === 'Player') return;
      const { name, team } = cleanNameAndTeam(row.Player, position === 'DST');
      
      const playerObj = {
        name, team, position,
        pass_yds: 0, pass_tds: 0, ints: 0,
        rush_yds: 0, rush_tds: 0,
        receptions: 0, rec_yds: 0, rec_tds: 0,
        fumbles: 0, age: 26, years_exp: 3 
      };

      rowCallback(row, playerObj);
      compiledPlayers.push(playerObj);
    });
    console.log(`✅ Loaded ${records.length} items from ${filename}`);
  };

  // 1. QBs
  parsePositionFile('QB 2026 Proj Stats.csv', 'QB', 2, (row, obj) => {
    obj.pass_yds = cleanNum(row.YDS);
    obj.pass_tds = cleanNum(row.TDS);
    obj.ints = cleanNum(row.INTS);
    obj.rush_yds = cleanNum(row.YDS_2);
    obj.rush_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 2. RBs
  parsePositionFile('RB 2026 Proj Stats.csv', 'RB', 2, (row, obj) => {
    obj.rush_yds = cleanNum(row.YDS);
    obj.rush_tds = cleanNum(row.TDS);
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS_2);
    obj.rec_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 3. WRs
  parsePositionFile('WR 2026 Proj Stats.csv', 'WR', 2, (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.rush_yds = cleanNum(row.YDS_2);
    obj.rush_tds = cleanNum(row.TDS_2);
    obj.fumbles = cleanNum(row.FL);
  });

  // 4. TEs
  parsePositionFile('TE 2026 Proj Stats.csv', 'TE', 2, (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.fumbles = cleanNum(row.FL);
  });

  // 5. Kickers 
  parsePositionFile('K 2026 Proj Stats.csv', 'K', 1, (row, obj) => {
    obj.fg_made = cleanNum(row.FG);
    obj.fg_att = cleanNum(row.FGA);
    obj.xp_made = cleanNum(row.XPT);
  });

  // 6. Defenses 
  parsePositionFile('DST 2026 Proj Stats.csv', 'DST', 1, (row, obj) => {
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
    
    // FIX: Added 'relax_column_count: true' to ignore blank rows at the bottom of the CSV
    const adpRecords = parse(adpContent, {
      columns: headers => headers.map(h => h ? h.trim() : ''), 
      skip_empty_lines: true,
      relax_column_count: true 
    });

    adpRecords.forEach(row => {
      // 1. Look for either the old 'Player' column or the new 'Player (Bye)' column
      let playerName = row.Player || row['Player (Bye)'];
      const adpVal = row.AVG || row.ADP;

      if (playerName && adpVal) {
        // 2. If it's the new format, strip off the "   TEAM (BYE)" using the triple-space divider
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