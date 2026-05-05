const bcrypt = require('bcryptjs');
(async () => {
  const hash = await bcrypt.hash('admin', 10);
  console.log('HASH_START:' + hash + ':HASH_END');
})();
