'use strict';
/*global eliminate:false*/

/**
 * Generates lookup tables using Knuth's min/max style, the one exception being
 * we don't care if the best is in possible or not
 * Using an empty slot as a color should be counted as a color
 */
function generateKnuth(numColors, numSlots, possible) {
  if(possible.length <= 2) {
    return false;
  }
  var currentBestMax = 9999
    , currentKnuth = {}
    , idx, guess, guessResults, guessMax, thisResponse, currentBest, nextStep
    , b, w;
  //Run through possible guesses
  for(var x in possible) {
    guess = possible[x];
    guessResults = [];
    for(b=0;b<5;b++) {
      for(w=0;w+b<=4;w++) {
        thisResponse = eliminate(possible, guess, [b,w]);
        if(thisResponse.length <= currentBestMax) {
          guessResults.push(thisResponse.length);
        } else {
          //No need to continue on this guess
          break;
        }
      }
    }
    guessMax = Math.max.apply(Math, guessResults);
    if(guessMax < currentBestMax) {
      currentBestMax = guessMax;
      currentBest = possible[x];
    }
  }
  //At this point, we've established the best guess
  currentKnuth.guess = currentBest;
  for(b=0;b<5;b++) {
    for(w=0;w+b<=4;w++) {
      nextStep = generateKnuth(numColors, numSlots, eliminate(possible, currentBest, [b,w]));
      if(nextStep === false) {
        continue;
      }
      idx = b + ',' + w;
      currentKnuth[idx] = nextStep;
    }
  }
  return currentKnuth;
}
