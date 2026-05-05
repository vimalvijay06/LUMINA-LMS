const bcrypt = require('bcryptjs');
async function getHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin', salt);
    console.log(hash);
}
getHash();
