import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const userRouter: Router = Router();
const userCon: userController = new userController();

// Badges
userRouter.put('/badge(s)?/:id', (req, res) => userCon.updateBadge(req, res));

userRouter.delete('/badge(s)?/:id', (req, res) => userCon.deleteBadge(req, res));

userRouter.post('/badge(s)?', (req, res) => userCon.createBadge(req, res));

userRouter.get('/badge(s)?', (req, res) => userCon.getBadges(req, res));

// User
userRouter.get('/user/:id', (req, res) => userCon.getUser(req, res));
userRouter.put('/user/:id/badge(s)?', (req, res) => userCon.updateUserBadges(req, res));

export { userRouter }