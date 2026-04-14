import { describe, expect, it } from 'vitest';
import {
  getActiveMoreMenuRoute,
  getNativeResumeTarget,
  isNativeAppRoute,
  sanitizeNativeAppPath,
  shouldResumeNativeUserIntoApp,
} from './native-app-routing';

describe('native-app-routing', () => {
  it('recognizes protected in-app routes', () => {
    expect(isNativeAppRoute('/dashboard')).toBe(true);
    expect(isNativeAppRoute('/quotes/new')).toBe(true);
    expect(isNativeAppRoute('/clients/123')).toBe(true);
    expect(isNativeAppRoute('/')).toBe(false);
    expect(isNativeAppRoute('/blog')).toBe(false);
  });

  it('only resumes from native entry routes', () => {
    expect(shouldResumeNativeUserIntoApp('/')).toBe(true);
    expect(shouldResumeNativeUserIntoApp('/auth/login')).toBe(true);
    expect(shouldResumeNativeUserIntoApp('/auth/signup')).toBe(true);
    expect(shouldResumeNativeUserIntoApp('/dashboard')).toBe(false);
  });

  it('sanitizes stored resume targets', () => {
    expect(sanitizeNativeAppPath('/quotes/new?template=storm')).toBe('/quotes/new?template=storm');
    expect(sanitizeNativeAppPath('https://snapquote.dev/dashboard')).toBeNull();
    expect(sanitizeNativeAppPath('//snapquote.dev/dashboard')).toBeNull();
    expect(sanitizeNativeAppPath('/blog')).toBeNull();
  });

  it('falls back to dashboard when there is no valid stored app route', () => {
    expect(getNativeResumeTarget('/', null)).toBe('/dashboard');
    expect(getNativeResumeTarget('/', '/blog')).toBe('/dashboard');
  });

  it('tracks which more-menu destination is active', () => {
    expect(getActiveMoreMenuRoute('/jobs')).toBe('/jobs');
    expect(getActiveMoreMenuRoute('/jobs/abc')).toBe('/jobs');
    expect(getActiveMoreMenuRoute('/pipeline')).toBe('/pipeline');
    expect(getActiveMoreMenuRoute('/dashboard')).toBeNull();
  });

  it('restores the last in-app route when reopening from marketing pages', () => {
    expect(getNativeResumeTarget('/', '/quotes/new?template=storm')).toBe('/quotes/new?template=storm');
    expect(getNativeResumeTarget('/auth/login', '/clients/123')).toBe('/clients/123');
    expect(getNativeResumeTarget('/dashboard', '/quotes')).toBeNull();
  });
});
