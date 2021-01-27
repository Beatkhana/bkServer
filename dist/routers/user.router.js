"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
var express_1 = require("express");
var user_controller_1 = require("../controllers/user.controller");
var userRouter = express_1.Router();
exports.userRouter = userRouter;
var userCon = new user_controller_1.userController();
// Badges
userRouter.put('/badge(s)?/:id', function (req, res) { return userCon.updateBadge(req, res); });
userRouter.delete('/badge(s)?/:id', function (req, res) { return userCon.deleteBadge(req, res); });
userRouter.post('/badge(s)?', function (req, res) { return userCon.createBadge(req, res); });
userRouter.get('/badge(s)?', function (req, res) { return userCon.getBadges(req, res); });
// User
userRouter.get('/user/by-ss/:id', function (req, res) { return userCon.userBySS(req, res); });
userRouter.get('/user/:id', function (req, res) { return userCon.getUser(req, res); });
userRouter.get('/users', function (req, res) { return userCon.allUsers(req, res); });
userRouter.get('/user', function (req, res) { return userCon.me(req, res); });
userRouter.put('/user/:id/badge(s)?', function (req, res) { return userCon.updateUserBadges(req, res); });
userRouter.put('/user/:id', function (req, res) { return userCon.updateUser(req, res); });
// discord auth
userRouter.get('/login', function (req, res) { return userCon.login(req, res); });
userRouter.get('/logout', function (req, res) { return userCon.logOut(req, res); });
userRouter.get('/discordAuth', function (req, res) { return userCon.discordAuth(req, res); });
userRouter.post('/newUser', function (req, res) { return userCon.newUser(req, res); });
