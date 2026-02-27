const fs = require('fs');
const path = require('path');
const logoPath = path.join(__dirname, 'logo.png');
if (fs.existsSync(logoPath)) {
    const base64 = fs.readFileSync(logoPath).toString('base64');
    console.log('data:image/png;base64,' + base64);
}
