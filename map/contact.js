/*
 * map/contact.js
 * 
 * Contact Mapper
*/

/*
  Maps a Contact to TableCellJson
*/
exports.mapContactToTableCellJson = (c) => {
    return {
      "id": String(c._id),
      "status": "Contact",
      "date": c.emailAddress,
      "account": c.teamName,
      "category": c.businessPhone,
      "contact": c.fullName,
    }
}

/*
  Maps a Contact to ContactLookupJson
*/
exports.mapContactToContactLookupJson = (c) => {
    return {
      "id": String(c._id),
      "value": c.fullName,
      "label": c.fullName + " (" + c.teamName + ")",
    }
}

/*
  Maps a Contact to ContactJson
*/
exports.mapContactToContactJson = (c) => {
    return {
      "id": String(c._id),
      "firstName": c.firstName,
      "lastName": c.lastName,
      "mobilePhone": c.mobilePhone,
      "emailAddress": c.emailAddress,
      "businessPhone": c.businessPhone,
      "supervisorName": c.supervisorName,
      "supervisorId": c.supervisorId,
      "modifyingUser": c.modifyingUser,
      "creatingUser": c.creatingUser,
      "createdDate": c.createdDate,
      "modifiedDate": c.modifiedDate,
      "teamId": c.teamId,
      "teamName": c.teamName,
    }
}

/*
  Maps a ContactJson to Contact
*/
exports.mapContactJsonToContact = (c) => {
    return {
      "firstName": c.firstName,
      "lastName": c.lastName,
      "fullName": c.firstName + " " + c.lastName,
      "mobilePhone": c.mobilePhone,
      "emailAddress": c.emailAddress,
      "businessPhone": c.businessPhone,
      "supervisorName": c.supervisorName,
      "supervisorId": c.supervisorId,
      "modifyingUser": c.modifyingUser,
      "creatingUser": c.creatingUser,
      "createdDate": c.createdDate,
      "modifiedDate": c.modifiedDate,
      "teamId": c.teamId,
      "teamName": c.teamName,
    }
}