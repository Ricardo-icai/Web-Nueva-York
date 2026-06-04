const { Client } = require("pg");

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing SUPABASE_DB_URL.");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const tables = await client.query(`
      select relname, relrowsecurity
      from pg_class
      where relnamespace = 'public'::regnamespace
        and relname in (
          'user_accounts',
          'travel_profiles',
          'user_favorites',
          'user_routes'
        )
      order by relname;
    `);

    const policies = await client.query(`
      select count(*)::int as count
      from pg_policies
      where schemaname = 'public'
        and tablename in (
          'user_accounts',
          'travel_profiles',
          'user_favorites',
          'user_routes'
        );
    `);

    const triggers = await client.query(`
      select count(*)::int as count
      from pg_trigger
      where not tgisinternal
        and tgrelid in (
          'public.user_accounts'::regclass,
          'public.travel_profiles'::regclass,
          'public.user_favorites'::regclass,
          'public.user_routes'::regclass,
          'auth.users'::regclass
        );
    `);

    console.log(
      JSON.stringify(
        {
          tables: tables.rows,
          policies: policies.rows[0].count,
          triggers: triggers.rows[0].count,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
