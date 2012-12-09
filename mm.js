'use strict';
/*global document:false*/
/*global nextGuess:true*/

//Global possiblities tracker
var possible;

document.addEventListener('DOMContentLoaded', function() {
  var i = 0;
  possible = generate();
  document.getElementById('ahem').style.visibility = 'hidden';
  document.getElementById('theTable').addEventListener('click', function(e) {
    if(e.target && e.target.nodeName == 'BUTTON') {
      if(e.target.id == i) {
        document.getElementById('ahem').style.visibility = 'hidden';
        nextStep(i);
        i++;
      } else {
        document.getElementById('ahem').style.visibility = '';
      }
      e.preventDefault();
    }
  });
});

function nextStep(num) {
  var bw = []
    , guessForm = document.getElementById('input' + (num + 1))
    , objective = document.getElementById('input' + num).value;
  //Get b/w data from form
  bw[0] = parseInt(document.getElementById('black'+num).value, 10);
  bw[1] = parseInt(document.getElementById('white'+num).value, 10);
  //Send data through cruncher
  possible = eliminate(possible, objective, bw);
  //Incredibly original variable names!
  //Find next guess:
  nextGuess = nextGuess[bw.join(',')];
  if(nextGuess !== undefined) {
    //We have another Knuth guess
    guessForm.value = nextGuess.guess;
  } else if (possible.length > 0) {
    //There are two possible senarios here.
    //If we've found the answer (one possible left) then we return it
    //If there's two, we give them the first one and either get it right, or 
    //get it right next time
    guessForm.value = possible[0];
  } else {
    guessForm.value = 'Cheater!';
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
 */
function eliminate(possibles, objective, bw) {
  var results = [], black = bw[0], white = bw[1], item, tmpblack, tmpwhite, tmpobj;
  for(var x in possibles) {
    item = possibles[x].split('');
    tmpblack = 0;
    tmpwhite = 0;
    tmpobj = objective.slice(0);
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
    //Can use one loop, both should be the same length
    for(y in item) {
      if(item[y] === undefined) {
        item.splice(y, 1);
      }
      if(tmpobj[y] === undefined) {
        tmpobj.splice(y, 1);
      }
    }
    if(black === tmpblack && white === tmpwhite) {
      results.push(possibles[x]);
    }
  }
  return results;
}
