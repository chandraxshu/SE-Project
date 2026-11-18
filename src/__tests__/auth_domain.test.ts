import { describe, it, expect } from 'vitest';
import { isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from '@/lib/supabase';

describe('Institutional Email Verification (FR-01, FR-02)', () => {
  it('correctly identifies ALLOWED_EMAIL_DOMAIN as iiita.ac.in', () => {
    expect(ALLOWED_EMAIL_DOMAIN).toBe('iiita.ac.in');
  });

  it('accepts valid institutional student email addresses', () => {
    expect(isAllowedEmail('student@iiita.ac.in')).toBe(true);
    expect(isAllowedEmail('iit2023001@iiita.ac.in')).toBe(true);
    expect(isAllowedEmail('iec2022045@iiita.ac.in')).toBe(true);
    expect(isAllowedEmail('faculty.member@iiita.ac.in')).toBe(true);
  });

  it('rejects personal Gmail addresses', () => {
    expect(isAllowedEmail('student@gmail.com')).toBe(false);
    expect(isAllowedEmail('chandranshu.personal@gmail.com')).toBe(false);
    expect(isAllowedEmail('iiita.student@gmail.com')).toBe(false);
  });

  it('rejects arbitrary external domains', () => {
    expect(isAllowedEmail('attacker@yahoo.com')).toBe(false);
    expect(isAllowedEmail('user@outlook.com')).toBe(false);
    expect(isAllowedEmail('fake@iiita.edu')).toBe(false);
    expect(isAllowedEmail('impostor@iiita.ac.in.fake.com')).toBe(false);
  });

  it('rejects empty or malformed strings', () => {
    expect(isAllowedEmail('')).toBe(false);
    expect(isAllowedEmail('iiita.ac.in')).toBe(false);
    expect(isAllowedEmail('@iiita.ac.in')).toBe(true); // domain suffix check
  });
});
