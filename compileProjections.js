// compileProjections.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Helper to clean up formatting numbers with commas or weird spacing
const cleanNum = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/,/g, '').trim()) || 0;
};

// Splits out "Josh Allen BUF" -> { name: "Josh Allen", team: "buf" }
const cleanNameAndTeam = (rawString, isDST = false) => {
  if (!rawString) return { name: '', team: 'fa' };
  let sanitized = rawString.replace(/\u00a0/g, ' ').trim();
  
  if (isDST) {
    // For DST, "Houston Texans" -> team: "hou"
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
    // If last part is an uppercase team code (like BUF, PHI, WAS)
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

  // Helper macro to parse positional data files
  const parsePositionFile = (filename, position, fromLine, rowCallback) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}. Skipping ${position}...`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      from_line: fromLine
    });

    records.forEach(row => {
      if (!row.Player) return;
      const { name, team } = cleanNameAndTeam(row.Player, position === 'DST');
      
      // Setup structural base contract required by vegasEngine.js
      const playerObj = {
        name,
        team,
        position,
        pass_yds: 0, pass_tds: 0, ints: 0,
        rush_yds: 0, rush_tds: 0,
        receptions: 0, rec_yds: 0, rec_tds: 0,
        fumbles: 0,
        age: 26, years_exp: 3 // Placeholders synced by your live API
      };

      rowCallback(row, playerObj);
      compiledPlayers.push(playerObj);
    });
    console.log(`✅ Loaded ${records.length} items from ${filename}`);
  };

  // 1. QBs (Bypasses row 1 multi-column grouping header)
  parsePositionFile('QB 2026 Proj Stats.csv', 'QB', 2, (row, obj) => {
    obj.pass_yds = cleanNum(row.YDS);
    obj.pass_tds = cleanNum(row.TDS);
    obj.ints = cleanNum(row.INTS);
    obj.rush_yds = cleanNum(row.YDS_1 || row['YDS']);
    obj.rush_tds = cleanNum(row.TDS_1);
    obj.fumbles = cleanNum(row.FL);
  });

  // 2. RBs (Bypasses row 1 multi-column grouping header)
  parsePositionFile('RB 2026 Proj Stats.csv', 'RB', 2, (row, obj) => {
    obj.rush_yds = cleanNum(row.YDS);
    obj.rush_tds = cleanNum(row.TDS);
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS_1 || row['YDS']);
    obj.rec_tds = cleanNum(row.TDS_1);
    obj.fumbles = cleanNum(row.FL);
  });

  // 3. WRs (If you name it 'WR 2026 Proj Stats.csv')
  parsePositionFile('WR 2026 Proj Stats.csv', 'WR', 2, (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.rush_yds = cleanNum(row.YDS_1 || row['YDS']);
    obj.rush_tds = cleanNum(row.TDS_1);
    obj.fumbles = cleanNum(row.FL);
  });

  // 4. TEs (Bypasses row 1 multi-column grouping header)
  parsePositionFile('TE 2026 Proj Stats.csv', 'TE', 2, (row, obj) => {
    obj.receptions = cleanNum(row.REC);
    obj.rec_yds = cleanNum(row.YDS);
    obj.rec_tds = cleanNum(row.TDS);
    obj.fumbles = cleanNum(row.FL);
  });

  // 5. Kickers (Flat header file format)
  parsePositionFile('K 2026 Proj Stats.csv', 'K', 1, (row, obj) => {
    obj.fg_made = cleanNum(row.FG);
    obj.fg_att = cleanNum(row.FGA);
    obj.xp_made = cleanNum(row.XPT);
  });

  // 6. Defenses (Flat header file format)
  parsePositionFile('DST 2026 Proj Stats.csv', 'DST', 1, (row, obj) => {
    obj.dst_sacks = cleanNum(row.SACK);
    obj.dst_ints = cleanNum(row.INT);
    obj.dst_fumbles_rec = cleanNum(row.FR);
    obj.dst_tds = cleanNum(row.TD);
    obj.dst_pts_allowed = cleanNum(row.PA);
  });

  // Write compiled output directly into codebase utils
  const outputPath = path.join(__dirname, 'src', 'utils', 'offseasonData.js');
  const fileTemplate = `// This file is auto-generated by compileProjections.js. Do not edit manually.
export const OFFSEASON_FUTURES_DATABASE = ${JSON.stringify(compiledPlayers, null, 2)};
`;

  fs.writeFileSync(outputPath, fileTemplate, 'utf-8');
  console.log(`\n✨ Success! Compiled and rewrote ${outputPath}. Ready to deploy.`);
}

compile();