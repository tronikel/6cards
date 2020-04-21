module.exports = class Message {
    constructor(id,from,status,content, to){
        this.id=id;
        this.from=from;
        this.to = to;
        this.status=status;
        this.content=content;


    }

}