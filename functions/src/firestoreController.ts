import { firestore, functions } from './config/firebase'
import './result'


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
  losers: string[] = []
  players: string[] = []
  startTime: any = null
  startingPoints: number = 0
  teams: string[] = []
  winners: string[] = []
  status: string = ''
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

    if (querySnapshot.exists) {
      functions.logger.info("gameSession with ID exists: " + id)
      
      let findSeconds = "_seconds"
      let findNanoSeconds = "_nanoseconds"
      let regExSeconds = new RegExp(findSeconds, 'g')
      let regExNanoSeconds = new RegExp(findNanoSeconds, 'g')
      let dataJson = JSON.stringify(querySnapshot.data())
        .replace(regExSeconds, "seconds")
        .replace(regExNanoSeconds, "nanoseconds")

      return { success: true, data: JSON.parse(dataJson) as GameSession }
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
  teams: any,
  status: any) => {
  try {
    let documentId = ''
    // let playersArray: string[]= players.toString().replace(/\s/g, '').split(',')
    // let teamsArray: string[] = teams.replace(/\s/g, '').split(',')

    await db.gameSessions.add({
      adminId: adminId,
      boardGameId: boardGameId,
      endTime: Date.now(),
      losers: [],
      players: players,
      startTime: Date.now(),
      startingPoints: startingPoints,
      teams: teams,
      winners: [],
      status: status
    })
      .then(function (docRef) {
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


const updateGameSession = async (gameSessionId: any, gameSession: any) => {
  try {
    if(gameSession.status === 'ACTIVE') {
      gameSession.startTime = Date.now()
    } else if(gameSession.status === 'FINISHED') {
      gameSession.endTime = Date.now()
    }

    await db.gameSessions.doc(gameSessionId).update(gameSession)

    return { success: true }
  } catch (error) {
    functions.logger.error("updateGameSession error:", error)
    return { success: false }
  }
}

const setGameSessionStatusActive = async (gameSessionId: any) => {
  try {
    await db.gameSessions.doc(gameSessionId)
      .update(
        {
          startTime: Date.now(),
          status: 'ACTIVE'
        }
      )

    return { success: true }
  } catch (error) {
    functions.logger.error("setGameSessionStatusActive error:", error)
    return { success: false }
  }
}


const setGameSessionStatusSuspended = async (gameSessionId: any) => {
  try {
    await db.gameSessions.doc(gameSessionId)
      .update(
        {
          status: 'SUSPENDED'
        }
      )

    return { success: true }
  } catch (error) {
    functions.logger.error("setGameSessionStatusSuspended error:", error)
    return { success: false }
  }
}


const setGameSessionStatusEnded = async (gameSessionId: any) => {
  try {
    await db.gameSessions.doc(gameSessionId)
      .update(
        {
          endTime: Date.now(),
          status: 'ENDED'
        }
      )

    return { success: true }
  } catch (error) {
    functions.logger.error("setGameSessionStatusEnded error:", error)
    return { success: false }
  }
}


const addPlayerToFirestoreGameSession = async (gameSessionId: string, playerId: string, playerEmail: string) => {
  try {
    let playerEntry = playerId + "|" + playerEmail
    let teamEntry = playerId + "|" + playerEmail

    var admin = require('firebase-admin');

    await db.gameSessions.doc(gameSessionId)
    .update(
      {
        players: admin.firestore.FieldValue.arrayUnion(playerEntry),
        teams: admin.firestore.FieldValue.arrayUnion(teamEntry)
      }
    )

    return { success: true }
  } catch (error) {
    functions.logger.error("addPlayerToGameSession error:", error)
    return { success: false }
  }
}

const removePlayerFromFirestoreGameSession = async (gameSessionId: string, playerId: string, playerEmail: string) => {
  try {
    let playerEntry = playerId + "|" + playerEmail
    let teamEntry = playerId + "|" + playerEmail

    let document = await db.gameSessions.doc(gameSessionId).get()
    
    if(document.exists) {
      let playersArr = document.data()?.players ?? []

      playersArr.forEach(function(item, index, object) {
        if (item === playerEntry) {
          object.splice(index, 1);
        }
      });

      let teamsArr = document.data()?.teams ?? []

      teamsArr.forEach(function(item, index, object) {
        if (item === teamEntry) {
          object.splice(index, 1);
        }
      });

      await db.gameSessions.doc(gameSessionId)
      .update({
        players: playersArr,
        teams: teamsArr
      })

      return { success: true }
    } else {
      return { success: false }
    }
  } catch (error) {
    functions.logger.error("addPlayerToGameSession error:", error)
    return { success: false }
  }
}

// Add deleteGameSession function. It should not be public. Maybe it should be a trigger

export {
  getAllBoardgames,
  getBoardgamesByName,
  getGameSessionById,
  createGameSession,
  updateGameSession,
  setGameSessionStatusActive,
  setGameSessionStatusSuspended,
  setGameSessionStatusEnded,
  addPlayerToFirestoreGameSession,
  removePlayerFromFirestoreGameSession,
  GameSession
}