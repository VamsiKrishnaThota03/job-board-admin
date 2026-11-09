import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

/**
 * Optional write protection. When ADMIN_API_KEY is set, requests must send it in the
 * `x-admin-key` header. When it is not set (local development and the public demo),
 * the guard allows the request.
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) return true;

    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-admin-key'];
    if (typeof provided !== 'string')
      throw new UnauthorizedException('Missing x-admin-key header');

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid admin key');
    }
    return true;
  }
}
