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



// This method adds a custom menu item to run the script
function onOpen() {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addSeparator()
      .addItem('Format sheets', 'generateInitialSheets')
      .addToUi();
}

// This method creates the brackets based on the data provided on the players
function acquireData(round_number,quarter_number,sides_per_round,limit_inter) {
  // Data integrity is done by the javascript and html
  ROUND_NUMBER=round_number;
  QUARTER_ROUND_NUMBER=quarter_number;
  SIDES_PER_ROUND=sides_per_round;
  LIMIT_INTER_AFF_ROUNDS=limit_inter;
  // var ControlMessage = "ROUND " + ROUND_NUMBER + " QUARTER " + QUARTER_ROUND_NUMBER + " SIDES " + SIDES_PER_ROUND + "LIMIT " + LIMIT_INTER_AFF_ROUNDS; 
  // Browser.msgBox(ControlMessage);
  createScoreboardSheet();
  SpreadsheetApp.flush();
  //copyValuesToRange(sheet, column, columnEnd, row, rowEnd)
  //ss.getSheetByName(SHEET_DEBATER).getRange("B3:B").copyTo(ss.getSheetByName(SHEET_SCOREBOARD).getRange("A4"), {contentsOnly:true});
  removeDuplicatesCopy(SHEET_DEBATER,SHEET_SCOREBOARD,'B3:B','A4:A');
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
    if (!elements[i][0] || elements[i][0].length == 0) {
      break;
    }
    numElements++;
  }
  elements = elements.slice(0, numElements);
  return elements;
  }
/*
 * function to create the sheet with the name in parameter
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createSheet(sheetName){
    var directionsSheet = ss.getSheetByName(sheetName);
   if (directionsSheet) {
    var ErrorMessage = "Sheet " + sheetName + " already exists !"; 
    Browser.msgBox(ErrorMessage);
    return;
  } else {
    directionsSheet =
        ss.insertSheet(sheetName, ss.getNumSheets());
  }
    var headersDebater = [
    ['Debater List', '', '','',''],
    ['Affiliation', 'Team Name','Name','Email','Paid-Status']
  ];
      
  var headersAdjudicator = [
    ['Adjudicator List', '',''],
    ['Affiliation','Name','Experience']
  ];
  var headersRoom = [
    ['Room List', ''],
    ['Room Name', 'Added Value']
  ];
   
  // Format the new sheet.
  switch(sheetName) {
    case SHEET_DEBATER :
        directionsSheet.getRange(1, 1, headersDebater.length, 5).setValues(headersDebater);
        directionsSheet.setColumnWidth(1, 200);directionsSheet.setColumnWidth(2, 200);
        directionsSheet.setColumnWidth(3, 200); directionsSheet.setColumnWidth(4, 200);
        directionsSheet.setColumnWidth(5, 200);
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:E1000"), '#ffffff', '#eeeeee');
        break;
    case SHEET_ADJU :
        directionsSheet.getRange(1, 1, headersAdjudicator.length, 3).setValues(headersAdjudicator);
        directionsSheet.setColumnWidth(1, 200);directionsSheet.setColumnWidth(2, 200);
        directionsSheet.setColumnWidth(3, 200);
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:C1000"), '#ffffff', '#eeeeee');
        break;
    case SHEET_ROOM :
        directionsSheet.getRange(1, 1, headersRoom.length, 2).setValues(headersRoom);
        directionsSheet.setColumnWidth(1, 200);directionsSheet.setColumnWidth(2, 200);
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:B200"), '#ffffff', '#eeeeee');
        break;
    default:
        Browser.msgBox("sheetName Invalid");        
        return;
}
  directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
  directionsSheet.getRange('A1:B1').setFontSize(20);
  directionsSheet.getRange('A1:2').setFontWeight('bold');  
  directionsSheet.getRange('A2:F').setVerticalAlignment('top');
  directionsSheet.getRange('A2:F').setHorizontalAlignment('left');
  directionsSheet.getRange('A2:F').setNumberFormat('0');
  directionsSheet.setFrozenRows(2);
   
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
      if(row.join() == newData[j].join()||row.length==0||!row){
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
 * function to create the sheet that
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createScoreboardSheet(){
    var directionsSheet = ss.getSheetByName(SHEET_SCOREBOARD);
   if (directionsSheet) {
    var ErrorMessage = "Sheet " + SHEET_SCOREBOARD + " already exists !"; 
    Browser.msgBox(ErrorMessage);
    return;
  } else {
    directionsSheet =
        ss.insertSheet(SHEET_SCOREBOARD, ss.getNumSheets());
  }
    var headersScoreboardside2 = [
    ['Scoreboard', '', '','',''],['Rounds registered', '', '0','',''],
      ['Team Name', 'Aggregate Score','Performance Average','Side Gov number','Side OPP number']
  ];
   var headersScoreboardside4 = [
    ['Scoreboard', '', '','','','',''],['Rounds registered', '', '','0','','',''],
      ['Team Name', 'Aggregate Score','Performance Average','Open Gov number','Open OPP number','Close Gov number','Close Opp number']
  ];
  if( SIDES_PER_ROUND==2)
  {
  // Format the new sheet for 2 side
    directionsSheet.getRange(1, 1, headersScoreboardside2.length, 5).setValues(headersScoreboardside2);
    directionsSheet.setColumnWidth(1, 300);directionsSheet.setColumnWidth(2, 200);
    directionsSheet.setColumnWidth(3, 200); directionsSheet.setColumnWidth(4, 150);
    directionsSheet.setColumnWidth(5, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:E1000"), '#ffffff', '#eeeeee');
  }
   else{
    // Format applied for 4 side
    directionsSheet.getRange(1, 1, headersScoreboardside4.length, 7).setValues(headersScoreboardside4);
    directionsSheet.setColumnWidth(1, 300);directionsSheet.setColumnWidth(2, 200);
    directionsSheet.setColumnWidth(3, 200); directionsSheet.setColumnWidth(4, 150);
    directionsSheet.setColumnWidth(5, 150);directionsSheet.setColumnWidth(6, 150); directionsSheet.setColumnWidth(7, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:G1000"), '#ffffff', '#eeeeee');
   }
    directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
    directionsSheet.getRange('A2:B2').merge().setBackground('#eeeeee');
    directionsSheet.getRange('C2:D2').merge().setBackground('#ffffff');
    directionsSheet.getRange('A1:D2').setFontSize(20);
    directionsSheet.getRange('A1:3').setFontWeight('bold'); 
    directionsSheet.getRange('A2:G').setVerticalAlignment('top');
    directionsSheet.getRange('A2:G').setHorizontalAlignment('left');
    directionsSheet.getRange('A2:G').setNumberFormat('0');
    directionsSheet.setFrozenRows(3);
    var scoreboard = ss.getSheetByName(SHEET_SCOREBOARD);
    var data = scoreboard.getRange("B4:E");
    rule = SpreadsheetApp.newDataValidation()
     .requireNumberGreaterThanOrEqualTo(0)
     .setAllowInvalid(false)
     .setHelpText('Number must be superior to 0')
     .build();
    data.setDataValidation(rule);
   
    // Validation of scoreboard number data.  
}

/*
/*
 * function to create the sheet to track TeamStats
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createTeamStatsSheet(){
    var directionsSheet = ss.getSheetByName(SHEET_TEAMSTATS);
   if (directionsSheet) {
    var ErrorMessage = "Sheet " + SHEET_TEAMSTATS + " already exists !"; 
    Browser.msgBox(ErrorMessage);
    return;
  } else {
    directionsSheet =
        ss.insertSheet(SHEET_TEAMSTATS, ss.getNumSheets());
  }
    var headersScoreboardside2 = [
    ['TeamStats', '', '','',''],
      ['Team Name', 'Aggregate Score','Performance Average','Side Gov number','Side OPP number']
  ];
   var headersScoreboardside4 = [
    ['TeamStats', '', '','','','',''],
      ['Team Name', 'Aggregate Score','Performance Average','Open Gov number','Open OPP number','Close Gov number','Close Opp number']
  ];
  if( SIDES_PER_ROUND==2)
  {
  // Format the new sheet for 2 side
    directionsSheet.getRange(1, 1, headersScoreboardside2.length, 5).setValues(headersScoreboardside2);
    directionsSheet.setColumnWidth(1, 300);directionsSheet.setColumnWidth(2, 200);
    directionsSheet.setColumnWidth(3, 200); directionsSheet.setColumnWidth(4, 150);
    directionsSheet.setColumnWidth(5, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:E1000"), '#ffffff', '#eeeeee');
  }
   else{
    // Format applied for 4 side
    directionsSheet.getRange(1, 1, headersScoreboardside4.length, 7).setValues(headersScoreboardside4);
    directionsSheet.setColumnWidth(1, 300);directionsSheet.setColumnWidth(2, 200);
    directionsSheet.setColumnWidth(3, 200); directionsSheet.setColumnWidth(4, 150);
    directionsSheet.setColumnWidth(5, 150);directionsSheet.setColumnWidth(6, 150); directionsSheet.setColumnWidth(7, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange("A1:G1000"), '#ffffff', '#eeeeee');
   }
    directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
    directionsSheet.getRange('A2:B2').merge().setBackground('#eeeeee');
    directionsSheet.getRange('C2:D2').merge().setBackground('#ffffff');
    directionsSheet.getRange('A1:D2').setFontSize(20);
    directionsSheet.getRange('A1:3').setFontWeight('bold'); 
    directionsSheet.getRange('A2:G').setVerticalAlignment('top');
    directionsSheet.getRange('A2:G').setHorizontalAlignment('left');
    directionsSheet.getRange('A2:G').setNumberFormat('0');
    directionsSheet.setFrozenRows(3);
    var scoreboard = ss.getSheetByName(SHEET_SCOREBOARD);
    var data = scoreboard.getRange("B4:E");
    rule = SpreadsheetApp.newDataValidation()
     .requireNumberGreaterThanOrEqualTo(0)
     .setAllowInvalid(false)
     .setHelpText('Number must be superior to 0')
     .build();
    data.setDataValidation(rule);
   
    // Validation of scoreboard number data.  
}
 /*
 * function to initialise the spreadsheets to acquire data.
 */
  function generateInitialSheets (){
    createSheet(SHEET_DEBATER);
    createSheet(SHEET_ROOM);
    createSheet(SHEET_ADJU);
    SpreadsheetApp.flush();
    validateRoomAdju();
  }
/*
 * function to force specific number values for numeric assigned data in the spreadsheet adjudicator and room.
 */
function validateRoomAdju() {
  // Set a rule for the cell B4 to be a number between 1 and 100.
  var adju = ss.getSheetByName(SHEET_ADJU);
  var room = ss.getSheetByName(SHEET_ROOM)
  var cell = adju.getRange('C3:C');
  var rule = SpreadsheetApp.newDataValidation()
     .requireNumberBetween(1, 3)
     .setAllowInvalid(false)
     .setHelpText('Number must be between 1 and 3. 1 New - 3 Experienced')
     .build();
  cell.setDataValidation(rule);
  cell = room.getRange('B3:B');
  rule = SpreadsheetApp.newDataValidation()
     .requireNumberBetween(1, 3)
     .setAllowInvalid(false)
     .setHelpText('Number must be between 1 and 3. 1 small - 3 Big')
     .build();
  cell.setDataValidation(rule);
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
