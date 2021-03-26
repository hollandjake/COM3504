# Team "; DROP TABLE grades; --"
COM3504 Web assignment

## MongoDB startup
### Tear down db
```shell
npm run-script rollbackDb
```
### Pre-populate some data 
Covering most of the scenarios it would encouter (e.g. base64 image, image url)
```shell
npm run-script migrateDb
```

## Server startup
```shell
npm run start
```

## Information about the team for Fabio

Discussed with Fabio about a different approach to dividing the work into sections of workable content that dont collide with each other.
Creating a feature based system as opposed to a technology based approach.

Division of work approved by Fabio:

### Jake
- [x] Index Page HTML/CSS #1
- [x] MongoDB #10
- [x] Index Page pull down jobs and thumbnails from db #7
- [x] Index page modal for creating new room #8
- [x] Socket.io Creating new room #9
- [x] Annotation tool #11
### Tom
- [x] Login Page HTML/CSS #2
- [x] Login with name logic #6
- [x] Global HTML/CSS design plan #5
- [x] Image searching by author's name #40
- [x] Job Page Add new image #19
- [x] Socket.io Upload new image #20
- [x] Store images in indexedDB #17
- [x] Dynamic cache fetching from indexedDB #22
### Billy
- [x] Job Page HTML/CSS #12
- [x] Job Page Image Carousel #13
- [ ] Socket.io Chat box #14
- [ ] Socket.io Annotation #15
- [ ] Swagger documentation #16
- [ ] ServiceWorker #18

### Unassigned / Part 2
- [ ] Knowledge graph image #23
- [ ] WebRTC #43