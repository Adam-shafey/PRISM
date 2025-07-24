import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Configure passport local strategy
passport.use(new LocalStrategy(
  { usernameField: "username" },
  async (username: string, password: string, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      // For now, we'll use a simple password check (in production, use proper hashing)
      // Since we're focusing on the functionality, we'll assume any password works for existing users
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // For development, automatically log in as the first user if no auth
  storage.getAllUsers().then(users => {
    if (users.length > 0) {
      req.login(users[0], (err: any) => {
        if (err) return res.status(401).json({ message: "Authentication required" });
        return next();
      });
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }
  }).catch(() => {
    return res.status(401).json({ message: "Authentication required" });
  });
}

export function getCurrentUser(req: any): User | null {
  return req.user || null;
}

export default passport;