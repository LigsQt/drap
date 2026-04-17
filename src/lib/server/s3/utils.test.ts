import { describe, expect, it } from 'vitest';

import {
  assertPayloadSize,
  assertSecureGoogleCdnUrl,
  normalizeImageContentType,
  S3ContentTypeError,
  S3EmptyPayloadError,
  S3RemoteHostError,
  S3RemoteProtocolError,
  S3TooLargePayloadError,
} from './util';

function expectError<T extends Error>(error: unknown, ExpectedError: new (...args: never[]) => T) {
  expect(error).toBeInstanceOf(ExpectedError);
  if (error instanceof ExpectedError) return error;
  throw error;
}

describe('normalizeImageContentType', () => {
  it('canonicalizes supported content types with parameters', () => {
    expect(normalizeImageContentType('image/jpeg; charset=UTF-8')).toBe('image/jpeg');
  });

  it('canonicalizes mixed-case supported content types', () => {
    expect(normalizeImageContentType('IMAGE/PNG')).toBe('image/png');
  });

  it('rejects unsupported content types', () => {
    try {
      normalizeImageContentType('text/plain; charset=UTF-8');
      throw new Error('expected normalizeImageContentType to throw');
    } catch (error) {
      const typedError = expectError(error, S3ContentTypeError);
      expect(typedError.contentType).toBe('text/plain; charset=UTF-8');
    }
  });

  it('rejects malformed content types', () => {
    try {
      normalizeImageContentType('not-a-real-type');
      throw new Error('expected normalizeImageContentType to throw');
    } catch (error) {
      const typedError = expectError(error, S3ContentTypeError);
      expect(typedError.contentType).toBe('not-a-real-type');
    }
  });

  it('rejects unsupported image formats even when they look image-like', () => {
    try {
      normalizeImageContentType('image/svg+xml; charset=UTF-8');
      throw new Error('expected normalizeImageContentType to throw');
    } catch (error) {
      const typedError = expectError(error, S3ContentTypeError);
      expect(typedError.contentType).toBe('image/svg+xml; charset=UTF-8');
    }
  });
});

describe('assertPayloadSize', () => {
  it('accepts a positive payload size within the maximum', () => {
    expect(() => assertPayloadSize(1024, 4096)).not.toThrow();
  });

  it('accepts a payload size exactly at the maximum', () => {
    expect(() => assertPayloadSize(4096, 4096)).not.toThrow();
  });

  it('rejects an empty payload', () => {
    try {
      assertPayloadSize(0, 4096);
      throw new Error('expected assertPayloadSize to throw');
    } catch (error) {
      expectError(error, S3EmptyPayloadError);
    }
  });

  it('rejects negative payload sizes as empty', () => {
    try {
      assertPayloadSize(-1, 4096);
      throw new Error('expected assertPayloadSize to throw');
    } catch (error) {
      expectError(error, S3EmptyPayloadError);
    }
  });

  it('rejects payloads larger than the maximum', () => {
    try {
      assertPayloadSize(4097, 4096);
      throw new Error('expected assertPayloadSize to throw');
    } catch (error) {
      const typedError = expectError(error, S3TooLargePayloadError);
      expect(typedError.size).toBe(4097);
      expect(typedError.maxBytes).toBe(4096);
    }
  });
});

describe('assertSecureGoogleCdnUrl', () => {
  it('accepts secure googleusercontent hosts', () => {
    const url = assertSecureGoogleCdnUrl('https://lh3.googleusercontent.com/avatar.png');

    expect(url.hostname).toBe('lh3.googleusercontent.com');
  });

  it('accepts secure googleusercontent hosts with mixed-case input', () => {
    const url = assertSecureGoogleCdnUrl('https://LH3.GoogleUserContent.com/avatar.png?size=256');

    expect(url.hostname).toBe('lh3.googleusercontent.com');
    expect(url.searchParams.get('size')).toBe('256');
  });

  it('rejects non-https URLs', () => {
    try {
      assertSecureGoogleCdnUrl('http://lh3.googleusercontent.com/avatar.png');
      throw new Error('expected assertSecureGoogleCdnUrl to throw');
    } catch (error) {
      const typedError = expectError(error, S3RemoteProtocolError);
      expect(typedError.protocol).toBe('http:');
    }
  });

  it('rejects disallowed hosts', () => {
    try {
      assertSecureGoogleCdnUrl('https://example.com/avatar.png');
      throw new Error('expected assertSecureGoogleCdnUrl to throw');
    } catch (error) {
      const typedError = expectError(error, S3RemoteHostError);
      expect(typedError.host).toBe('example.com');
    }
  });

  it('accepts googleusercontent subdomains by registrable domain', () => {
    const url = assertSecureGoogleCdnUrl('https://foo.bar.googleusercontent.com/avatar.png');

    expect(url.hostname).toBe('foo.bar.googleusercontent.com');
  });

  it('rejects sibling domains that only share a suffix', () => {
    try {
      assertSecureGoogleCdnUrl('https://googleusercontent.com.example.com/avatar.png');
      throw new Error('expected assertSecureGoogleCdnUrl to throw');
    } catch (error) {
      const typedError = expectError(error, S3RemoteHostError);
      expect(typedError.host).toBe('googleusercontent.com.example.com');
    }
  });

  it('rejects lookalike registrable domains', () => {
    try {
      assertSecureGoogleCdnUrl('https://googleusercontent.co/avatar.png');
      throw new Error('expected assertSecureGoogleCdnUrl to throw');
    } catch (error) {
      const typedError = expectError(error, S3RemoteHostError);
      expect(typedError.host).toBe('googleusercontent.co');
    }
  });

  it('propagates malformed URLs before host checks run', () => {
    expect(() => assertSecureGoogleCdnUrl('not a url')).toThrow(TypeError);
  });
});
