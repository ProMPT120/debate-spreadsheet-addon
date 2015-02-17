/*
* Function to handle pairing of round zero with two sides.
*/
function pairingZeroTwoSide(RoundName) {
  
    var scoreBoardSheet = ss.getSheetByName(SHEET_SCOREBOARD);
    var range = scoreBoardSheet.getRange(4, 1, TEAM_NUMBER);
   var values = range.getValues();
   shuffleArray(values);
   var rand;
   var properOpponent;
   var govIndex=0;
   var newGov = [];
   var newOpp = [];
  var itr=2000;
   while(values.length>0&&LIMIT_INTER_AFF_ROUNDS)
   {
     rand= randomIndexTeam(values.length-1);
     properOpponent=false;
     newGov.push(values[rand]);
     values.splice(rand,1);
     while(!properOpponent){
     rand= randomIndexTeam(values.length-1);
       if(obtainAffiliationDebater(newGov[govIndex])!=obtainAffiliationDebater(values[rand])){
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
    if(!LIMIT_INTER_AFF_ROUNDS){
   for (var row in values) {
     var rand = Math.ceil(Math.random() *2 );//(Number(TEAM_NUMBER))
     if(rand%2==0&&newGov.length<Number(TEAM_NUMBER/2)){// need to take into account affiliation and record number assigned
     newGov.push(values[row]);
     }
     else if(newOpp.length<Number(TEAM_NUMBER/2)){
     newOpp.push(values[row]);
     }
     else{
     newGov.push(values[row]);
     }
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
   var range = scoreBoardSheet.getRange(4, 1, TEAM_NUMBER);
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
   var itr=4000;
   if(LIMIT_INTER_AFF_ROUNDS){
   while(values.length>4){
     rand= randomIndexTeam(values.length-1);
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
         OpeGov.push(values[rand]);
         CloGov.push(values[rand2]);
         OpeOpp.push(values[rand3]);
         CloOpp.push(values[rand4]);
         teamname_rand=values[rand];
         teamname_rand2=values[rand2];
         teamname_rand3=values[rand3];
         teamname_rand4=values[rand4];
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



