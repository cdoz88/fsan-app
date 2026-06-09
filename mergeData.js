const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// 1. Paste the manual DraftKings sportsbook data you've gathered so far
const DK_LINES = {
  "Ja'Marr Chase": { rec_yds: 1324.5, rec_tds: 10.5 },
  "Jaxon Smith-Njigba": { rec_yds: 1324.5, rec_tds: 8.5 },
  "Puka Nacua": { rec_yds: 1324.5, rec_tds: 7.5 },
  "Amon-Ra St. Brown": { rec_yds: 1249.5, rec_tds: 9.5 },
  "CeeDee Lamb": { rec_yds: 1199.5, rec_tds: 7.5 },
  "Drake London": { rec_yds: 1149.5, rec_tds: 7.5 },
  "Justin Jefferson": { rec_yds: 1149.5, rec_tds: 6.5 },
  "Nico Collins": { rec_yds: 1074.5, rec_tds: 6.5 },
  "Chris Olave": { rec_yds: 1024.5, rec_tds: 5.5 },
  "George Pickens": { rec_yds: 999.5, rec_tds: 6.5 },
  "Tetairoa McMillan": { rec_yds: 949.5, rec_tds: 6.5 },
  "Tee Higgins": { rec_yds: 874.5, rec_tds: 8.5 },
  "Davante Adams": { rec_yds: 774.5, rec_tds: 9.5 },
  "Trey McBride": { rec_yds: 999.5, rec_tds: 6.5 },
  "Brock Bowers": { rec_yds: 899.5, rec_tds: 7.5 },
  "Travis Kelce": { rec_yds: 674.5, rec_tds: 4.5 },
  "Derrick Henry": { rush_yds: 1274.5, rush_tds: 12.5 },
  "Jahmyr Gibbs": { rush_yds: 1249.5, rush_tds: 12.5 },
  "James Cook": { rush_yds: 1249.5, rush_tds: 10.5 },
  "Jonathan Taylor": { rush_yds: 1249.5, rush_tds: 11.5 },
  "Bijan Robinson": { rush_yds: 1174.5, rush_tds: 8.5 },
  "Saquon Barkley": { rush_yds: 1099.5, rush_tds: 7.5 },
  "Ashton Jeanty": { rush_yds: 1024.5, rush_tds: 7.5 },
  "Javonte Williams": { rush_yds: 999.5, rush_tds: 9.5 },
  "Kyren Williams": { rush_yds: 999.5, rush_tds: 9.5 },
  "Christian McCaffrey": { rush_yds: 974.5, rush_tds: 8.5 },
  "Omarion Hampton": { rush_yds: 949.5, rush_tds: 7.5 },
  "Kenneth Walker III": { rush_yds: 924.5, rush_tds: 7.5 },
  "Jeremiyah Love": { rush_yds: 899.5, rush_tds: 5.5 },
  "Chase Brown": { rush_yds: 824.5, rush_tds: 5.5 },
  "Josh Allen": { pass_yds: 3549.5, pass_tds: 24.5, rush_yds: 499.5, rush_tds: 11.5 },
  "Jayden Daniels": { pass_yds: 3249.5, pass_tds: 21.5, rush_yds: 549.5 },
  "Lamar Jackson": { pass_yds: 3249.5, pass_tds: 24.5, rush_yds: 574.5 },
  "Jalen Hurts": { pass_yds: 3249.5, pass_tds: 22.5, rush_yds: 399.5, rush_tds: 8.5 },
  "Drake Maye": { pass_yds: 3799.5, pass_tds: 26.5, rush_yds: 424.5 },
  "Jaxson Dart": { pass_yds: 3150.5, pass_tds: 19.5, rush_yds: 449.5 }
};

try {
  const csvFilePath = path.join(__dirname, 'data', '2026 Dynasty Rankings.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  // Parse CSV records raw
  const records = parse(fileContent, {
    columns: false, 
    skip_empty_lines: true
  });

  // Remove the header row
  const rows = records.slice(1);

  const hybridPlayers = rows.map(row => {
    const name = row[2]?.trim();
    const team = row[3]?.trim() || "FA";
    
    // Parse baseline numbers from the CSV indexes
    const pass_yds = parseFloat(row[5]) || 0;
    const pass_tds = parseFloat(row[6]) || 0;
    const receptions = parseFloat(row[7]) || 0;
    const rec_yds = parseFloat(row[8]) || 0;
    const rec_tds = parseFloat(row[9]) || 0;
    const rush_yds = parseFloat(row[11]) || 0;
    const rush_tds = parseFloat(row[12]) || 0;

    // Determine position based on stats profiles
    let position = "WR";
    if (pass_yds > 500) position = "QB";
    else if (parseFloat(row[10]) > 80 || (rush_yds > 200 && receptions < 60)) position = "RB"; // Att count or high rush profile

    // Check if we have a sharp DraftKings line anchor to overlay
    const dkAnchor = DK_LINES[name] || {};

    return {
      name,
      position,
      team: team.toLowerCase(),
      age: null, // Will be live injected by our API route
      pass_yds: dkAnchor.pass_yds !== undefined ? dkAnchor.pass_yds : pass_yds,
      pass_tds: dkAnchor.pass_tds !== undefined ? dkAnchor.pass_tds : pass_tds,
      ints: 0,
      rush_yds: dkAnchor.rush_yds !== undefined ? dkAnchor.rush_yds : rush_yds,
      rush_tds: dkAnchor.rush_tds !== undefined ? dkAnchor.rush_tds : rush_tds,
      receptions,
      rec_yds: dkAnchor.rec_yds !== undefined ? dkAnchor.rec_yds : rec_yds,
      rec_tds: dkAnchor.rec_tds !== undefined ? dkAnchor.rec_tds : rec_tds,
      fumbles: 0
    };
  }).filter(p => p.name); // Filter out empty lines

  // Write out the fresh standalone database file
  const outputPath = path.join(__dirname, 'src', 'utils', 'offseasonData.js');
  const fileTemplate = `export const OFFSEASON_FUTURES_DATABASE = ${JSON.stringify(hybridPlayers, null, 2)};`;
  
  fs.writeFileSync(outputPath, fileTemplate, 'utf-8');
  console.log(`Success! Compiled ${hybridPlayers.length} hybrid-projections into offseasonData.js`);

} catch (err) {
  console.error("Compilation failed:", err);
}