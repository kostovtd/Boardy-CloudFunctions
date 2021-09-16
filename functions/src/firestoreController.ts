import { firestore, admin, functions } from './config/firebase'
import './result'

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

class GameSessionWithId {
  id: string = ''
  adminId: string = ''
  boardGameId: string = ''
  endTime: any = null
  lossers: string[] = []
  players: string[] = []
  startTime: any = null
  startingPoints: number = 0
  teams: string[] = []
  winners: string[] = []

  constructor(id: string, gameSesionData: any) {
    this.id = id
    this.adminId = gameSesionData.adminId
    this.boardGameId = gameSesionData.boardGameId
    this.endTime = gameSesionData.lossers
    this.lossers = gameSesionData.lossers
    this.players = gameSesionData.players
    this.startTime = gameSesionData.startTime
    this.startingPoints = gameSesionData.startingPoints
    this.teams = gameSesionData.teams
    this.winners = gameSesionData.winners
  }
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
    const allEntries: any[] = []
    const querySnapshot = await db.boardGames.where("name", ">=", name)
      .where("name", "<=", name + '\uf8ff').get()
    querySnapshot.forEach((doc: any) => {
      allEntries.push(doc.data())
    })
    return { success: true, data: allEntries }
  } catch (error) {
    functions.logger.error("getBoardgamesByName error:", error)
    return { success: false }
  }
}


const getGameSessionById = async (id: any) => {
  try {
    functions.logger.info("ID: " + id)
    await db.gameSessions.doc(id).get()
    .then(function(docRef) {
      if(docRef.exists) {
        functions.logger.info("docRef.exists: " + docRef.exists)
        return { success: true, data: new GameSessionWithId(id, docRef.data) }
      } else {
        return { success: false }
      }
    })
    return { success: false }
  } catch (error) {
    functions.logger.error("getGameSessionById error:", error)
    return { success: false }
  }
}


const createGameSession = async (adminId: any,
  boardGameId: any,
  players: string[],
  startingPoints: number,
  teams: string[]) => {
  try {
    // let data = new GameSessionWithId("", new GameSession())
    let documentId = ''
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
    .then(function(docRef) {
      functions.logger.debug("docRef.id = " + docRef.id)
      // return { success: true, data:  }
      documentId = docRef.id
    })
    // .then(function(docRef) {
    //   docRef.get().then(function(docRef) {
    //     if(docRef.exists) {
    //       functions.logger.info("docRef - " + JSON.stringify(docRef.data()!))
    //       data = new GameSessionWithId(docRef.id, docRef.data()!)
    //     }
    //   })
    // })
    // return { success: true, data: data }
    return { success: true, data: documentId }
  } catch (error) {
    functions.logger.error("createGameSession error:", error)
    return { success: false }
  }
}


const updateGameSession = async (gameSessionId: any, gameSession: GameSession) => {
  try {
    await db.gameSessions.doc(gameSessionId).update(gameSession)
    return { success: true }
  } catch (error) {
    functions.logger.error("updateGameSession error:", error)
    return { success: false }
  }
}

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger




export { getAllBoardgames, getBoardgamesByName, getGameSessionById, createGameSession, updateGameSession, GameSession }