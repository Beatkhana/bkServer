import { Router } from 'express';
import { MapPoolController } from '../controllers/map_pool';

const mapPoolRouter: Router = Router();
const mapPoolCon: MapPoolController = new MapPoolController();

mapPoolRouter.get('/tournament/:tourneyId/map-pools', (req, res) => mapPoolCon.getPools(req, res));
mapPoolRouter.get('/tournament/:tourneyId/download-pool/:id', (req, res) => mapPoolCon.downloadPool(req, res));

mapPoolRouter.put('/tournament/:tourneyId/map-pools', (req, res) => mapPoolCon.updatePool(req, res));

mapPoolRouter.delete('/tournament/:tourneyId/map-pools/:poolId', (req, res) => mapPoolCon.deletePool(req, res));

mapPoolRouter.post('/tournament/:tourneyId/addPool', (req, res) => mapPoolCon.addPool(req, res));
mapPoolRouter.post('/tournament/:tourneyId/deleteSong', (req, res) => mapPoolCon.deleteSong(req, res));
mapPoolRouter.post('/tournament/:tourneyId/addSong', (req, res) => mapPoolCon.addSongSS(req, res));
mapPoolRouter.post('/tournament/:tourneyId/addSongByKey', (req, res) => mapPoolCon.addSongBS(req, res));

export { mapPoolRouter }