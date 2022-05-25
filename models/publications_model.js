const fs = require('fs');
const uuid = require('uuid');


//get all publications
exports.getAllPublications = function(){
  let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
  return allPublications;
}
//get all the publication names
exports.getAllPublicationNames = function(){
  let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
  let pubarray=[]
  for(e in allPublications){
    pubarray.push(e.publication_name);
  }
  return pubarray;
}

exports.getAllPublicationEditions = function(checked_publications,checked_topics){
  let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
  let array_of_editions = [];
  for(publication in allPublications){
    if(checked_publications && checked_publications.length >0 && !checked_publications.includes(allPublications[publication].publication_name)){
      continue;
    }
    for(let i=0;i<allPublications[publication].editions.length;i++){
      if(allPublications[publication]["editions"][i].approved == true){
        for(let t=0;t<allPublications[publication].editions[i].topics_covered.length;t++){
          if(!checked_topics || checked_topics.length<=0 || checked_topics.includes(allPublications[publication].editions[i].topics_covered[t])){
            allPublications[publication].editions[i]["publication_name"] = allPublications[publication]["publication_name"];
            array_of_editions.push(allPublications[publication].editions[i]);
            break;
          }
        }
      }
    }
  }
  return array_of_editions;
}

exports.getPublication = function(publication){
  let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
  return allPublications[publication]
}

exports.getPublicationByUser = function(user){
  let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
  let object_of_belonging_publications = {}
  for(one in allPublications){
    if(allPublications[one]["student_leader"] == user){
      object_of_belonging_publications[allPublications[one].publication_name] = allPublications[one]
    }
  }
  return object_of_belonging_publications;
}

exports.getPublicationByEditionID = function(id){
let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
  for (const [key, value] of Object.entries(publication_info)) {
    console.log(value.editions)
    console.log("value^^")
      for(edition of value.editions){
        if(edition["id"] == id){
          return edition;
        }
      }
      return {}
  }
}


//   let allPublications = JSON.parse(fs.readFileSync('data/publications.json'));
//   for(one in allPublications){
//     for(edition in one["editions"]){
//       if(edition["id"] == id){
//         return edition;
//       }
//     }
//     return {}
//   }
// }
exports.newEdition = function(publication_name,form_date,pdflink,topics_covered){
  let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
  let newID = uuid.v1();
  let new_edition = {
    "id":newID,
    "form_date": form_date,
    "pdf_link": pdflink,
    "topics_covered":topics_covered,
    "approved":false,
  }
  publication_info[publication_name]["editions"].push(new_edition);
  fs.writeFileSync('data/publications.json', JSON.stringify(publication_info));
  return new_edition.id;
}

exports.editEdition = function(publication_ID, edition_ID,form_date,pdflink,topics_covered){
  let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
      for(edition of publication_info[publication_ID]["editions"]){
        if(edition["id"] == edition_ID){
          edition.form_date = form_date;
          edition.pdf_link = pdflink;
          edition.topics_covered = topics_covered;
        }
      }
  fs.writeFileSync('data/publications.json', JSON.stringify(publication_info));
}

exports.getEdition = function(publication_ID,edition_ID){
  let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
      for(edition of publication_info[publication_ID]["editions"]){
        if(edition["id"] == edition_ID){
          return edition;
        }
      }
      return {};
}



exports.newPublication = function(student_leader, advisor, name){
  let publications = JSON.parse(fs.readFileSync('data/publications.json'));
  let new_publication = {
    "publication_name":name,
    "student_leader":student_leader,
    "advisor_email":advisor,
    "editions":[]
  }
  publications[name] = new_publication;
  fs.writeFileSync('data/publications.json', JSON.stringify(publications));
}

exports.deletePublication = function(publication_name){
  let publications = JSON.parse(fs.readFileSync('data/publications.json'));
  delete publications[publication_name];
  fs.writeFileSync("data/publications.json", JSON.stringify(publications));
}

exports.editPublication = function(old_publication_name,advisor,student,new_publication_name){
let publications = JSON.parse(fs.readFileSync('data/publications.json'));
    publications[old_publication_name].advisor_email = advisor;
    publications[old_publication_name].student_leader = student;
    publications[old_publication_name].publication_name = new_publication_name;
    publications[new_publication_name] = publications[old_publication_name];
    if(old_publication_name != new_publication_name){
      delete publications[old_publication_name];
    }
    fs.writeFileSync("data/publications.json", JSON.stringify(publications));
}

exports.approveEdition = function(publication_name,edition_id,advisor_email){
  let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
  let publication  = publication_info[publication_name];
      for(edition of publication_info[publication_name]["editions"]){
        if(edition["id"] == edition_id){
          if(publication.advisor_email == advisor_email){
            edition.approved = true;
          }
          break;
        }
      }
    fs.writeFileSync("data/publications.json", JSON.stringify(publication_info));
}

exports.SaveComment = function(edition_id,comment,user){
  console.log(edition_id)
  console.log("EDITIONID^")
  let publication_info = JSON.parse(fs.readFileSync('data/publications.json'));
  for (const [key, value] of Object.entries(publication_info)) {
      for(edition of value.editions){
        if(edition["id"] == edition_id){
          if(!edition.comments){
            edition.comments = [comment];
          }
          else{
            edition.comments.push(comment);
          }
          fs.writeFileSync("data/publications.json", JSON.stringify(publication_info));
        }
      }
  }

  // for (const key of Object.entries(publication_info)) {
  //     for(edition of publication_info[key]["editions"]){
  //       if(edition["id"] == edition_id){
  //         if(!edition.comments){
  //           edition.comments = [comment];
  //         }
  //         else{
  //           edition.comments.push(comment);
  //         }
  //         fs.writeFileSync("data/publications.json", JSON.stringify(publication_info));
  //       }
  //     }
  // console.log(key);
  // console.log("KEY^")
  // }
  // for(publication in publication_info){
  //   for(edition of publication_info[publication]["editions"]){
  //     if(edition["id"] == edition_ID){
  //       if(!edition.comments){
  //         edition.comments = [comment];
  //       }
  //       else{
  //         edition.comments.push(comment);
  //       }
  //     }
  //   }
  // }
return {};
}
