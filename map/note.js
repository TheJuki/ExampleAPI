/*
 * map/note.js
 * 
 * Note Mapper
*/

// Strip HTML tags from note body
var striptags = require('striptags');

/*
  Maps a Note to NoteJson
*/
exports.mapNoteToTableCellJson = (n) => {
    return {
      "id": String(n._id),
      "status": n.type,
      "date": n.createdDate,
      "account": striptags(n.body),
      "category": n.parentType,
      "contact": n.modifyingUser,
    }
}

/*
  Maps a Note to NoteJson
*/
exports.mapNoteToNoteJson = (n) => {
    return {
      "id": String(n._id),
      "type": n.type,
      "body": n.body,
      "parentId": n.parentId,
      "parentType": n.parentType,
      "modifyingUser": n.modifyingUser,
      "creatingUser": n.creatingUser,
      "createdDate": n.createdDate,
      "modifiedDate": n.modifiedDate
    }
}

/*
  Maps a NoteJson to Note
*/
exports.mapNoteJsonToNote = (n) => {
    return {
      "type": n.type,
      "body": n.body,
      "parentId": n.parentId,
      "parentType": n.parentType,
      "modifyingUser": n.modifyingUser,
      "creatingUser": n.creatingUser,
      "createdDate": n.createdDate,
      "modifiedDate": n.modifiedDate
    }
}