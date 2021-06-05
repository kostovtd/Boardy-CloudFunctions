import { firestore, admin, functions } from './config/firebase'

const FieldValue = admin.firestore.FieldValue;

interface BoardGame {
  name: string,
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

interface GameSession {
  adminId: string,
  boardGameId: string,
  endTime: any,
  lossers: string[],
  players: string[],
  startTime: any,
  startingPoints: number,
  teams: string[],
  winners: string[]
}

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T
})


const dataPoint = <T>(collectionPath: string) => firestore.collection(collectionPath).withConverter(converter<T>())


const db = {
  boardGames: dataPoint<BoardGame>('boardGames'),
  gameSessions: dataPoint<GameSession>('gameSessions')
}


const getAllBoardgames = async () => {
  try {
    const allEntries: any[] = []
    const querySnapshot = await db.boardGames.get()
    querySnapshot.forEach((doc: any) => {
      allEntries.push(doc.data())
    })
    return allEntries
  } catch (error) {
    functions.logger.error("getAllBoardgames error:", error)
    return false
  }
}


const getBoardgamesByName = async (name: any) => {
  try {
    const allEntries: any[] = []
    const querySnapshot = await db.boardGames.where("name", ">=", name)
      .where("name", "<=", name + '\uf8ff').get()
    querySnapshot.forEach((doc: any) => {
      allEntries.push(doc.data())
    })
    return allEntries
  } catch (error) {
    functions.logger.error("getBoardgamesByName error:", error)
    return false
  }
}


const getGameSessionById = async (id: any) => {
  try {
    const querySnapshot = await db.gameSessions.doc(id).get()
    return querySnapshot.data()
  } catch (error) {
    functions.logger.error("getGameSessionById error:", error)
    return false
  }
}


const createGameSession = async (adminId: any,
  boardGameId: any,
  players: string[],
  startingPoints: number,
  teams: string[]) => {
  try {
    await db.gameSessions.add({
      adminId: adminId,
      boardGameId: boardGameId,
      endTime: FieldValue.serverTimestamp(),
      lossers: [],
      players: players,
      startTime: FieldValue.serverTimestamp(),
      startingPoints: startingPoints,
      teams: teams,
      winners: []
    })
    return true
  } catch (error) {
    functions.logger.error("createGameSession error:", error)
    return false
  }
}


const updateGameSession = async (gameSessionId: any, gameSession: GameSession) => {
  try {
    await db.gameSessions.doc(gameSessionId).update(gameSession)
    return true
  } catch (error) {
    functions.logger.error("updateGameSession error:", error)
    return false
  }
}

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger




export { getAllBoardgames, getBoardgamesByName, getGameSessionById, createGameSession, updateGameSession }