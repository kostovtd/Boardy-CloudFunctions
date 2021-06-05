import * as functions from "firebase-functions";
import {
    getAllBoardgames, getBoardgamesByName,
    getGameSessionById, createGameSession, updateGameSession
} from './firestoreController'
import {
    getRealtimeGameSessionById, incrementRealtimeDatabasePointsBy,
    createRealtimeGameSession
} from './realTimeDatabaseController'


const cors = require('cors')({
    origin: true,
})


exports.getAllBoardgames = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    return cors(req, res, async () => {
        let boardGamesJson = await getAllBoardgames()
        if(boardGamesJson) {
            res.status(200).send(boardGamesJson)
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.getBoardgamesByName = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.query.name) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let boardGamesJson = await getBoardgamesByName(req.query.name)
        if(boardGamesJson) {
            res.status(200).send(boardGamesJson)
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.getGameSessionById = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.query.id) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let boardGamesJson = await getGameSessionById(req.query.id)
        if(boardGamesJson) {
            res.status(200).send(boardGamesJson)
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.createGameSession = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'GET' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.adminId || !req.body.boardGameId || !req.body.players ||
        !req.body.startingPoints || !req.body.teams) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let gameSession = await createGameSession(req.body.adminId, req.body.boardGameId,
            req.body.players.split(','), Number(req.body.startingPoints),
            req.body.teams.split(','))
        if (gameSession) {
            res.status(200).send()
        } else {
            res.status(500).send('Internal Server Error')            
        }
    })
})


exports.updateGameSession = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'GET' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.gameSessionId || !req.body.gameSession) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let gameSession = await updateGameSession(req.body.gameSessionId, req.body.gameSession)
        if (gameSession) {
            res.status(200).send()
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.getRealtimeGameSessionById = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.query.id) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let gameSession = await getRealtimeGameSessionById(req.query.id)
        if (!gameSession) {
            res.status(500).send('Internal Server Error')
        } else {
            res.status(200).send(gameSession)
        }
    })
})


exports.incrementRealtimeDatabasePointsBy = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'GET' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.gameSessionId || !req.body.playerId || !req.body.points) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let realtimeGameSession = await incrementRealtimeDatabasePointsBy(req.body.gameSessionId,
            req.body.playerId, req.body.points)
        if (realtimeGameSession) {
            res.status(200).send()
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.createRealtimeGameSession = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT' || req.method === 'GET' || req.method === 'DELETE') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.gameSessionId || !req.body.players) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let realtimeGameSession = await createRealtimeGameSession(req.body.gameSessionId, req.body.players)
        if (realtimeGameSession) {
            res.status(200).send()
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})