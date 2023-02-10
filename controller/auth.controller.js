import jwt from "jsonwebtoken";
import { JWT } from "./../config.js";
import User from "../model/schema/user.js";
import Profile from "../model/schema/profile.js";
import Progress from "../model/schema/progress.js";
import Meditation from "../model/schema/meditation.js";
import DB_Provider from "../model/provider.js";

class AuthController {
  async register(req, res) {
    try {
      const createdProfile = await DB_Provider.create(Profile, {}, "withReturn");
      const createdProgress = await DB_Provider.create(Progress, {}, "withReturn");

      req.body.profile = createdProfile._id;
      req.body.progress = createdProgress._id;

      const createdUser = await DB_Provider.create(User, req.body, "withReturn");
      const nomalizedUser = DB_Provider.normalize(createdUser);
      const filledUser = await this.withData(nomalizedUser);

      return res.json(filledUser);
    } catch (e) {
      return res.status(500).json({
        message: `USER CREATION FAILED`,
        error: e.message
      });
    }
  }

  async login(req, res) {
    const payload = DB_Provider.normalize(req.user);

    const accessToken = jwt.sign(payload, JWT.SECRET.ACCESS, {
      expiresIn: JWT.LIFE.ACCESS
    });

    const refreshToken = jwt.sign(payload, JWT.SECRET.REFRESH, {
      expiresIn: JWT.LIFE.REFRESH
    });

    const nomalizedUser = DB_Provider.normalize(req.user);
    const filledUser = await this.withData(nomalizedUser);

    return res
      .cookie("X-Refresh-Token", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 365 * 24 * 60 * 60 * 1000
      })
      .header("X-Access-Token", accessToken)
      .status(200)
      .json(filledUser);
  }

  async user(req, res) {
    const user = req.user ? req.user : null;
    const nomalizedUser = DB_Provider.normalize(user);
    const filledUser = await this.withData(nomalizedUser);

    res.status(200).json(filledUser);
  }

  async withData(nomalizedUser) {
    if (!nomalizedUser) return nomalizedUser;

    let nomalizedProfile = null;
    if (nomalizedUser.profile) {
      const profile = await DB_Provider.findById(Profile, nomalizedUser.profile);
      nomalizedProfile = DB_Provider.normalize(profile);
    }

    let nomalizedProgress = null;
    if (nomalizedUser.progress) {
      const progress = await DB_Provider.findById(Progress, nomalizedUser.progress);
      nomalizedProgress = DB_Provider.normalize(progress);
    }

    const meditations = await DB_Provider.findMany(Meditation, {
      owner: nomalizedUser.id
    });
    const nomalizedMeditations = DB_Provider.normalizeAll(meditations || []);

    nomalizedUser.profile = nomalizedProfile;
    nomalizedUser.progress = nomalizedProgress;
    nomalizedUser.meditations = nomalizedMeditations;

    return nomalizedUser;
  }
}

export default new AuthController();
