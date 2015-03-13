/*
* Function to obtain the number of rounds where it will be impossible to get non affiliated matches
*/
function nonAffiliatedMatches(RepresentativeArray,nb_Team){
  var non_affiliated_rounds;
  var limiting_value=Number(RepresentativeArray[0][1]+1);//Array is sorted
  var groups=Number(nb_Team/SIDES_PER_ROUND);
   if(limiting_value>groups)
  {
    non_affiliated_rounds=Math.ceil((limiting_value-groups)/SIDES_PER_ROUND);
  }
  else if(limiting_value==groups){
    non_affiliated_rounds=1;
  }
    else{
    non_affiliated_rounds=0;
    }
  return non_affiliated_rounds;
}

/*
* Function to obtain a sorted two dimentional array of highest affiliated teams with associated numbers
*/
function obtainAffiliationNumbers()
{
  var sheet = ss.getSheetByName(SHEET_SCOREBOARD);
  var data = sheet.getRange(4,1,TEAM_NUMBER,1).getValues();
  createArray(TEAM_NUMBER,2);
  var newData = createArray(TEAM_NUMBER,2);
  var index=0;
  for(i in data){
    var row = data[i];
    var found=false;
    for(var j=0;j<(TEAM_NUMBER);j++){
      if(row.toString() == String(newData[j][0])){
        found=true;
        newData[j][1]=Number(newData[j][1])+1;
        break;
      }
    }
    if(!found){
     newData[index][0]=row.toString();
     newData[index][1]=Number(0);
     index++;
    }
  }
  newData.sort(function(a, b){return b[1]-a[1]});
  return newData;
}
/*
* Function to obtain partial a sorted two dimentional array of highest affiliated teams with associated numbers to range starting by initRow and numRow
*/
function obtainPartialAffiliationNumbers(initrow,numRow){
  var sheet = ss.getSheetByName(SHEET_SCOREBOARD);
  var data = sheet.getRange(initrow+4,1,numRow,1).getValues();
  createArray(numRow,2);
  var newData = createArray(numRow,2);
  var index=0;
  for(i in data){
    var row = data[i];
    var found=false;
    for(var j=0;j<(numRow);j++){
      if(row.toString() == String(newData[j][0])){
        found=true;
        newData[j][1]=Number(newData[j][1])+1;
        break;
      }
    }
    if(!found){
     newData[index][0]=row.toString();
     newData[index][1]=Number(0);
     index++;
    }
  }
  newData.sort(function(a, b){return b[1]-a[1]});
  return newData;
}
/*
* Function to obtain a team with affiliation to most represented affiliation in tournament and remove it from the array affiliated.
* mostRepresented represents the teams in order of presence non assigned yet.
*/
function findTeamRepresented(mostRepresented,values){
  var AffilName;
  var teamName;
  if(Number(mostRepresented[0][1])==0){
    AffilName=String(mostRepresented.shift()[0]);
  }else{
    AffilName=String(mostRepresented[0][0]);
    mostRepresented[0][1]=Number(mostRepresented[0][1])-1;
  }
  mostRepresented.sort(function(a, b){return b[1]-a[1]});
  for (var row in values) {
    if(obtainAffiliationDebater(values[row])==AffilName){
    return values[row];
    }
  }
  throw "Unexpected result in function findTeamRepresented";
}
/*
*  This function removes 1 to the affiliation in mostRepresented of the team randomly selected in parameter.
*/
function updateRepresented(mostRepresented,teamRandomSelected){
    var AffilName=obtainAffiliationDebater(teamRandomSelected);
    for (var row in mostRepresented) {
    if(String(mostRepresented[row][0])==AffilName&&mostRepresented[row][1]==0){
      mostRepresented.splice(row,1);
    }
     else if(String(mostRepresented[row][0])==AffilName&&mostRepresented[row][1]>0){
      mostRepresented[row][1]=Number(mostRepresented[row][1]-1);  
     }
  }
  mostRepresented.sort(function(a, b){return b[1]-a[1]});
}
/*
*  This function returns the bracket size from currentRow
*/
function obtainBracketSize(dataGrid,currentRow){
  var aggregateCurrent=dataGrid[currentRow][2];
  var bracketSize=SIDES_PER_ROUND;
  while(Number(currentRow+bracketSize)<TEAM_NUMBER&&aggregateCurrent==dataGrid[currentRow+bracketSize][2]){
    bracketSize+=SIDES_PER_ROUND;
  }
  return bracketSize;
}
/*
* Function to handle pairing of round zero with two sides.
*/
function pairingZeroTwoSide(RoundName) {
    var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
    var range = scoreBoardSheet.getRange(4, 2, TEAM_NUMBER);
   var values = range.getValues();
   shuffleArray(values);
   var rand;
   var properOpponent;
   var govIndex=0;
   var newGov = [];
   var newOpp = [];
  var itr=TEAM_NUMBER*40;
  var RepresentativeArray=obtainAffiliationNumbers();
  var non_affiliated_rounds=nonAffiliatedMatches(RepresentativeArray,TEAM_NUMBER);
   while(values.length>Number(non_affiliated_rounds*2)&&LIMIT_INTER_AFF_ROUNDS)
   {
     rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));// assignation before looping on random values
     properOpponent=false;
     var random = Math.ceil(Math.random() *2 );//To allow most represented to be opposition and gov
     if(random%2==0){
     newGov.push(values[rand]);
     values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length);
       if(obtainAffiliationDebater(newGov[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);// Counterpart to keep findTeamRepresented from getting out of sync with the values array.
         newOpp.push(values[rand]);
         values.splice(rand,1);
         govIndex+=1;
         properOpponent=true;
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when randomness doesnt prioritize spreading big teams.
     }
     }
     else{
       newOpp.push(values[rand]);
       values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length);
       if(obtainAffiliationDebater(newOpp[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);// Counterpart to keep findTeamRepresented from getting out of sync with the values array
         newGov.push(values[rand]);
         values.splice(rand,1);
         govIndex+=1;
         properOpponent=true;
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when unforseen bugs occur.
     }
     }
   }
   for (var row in values) {
     var rand = Math.ceil(Math.random() *2 );//(Number(TEAM_NUMBER))
     if(rand%2==0&&newGov.length<Number(TEAM_NUMBER/2)){
     newGov.push(values[row]);
     }
     else if(newOpp.length<Number(TEAM_NUMBER/2)){
     newOpp.push(values[row]);
     }
     else{
     newGov.push(values[row]);
     }
   }
    ss.getSheetByName(RoundName).getRange(3, 2,newGov.length,1).setValues(newGov);
    ss.getSheetByName(RoundName).getRange(3, 3,newOpp.length,1).setValues(newOpp);
}
/*
* Function to handle pairing of round 1 to quarterRound-1 with two sides.
*/
function pairingTwoSideScoreBoard(RoundName){
  var remainingPairings=TEAM_NUMBER;
  var currentRow=0;
  var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
  var range = scoreBoardSheet.getRange(4, 1, TEAM_NUMBER,6);
  var dataGrid = range.getValues();//Data sorted
  var bracketSize;
  var rand;
  var properOpponent;
  var govIndex=0;
  var newGov = [];
  var newOpp = [];
  var itr=TEAM_NUMBER*40;
  var values;
  while(remainingPairings>0){
  bracketSize=obtainBracketSize(dataGrid,currentRow);
  values=scoreBoardSheet.getRange(currentRow+4, 2, bracketSize).getValues();
  var RepresentativeArray=obtainPartialAffiliationNumbers(currentRow,bracketSize);
  var non_affiliated_rounds=nonAffiliatedMatches(RepresentativeArray,bracketSize);
   while(values.length>Number(non_affiliated_rounds*2)&&LIMIT_INTER_AFF_ROUNDS){
     rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));// assignation before looping on random values
     properOpponent=false;
     var random = Math.ceil(Math.random() *2 );//To allow most represented to be opposition and gov
     if(random%2==0){
     newGov.push(values[rand]);
     values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length);
       if(obtainAffiliationDebater(newGov[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);// Counterpart to keep findTeamRepresented from getting out of sync with the values array.
         newOpp.push(values[rand]);
         values.splice(rand,1);
         govIndex+=1;
         properOpponent=true;
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when randomness doesnt prioritize spreading big teams.
     }
     }
     else{
       newOpp.push(values[rand]);
       values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length);
       if(obtainAffiliationDebater(newOpp[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);// Counterpart to keep findTeamRepresented from getting out of sync with the values array
         newGov.push(values[rand]);
         values.splice(rand,1);
         govIndex+=1;
         properOpponent=true;
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when unforseen bugs occur.
     }
     }
   }
   for (var row=0;row<values.length;row+=2) {
     var rand = Math.ceil(Math.random() *2 );
     if(rand==1){
     newGov.push(values[row]);
     newOpp.push(values[row+1]);  
     }
     else{
     newOpp.push(values[row]);
     newGov.push(values[row+1])
     }
   }
   currentRow=currentRow+bracketSize;
   remainingPairings=remainingPairings-bracketSize;   
  }
  control2Sides(dataGrid,newGov,newOpp);
  ss.getSheetByName(RoundName).getRange(3, 2,newGov.length,1).setValues(newGov);
  ss.getSheetByName(RoundName).getRange(3, 3,newOpp.length,1).setValues(newOpp);
  
}
/* function to inverse gov and opp selected depending on number of times they have been opposition/gov.
*
*
*/
function control2Sides(dataGrid,newGov,newOpp){
  var indexGov;
  var indexOpp;
  var deficiencyGov;
  var deficiencyOpp;
  var temp;
  var deficiencyTeams=createArray(2,TEAM_NUMBER);
  for(var i=0;i<TEAM_NUMBER;i++){
    deficiencyTeams[0][i]=String(dataGrid[i][1]);
    deficiencyTeams[1][i]=Number(dataGrid[i][4]-dataGrid[i][5]);
  }
  for(var i=0;i<newGov.length;i++){
  indexGov=deficiencyTeams[0].indexOf(String(newGov[i]));
  indexOpp=deficiencyTeams[0].indexOf(String(newOpp[i]));  
    if(indexGov==-1||indexOpp==-1){
      throw "Error : Invalid state function control2sides";
    }else{
      if(Number(deficiencyTeams[1][indexGov])>Number(deficiencyTeams[1][indexOpp])){
      temp=newGov[i];
      newGov[i]=newOpp[i];
      newOpp[i]=temp;
      }
    }
  }
  
  
  
}


/*
* Function to handle pairing 0 for four sides
*/
function pairingZeroFourSide(RoundName){
  var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
   var range = scoreBoardSheet.getRange(4, 2, TEAM_NUMBER);
   var values = range.getValues();
   shuffleArray(values);
   var rand;
   var rand2;
   var rand3;
   var rand4;
   var teamname_rand;
   var teamname_rand2;
   var teamname_rand3;
   var teamname_rand4;
   var OpeGov = [];
   var CloGov = [];
   var OpeOpp = [];
   var CloOpp = [];
   var itr=TEAM_NUMBER*80;
   var RepresentativeArray=obtainAffiliationNumbers();
   var non_affiliated_rounds=nonAffiliatedMatches(RepresentativeArray,TEAM_NUMBER);
   if(LIMIT_INTER_AFF_ROUNDS){
   rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));
   while(values.length>Number(non_affiliated_rounds*4)){
     var random = Math.ceil(Math.random()*4 );//To allow most represented to be opposition and gov
     //rand= randomIndexTeam(values.length);
     rand2= randomIndexTeam(values.length);
     rand3= randomIndexTeam(values.length);
     rand4= randomIndexTeam(values.length);
       if(rand!=rand2&&
         rand!=rand3&&
         rand!=rand4&&
         rand2!=rand3&&
         rand3!=rand4&&
         rand2!=rand4&&
         obtainAffiliationDebater(values[rand])!=obtainAffiliationDebater(values[rand2])&&
         obtainAffiliationDebater(values[rand])!=obtainAffiliationDebater(values[rand3])&&
         obtainAffiliationDebater(values[rand])!=obtainAffiliationDebater(values[rand4])&&
         obtainAffiliationDebater(values[rand2])!=obtainAffiliationDebater(values[rand3])&&
         obtainAffiliationDebater(values[rand3])!=obtainAffiliationDebater(values[rand4])&&
         obtainAffiliationDebater(values[rand2])!=obtainAffiliationDebater(values[rand4])
        ){
          switch(random) {
          case 1 :
                  OpeGov.push(values[rand]);
                  CloGov.push(values[rand2]);
                  OpeOpp.push(values[rand3]);
                  CloOpp.push(values[rand4]);
          break;
          case 2 :
                  OpeGov.push(values[rand2]);
                  CloGov.push(values[rand]);
                  OpeOpp.push(values[rand3]);
                  CloOpp.push(values[rand4]);
        break;
         case 3 :
                  OpeGov.push(values[rand2]);
                  CloGov.push(values[rand3]);
                  OpeOpp.push(values[rand]);
                  CloOpp.push(values[rand4]);
        break;
        case 4 :
                  OpeGov.push(values[rand2]);
                  CloGov.push(values[rand3]);
                  OpeOpp.push(values[rand4]);
                  CloOpp.push(values[rand]);
        break;
    default:
        throw "Invalid state switch random pairingZero4side";        
        return;
         }
         teamname_rand=values[rand];
         teamname_rand2=values[rand2];
         teamname_rand3=values[rand3];
         teamname_rand4=values[rand4];
         updateRepresented(RepresentativeArray,values[rand2]);
         updateRepresented(RepresentativeArray,values[rand3]);
         updateRepresented(RepresentativeArray,values[rand4]);
         rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));// rand reassigned when all values found
         values.splice(values.indexOf(teamname_rand),1);
         values.splice(values.indexOf(teamname_rand2),1);
         values.splice(values.indexOf(teamname_rand3),1);
         values.splice(values.indexOf(teamname_rand4),1);
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when unforseen bugs occur.
     }
     while(values.length>0)
     {
     var rand = Math.ceil(Math.random() *4 );
     if(rand%4==0&&OpeGov.length<Number(TEAM_NUMBER/4)){// need to take into account affiliation and record number assigned
     OpeGov.push(values.pop());
     }
     else if(rand%4==1&&CloGov.length<Number(TEAM_NUMBER/4)){
     CloGov.push(values.pop());
     }
     else if(rand%4==2&&OpeOpp.length<Number(TEAM_NUMBER/4)){
     OpeOpp.push(values.pop());
     }
     else if(rand%4==3&&CloOpp.length<Number(TEAM_NUMBER/4)){
     CloOpp.push(values.pop());
     }
     }
     
     }
     else{
     while(values.length>0)
     {
     var rand = Math.ceil(Math.random() *4 );
     if(rand%4==0&&OpeGov.length<Number(TEAM_NUMBER/4)){// need to take into account affiliation and record number assigned
     OpeGov.push(values.pop());
     }
     else if(rand%4==1&&CloGov.length<Number(TEAM_NUMBER/4)){
     CloGov.push(values.pop());
     }
     else if(rand%4==2&&OpeOpp.length<Number(TEAM_NUMBER/4)){
     OpeOpp.push(values.pop());
     }
     else if(rand%4==3&&CloOpp.length<Number(TEAM_NUMBER/4)){
     CloOpp.push(values.pop());
     }
   }
   }
    ss.getSheetByName(RoundName).getRange(3, 2,OpeGov.length,1).setValues(OpeGov);
    ss.getSheetByName(RoundName).getRange(3, 3,CloGov.length,1).setValues(CloGov);
    ss.getSheetByName(RoundName).getRange(3, 4,OpeOpp.length,1).setValues(OpeOpp);
    ss.getSheetByName(RoundName).getRange(3, 5,CloOpp.length,1).setValues(CloOpp); 
}
/*
*  Function to assign adjudicators randomly in order of highest experience.
*/
function assignAdjudicator2sides(RoundName){
   var scorePlayerRounds = ss.getSheetByName(RoundName);
  if(!scorePlayerRounds){
    throw "Please generate round : "+RoundName +" before integration";
  }
   var pairingNumber=TEAM_NUMBER/2;
   var colNumAdju=Math.ceil(ADJUDICATOR_NUMBER/pairingNumber);
   var adjuName;
   for (var i = 1; i <= colNumAdju; i++) {
     adjuName = 'Adjudicator ' + i;
     scorePlayerRounds.getRange(2, i+3).setValue(adjuName);
     scorePlayerRounds.setColumnWidth(i+3, 250);
    }
   setAlternatingRowBackgroundColors_(scorePlayerRounds.getRange(3,4,pairingNumber,colNumAdju), '#ffffff', '#eeeeee');
   
   var range = scorePlayerRounds.getRange(3, 2,pairingNumber,2);
   var data = range.getValues();
   var govList=[];
   var oppList=[];
  for(var i = 0;i<pairingNumber;i++){
    govList.push(data[i][0]);
    oppList.push(data[i][1]);
  }
   var adjuSheet = ss.getSheetByName(SHEET_ADJU);
   var rangeAdju = adjuSheet.getRange(3, 1, ADJUDICATOR_NUMBER,3);
   rangeAdju.sort([{column: 3, ascending: false}, {column: 1, ascending: false}]);
   var dataAdju = rangeAdju.getValues();//Sorted data of adjudicators to experience then team.
   var adjudicator_Names=[];
   for(var i=0;i<ADJUDICATOR_NUMBER;i++)
   {
     adjudicator_Names.push(dataAdju[i][1]); 
   }
  var k=0;
  var coladd=0;
   var assigned_adju_data=createArray(pairingNumber,colNumAdju);
  while(adjudicator_Names.length>0){
  for(var i=0;i<pairingNumber;i++){
    for(var j in adjudicator_Names){
      if(k==pairingNumber){
      coladd++;//Progressing to next adjudicator column
      k=0;
      }
     if(obtainAffiliationDebater(govList[i])!=obtainAffiliationAdjudicator(adjudicator_Names[j])&&
        obtainAffiliationDebater(oppList[i])!=obtainAffiliationAdjudicator(adjudicator_Names[j])){
        assigned_adju_data[i][0+coladd]=adjudicator_Names[j];
        adjudicator_Names.splice(j, 1);
       k++;
          break;
        }
     }
   }
  }
  ss.getSheetByName(RoundName).getRange(3,4,assigned_adju_data.length,colNumAdju).setValues(assigned_adju_data);



}
/*
*  Function to assign rooms randomly in order of highest quality if more rooms are available than rounds.
*/
function assignRooms(RoundName)
{
  var scoreBoardRoom = ss.getSheetByName(SHEET_ROOM);
  var range = scoreBoardRoom.getRange(3, 1, ROOM_NUMBER,2);
  if(ROOM_NUMBER<Number(TEAM_NUMBER/SIDES_PER_ROUND)){
   throw "Insufficient room number to assign pairings for the tournament";
  }
  var data = range.getValues();
  data.sort(function(a, b){return b[1]-a[1]});
  var roomRequired=Number(TEAM_NUMBER/SIDES_PER_ROUND);
  var qualityRooms=createArray(roomRequired,1);
  for(var i=0;i<roomRequired;i++){
    qualityRooms[i][0]=data.shift()[0];
  }
  ss.getSheetByName(RoundName).getRange(3,1,qualityRooms.length,1).setValues(shuffleArray(qualityRooms));
}

