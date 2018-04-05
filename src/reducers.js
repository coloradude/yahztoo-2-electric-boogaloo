import {
  genericNumsScore,
  threeOrFourOfAKindScore,
  fullHouseScore,
  hasStraightScore,
  chanceScore,
  yahtzooScore
} from './score-evaluators/score-evaluators'

import initialState from './initial-state'


const calculateScores = (state, action) => {

  const newState = {...state}
  const diceArray = newState.diceBoard.dice

  const activeScorecardTop = newState.players[newState.activePlayer].scorecard.topCard
  const activeScorecardBottom = newState.players[newState.activePlayer].scorecard.bottomCard

  switch(action.type){
    case 'CALCULATE_VALUES': 

      const dice = diceArray.map( die => {
        return die.isReadyToRoll ? {
            value: (Math.ceil(Math.random() * 6)),
            isReadyToRoll: true
          }
          : die
      })

      // Removed gameBoard.ones.isActive && ... from front of ternary, may need to add again
      // There are 4 possible states for a gameBoard tile
      // 1. Unscored
      // 2. Scored but unavailable
      // 3. Scored and available
      // 4. Scratchable
      // I need to keep isActive state so it can be determine whether an
      // Active square is being pressed o the user is going for a scratch


      // This chunk gives a score if there is an available score based the active 
      // players scorecard and if the tile hasnt been scratched by the active player. 
      // Otherwise it returns 0 which deactivates the tile

      // If they arent scratched but have a score they are active
      // If they have no score && are not scratched they are active
      // if they have no score or have already been scored they are inactive

      // Might want to flip isScratched. Kind of confusing.

      // Pass an object down
      // Handle decisions on the view level

      const buildScore = ({
        scoreCardItem: {
          isScratched, 
          value
        }, 
        params: {
          dice, 
          num
        },
        scoreFunc
      }) => {
        const currentScore = scoreFunc(dice, num)
        if (isScratched || value){
          return 0
        } else if (!isScratched && currentScore) {
          return currentScore
        } else {
          return -1
        }
      }
    
    // All of this needs to be changed to iteration and/or spun out into its own module

      const ones = buildScore({
        scoreCardItem: activeScorecardTop.ones, 
        params: {
          dice,
          num: 1
        },
        scoreFunc: genericNumsScore
      })
      const twos = buildScore({
        scoreCardItem: activeScorecardTop.twos, 
        params: {
          dice,
          num: 2
        },
        scoreFunc: genericNumsScore
      })
      const threes = buildScore({
        scoreCardItem: activeScorecardTop.threes, 
        params: {
          dice,
          num: 3
        },
        scoreFunc: genericNumsScore
      })
      const fours = buildScore({
        scoreCardItem: activeScorecardTop.fours, 
        params: {
          dice,
          num: 4
        },
        scoreFunc: genericNumsScore
      })
      const fives = buildScore({
        scoreCardItem: activeScorecardTop.fives, 
        params: {
          dice,
          num: 5
        },
        scoreFunc: genericNumsScore
      })
      const sixes = buildScore({
        scoreCardItem: activeScorecardTop.sixes, 
        params: {
          dice,
          num: 6
        },
        scoreFunc: genericNumsScore
      })
      const threeOfAKind = buildScore({
        scoreCardItem: activeScorecardBottom.threeOfAKind, 
        params: {
          dice,
          num: 3
        },
        scoreFunc: threeOrFourOfAKindScore
      })
      const fourOfAKind = buildScore({
        scoreCardItem: activeScorecardBottom.fourOfAKind, 
        params: {
          dice,
          num: 4
        },
        scoreFunc: threeOrFourOfAKindScore
      })
      const fullHouse = buildScore({
        scoreCardItem: activeScorecardBottom.fullHouse, 
        params: {
          dice
        },
        scoreFunc: fullHouseScore
      })
      const smallStraight = buildScore({
        scoreCardItem: activeScorecardBottom.smallStraight, 
        params: {
          dice,
          num: 4
        },
        scoreFunc: hasStraightScore
      })
      const largeStraight = buildScore({
        scoreCardItem: activeScorecardBottom.largeStraight, 
        params: {
          dice,
          num: 5
        },
        scoreFunc: hasStraightScore
      })
      const chance = buildScore({
        scoreCardItem: activeScorecardBottom.chance, 
        params: {
          dice
        },
        scoreFunc: chanceScore
      })
      const yahtzoo = buildScore({
        scoreCardItem: activeScorecardBottom.yahtzoo, 
        params: {
          dice
        },
        scoreFunc: yahtzooScore
      })

      newState.gameBoard = {
        ones: {
          score: ones,
          isActive: !!ones
        },
        twos: {
          score: twos,
          isActive: !!twos
        },
        threes: {
          score: threes,
          isActive: !!threes
        },
        fours: {
          score: fours,
          isActive: !!fours
        },
        fives: {
          score: fives,
          isActive: !!fives
        },
        sixes: {
          score: sixes,
          isActive: !!sixes
        },
        threeOfAKind: {
          score: threeOfAKind,
          isActive: !!threeOfAKind
        },
        fourOfAKind: {
          score: fourOfAKind,
          isActive: !!fourOfAKind
        },
        fullHouse: {
          score: fullHouse,
          isActive: !!fullHouse
        },
        smallStraight: {
          score: smallStraight,
          isActive: !!smallStraight
        },
        largeStraight: {
          score: largeStraight,
          isActive: !!largeStraight
        },
        yahtzoo: {
          score: yahtzoo,
          isActive: !!yahtzoo
        },
        chance: {
          score: chance,
          isActive: !!chance
        }
      }

      newState.diceBoard.rollsLeft--

      // Possible fix for weird dice behavior
      // newState.diceBoard.rollsLeft === 
      // newState.diceBoard.rollsLeft > 0 ? 
      //   newState.diceBoard.rollsLeft-- : 
      //   newState.diceBoard.rollsLeft++

      newState.diceBoard.dice = dice
      
      return newState
    
    case 'ADD_SCORE':

    // First block checks to see if player is scratching the particular tile,
    // if not it adds the score to the correct player and updates the scorecard

      const topCardToBeUpdated = newState.players[newState.activePlayer].scorecard.topCard
      const bottomCardToBeUpdated = newState.players[newState.activePlayer].scorecard.bottomCard

      const topItemToBeUpdated = topCardToBeUpdated[action.payload.die] 
      const bottomItemToBeUpdated = bottomCardToBeUpdated[action.payload.die] 

      if (action.payload.score === -1){
        if (topItemToBeUpdated){
          topCardToBeUpdated[action.payload.die] = {
            value: 0,
            isScratched: true
          }
        } else {
          bottomCardToBeUpdated[action.payload.die] = {
            value: 0,
            isScratched: true
          }
        }

      } else {

        // This section determines whether the score in question belongs to the top card
        // or the bottom card by checking for a matching key and applies the score to the 
        // correct card accordingly then calculates the new total score

        

        if (topItemToBeUpdated){
          topCardToBeUpdated[action.payload.die] = {
            value: action.payload.score,
            isScratched: false
          }
        } else {
          bottomCardToBeUpdated[action.payload.die] = {
            value: action.payload.score,
            isScratched: false
          }
        }

        let topTotal = 0
        for (let item in topCardToBeUpdated) {
          topTotal += topCardToBeUpdated[item].value
        }

        // Gives top card bonus of 63 if total score is more than 35
        if (topTotal >= 63 ) topTotal += 35
  
        let bottomTotal = 0
        for (let item in bottomCardToBeUpdated) {
          bottomTotal += bottomCardToBeUpdated[item].value
        }
  
        newState.players[newState.activePlayer]
        .scorecard.total = topTotal + bottomTotal
      }

      // This only allows for 2 players. Easy to extend this to more in the future
      newState.activePlayer = newState.activePlayer === 0 ? 1 : 0
      
      // These reset the game pieces to default state
      newState.gameBoard = initialState.gameBoard
      newState.diceBoard = initialState.diceBoard

      // Where is this getting modified requiring an explicit declaration?
      newState.diceBoard.rollsLeft = 3

      return newState
    
    default:
      return state
  }
}

export default calculateScores


