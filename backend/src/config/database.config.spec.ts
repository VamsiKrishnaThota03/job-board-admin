import { corsOrigins, databaseConfig, sslOption } from './database.config';

describe('database config', () => {
  it('fails fast without DATABASE_URL', () => {
    expect(() => databaseConfig({})).toThrow(/DATABASE_URL/);
  });

  it('verifies TLS by default and skips it for localhost', () => {
    expect(sslOption('postgres://u:p@db.example.com/x')).toEqual({
      rejectUnauthorized: true,
    });
    expect(sslOption('postgres://u:p@localhost:5432/x')).toBe(false);
    expect(sslOption('postgres://u:p@db.example.com/x', 'no-verify')).toEqual({
      rejectUnauthorized: false,
    });
    expect(sslOption('postgres://u:p@db.example.com/x', 'disable')).toBe(false);
  });

  it('honours DB_SYNCHRONIZE', () => {
    expect(
      databaseConfig({ DATABASE_URL: 'postgres://localhost/x' }).synchronize,
    ).toBe(true);
    expect(
      databaseConfig({
        DATABASE_URL: 'postgres://localhost/x',
        DB_SYNCHRONIZE: 'false',
      }).synchronize,
    ).toBe(false);
  });

  it('parses FRONTEND_URL lists and strips trailing slashes', () => {
    expect(
      corsOrigins({ FRONTEND_URL: 'https://a.app/, http://localhost:3000' }),
    ).toEqual(['https://a.app', 'http://localhost:3000']);
    expect(corsOrigins({})).toEqual(['http://localhost:3000']);
  });
});
