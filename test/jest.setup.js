// Optionally set test env vars here
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'db';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'example';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'example';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'exampledb';
process.env.DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'password';
