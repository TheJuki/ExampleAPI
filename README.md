# Example API

> Get started with using Node.JS for API calls using Express, MongoDB, JSON, and JWT

## Features
- JWT Authorization headers
- bcrypt password hashing
- Express routing
- Pug views with Semantic UI
- JSON bodies and responses (with mapping when necessary)
- MongoDB (find, insert, update)

## Remixing
* Go to [example-api-thejuki](https://glitch.com/edit/#!/example-api-thejuki) and edit a file to create a remix
* Update your .env file with your MongoDB components and custom JWT information

## Live Example
* [https://example-api-thejuki.glitch.me](https://example-api-thejuki.glitch.me)
* Note: Due to Glitch restictions the API will sleep after 5 minutes of inactivity. Also, the JWT token will expire after 24 hours.

## How to use
* Use the website to get an idea of the JSON responses of the API.
* Use the API in an application of your choice.
* Except for Login and Verify, a JWT token is required in the header of the request. 'Authorization' = JWT Token with Bearer from Login.

### Login Post (/api/v1/login)
* Use the credentials shown on the home page to login.

#### Request (?userId=&password=) 
* Use @FormUrlEncoded if using Retrofit
* userId - User's username
* password - User's password

#### Response (JSON)
* Success - true if login passes
* error - A login error, if any
* token - JWT token with Bearer
* id - User's Contact Id
* fullName - User's Contact Full Name
* username - User's username
* roles - User's roles

### Token Verify Post (/api/v1/verify)
* Verify if a JWT token is valid.

#### Request (?userId=&password=) 
* Use @FormUrlEncoded if using Retrofit
* token - JWT token

#### Response (JSON)
* Success - true if token is valid

### List Contacts by Full Name (/api/v1/contact/list/json)

#### Request (?term=) 
* term - Partial or full Contact name

#### Response (JSON)
* List of TableCellJson objects
* NOTE: The fields of this JSON object are general and represents the position of the fields on a cell in a table or list
  * id - _id
  * status - "Contact"
  * date - emailAddress
  * account - teamName
  * category - businessPhone
  * contact - fullName
  
### Lookup Contacts by Full Name (/api/v1/contact/lookup/json)

#### Request (?term=) 
* term - Partial or full Contact name

#### Response (JSON)
* List of ContactLookupJson objects
  * id - _id
  * value - fullName
  * label - fullName + " (" + c.teamName + ")"
  
### Get Contact by Id (/api/v1/contact/find/json)

#### Request (?id=) 
* id - The Contact's _id

#### Response (JSON)
* ContactJson (Direct mapping to Contact table except for _id)
  * Success - false if no Contact is found
  * id - _id
  * firstName - firstName
  * lastName - lastName
  * mobilePhone - mobilePhone
  * businessPhone - businessPhone
  * emailAddress - emailAddress
  * supervisorName - supervisorName
  * supervisorId - supervisorId
  * modifyingUser - modifyingUser
  * creatingUser - creatingUser
  * createdDate - createdDate
  * modifiedDate - modifiedDate
  * teamId - teamId
  * teamName - teamName
  
### Save Contact Post (/api/v1/contact/save)

#### Request (JSON body) 
* body - ContactJson

#### Response (JSON)
* NOTE: This could be modified to return the inserted/updated ContactJson instead of just the id
* Success - false if Contact could not be added or updated
* id - insertedId or contact.id
  
### List Notes by Parent (/api/v1/note/list/json)

#### Request (?term=) 
* pId - parentId
* pType - parentType
* type - type (Type could be "All" to not filter by type)

#### Response (JSON)
* List of TableCellJson objects
* NOTE: The fields of this JSON object are general and represents the position of the fields on a cell in a table or list
  * id - _id
  * status - type
  * date - createdDate
  * account - striptags(body) // Stripping HTML tags
  * category - parentType
  * contact - modifyingUser
  
### Get Note by Id (/api/v1/note/find/json)

#### Request (?id=) 
* id - The Note's _id

#### Response (JSON)
* NoteJson (Direct mapping to Note table except for _id)
  * Success - false if no Note is found
  * id - _id
  * type - type
  * body - body
  * parentId - parentId
  * parentType - parentType
  * modifyingUser - modifyingUser
  * creatingUser - creatingUser
  * createdDate - createdDate
  * modifiedDate - modifiedDate
  
### Save Note Post (/api/v1/note/save)

#### Request (JSON body) 
* body - NoteJson

#### Response (JSON)
* NOTE: This could be modified to return the inserted/updated NoteJson instead of just the id
* Success - false if Note could not be added or updated
* id - insertedId or note.id
  
## Contributing
You can submit pull requests or issues to this project to make this API even better!

## Resources
* [Glitch](https://glitch.com) is the environment this API was built in and hosted in
* [mLab](https://mlab.com/) is the MongoDB host for this API

License
-----------------
This API is available as open source under the terms of the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
