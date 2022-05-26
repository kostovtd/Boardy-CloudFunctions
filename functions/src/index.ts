import * as functions from "firebase-functions";
import {
    getAllBoardgames, 
    getBoardgamesByName,
    getGameSessionById, 
    createGameSession, 
    updateGameSession
} from './firestoreController'
import {
    getRealtimeGameSessionById, 
    changeRealtimeDatabasePoints,
    createRealtimeGameSession,
    updateRealtimeGameSession
} from './realTimeDatabaseController'


const cors = require('cors')({
    origin: true,
})


exports.getAllBoardgames = functions.https.onRequest((req, res) => {
    if (req.method === 'GET') {
        return res.status(403).send('Forbidden!')
    }

    return cors(req, res, async () => {
        let boardGamesResult = await getAllBoardgames()
        if(boardGamesResult.success) {
            res.status(200).send(boardGamesResult)
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.getBoardgamesByName = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
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
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.getGameSessionById = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.query.id) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let gameSessionResult = await getGameSessionById(req.query.id)
        let realTimeGameSessionResult = await getRealtimeGameSessionById(req.query.id)
        if(gameSessionResult.success && realTimeGameSessionResult.success) {
            res.status(200).send({
                success: true,
                data: {
                    gameSession: gameSessionResult.data,
                    realTimeGameSession: realTimeGameSessionResult.data
                }
            })
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})


exports.createGameSession = functions.https.onRequest((req, res) => {
    if (req.method !== 'POST') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.adminId || !req.body.boardGameId || !req.body.players ||
        !req.body.startingPoints || !req.body.teams) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let createGameSessionFirestoreResult = await createGameSession(req.body.adminId, 
            req.body.boardGameId,
            req.body.players, 
            Number(req.body.startingPoints),
            req.body.teams,
            req.body.status)

        if (createGameSessionFirestoreResult.success) {
            let players = req.body.players
            let points = req.body.startingPoints

            let createGameSessionRealtimeResult = await createRealtimeGameSession(createGameSessionFirestoreResult.data,
                players, +points)
            
            if(createGameSessionRealtimeResult.success) {
                res.status(200).send({
                    success: true,
                    gameSessionId: createGameSessionFirestoreResult.data
                })
            } else {
                res.status(500).send('Internal Server Error')            
            }
        } else {
            res.status(500).send('Internal Server Error')            
        }
    })
})


exports.updateGameSession = functions.https.onRequest((req, res) => {
    if (req.method !== 'POST') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.gameSessionId) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let updateGameSessionFirestoreFailed = false
        let updateGameSessionDatabaseFailed = false

        if(req.body.gameSessionFirestore) {
            let updateGameSessionFirestoreResult = await updateGameSession(req.body.gameSessionId,
                req.body.gameSessionFirestore)

            updateGameSessionFirestoreFailed = !updateGameSessionFirestoreResult.success
        }
    
        if(req.body.gameSessionDatabase) {
            let updateGameSessionDatabaseResult = await updateRealtimeGameSession(
                req.body.gameSessionId,
                req.body.gameSessionDatabase
            )

            updateGameSessionDatabaseFailed = !updateGameSessionDatabaseResult.success
        }

        if(updateGameSessionFirestoreFailed || updateGameSessionDatabaseFailed) {
            res.status(500).send('Internal Server Error')
        } else {
            res.status(200).send({
                success: true
            })
        }
    })
})


exports.getRealtimeGameSessionById = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
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


exports.changeRealtimeDatabasePoints = functions.https.onRequest((req, res) => {
    if (req.method !== 'POST') {
        return res.status(403).send('Forbidden!')
    }

    if (!req.body.gameSessionId || !req.body.playerId || !req.body.points) {
        return res.status(400).send('Bad request')
    }

    return cors(req, res, async () => {
        let realtimeGameSessionResult = await changeRealtimeDatabasePoints(req.body.gameSessionId,
            req.body.playerId, req.body.points)
        if (realtimeGameSessionResult.success) {
            res.status(200).send(realtimeGameSessionResult)
        } else {
            res.status(500).send('Internal Server Error')
        }
    })
})