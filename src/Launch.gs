// This addon allows to create spreadsheets to manage a debate tournament and fully populate pairings afterwards.
// and initial pairings of round 1 and 2.
/* 
  Variable name definition for elements used in the addon
*/
var SHEET_DEBATER = 'Debater';
var SHEET_ROOM = 'Room';
var SHEET_ADJU = 'Adjudicator';
var SHEET_SCOREBOARD = 'Scoreboard';
var SHEET_PLAYERSTATS = 'PlayerStats';
var SHEET_TEAMSTATS = 'TeamStats';

/*
  Configuration global variables set up at the beginning of the addon to be refered globally.
  Those variables can only be accessed via add-on sidebar.
*/

var ss = SpreadsheetApp.getActiveSpreadsheet();
var ROUND_NUMBER = 7;
var QUARTER_ROUND_NUMBER = 5;
var SIDES_PER_ROUND = 2;
var LIMIT_INTER_AFF_ROUNDS = true;
var TEAM_NUMBER = 12;
var PLAYER_NUMBER = 24;
var ROOM_NUMBER=6;
var ADJUDICATOR_NUMBER=17;
var AFFIL_TEAM=[];
var TEAM_LIST=[];
var AFFIL_ADJUDICATOR=[];
var ADJUDICATOR_LIST=[];

// This function adds a custom menu item to run the script
function onOpen() {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addSeparator()
      .addItem('Create sheet Debater', 'generateSheetDebater')
      .addItem('Create sheet Adjudicator', 'generateSheetAdjudicator')
      .addItem('Create sheet Room', 'generateSheetRoom')
      .addToUi();
}


/**
 * Runs when the add-on is installed (default google code)
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

// This function creates the brackets based on the data provided on the players
function acquireData(round_number,quarter_number,sides_per_round,limit_inter) {
  // Data integrity is done by the javascript and html
  ROUND_NUMBER=Number(round_number);
  QUARTER_ROUND_NUMBER=Number(quarter_number);
  SIDES_PER_ROUND=Number(sides_per_round);
  LIMIT_INTER_AFF_ROUNDS=limit_inter;
  if(QUARTER_ROUND_NUMBER>ROUND_NUMBER){
    throw "quarter finals "+QUARTER_ROUND_NUMBER + " musn't be inferior to round number "+ROUND_NUMBER;
  }
  obtainNumberTeams();
  obtainNumberPlayers();
  obtainNumberAdjudicator();
  populateDebaterList();
  populateAdjudicatorList();
  createScoreboardSheet();
  SpreadsheetApp.flush();
  removeDuplicatesCopy(SHEET_DEBATER,SHEET_SCOREBOARD,'B3:B','B4:B');
  setReducedAffList();
  createTeamStatsSheet();
  removeDuplicatesCopy(SHEET_DEBATER,SHEET_TEAMSTATS,'B3:B','A3:A');
  createPlayerStatsSheet();
  simpleCopy(SHEET_DEBATER,SHEET_PLAYERSTATS,'C3:C','B3:B');
  simpleCopy(SHEET_DEBATER,SHEET_PLAYERSTATS,'B3:B','A3:A');
  var range=ss.getSheetByName(SHEET_PLAYERSTATS).getRange(3,1,PLAYER_NUMBER,4+QUARTER_ROUND_NUMBER);//Ordering playerstats by team
  range.sort([{column: 1, ascending: false}, {column: 2, ascending: false}]);
  applyAlternatingColoring(SHEET_PLAYERSTATS,3,PLAYER_NUMBER,4+QUARTER_ROUND_NUMBER);//sheetName,initRow,rowNum,colNum
  SpreadsheetApp.flush();
}
/**
 * Opens a sidebar in the document containing the add-on's user interface.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Debate manager sidebar');
  SpreadsheetApp.getUi().showSidebar(ui);
}
  /**
 * Function to splice the current element list from a single column to the non-null values of that column
 *
 * @param {string} sheetName The name of the sheet to which the element list belongs to.
 * @param {string} rangeName The name of the range to splice identified in the original spreadsheet
 * @return {elementList} The element list splice of non null elements.
 */
  function spliceElementList (sheetName,rangeName){
      // Get the elements from column identified with .  We assume the entire column is filled here.
  var rangeElements = ss.getRangeByName(rangeName);
  var sheetControl = ss.getSheetByName(sheetName);

  // Get the players from column A.  We assume the entire column is filled here.
  rangeElements = rangeElements.offset(0, 0, sheetControl.getMaxRows() -
      rangeElements.getRowIndex() + 1, 1);
  var elements = rangeElements.getValues();

  // Now figure out how many players there are(ie don't count the empty cells)
  var numElements = 0;
  for (var i = 0; i < elements.length; i++) {
    if (!elements[i][0] || elements[i][0] =="") {
      break;
    }
    numElements++;
  }
  elements = elements.slice(0, numElements);
  return elements;
  }
/**
* Function to set the number of teams registered to global variable
*
*/
function obtainNumberTeams(){
    var directionsSheet = ss.getSheetByName(SHEET_DEBATER);
  var rangeElements = directionsSheet.getRange("B3:B");
  var data = rangeElements.getValues();
  var number =0;
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()||row==""){
        duplicate = true;
      }
    }
    if(!duplicate){
      newData.push(row);
      number++;
    }
  }
  TEAM_NUMBER=number;
}
/**
* Function to set the number of adjudicators registered to global variable
*
*/
function obtainNumberAdjudicator(){
   var directionsSheet = ss.getSheetByName(SHEET_ADJU);
  var rangeElements = directionsSheet.getRange("B3:B");
  var data = rangeElements.getValues();
  var number =0;
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()){
        duplicate = true;
        throw "Adjudicator duplicated name detected : "+row +" in Room sheet at line : "+Number(3+i);
      }
      if(row==""){
        duplicate=true;
      }
    }
    if(!duplicate){
      newData.push(row);
      number++;
    }
  }
  ADJUDICATOR_NUMBER=number;
}
/**
* Function to set the number of rooms registered to global variable
*
*/
function obtainNumberRooms(){
    var directionsSheet = ss.getSheetByName(SHEET_ROOM);
  var rangeElements = directionsSheet.getRange("A3:A");
  var data = rangeElements.getValues();
  var number =0;
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()){
        duplicate = true;
        throw "Room duplicated name detected : "+row +" in Room sheet at line : "+Number(3+i);
      }
      if(row==""){
        duplicate=true;
      }
    }
    if(!duplicate){
      newData.push(row);
      number++;
    }
  }
  ROOM_NUMBER=number;
}
/*
* Function to set the number of players registered to global variable
*/
function obtainNumberPlayers(){
  var directionsSheet = ss.getSheetByName(SHEET_DEBATER);
  var rangeElements = directionsSheet.getRange("C3:C");
  var data = rangeElements.getValues();
  var number =0;
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()){
        duplicate = true;
        throw "Debater name: "+row +" isn't allowed to be in multiple teams";
      }
      if(row==""){
        duplicate=true;
      }
    }
    if(!duplicate){
      newData.push(row);
      number++;
    }
  }
  PLAYER_NUMBER=number;
}
/*
* @desc Function to remove duplicates during copy from a rangename to another using a space of the initial rangename without duplicates.
* @param initialSheetName name of original sheet to copy from.
* @param destinationSheetName name of the destionation sheet to copy to.
* @param initialRangeName name of the initial rangename
* @param destinationRangeName name of the destination rangename
*/
function removeDuplicatesCopy(initialSheetName,destinationSheetName,initialRangeName,destinationRangeName) {
  var sheet = ss.getSheetByName(initialSheetName);
  var data = sheet.getRange(initialRangeName).getValues();
  
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()||row==""){
        duplicate = true;
      }
    }
    if(!duplicate){
      newData.push(row);
    }
  }
  var row = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getRow();
  var col = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getColumn();
  ss.getSheetByName(destinationSheetName).getRange(row, col, newData.length, newData[0].length).setValues(newData);
}


/*
* @desc Function to randomise during copy from a rangename to another using a space of the initial rangename
* @param initialSheetName name of original sheet to copy from.
* @param destinationSheetName name of the destionation sheet to copy to.
* @param initialRangeName name of the initial rangename
* @param destinationRangeName name of the destination rangename
*/
function randomisedCopy(initialSheetName,destinationSheetName,initialRangeName,destinationRangeName) {
  var sheet = ss.getSheetByName(initialSheetName);
  var data = sheet.getRange(initialRangeName).getValues();
  
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()||row==""){
        duplicate = true;
      }
    }
    if(!duplicate){
      newData.push(row);
    }
  }
  var row = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getRow();
  var col = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getColumn();
  ss.getSheetByName(destinationSheetName).getRange(row, col, newData.length, newData[0].length).setValues(shuffleArray(newData));
}
/*
* @desc Function to copy from a rangename to another using a space of the initial rangename
* @param initialSheetName name of original sheet to copy from.
* @param destinationSheetName name of the destionation sheet to copy to.
* @param initialRangeName name of the initial rangename
* @param destinationRangeName name of the destination rangename
*/
function simpleCopy(initialSheetName,destinationSheetName,initialRangeName,destinationRangeName) {
  var sheet = ss.getSheetByName(initialSheetName);
  var data = sheet.getRange(initialRangeName).getValues();
  var row = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getRow();
  var col = ss.getSheetByName(destinationSheetName).getRange(destinationRangeName).getColumn();
  //range.copyValuesToRange(destinationSheetName, row, col, 4, 6);
  sheet.getRange(initialRangeName).copyTo(ss.getSheetByName(destinationSheetName).getRange(destinationRangeName), {contentsOnly:true});
  //ss.getSheetByName(destinationSheetName).getRange(row, col, data.length, data[0].length).setValues(data);
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
/**
 * Creates and returns and array of the dimensions in parameter such as 2 or 2,3
 */
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}
/*
*  Function to obtain affiliation of a team from Debater list
*/
function obtainAffiliationDebater(teamName){
  /*
  var debaterSheet=ss.getSheetByName(SHEET_DEBATER);
  var rangeName = debaterSheet.getRange(3, 1, PLAYER_NUMBER,2);
  var nameFields = rangeName.getValues();
  var found=false;
  for(i in nameFields){
    if(String(nameFields[i][1])==String(teamName)){
      found=true;
      return nameFields[i][0];
    }
  }
  */
  
  var index=TEAM_LIST.indexOf(String(teamName));
  if(index==-1){
     throw "Error : Affiliation not found to teamName " + teamName;
  }else{
    return AFFIL_TEAM[index];
  }
  
}
/*
*  Function to populate the arrays of AFFIL_TEAM and TEAM_LIST to act as a direct cache for the browser without having to parse the spreadsheet data over and over.
   This would speed up the pairingGenerator multiple calls to obtainDebater.
*/
function populateDebaterList(){
  var debaterSheet=ss.getSheetByName(SHEET_DEBATER);
  var rangeName = debaterSheet.getRange(3, 1, PLAYER_NUMBER,2);
  var nameFields = rangeName.getValues();
  for(i in nameFields){
    var row = String(nameFields[i][1]);
    var duplicate = false;
    for(j in TEAM_LIST){
      if(row == String(TEAM_LIST[j])){
        duplicate = true;
      }
      if(row==""){
        duplicate=true;
      }
    }
    if(!duplicate){
      TEAM_LIST.push(row);
      AFFIL_TEAM.push(String(nameFields[i][0]));
    }
  }
  
  
}


/*
*  Function to populate the arrays of AFFIL_ADJUDICATOR and ADJUDICATOR_LIST
*/
function populateAdjudicatorList(){
  var debaterSheet=ss.getSheetByName(SHEET_ADJU);
  var rangeName = debaterSheet.getRange(3,1,ADJUDICATOR_NUMBER,2);
  var nameFields = rangeName.getValues();
    for(i in nameFields){
    var row = String(nameFields[i][1]);
    var duplicate = false;
    for(j in ADJUDICATOR_LIST){
      if(row == String(ADJUDICATOR_LIST[j])){
        duplicate = true;
        throw "Adjudicator name: "+row +" isn't allowed to be registered multiple times";
      }
      if(row==""){
        duplicate=true;
      }
    }
    if(!duplicate){
      ADJUDICATOR_LIST.push(row);
      AFFIL_ADJUDICATOR.push(String(nameFields[i][0]));
    }
  }
  
}
/* 
*  Function to obtain affiliation of an adjudicator from Adjudicator list
*/
function obtainAffiliationAdjudicator(adjudicatorName){
  /*
  var debaterSheet=ss.getSheetByName(SHEET_ADJU);
  var rangeName = debaterSheet.getRange("A3:B");
  var nameFields = rangeName.getValues();
  var found=false;
  for(i in nameFields){
    if(String(nameFields[i][1])==String(adjudicatorName)){
      found=true;
      return nameFields[i][0];
    }
  }
  if(!found){
  throw "Error : Affiliation not found to adjudicator";
  }
  */
  var index=ADJUDICATOR_LIST.indexOf(String(adjudicatorName));
  if(index==-1){
     throw "Error : Affiliation not found to Adjudicator name " + adjudicatorName;
  }else{
    return AFFIL_ADJUDICATOR[index];
  }
}
/*
* Function to return integer between 0 and team number-1
*/
function randomIndexTeam(maxIndex)
{
  return Math.ceil(Math.random() *(Number(maxIndex)))-1;//Reducing 1 to team number because highest array index is TEAM_NUMBER-1
}


function pairingGenerator(round_number,quarter_number,sides_per_round,limit_inter){
  ROUND_NUMBER=Number(round_number);
  QUARTER_ROUND_NUMBER=Number(quarter_number);
  SIDES_PER_ROUND=Number(sides_per_round);
  LIMIT_INTER_AFF_ROUNDS=limit_inter;
  if(QUARTER_ROUND_NUMBER>ROUND_NUMBER){
    throw "quarter finals "+QUARTER_ROUND_NUMBER + " musn't be inferior to round number "+ROUND_NUMBER;
  }
  obtainNumberTeams();
  obtainNumberPlayers();
  obtainNumberRooms();
  obtainNumberAdjudicator();
  populateDebaterList();
  populateAdjudicatorList();
  var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
  var currentRound=scoreBoardSheet.getRange("C2").getValue();
  var RoundName= "Round " + Number(currentRound+1);
  if (currentRound==0&&SIDES_PER_ROUND==2) {
    if(TEAM_NUMBER%2!=0){
      throw "Team Number not divisible by 2"
  }
    createPairingSheet(RoundName);
    assignRooms(RoundName);    
    pairingZeroTwoSide(RoundName);
    assignAdjudicator2sides(RoundName);
    SpreadsheetApp.flush();
    /*
  TO DO : UPDATE ADJUDICATOR SMART FOR 2 
  */
} else if (currentRound==0&&SIDES_PER_ROUND==4) {
  if(TEAM_NUMBER%4!=0){
    throw "Team Number not divisible by 4"
  }
    createPairingSheet(RoundName);
    assignRooms(RoundName);   
    pairingZeroFourSide(RoundName);
    //assignAdjudicator4sides(RoundName);
  /*
  TO DO : UPDATE ADJUDICATOR SMART FOR 4
  */
  
} else if (currentRound>0&&currentRound<QUARTER_ROUND_NUMBER&&SIDES_PER_ROUND==2) {
  /*
  TO DO :
  FROM SCOREBOARD CREATE BRACKETS OF 2
  */
  createPairingSheet(RoundName);
  assignRooms(RoundName);
  pairingTwoSideScoreBoard(RoundName);
  assignAdjudicator2sides(RoundName);
  SpreadsheetApp.flush();
} else if (currentRound>0&&currentRound<QUARTER_ROUND_NUMBER&&SIDES_PER_ROUND==4){
  /*
  TO DO :
  FROM SCOREBOARD CREATE BRACKETS OF 4
  */
} else {//QUARTER ROUND && both types of side per round to be matched
  /*
  TO DO : CREATE BRACKET FINALS
  */
}
    
  
  
}


function dataIntegration(round_number,quarter_number,sides_per_round,limit_inter){
  ROUND_NUMBER=round_number;
  QUARTER_ROUND_NUMBER=quarter_number;
  SIDES_PER_ROUND=sides_per_round;
  LIMIT_INTER_AFF_ROUNDS=limit_inter;
  if(quarter_number>round_number){
    throw "quarter finals "+quarter_number + " musn't be inferior to round number "+round_number;
  }
  obtainNumberTeams();
  obtainNumberPlayers();
  obtainNumberAdjudicator();
  populateDebaterList();
  populateAdjudicatorList();
  var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
  var currentRound=scoreBoardSheet.getRange("C2").getValue();
  updateTeamToScoreboard(currentRound);
  updatePlayerToScoreboard(currentRound);
  if (currentRound<QUARTER_ROUND_NUMBER&&SIDES_PER_ROUND==2) {
   /*
   TO DO : UPDATE SCORE FROM PLAYERS AND TEAMS TO SCOREBOARD.
   UPDATE NUMBER OPP NUMBER GOV
   notes : use reusable code for lookup in scoreboard.
   */ 
   updateRound2Sides(currentRound);
   sortScoreBoard();
   scoreBoardSheet.getRange("C2").setValue(Number(currentRound+1)); 
   Browser.msgBox("Data Validated add-on switching to Round: "+Number(currentRound+1));
   SpreadsheetApp.flush();
} else if (currentRound<QUARTER_ROUND_NUMBER&&SIDES_PER_ROUND==4) {
   /*
   TO DO : UPDATE SCORE FROM PLAYERS AND TEAMS TO SCOREBOARD.
   UPDATE NUMBER OPP NUMBER GOV
   notes : use reusable code for lookup in scoreboard.
   */ 
   updateRound4Sides(currentRound);
   sortScoreBoard();
   scoreBoardSheet.getRange("C2").setValue(Number(currentRound+1));
   Browser.msgBox("Data Validated add-on switching to Round: "+Number(currentRound+1));
   SpreadsheetApp.flush();
} else {//QUARTER ROUND && both types of side per round to be matched

}
  
  
}


/*
var range = sheet.getRange(1, 1, 3);
 var values = range.getValues();

 // Prints 3 values from the first column, starting from row 1.
 for (var row in values) {
   for (var col in values[row]) {
     Logger.log(values[row][col]);
   }
 }
 */




/**
 * Sets the background colors for alternating rows within the range.
 * @param {Range} range The range to change the background colors of.
 * @param {string} oddColor The color to apply to odd rows (relative to the
 *     start of the range).
 * @param {string} evenColor The color to apply to even rows (relative to the
 *     start of the range).
 */
function setAlternatingRowBackgroundColors_(range, oddColor, evenColor) {
  var backgrounds = [];
  for (var row = 1; row <= range.getNumRows(); row++) {
    var rowBackgrounds = [];
    for (var column = 1; column <= range.getNumColumns(); column++) {
      if (row % 2 == 0) {
        rowBackgrounds.push(evenColor);
      } else {
        rowBackgrounds.push(oddColor);
      }
    }
    backgrounds.push(rowBackgrounds);
  }
  range.setBackgrounds(backgrounds);
}
/*
  // First clear the results sheet and all formatting
  sheetResults.clear();

  var upperPower = Math.ceil(Math.log(numPlayers) / Math.log(2));

  // Find out what is the number that is a power of 2 and lower than numPlayers.
  var countNodesUpperBound = Math.pow(2, upperPower);

  // Find out what is the number that is a power of 2 and higher than numPlayers.
  var countNodesLowerBound = countNodesUpperBound / 2;

  // This is the number of nodes that will not show in the 1st level.
  var countNodesHidden = numPlayers - countNodesLowerBound;

  // Enter the players for the 1st round
  var currentPlayer = 0;
  for (var i = 0; i < countNodesLowerBound; i++) {
    if (i < countNodesHidden) {
      // Must be on the first level
      var rng = sheetResults.getRange(i * 4 + 1, 1);
      setBracketItem_(rng, players);
      setBracketItem_(rng.offset(2, 0, 1, 1), players);
      setConnector_(sheetResults, rng.offset(0, 1, 3, 1));
      setBracketItem_(rng.offset(1, 2, 1, 1));
    } else {
      // This player gets a bye
      setBracketItem_(sheetResults.getRange(i * 4 + 2, 3), players);
    }
  }

  // Now fill in the rest of the bracket
  upperPower--;
  for (var i = 0; i < upperPower; i++) {
    var pow1 = Math.pow(2, i + 1);
    var pow2 = Math.pow(2, i + 2);
    var pow3 = Math.pow(2, i + 3);
    for (var j = 0; j < Math.pow(2, upperPower - i - 1); j++) {
      setBracketItem_(sheetResults.getRange((j * pow3) + pow2, i * 2 + 5));
      setConnector_(sheetResults, sheetResults.getRange((j * pow3) + pow1, i * 2 + 4, pow2 + 1, 1));
    }
  }
}

// Sets the value of an item in the bracket and the color.
function setBracketItem_(rng, players) {
  if (players) {
    var rand = Math.ceil(Math.random() * players.length);
    rng.setValue(players.splice(rand - 1, 1)[0][0]);
  }
  rng.setBackgroundColor('yellow');
}

// Sets the color and width for connector cells.
function setConnector_(sheet, rng) {
  sheet.setColumnWidth(rng.getColumnIndex(), CONNECTOR_WIDTH);
  rng.setBackgroundColor('green');
}
*/
