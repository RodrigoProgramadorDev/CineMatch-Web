export class Content {
    constructor(title, genres, durationMinutes) {
        this.title = title;
        this.genres = genres;
        this.durationMinutes = durationMinutes;
    }
}

export class Series extends Content {
    constructor(id, title, genres, durationMinutes, image) {
        super(title, genres, durationMinutes);
        this.id = id;
        this.type = "Série";
        this.image = image;
    }
}