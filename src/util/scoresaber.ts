const request = require("request");

export function getSSData(id: any, callback: any) {
    request(`https://new.scoresaber.com/api/player/${id}/basic`, { json: true }, (err, res, body) => {
        if (err) {
            console.log(err);
            return null;
        }
        return callback(body);
    });
}
