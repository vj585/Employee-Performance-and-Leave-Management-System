const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function fixUrls(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixUrls(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Replace template literals: `http://localhost:5000/api/...`
      if (content.includes('`http://localhost:5000/api')) {
        content = content.replace(/`http:\/\/localhost:5000\/api/g, '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000/api\'}');
        modified = true;
      }

      // Replace string literals: 'http://localhost:5000/api/...'
      if (content.includes("'http://localhost:5000/api")) {
        content = content.replace(/'http:\/\/localhost:5000\/api(.*?)'/g, "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}$1`");
        modified = true;
      }
      
      // Replace double-quoted string literals: "http://localhost:5000/api/..."
      if (content.includes('"http://localhost:5000/api')) {
        content = content.replace(/"http:\/\/localhost:5000\/api(.*?)"/g, "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}$1`");
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed URLs in: ${fullPath}`);
      }
    }
  }
}

fixUrls(directoryPath);
