import { Router } from "express";
import { userController } from "../controllers/user";

const userRouter: Router = Router();
const userCon: userController = new userController();

// Badges
userRouter.put("/badge(s)?/:id", (req, res) => userCon.updateBadge(req, res));

userRouter.delete("/badge(s)?/:id", (req, res) => userCon.deleteBadge(req, res));

userRouter.post("/badge(s)?", (req, res) => userCon.createBadge(req, res));

userRouter.get("/badge(s)?", (req, res) => userCon.getBadges(req, res));

// User
userRouter.get("/user/by-ss/:id", (req, res) => userCon.userBySS(req, res));
userRouter.get("/user/:id", (req, res) => userCon.getUser(req, res));
userRouter.get("/users", (req, res) => userCon.allUsers(req, res));
userRouter.get("/user", (req, res) => userCon.me(req, res));

userRouter.put("/user/:id/badge(s)?", (req, res) => userCon.updateUserBadges(req, res));
userRouter.put("/user/:id", (req, res) => userCon.updateUser(req, res));

// discord auth
userRouter.get("/login", (req, res) => userCon.login(req, res));
userRouter.get("/logout", (req, res) => userCon.logOut(req, res));
userRouter.get("/quest", (req, res) => userCon.questId(req, res));
userRouter.get("/discordAuth", (req, res) => userCon.discordAuth(req, res));

userRouter.post("/newUser", (req, res) => userCon.newUser(req, res));

export { userRouter };
