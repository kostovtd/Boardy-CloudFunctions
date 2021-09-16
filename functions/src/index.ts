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
        let boardGamesResult = await getAllBoardgames()
        if(boardGamesResult.success) {
            res.status(200).send(boardGamesResult)
        } else {
            res.status(500).send(new Result())
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
        let boardGamesResult = await getBoardgamesByName(req.query.name)
        if(boardGamesResult.success) {
            res.status(200).send(boardGamesResult)
        } else {
            res.status(500).send(new Result())
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
        let gameSessionResult = await getGameSessionById(req.query.id)
        if(gameSessionResult.success) {
            res.status(200).send(gameSessionResult)
        } else {
            res.status(500).send(new Result())
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
        let createGameSessionFirestoreResult = await createGameSession(req.body.adminId, req.body.boardGameId,
            req.body.players.split(','), Number(req.body.startingPoints),
            req.body.teams.split(','))
        if (createGameSessionFirestoreResult.success) {
            functions.logger.debug("first if passed")
            let getGameSessionFirestoreResult = await getGameSessionById(createGameSessionFirestoreResult)

            if(getGameSessionFirestoreResult.success) {
                functions.logger.debug("second if passed")

                let createGameSessionRealtimeResult = await createRealtimeGameSession(createGameSessionFirestoreResult, 
                    req.body.players.split(','))
                
                if(createGameSessionRealtimeResult.success) {
                    functions.logger.debug("third if passed")

                    let realtimeGameSessionResult = await getRealtimeGameSessionById(createGameSessionFirestoreResult)
    
                    if (realtimeGameSessionResult.success) {
                        functions.logger.debug("fourth if passed")

                        res.status(200).send({
                            'gameSessionFirestore': getGameSessionFirestoreResult,
                            'gameSessionRealtime': realtimeGameSessionResult.data
                        })
                    }
                }    
            }

            res.status(500).send(new Result()) 
        } else {
            res.status(500).send(new Result())            
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
        let gameSessionResult = await updateGameSession(req.body.gameSessionId, req.body.gameSession)
        if (gameSessionResult.success) {
            res.status(200).send(gameSessionResult)
        } else {
            res.status(500).send(new Result())
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
        let gameSessionResult = await getRealtimeGameSessionById(req.query.id)
        if (gameSessionResult.success) {
            res.status(200).send(gameSessionResult)
        } else {
            res.status(500).send('Internal Server Error')
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
        let realtimeGameSessionResult = await incrementRealtimeDatabasePointsBy(req.body.gameSessionId,
            req.body.playerId, req.body.points)
        if (realtimeGameSessionResult.success) {
            res.status(200).send(realtimeGameSessionResult)
        } else {
            res.status(500).send(new Result())
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
        let realtimeGameSessionResult = await createRealtimeGameSession(req.body.gameSessionId, req.body.players)
        if (realtimeGameSessionResult.success) {
            res.status(200).send(realtimeGameSessionResult)
        } else {
            res.status(500).send(new Result())
        }
    })
})