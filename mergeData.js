const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

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

  const purePlayers = rows.map(row => {
    const name = row[2]?.trim();
    const team = row[3]?.trim() || "FA";
    
    // Parse baseline numbers strictly from the FantasyPros CSV
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
    else if (parseFloat(row[10]) > 80 || (rush_yds > 200 && receptions < 60)) position = "RB";

    return {
      name,
      position, // This will be corrected automatically by our Sleeper API route
      team: team.toLowerCase(),
      age: null, 
      pass_yds,
      pass_tds,
      ints: 0,
      rush_yds,
      rush_tds,
      receptions,
      rec_yds,
      rec_tds,
      fumbles: 0
    };
  }).filter(p => p.name);

  // Write out the fresh standalone database file
  const outputPath = path.join(__dirname, 'src', 'utils', 'offseasonData.js');
  const fileTemplate = `export const OFFSEASON_FUTURES_DATABASE = ${JSON.stringify(purePlayers, null, 2)};`;
  
  fs.writeFileSync(outputPath, fileTemplate, 'utf-8');
  console.log(`Success! Compiled ${purePlayers.length} pure consensus projections into offseasonData.js`);

} catch (err) {
  console.error("Compilation failed:", err);
}