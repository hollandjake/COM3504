# Team "; DROP TABLE grades; --"
COM3504 Web assignment [GitHub](https://github.com/hollandjake/COM3504)

## MongoDB startup (Optional)

If you want to seed the database with test jobs and images

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
- [x] Index Page HTML/CSS [#1](https://github.com/hollandjake/COM3504/issues/1)
- [x] MongoDB [#10](https://github.com/hollandjake/COM3504/issues/10)
- [x] Index Page pull down jobs and thumbnails from db [#7](https://github.com/hollandjake/COM3504/issues/7)
- [x] Index page modal for creating new room [#8](https://github.com/hollandjake/COM3504/issues/8)
- [x] Socket.io Creating new room [#9](https://github.com/hollandjake/COM3504/issues/9)
- [x] Annotation tool [#11](https://github.com/hollandjake/COM3504/issues/11)
### Tom
- [x] Login Page HTML/CSS [#2](https://github.com/hollandjake/COM3504/issues/2)
- [x] Login with name logic [#6](https://github.com/hollandjake/COM3504/issues/6)
- [x] Global HTML/CSS design plan [#5](https://github.com/hollandjake/COM3504/issues/5)
- [x] Image searching by author's name [#40](https://github.com/hollandjake/COM3504/issues/40)
- [x] Job Page Add new image [#19](https://github.com/hollandjake/COM3504/issues/19)
- [x] Socket.io Upload new image [#20](https://github.com/hollandjake/COM3504/issues/20)
- [x] Store images in indexedDB [#17](https://github.com/hollandjake/COM3504/issues/17)
- [x] Dynamic cache fetching from indexedDB [#22](https://github.com/hollandjake/COM3504/issues/22)
### Billy
- [x] Job Page HTML/CSS [#12](https://github.com/hollandjake/COM3504/issues/12)
- [x] Job Page Image Carousel [#13](https://github.com/hollandjake/COM3504/issues/13)
- [x] Socket.io Chat box [#14](https://github.com/hollandjake/COM3504/issues/14)
- [x] Socket.io Annotation [#15](https://github.com/hollandjake/COM3504/issues/15)
- [x] Swagger documentation [#16](https://github.com/hollandjake/COM3504/issues/16)
- [x] ServiceWorker [#18](https://github.com/hollandjake/COM3504/issues/18)

### Unassigned / Part 2
- [x] Knowledge graph image [#23](https://github.com/hollandjake/COM3504/issues/23)
- [x] WebRTC [#43](https://github.com/hollandjake/COM3504/issues/43)
