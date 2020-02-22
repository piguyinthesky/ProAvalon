import passport from 'passport';
import passportLocal from 'passport-local';

// import { User, UserType } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from '../models/User';

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: UserDocument, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    (username, password, done) => {
      User.findOne(
        {
          $or: [
            { email: username.toLowerCase() },
            { usernameLower: username.toLowerCase() },
          ],
        },
        (err, user: UserDocument | undefined) => {
          if (err) {
            done(err);
          } else if (!user) {
            done(undefined, false, { message: `Email ${username} not found.` });
          } else {
            user.comparePassword(password, (e, isMatch) => {
              if (e) done(e);
              else if (isMatch) done(undefined, user);
              else {
                done(undefined, false, {
                  message: 'Invalid email or password.',
                });
              }
            });
          }
        },
      );
    },
  ),
);

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const provider = req.path.split('/').slice(-1)[0];

  const user = req.user as UserDocument;
  if (user.tokens.find((obj) => obj.kind === provider)) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
