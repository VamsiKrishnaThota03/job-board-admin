import { describeWriteMode, writeMode } from './write-access';

describe('writeMode', () => {
  it('is closed when nothing is configured', () => {
    expect(writeMode({})).toBe('closed');
  });

  it('is closed for an empty ADMIN_API_KEY', () => {
    // '' must not be mistaken for "a key is configured", which would then
    // compare against an empty x-admin-key header.
    expect(writeMode({ ADMIN_API_KEY: '' })).toBe('closed');
  });

  it('is api-key when a key is set', () => {
    expect(writeMode({ ADMIN_API_KEY: 'secret' })).toBe('api-key');
  });

  it('is public only for the exact string "true"', () => {
    expect(writeMode({ ALLOW_PUBLIC_WRITES: 'true' })).toBe('public');
    for (const value of ['1', 'yes', 'TRUE', 'True', 'false', '']) {
      expect(writeMode({ ALLOW_PUBLIC_WRITES: value })).toBe('closed');
    }
  });

  it('prefers a real key over the public opt-in', () => {
    expect(
      writeMode({ ADMIN_API_KEY: 'secret', ALLOW_PUBLIC_WRITES: 'true' }),
    ).toBe('api-key');
  });
});

describe('describeWriteMode', () => {
  it('warns loudly in public mode', () => {
    expect(describeWriteMode({ ALLOW_PUBLIC_WRITES: 'true' })).toMatch(
      /OPEN TO ANYONE/,
    );
  });

  it('names the setting to change when closed', () => {
    expect(describeWriteMode({})).toMatch(/ADMIN_API_KEY/);
  });

  it('confirms the header requirement in api-key mode', () => {
    expect(describeWriteMode({ ADMIN_API_KEY: 'secret' })).toMatch(
      /x-admin-key/,
    );
  });
});
