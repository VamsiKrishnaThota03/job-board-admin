import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { writeMode } from './write-access';

/**
 * Guards every write to /jobs.
 *
 * Fails closed. The previous version returned `true` whenever `ADMIN_API_KEY`
 * was unset, which is exactly how the deployed API was running — and the
 * frontend never sends the header at all, so POST, PATCH and DELETE were open
 * to anyone on the internet.
 *
 * See `write-access.ts` for the three modes and why a public one still exists.
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const mode = writeMode();

    if (mode === 'closed') {
      // 503 rather than 401: no credential the caller could send would work,
      // because the server has none configured. That is the operator's problem,
      // and the message says so without revealing anything secret.
      this.logger.warn('Rejected a write: no ADMIN_API_KEY configured');
      throw new ServiceUnavailableException(
        'Write access is not configured on this deployment. Set ADMIN_API_KEY on the server to enable POST, PATCH and DELETE.',
      );
    }

    if (mode === 'public') return true;

    const expected = process.env.ADMIN_API_KEY as string;
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-admin-key'];

    if (typeof provided !== 'string' || provided.length === 0) {
      throw new UnauthorizedException('Missing x-admin-key header');
    }

    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    // timingSafeEqual throws when the lengths differ, so compare them first.
    // The length of the value the caller submitted is not itself a secret.
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid admin key');
    }

    return true;
  }
}
