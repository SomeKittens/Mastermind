'use strict';
/*global document:false*/
/*global nextGuess:true*/

//Global possiblities tracker
var possible
  , tempKnuth
  , currentStep;
  
/**
 * DOM event manipulation
 * This triggers when the page finishes loading and initializes some variables
 * as well as adding event triggers to the "next" buttons
 */
document.addEventListener('DOMContentLoaded', function() {
  //Initialize global variables
  //We're not calling reset() here because it involves more work
  possible = generate();
  currentStep = 0;
  tempKnuth = JSON.parse(JSON.stringify(nextGuess));
  document.getElementById('ahem').style.visibility = 'hidden';
  //Event listener for the whole table, only does something when a button's clicked
  document.getElementById('theTable').addEventListener('click', function(e) {
    //If what was clicked was a button
    if(e.target && e.target.nodeName == 'BUTTON') {
      //And it's the current button:
      //TODO: replace this check by disabling all non-active buttons
      if(e.target.id == currentStep) {
        document.getElementById('ahem').style.visibility = 'hidden';
        nextStep(currentStep);
        currentStep++;
      //Otherwise, correct the user
      } else {
        document.getElementById('ahem').style.visibility = '';
      }
    }
  });
  //Trigger reset when the reset button is clicked
  document.getElementById('reset').addEventListener('click', reset);
});

/**
 * Determines the next guess
 */
function nextStep(num) {
  var bw = []
    , guessForm = document.getElementById('input' + (num + 1))
    , objective = document.getElementById('input' + num).value
    , bwIndex;
  //Get b/w data from form
  bw[0] = parseInt(document.getElementById('black' + num).value, 10);
  bw[1] = parseInt(document.getElementById('white' + num).value, 10);
  //Eliminate all possiblities that aren't consistent with current state
  possible = eliminate(possible, objective, bw);
  //Incredibly original variable names!
  //Find next guess:
  if(bw[0] !== 4 && possible.length > 1) {
    bwIndex = bw.join(',');
    if(tempKnuth.hasOwnProperty(bwIndex)) {
      //Look up next guess
      tempKnuth = tempKnuth[bwIndex];
      if(tempKnuth !== undefined) {
        //We have another Knuth guess
        guessForm.value = tempKnuth.guess;
      }
    } else if (possible.length > 1) {
      //Knuth has failed us, time to brute force
      guessForm.value = possible[0];
    } else {
      console.log(possible);
    }
  } else if (possible.length === 1) {
    guessForm.value = possible[0];
    guessForm.style['background-color'] = '#00FF00';
  }
}

function generate() {
  var possible = [];
  //Generate all possibles
  //Lame and hacky?  Yes.  Gets the job done?  Also yes.
  for(var i=1000;i<=6000;i += 1000) {
    for(var j=100;j<=600;j += 100) {
      for(var k=10;k<=60;k += 10) {
        for(var l=1;l<=6;l += 1) {
          possible.push(i + j + k + l + '');
        }
      }
    }
  }
  return possible;
}

/**
 * Removes all elements from possibles that aren't compatible with current state
 * possibles: An array of four-digit strings containing possible answers at this step
 * objective: Four-character string to test against
 * bw: Two item array.  Digit at 0 is # of black pegs, 1 is white pegs
 */
function eliminate(possibles, objective, bw) {
  var results = [], black = bw[0], white = bw[1], item, tmpblack, tmpwhite, tmpobj;
  for(var x in possibles) {
    item = possibles[x].split('');
    tmpblack = 0;
    tmpwhite = 0;
    tmpobj = objective.split('');
    //Run through and find all perfect matches
    for(var y in item) {
      if(item[y] === tmpobj[y]) {
        //Remove elements (so they don't mess up white peg processing)
        //Using delete so we don't modify the length of the array
        delete item[y];
        delete tmpobj[y];
        tmpblack += 1;
      }
    }
    //NOW we can fully delete the elements
    for(y in item) {
      if(item[y] === undefined) {
        item.splice(y, 1);
        tmpobj.splice(y, 1);
      }
    }
    //Find all color-only matches (I can't write these comments without sounding racist.  Who made this up?)
    for(y in item) {
      var index = tmpobj.indexOf(item[y]);
      if(index !== -1) {
        delete item[y];
        delete tmpobj[index];
        tmpwhite += 1;
      }
    }
    if(black === tmpblack && white === tmpwhite) {
      results.push(possibles[x]);
    }
  }
  return results;
}

/**
 * Resets to factory defaults
 */
function reset() {
  //Return global variables to start
  possible = generate();
  currentStep = 0;
  tempKnuth = JSON.parse(JSON.stringify(nextGuess));
  //Zero b/w values
  for(var i=0;i<5;i++) {
    document.getElementById('black' + i).value = '0';
    document.getElementById('white' + i).value = '0';
  }
  //Empty guess boxes, i is initially one because the first guess is always 1122
  for(i=1;i<6;i++) {
    document.getElementById('input' + i).value = '';
    document.getElementById('input' + i).style['background-color'] = '';
  }
}
