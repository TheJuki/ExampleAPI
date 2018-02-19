/*
  Maps a Team to ListItemJson
*/
exports.mapTeamToListItemJson = (t) => {
    return {
      "id": String(t._id),
      "name": t.name
    }
}