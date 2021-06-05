import { database, admin, functions } from './config/firebase'

const ServerValue = admin.database.ServerValue

const getRealtimeGameSessionById = async (gameSessionId: any) => {
    try {
        return await database.ref().child("gameSession_" + gameSessionId).get()
    } catch (error) {
        functions.logger.error("getRealtimeGameSessionById error:", error)
        return false
    }
}


const createRealtimeGameSession = async (gameSessionId: any, players: any) => {
    try {
        const gameSessionPath = '/gameSession_' + gameSessionId
        await database.ref(gameSessionPath)
        .set({
            active: true,
            points: players
        })
        return true
    } catch(error) {
        functions.logger.error("createRealtimeGameSession error:", error)
        return false
    }
}


const incrementRealtimeDatabasePointsBy = async (gameSessionId: any, playerId: any, points: any) => {
    try {
        const gameSessionPath = 'gameSession_' + gameSessionId
        const playerPath = 'points/' + playerId
        await database.ref()
            .child(gameSessionPath)
            .update({
                [playerPath]: ServerValue.increment(points)
            })
        return true
    } catch (error) {
        functions.logger.error("getRealtimeGameSessionById error:", error)
        return false
    }
}


// const updateRealtimeGameSession

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger


export { getRealtimeGameSessionById, incrementRealtimeDatabasePointsBy, createRealtimeGameSession }