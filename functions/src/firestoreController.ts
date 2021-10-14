import { firestore, admin, functions } from './config/firebase'
import './result'

const FieldValue = admin.firestore.FieldValue;

interface BoardGame {
  name: string,
  id: string,
  moduleName: string,
  maxPlayingTime: number,
  minPlayingTime: number,
  packageName: string,
  publishers: [],
  activityName: string,
  artists: [],
  designers: [],
  maxNumberOfPlayers: number,
  minNumberOfPlayers: number
}

class GameSession {
  adminId: string = ''
  boardGameId: string = ''
  endTime: any = null
  lossers: string[] = []
  players: string[] = []
  startTime: any = null
  startingPoints: number = 0
  teams: string[] = []
  winners: string[] = []
}


const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T
})


const dataPoint = <T>(collectionPath: string) => firestore.collection(collectionPath).withConverter(converter<T>())


const db = {
  boardGames: dataPoint<BoardGame>('boardGames'),
  gameSessions: dataPoint<GameSession>('gameSessions'),
}


const getAllBoardgames = async () => {
  try {
    const allEntries: any[] = []
    const querySnapshot = await db.boardGames.get()

    querySnapshot.forEach((doc: any) => {
      allEntries.push(doc.data())
    })

    return { success: true, data: allEntries }
  } catch (error) {
    functions.logger.error("getAllBoardgames error:", error)
    return { success: false }
  }
}


const getBoardgamesByName = async (name: any) => {
  try {
    const allEntries: BoardGame[] = []
    const querySnapshot = await db.boardGames.where("name", ">=", name)
      .where("name", "<=", name + '\uf8ff').get()

    querySnapshot.forEach((doc: any) => {
      allEntries.push(doc.data())
      allEntries[allEntries.length - 1].id = doc.id
    })

    return { success: true, data: allEntries }
  } catch (error) {
    functions.logger.error("getBoardgamesByName error:", error)
    return { success: false }
  }
}


const getGameSessionById = async (id: any) => {
  try {
    const querySnapshot = await db.gameSessions.doc(id).get()

    if(querySnapshot.exists) {
      functions.logger.info("gameSession with ID exists: " + id)
      return { success: true, data: querySnapshot.data() }
    }

    return { success: false }
  } catch (error) {
    functions.logger.error("getGameSessionById error:", error)
    return { success: false }
  }
}


const createGameSession = async (adminId: any,
  boardGameId: any,
  players: any,
  startingPoints: number,
  teams: any) => {
  try {
    let documentId = ''
    let playersArray: string[]= players.replace(/\s/g, '').split(',')
    let teamsArray: string[] = teams.replace(/\s/g, '').split(',')

    await db.gameSessions.add({
      adminId: adminId,
      boardGameId: boardGameId,
      endTime: FieldValue.serverTimestamp(),
      lossers: [],
      players: playersArray,
      startTime: FieldValue.serverTimestamp(),
      startingPoints: startingPoints,
      teams: teamsArray,
      winners: []
    })
    .then(function(docRef) {
      functions.logger.debug("docRef.id = " + docRef.id)
      documentId = docRef.id
    })

    functions.logger.info("gameSession created in firestore")
    
    return { success: true, data: documentId }
  } catch (error) {
    functions.logger.error("createGameSession error:", error)
    return { success: false }
  }
}


const updateGameSession = async (gameSessionId: any, gameSession: GameSession) => {
  try {
    await db.gameSessions.doc(gameSessionId).update(gameSession)
    
    functions.logger.info("game session updated")

    return { success: true }
  } catch (error) {
    functions.logger.error("updateGameSession error:", error)
    return { success: false }
  }
}

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger




export { getAllBoardgames, getBoardgamesByName, getGameSessionById, createGameSession, updateGameSession, GameSession }