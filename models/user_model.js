const fs = require('fs');


exports.createUser =  function (userID){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
  if(!allUsers[userID]){
    let newUser={
      "privileges": ["reader"],
      "dateJoined": new Date(),
      "publications":[],
    }
    allUsers[userID] = newUser;
    fs.writeFileSync(__dirname+'/../data/user.json', JSON.stringify(allUsers));
  }
}

exports.makeAdvisor = function(advisor,publication){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
  if(!allUsers[advisor]){
    exports.createUser(advisor);
  }
  if(allUsers[advisor]){
    if(!allUsers[advisor].privileges.includes("advisor")){
      allUsers[advisor].privileges.push("advisor");
    }
    if(!allUsers[advisor].publications.includes(publication)){
      allUsers[advisor].publications.push(publication);
    }
    fs.writeFileSync(__dirname+'/../data/user.json', JSON.stringify(allUsers));
  }
}

exports.makeStudentLeader = function(student,publication){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
  if(!allUsers[student]){
    exports.createUser(student);
  }
  if(allUsers[student]){
    if(!allUsers[student].privileges.includes("studentLeader")){
      allUsers[student].privileges.push("studentLeader");
    }
    if(!allUsers[student].publications.includes(publication)){
      allUsers[student].publications.push(publication);
    }
    fs.writeFileSync(__dirname+'/../data/user.json', JSON.stringify(allUsers));
  }
}

exports.updateUser = function(advisor,student,name){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
}

exports.removeStudentLeader = function(student,publication){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
  if(!allUsers[student]){return null}
  let index_of_removed = allUsers[student].publications.indexOf(publication);

  if(index_of_removed>-1){
    allUsers[student].publications.splice(index_of_removed,1)
  }
  if(allUsers[student].publications.length<=0){
    let index_of_removed_privilege = allUsers[student].privileges.indexOf("studentLeader");
    allUsers[student].privileges.splice(index_of_removed_privilege,1)
  }
  fs.writeFileSync(__dirname+'/../data/user.json', JSON.stringify(allUsers));

}
exports.removeAdvisor = function(advisor,publication){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
  if(!allUsers[advisor]){return null}
  let index_of_removed = allUsers[advisor].publications.indexOf(publication);

  if(index_of_removed>-1){
    allUsers[advisor].publications.splice(index_of_removed,1)
  }
  if(allUsers[advisor].publications.length<=0){
    let index_of_removed_privilege = allUsers[advisor].privileges.indexOf("advisor");
    allUsers[advisor].privileges.splice(index_of_removed_privilege,1)
  }
  fs.writeFileSync(__dirname+'/../data/user.json', JSON.stringify(allUsers));
}

exports.getUser = function(userID){
  let allUsers = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));
    return allUsers[userID];
}
