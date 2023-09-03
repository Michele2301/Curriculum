## Block
- title
- author
- creation date
- publication date (divide the pages in published, unpublished and draft)
- contents (header and (image_preloaded||text))
## Authenticated user
- see every created page
- - create a new page
- - edit an existing page (only if author)
- - delete an existing page (only if author)
## Admin user
- see every created page
- - create a new page
- - edit an existing page
- - delete an existing page
- - change the authorship of a page
- - change the website name (like FilmLibrary to Films)
## Not authenticated user
- sees the name of the website
- all the pages *published* and can read them but not modify anything

## Link to the file
- [Link to the file](https://docs.google.com/document/d/1MaIpKyLjvUv3UwMztYrYYVie_nTu4ekMYRyYpMEwzbk/edit#)
- [Link to my file](https://docs.google.com/document/d/1w_DSN5MKEHpLcEY5NqzQPsKLVXQfvbONt3KLd6fb3-M/edit)
## Client

## Server
### No auth
/frontOffice (public)
### Auth
GET /backOffice - shows all the pages
POST /backOffice/page/:id/
PUT /backOffice/page/:id/
DELETE /backOffice/page/:id/
## Database

- - Page: idPage, title, author, creation date, publication date, contents, linkToUser(idUser)
- - User: idUser, username, hashedPassword, salt, role
- - Block: idBlock, linkToPage(idPage), Position, Type, Content (for images the local link to the image and for the text the text)