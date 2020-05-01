module.exports = class Party {
    constructor(code,pokemons,users,mainUser,status){
        this.code=code;
        this.users=users;
        this.pokemons=pokemons;
        this.mainUser=mainUser;
        this._status = status

        
    }
     STATUSVALUES = {
        WAITING: '0',
        READY: '1',
        STARTED: '2'
      };
 get status() {
    return this._status;
  }

  set status(st) {
    this._status = st; 
  }
}