import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';

export type UserDocument = mongoose.Document & {
  username: string;
  usernameLower: string;
  password: string;

  emailAddress: string;
  emailVerified: boolean;
  emailToken: string;

  avatarImgRes: string;
  avatarImgSpy: string;
  avatarHide: boolean;

  dateJoined: Date;

  totalTimePlayed: Date;
  totalGamesPlayed: number;
  totalWins: number;
  totalResWins: number;
  totalLosses: number;
  totalResLosses: number;

  winsLossesGameSizeBreakdown: object;

  nationality: string;
  nationCode: string;
  timeZone: string;
  biography: string;

  roleStats: object;
  hideStats: boolean;

  // notifications: Notification[];
  // modAction: ModAction[];

  mutedPlayers: string[];

  patreonId: string;

  IPAddresses: string[];
  lastIPAddress: string;

  tokens: AuthToken[];

  comparePassword: comparePasswordFunction;
};

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: Error, isMatch: boolean) => void,
) => void;

export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    usernameLower: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    emailAddress: String,
    emailVerified: { type: Boolean, default: false },
    emailToken: String,

    avatarImgRes: { type: String, default: null },
    avatarImgSpy: { type: String, default: null },
    avatarHide: Boolean,

    dateJoined: Date,

    totalTimePlayed: { type: Date, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalResWins: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    totalResLosses: { type: Number, default: 0 },

    winsLossesGameSizeBreakdown: {
      type: Object,
      default: {},
    },

    nationality: String,
    nationCode: String,
    timeZone: String,
    biography: String,

    // dont need to worry about roleWins growing out of control
    // since there are a limited amount of roles, and each role
    // only has one Number attached to it
    roleStats: {
      type: Object,
      default: {
        '5p': {
          merlin: {},
          percival: {},
          assassin: {},
          morgana: {},
          spy: {},
          resistance: {},
        },
      },
    },
    hideStats: Boolean,

    // notifications: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'notification',
    // }],

    // modAction: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'ModAction',
    // }],

    mutedPlayers: [String],

    patreonId: String,

    IPAddresses: [String],
    lastIPAddress: String,
  },
  { timestamps: true },
);

/**
 * Password hash middleware.
 * TODO: get rid of return statements once consistent-return is disabled
 */
userSchema.pre('save', function save(next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt.genSalt(10, (err: mongoose.Error | undefined, salt: string) => {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(
      user.password,
      salt,
      null,
      (e: mongoose.Error, hash: string) => {
        if (e) {
          return next(e);
        }
        user.password = hash;
        return next();
      },
    );
  });
});

const comparePassword: comparePasswordFunction = function comparePassword(
  this: UserDocument,
  candidatePassword,
  cb,
) {
  bcrypt.compare(candidatePassword, this.password, cb);
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>('User', userSchema);
