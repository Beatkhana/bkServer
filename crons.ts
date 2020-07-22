import { database } from './database';
import { userAuth } from './userAuth';

export class crons {
    
    static updateSSData() {
        let db = new database();
        let uA = new userAuth();
        db.query(`SELECT CAST(discordId AS CHAR) as discordId, CAST(ssId AS CHAR) as ssId FROM users`, async (err, res) => {
            // console.log(res)
            // console.log(err)
            let completed = 0;
            for (const user of res) {
                uA.getSSData(user.ssId, (data) => {
                    if(data) {
                        let info = {};
                        if(data.playerInfo.banned == 1) {
                            info = {
                                ssId: data.playerInfo.playerId,
                                country: data.playerInfo.country,
                            };
                        } else {
                            info = {
                                ssId: data.playerInfo.playerId,
                                // name: data.playerInfo.playerName,
                                avatar: data.playerInfo.avatar,
                                globalRank: data.playerInfo.rank,
                                localRank: data.playerInfo.countryRank,
                                // country: data.playerInfo.country,
                            };
                        }
    
                        db.preparedQuery('UPDATE users SET ? WHERE discordId = ?', [info, user.discordId], (err, res) => {
                            if(!err) {
                                completed += 1;
                            }else {
                                console.log(err)
                            }
                        })
                    }
                });
                await delay(1000);
            }
            console.log(`Cron completed: Updated ${completed}/${res.length} users`);
        });

        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
    }
}