import { User as AppUser } from '../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    }
  }
}
