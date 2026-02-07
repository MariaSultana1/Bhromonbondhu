const dns = require('dns').promises;
const net = require('net');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ No MONGODB_URI in environment.');
  process.exit(1);
}

const extractHost = (uri) => {
  const m = uri.match(/mongodb(?:\+srv)?:\/\/[^@]+@([^\/\?]+)/);
  if (m) return m[1];
  const m2 = uri.match(/mongodb(?:\+srv)?:\/\/([^\/\?]+)/);
  return m2 ? m2[1] : null;
};

const host = extractHost(uri);
if (!host) {
  console.error('❌ Could not extract host from URI:', uri);
  process.exit(1);
}

console.log('🔎 Testing SRV DNS for:', host);

(async () => {
  try {
    const srvName = `_mongodb._tcp.${host}`;
    console.log('➡️  Resolving SRV:', srvName);
    const records = await dns.resolveSrv(srvName);
    console.log('✅ SRV Records:');
    records.forEach(r => console.log(` - ${r.name}:${r.port} (priority=${r.priority} weight=${r.weight})`));

    // Try connecting to each returned host
    for (const r of records) {
      const targetHost = r.name;
      const port = r.port || 27017;
      console.log(`🔌 Testing TCP connection to ${targetHost}:${port} ...`);

      await new Promise((resolve) => {
        const socket = net.createConnection({ host: targetHost, port, timeout: 5000 }, () => {
          console.log(`✅ TCP connection succeeded to ${targetHost}:${port}`);
          socket.destroy();
          resolve();
        });

        socket.on('error', (err) => {
          console.error(`❌ TCP connection failed to ${targetHost}:${port} — ${err.code || err.message}`);
          resolve();
        });

        socket.on('timeout', () => {
          console.error(`❌ TCP connection timed out to ${targetHost}:${port}`);
          socket.destroy();
          resolve();
        });
      });
    }
  } catch (err) {
    console.error('❌ SRV Resolution failed:', err.code || err.message);
    if (err.code === 'ENOTFOUND') console.error(' - DNS could not find the SRV record');
    if (err.code === 'ECONNREFUSED') console.error(' - DNS server refused the query (possible network/DNS or firewall issue)');
    if (err.code === 'EAI_AGAIN') console.error(' - Temporary DNS lookup failure');
    process.exit(1);
  }
})();
