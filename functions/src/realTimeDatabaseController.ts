import { database, functions } from './config/firebase'
import './result'

const getRealtimeGameSessionById = async (gameSessionId: any) => {
    try {
        let data = await database.ref().child("gameSession_" + gameSessionId).get()

        functions.logger.info("gameSession with ID found in realtime database: " + gameSessionId)

        return { success: true, data: data }
    } catch (error) {
        functions.logger.error("getRealtimeGameSessionById error:", error)
        return { success: false }
    }
}


const createRealtimeGameSession = async (gameSessionId: any, players: any, startingPoints: number) => {
    try {

        let pointsArray: { [key: string]: number } = {}

        for (var i = 0; i < players.length; i++) {
            pointsArray[players[i].split('|')[0]] = startingPoints
        }

        const gameSessionPath = '/gameSession_' + gameSessionId
        await database.ref(gameSessionPath).set({
            active: true,
            points: pointsArray
        })

        functions.logger.info("gameSession created in realtime database with id: " + gameSessionId)

        return { success: true }
    } catch (error) {
        functions.logger.error("createRealtimeGameSession error:", error)
        return { success: false }
    }
}


const changeRealtimeDatabasePoints = async (gameSessionId: any, playerId: any, points: any) => {
    try {
        const gameSessionPath = 'gameSession_' + gameSessionId
        const playerPath = 'points/' + playerId

        await database.ref()
            .child(gameSessionPath)
            .update({
                [playerPath]: points
            })

        functions.logger.info("realtime database points incremented for game session: " + gameSessionId)

        return { success: true }
    } catch (error) {
        functions.logger.error("getRealtimeGameSessionById error:", error)
        return { success: false }
    }
}


const updateRealtimeGameSession = async (gameSessionId: any, realtimeGameSession: any) => {
    try {
        const gameSessionPath = 'gameSession_' + gameSessionId

        await database.ref()
            .child(gameSessionPath)
            .update(realtimeGameSession)

        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

const setRealtimeGameSessionActive = async (gameSessionId: any, isActive: boolean) => {
    try {
        const gameSessionPath = 'gameSession_' + gameSessionId

        await database.ref()
            .child(gameSessionPath)
            .update({
                ['active']: isActive
            })

        return { success: true }
    } catch (error) {
        return { success: false }
    }
}


const addPlayerToRealtimeGameSession = async (gameSessionId: string, playerId: string, points: any) => {
    try {
        const pointsPath = 'gameSession_' + gameSessionId + "/points"

        let pointsArray: { [key: string]: number } = {}

        pointsArray[playerId] = points

        await database.ref()
            .child(pointsPath)
            .update(pointsArray)

        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger


export {
    getRealtimeGameSessionById,
    changeRealtimeDatabasePoints,
    createRealtimeGameSession,
    updateRealtimeGameSession,
    setRealtimeGameSessionActive,
    addPlayerToRealtimeGameSession
}