
n to initialise the spreadsheet debater
 */
  function generateSheetDebater (){
    createSheet(SHEET_DEBATER);
    SpreadsheetApp.flush();
  }
/*
 * function to initialise the spreadsheet Room
 */
function generateSheetRoom (){
    createSheet(SHEET_ROOM);
    SpreadsheetApp.flush();
    validateRoom();
  }
/*
 * function to initialise the spreadsheet adjudicator
 */
function generateSheetAdjudicator (){
    createSheet(SHEET_ADJU);
    SpreadsheetApp.flush();
    validateAdjudicator();
  }
/*
 * function to create the sheet with the name in parameter
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createSheet(sheetName){
    var directionsSheet = ss.getSheetByName(sheetName);
   if (directionsSheet) {
    throw "Sheet " + sheetName + " already exists !";
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
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A3:E1000"), '#ffffff', '#eeeeee');
        break;
    case SHEET_ADJU :
        directionsSheet.getRange(1, 1, headersAdjudicator.length, 3).setValues(headersAdjudicator);
        directionsSheet.setColumnWidth(1, 200);directionsSheet.setColumnWidth(2, 200);
        directionsSheet.setColumnWidth(3, 200);
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A3:C1000"), '#ffffff', '#eeeeee');
        break;
    case SHEET_ROOM :
        directionsSheet.getRange(1, 1, headersRoom.length, 2).setValues(headersRoom);
        directionsSheet.setColumnWidth(1, 200);directionsSheet.setColumnWidth(2, 200);
        setAlternatingRowBackgroundColors_(directionsSheet.getRange("A3:B200"), '#ffffff', '#eeeeee');
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
* Function to set configuration into the scoreboard sheet.
*/
function setConfiguration()
{
   var scoreboard = ss.getSheetByName(SHEET_SCOREBOARD);
   var data = scoreboard.getRange("B4:E");
   scoreboard.getRange("B4:E").setData();
}

/*
 * function to create the sheet that
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createScoreboardSheet(){
    var directionsSheet = ss.getSheetByName(SHEET_SCOREBOARD);
   if (directionsSheet) {
    throw "Sheet " + SHEET_SCOREBOARD + " already exists !";
  } else {
    directionsSheet =
        ss.insertSheet(SHEET_SCOREBOARD, ss.getNumSheets());
  }
    var headersScoreboardside2 = [
    ['Scoreboard', '', '','','',''],['Rounds registered', '', '0','','',''],
      ['Affiliation','Team Name', 'Aggregate Score','Performance Average','Side Gov number','Side OPP number']
  ];
   var headersScoreboardside4 = [
    ['Scoreboard', '', '','','','','',''],['Rounds registered', '', '','0','','','',''],
      ['Affiliation','Team Name', 'Aggregate Score','Performance Average','Open Gov number','Open OPP number','Close Gov number','Close Opp number']
  ];
  if( SIDES_PER_ROUND==2)
  {
  // Format the new sheet for 2 side
    directionsSheet.getRange(1, 1, headersScoreboardside2.length, 6).setValues(headersScoreboardside2);
    directionsSheet.setColumnWidth(1, 250);directionsSheet.setColumnWidth(2, 250);directionsSheet.setColumnWidth(3, 200);
    directionsSheet.setColumnWidth(4, 200); directionsSheet.setColumnWidth(5, 150);
    directionsSheet.setColumnWidth(6, 150);directionsSheet.setColumnWidth(7, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,TEAM_NUMBER,6), '#ffffff', '#eeeeee');
  }
   else{
    // Format applied for 4 side
    directionsSheet.getRange(1, 1, headersScoreboardside4.length, 8).setValues(headersScoreboardside4);
    directionsSheet.setColumnWidth(1, 250);directionsSheet.setColumnWidth(2, 250);directionsSheet.setColumnWidth(3, 200);
    directionsSheet.setColumnWidth(4, 200); directionsSheet.setColumnWidth(5, 150);
    directionsSheet.setColumnWidth(6, 150);directionsSheet.setColumnWidth(7, 150); directionsSheet.setColumnWidth(8, 150);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,TEAM_NUMBER,8), '#ffffff', '#eeeeee');
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
    /*var data = scoreboard.getRange("C4:G");
   
    rule = SpreadsheetApp.newDataValidation()
     .requireNumberGreaterThanOrEqualTo(0)
     .setAllowInvalid(false)
     .setHelpText('Number must be superior to 0')
     .build();
    data.setDataValidation(rule);*/
   
    // Validation of scoreboard number data.  
}

/*
 * function to force specific number values for numeric assigned data in the spreadsheet adjudicator and room.
 */
function validateRoom() {
  // Set a rule for the cell B4 to be a number between 1 and 100.
  var room = ss.getSheetByName(SHEET_ROOM);
  cell = room.getRange('B3:B');
  rule = SpreadsheetApp.newDataValidation()
     .requireNumberBetween(1, 3)
     .setAllowInvalid(false)
     .setHelpText('Number must be between 1 and 3. 1 small - 3 Big')
     .build();
  cell.setDataValidation(rule);
}
/*
 * function to force specific number values for numeric assigned data in the spreadsheet adjudicator
 */
function validateAdjudicator(){
 var adju = ss.getSheetByName(SHEET_ADJU);
  var cell = adju.getRange('C3:C');
  var rule = SpreadsheetApp.newDataValidation()
     .requireNumberBetween(1, 3)
     .setAllowInvalid(false)
     .setHelpText('Number must be between 1 and 3. 1 New - 3 Experienced')
     .build();
  cell.setDataValidation(rule);
}


/*
/*
 * function to create the sheet to track TeamStats
 * @param {string} sheetName name of the sheet to create and add or clear if existing.
 */
 function createTeamStatsSheet(){
    var directionsSheet = ss.getSheetByName(SHEET_TEAMSTATS);
   if (directionsSheet) {
     throw "Sheet " + SHEET_TEAMSTATS + " already exists !";
  } else {
    directionsSheet =
        ss.insertSheet(SHEET_TEAMSTATS, ss.getNumSheets());
  }
    var headersTeamStats = [
    ['TeamStats'],
      ['Team Name']
  ];
    directionsSheet.getRange(1, 1, headersTeamStats.length, 1).setValues(headersTeamStats);
    directionsSheet.setColumnWidth(1, 300);
   var roundName;
   for (var i = 1; i <= ROUND_NUMBER; i++) {
     roundName = 'Round ' + i;
     directionsSheet.getRange(2, i+1).setValue(roundName);
     directionsSheet.setColumnWidth(i+1, 100);
    }
    var controlRound = Number(ROUND_NUMBER)+1;// Adding 1 to rounder number to account for team name column.
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,TEAM_NUMBER,controlRound), '#ffffff', '#eeeeee');
    directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
    directionsSheet.getRange('A1:B1').setFontSize(25); 
    directionsSheet.getRange('A1:2').setFontWeight('bold'); 
    directionsSheet.getRange(2,1,TEAM_NUMBER,controlRound).setVerticalAlignment('top');
    directionsSheet.getRange(2,1,TEAM_NUMBER,controlRound).setHorizontalAlignment('left');
    directionsSheet.getRange(2,1,TEAM_NUMBER,controlRound).setNumberFormat('0');
    directionsSheet.setFrozenRows(2);
    var data = directionsSheet.getRange(3,2,TEAM_NUMBER,ROUND_NUMBER);
    rule = SpreadsheetApp.newDataValidation()
     .requireNumberGreaterThanOrEqualTo(0)
     .setAllowInvalid(false)
     .setHelpText('Number must be superior to 0')
     .build();
    data.setDataValidation(rule);
    // Validation of scoreboard number data.  
}
/* function to create the spreadsheet PlayerStats
*/
function createPlayerStatsSheet(){
    var directionsSheet = ss.getSheetByName(SHEET_PLAYERSTATS);
   if (directionsSheet) {
    throw "Sheet " + SHEET_PLAYERSTATS + " already exists !";
  } else {
    directionsSheet =
        ss.insertSheet(SHEET_PLAYERSTATS, ss.getNumSheets());
  }
    var headersPlayerStats = [
    ['PlayerStats'],
      ['Debater Name']
  ];
    directionsSheet.getRange(1, 1, headersPlayerStats.length, 1).setValues(headersPlayerStats);
    directionsSheet.setColumnWidth(1, 300);
   var roundName;
   for (var i = 1; i <= ROUND_NUMBER; i++) {
     roundName = 'Round ' + i;
     directionsSheet.getRange(2, i+1).setValue(roundName);
     directionsSheet.setColumnWidth(i+1, 100);
    }
    var controlRound = Number(ROUND_NUMBER)+1;// Adding 1 to rounder number to account for team name column.
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,PLAYER_NUMBER,controlRound), '#ffffff', '#eeeeee');
    directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
    directionsSheet.getRange('A1:B1').setFontSize(25); 
    directionsSheet.getRange('A1:2').setFontWeight('bold'); 
    directionsSheet.getRange(2,1,PLAYER_NUMBER,controlRound).setVerticalAlignment('top');
    directionsSheet.getRange(2,1,PLAYER_NUMBER,controlRound).setHorizontalAlignment('left');
    directionsSheet.getRange(2,1,PLAYER_NUMBER,controlRound).setNumberFormat('0');
    directionsSheet.setFrozenRows(2);
    var data = directionsSheet.getRange(3,2,PLAYER_NUMBER,ROUND_NUMBER);
    rule = SpreadsheetApp.newDataValidation()
     .requireNumberGreaterThanOrEqualTo(0)
     .setAllowInvalid(false)
     .setHelpText('Number must be superior to 0')
     .build();
    data.setDataValidation(rule);
    // Validation of scoreboard number data.  
}
function createPairingSheet(pairingName){
    var directionsSheet = ss.getSheetByName(pairingName);
   if (directionsSheet) {
    throw "Sheet " + pairingName + " already exists !";
  } else {
    directionsSheet =
        ss.insertSheet(pairingName, ss.getNumSheets());
  }
    directionsSheet.getRange(1, 1, 1, 1).setValue(pairingName);
    directionsSheet.setColumnWidth(1, 250);
    directionsSheet.getRange('A1:B1').merge().setBackground('#ddddee');
    directionsSheet.getRange('A1:B1').setFontSize(25); 
    directionsSheet.getRange('A1:2').setFontWeight('bold');
     var headersPairingside2 = [['Room', 'Government', 'Opposition','Adjudicator']];;
    var headersPairingside4 =  [['Room', 'Opening Government', 'Opening Opposition','Closing Government','Closing Opposition','Adjudicator']];
    if(SIDES_PER_ROUND==2)
    {
     directionsSheet.getRange(2, 1, headersPairingside2.length, 4).setValues(headersPairingside2);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,Number(TEAM_NUMBER/2),4), '#ffffff', '#eeeeee');  
    directionsSheet.getRange(2,1,Number(TEAM_NUMBER/2),4).setVerticalAlignment('top');
    directionsSheet.getRange(2,1,Number(TEAM_NUMBER/2),4).setHorizontalAlignment('left');
    directionsSheet.setColumnWidth(2, 250);directionsSheet.setColumnWidth(3, 250);directionsSheet.setColumnWidth(4, 350);
    }else {
    directionsSheet.getRange(2, 1, headersPairingside4.length, 6).setValues(headersPairingside4);
    setAlternatingRowBackgroundColors_(directionsSheet.getRange(3,1,Number(TEAM_NUMBER/4),6), '#ffffff', '#eeeeee');  
    directionsSheet.getRange(2,1,Number(TEAM_NUMBER/4),6).setVerticalAlignment('top');
    directionsSheet.getRange(2,1,Number(TEAM_NUMBER/4),6).setHorizontalAlignment('left');
    directionsSheet.setColumnWidth(2, 250);directionsSheet.setColumnWidth(3, 250);directionsSheet.setColumnWidth(4, 250);
    directionsSheet.setColumnWidth(5, 250);directionsSheet.setColumnWidth(6, 350);
    }
    directionsSheet.setFrozenRows(2);  
}
/*
* Function to set in scoreboard the reduced affiliation list next to unique team list
*
*/
function setReducedAffList()
{ 
   var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
   var range = scoreBoardSheet.getRange(4, 2, TEAM_NUMBER);
   var data = range.getValues();
   var reduced_affiliation=createArray(TEAM_NUMBER,1);
   for(var i in data)
   {
     reduced_affiliation[i][0]=obtainAffiliationDebater(data[i]);
   }
  ss.getSheetByName(SHEET_SCOREBOARD).getRange(4,1,reduced_affiliation.length,1).setValues(reduced_affiliation);
}

/*
function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}*/

