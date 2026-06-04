const fs = require("fs");
const { Client } = require("pg");

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing SUPABASE_DB_URL.");
  process.exit(1);
}

const schema = fs.readFileSync("supabase/schema.sql", "utf8");

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(schema);

    const result = await client.query(`
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename in (
          'user_accounts',
          'travel_profiles',
          'user_favorites',
          'user_routes'
        )
      order by tablename;
    `);

    console.log(result.rows.map((row) => row.tablename).join("\n"));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
