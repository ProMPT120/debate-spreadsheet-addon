/*
* Function to obtain the number of rounds where it will be impossible to get non affiliated matches
*/
function nonAffiliatedMatches(RepresentativeArray){
  var non_affiliated_rounds;
   if(Number(RepresentativeArray[0][1])>Number(TEAM_NUMBER)/SIDES_PER_ROUND)
  {
    non_affiliated_rounds=Number(RepresentativeArray[0][1])-Number(TEAM_NUMBER/SIDES_PER_ROUND);
    //Browser.msgBox("Warning : there will be "+ non_affiliated_rounds+" rounds with teams affiliated");
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
  //throw "Unexpected result in function findTeamRepresented";
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
  var non_affiliated_rounds=nonAffiliatedMatches(RepresentativeArray);
  //Browser.msgBox("non aff rounds : "+ non_affiliated_rounds);
   while(values.length>Number(non_affiliated_rounds*2)&&LIMIT_INTER_AFF_ROUNDS)
   {
     rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));
     //rand = randomIndexTeam(values.length-1);
     properOpponent=false;
     var random = Math.ceil(Math.random() *2 );//To allow most represented to be opposition and gov
     if(random%2==0){
     newGov.push(values[rand]);
     values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length-1);
       if(obtainAffiliationDebater(newGov[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);
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
     rand= randomIndexTeam(values.length-1);
       if(obtainAffiliationDebater(newOpp[govIndex])!=obtainAffiliationDebater(values[rand])){
         updateRepresented(RepresentativeArray,values[rand]);
         newGov.push(values[rand]);
         values.splice(rand,1);
         govIndex+=1;
         properOpponent=true;
     }
     itr-=1;
     if(itr<0)
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when randomness doesnt prioritize spreading big teams.
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
   var itr=TEAM_NUMBER*40;
   var RepresentativeArray=obtainAffiliationNumbers();
   var non_affiliated_rounds=nonAffiliatedMatches(RepresentativeArray);
   if(LIMIT_INTER_AFF_ROUNDS){
   rand= values.indexOf(findTeamRepresented(RepresentativeArray,values));
   while(values.length>Number(non_affiliated_rounds*4)){
     var random = Math.ceil(Math.random()*4 );//To allow most represented to be opposition and gov
     //rand= randomIndexTeam(values.length-1);
     rand2= randomIndexTeam(values.length-1);
     rand3= randomIndexTeam(values.length-1);
     rand4= randomIndexTeam(values.length-1);
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
       throw "Computation limit exceeded. Regenerate round";// Prevents infinite looping when randomness doesnt prioritize spreading big teams.
       // Supposed to use backtracking on most prevalent teams to prevent this case scenario if it is possible.
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
   

   
   /*
    if(!LIMIT_INTER_AFF_ROUNDS){
   while (var row in values) {
     var rand = Math.ceil(Math.random() *4 );//(Number(TEAM_NUMBER))
     Browser.msgBox("rand number is "+ rand);
     if(rand%4==0&&OpeGov.length<Number(TEAM_NUMBER/4)){// need to take into account affiliation and record number assigned
     OpeGov.push(values[row]);
     }
     else if(rand%4==1&&CloGov.length<Number(TEAM_NUMBER/4)){
     CloGov.push(values[row]);
     }
     else if(rand%4==2&&OpeOpp.length<Number(TEAM_NUMBER/4)){
     OpeOpp.push(values[row]);
     }
     else if(rand%4==3&&CloOpp.length<Number(TEAM_NUMBER/4)){
     CloOpp.push(values[row]);
     }
   }
  }
  */
    //var ControlMessage = "Affiliation "+ obtainAffiliationDebater("Mn") ; 
    //Browser.msgBox(ControlMessage);
    ss.getSheetByName(RoundName).getRange(3, 2,OpeGov.length,1).setValues(OpeGov);
    ss.getSheetByName(RoundName).getRange(3, 3,CloGov.length,1).setValues(CloGov);
    ss.getSheetByName(RoundName).getRange(3, 4,OpeOpp.length,1).setValues(OpeOpp);
    ss.getSheetByName(RoundName).getRange(3, 5,CloOpp.length,1).setValues(CloOpp);
  
  
}
