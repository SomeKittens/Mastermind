'use strict';
/*global nextGuess:false*/
/*global generate:false*/
/*global eliminate:false*/
/*global reset:false*/
/*global nextStep:false*/
/*global document:false*/

var testRig = (function() {
  return {
    /**
     * Runs a round of Mastermind, returns an array where
     * index 0 = # of black pegs
     * index 1 = # of white pegs
     */
    check: function(guess, solution) {
      var item = guess.split('')
        , tmpblack = 0
        , tmpwhite = 0
        , tmpobj = solution.split('');
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
      return [tmpblack, tmpwhite];
    },
    runKnuthTest: function() {
      var bw = []
        , itersArray = []
        , toTest = generate(); //generate is in global scope
        , bwIndex, guess, possible, tempKnuth, item, iters;
      for(var x in toTest) {
        //Bit of optimization so we don't have to run generate() every time
        possible = toTest.slice(0);
        item = toTest[x];
        guess = '1122';
        iters = 0;
        //Deep copy so we can reuse it.
        tempKnuth = JSON.parse(JSON.stringify(nextGuess));
        do {
          iters += 1;
          //Test against first guess
          bw = this.check(guess, item);
          possible = eliminate(possible, guess, bw);
          if(bw[0] !== 4 && possible.length > 1) {
            bwIndex = bw.join(',');
            if(tempKnuth.hasOwnProperty(bwIndex)) {
              //Look up next guess
              tempKnuth = tempKnuth[bw.join(',')];
              if(tempKnuth !== undefined) {
                //We have another Knuth guess
                guess = tempKnuth.guess;
              }
            } else if (possible.length > 1) {
              //Knuth has failed us, time to brute force
              guess = possible[0];
            } else {
              console.error('Error when testing ' + item);
              console.log(possible);
              break;
            }
          } else if (possible.length === 1) {
            //console.log(item + ' found correctly');
            break;
          }
        }while(bw[0] !== 4);
        itersArray.push(iters);
      }
      this.finished(itersArray);
    },
    runBruteTest: function() {
      var bw = []
        , toTest = generate() //generate is in global scope
        , itersArray = []
        , bwIndex, guess, possible, tempKnuth, item, iters;
      for(var x in toTest) {
        //Bit of optimization so we don't have to run generate() every time
        possible = toTest.slice(0);
        item = toTest[x];
        iters = 0;
        guess = '1122';
        //Deep copy so we can reuse it.
        tempKnuth = JSON.parse(JSON.stringify(nextGuess));
        do {
          iters += 1;
          //Test against first guess
          bw = this.check(guess, item);
          possible = eliminate(possible, guess, bw);
          if(bw[0] !== 4 && possible.length > 1) {
            if (possible.length > 1) {
              guess = possible[0];
            } else {
              console.error('Error when testing ' + item);
              console.log(possible);
              break;
            }
          } else if (possible.length === 1) {
            break;
          }
        }while(bw[0] !== 4);
        itersArray.push(iters);
      }
      this.finished(itersArray);
    },
    testMM: function() {
      var toTest = generate()
        , guess, bw;
      for(var x in toTest) {
        reset();
        for(var j=0;j<5;j++) {
          //Get guess data
          guess = document.getElementById('input' + j).value;
          //Figure out b/w data
          bw = this.check(guess, toTest[x]);
          if(bw[0] === 4) { break; } //We're done, no need to execute futher
          document.getElementById('black' + j).value = bw[0];
          document.getElementById('white' + j).value = bw[1];
          //Run results through nextStep
          nextStep(j);
        }
      }
    },
    //TODO: figure out how to make this private scope
    finished: function(itersArray) {
      var sum, avg;
      console.log('test done.');
      console.log('results: ');
      console.log('Worst case: ' + Math.max.apply(Math, itersArray));
      //Find average, thanks to Sergi
      //http://stackoverflow.com/questions/10359907/array-sum-and-average
      sum = itersArray.reduce(function(a, b) { return a + b; });
      avg = sum / itersArray.length;
      console.log('Average case: ' + avg);
    }
  };
})();
