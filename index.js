new Vue({
  el: '#app',

  data() {
    return {
      //Players => Name/FirstName/Org/email/?/ID?
      players: [],
      group: '', //solo/duo or null
      playerInfo: {
        'N': '',
        'FN': '',
        'EMAIL': '',
        'ORG':'',
        'PSEUDO':'',
        'PLAYING': false,
        'GROUP': '',
      },
      playing: false,
      errorMessage: '',
      state:'idle', //idle, chooseBadge, scanning, form,
      duo: '', //store first player if duo mod is selected
    }
  },

  methods: {
    //QR Scan decode
    onDecode(content) {
      if (content != ""){
        var cardData = content.split("\n");
        var jsonData = {};
        cardData.forEach((data) => {
          var kv = data.split(':');
          if(kv[0]=="N"){
            var names = kv[1].split(";");
            jsonData[kv[0]] = names[0];
            jsonData["FN"] = names[1];
          }else{
            jsonData[kv[0]] = kv[1];
          }
        });
        jsonData["PSEUDO"]="";
        jsonData["GROUP"]=this.group;
        this.playerInfo = jsonData;
        this.changeState("form");
      }
    },
    // Initialise camera
    onInit(promise) {
      promise.then(() => {
          console.log('Successfully initilized! Ready for scanning now!')
        })
        .catch(error => {
          if (error.name === 'NotAllowedError') {
            this.errorMessage = 'Hey! I need access to your camera'
          } else if (error.name === 'NotFoundError') {
            this.errorMessage = 'Do you even have a camera on your device?'
          } else if (error.name === 'NotSupportedError') {
            this.errorMessage = 'Seems like this page is served in non-secure context (HTTPS, localhost or file://)'
          } else if (error.name === 'NotReadableError') {
            this.errorMessage = 'Couldn\'t access your camera. Is it already in use?'
          } else if (error.name === 'OverconstrainedError') {
            this.errorMessage = 'Constraints don\'t match any installed camera. Did you asked for the front camera although there is none?'
          } else {
            this.errorMessage = 'UNKNOWN ERROR: ' + error.message
          }
        })
    },
    //Change page state
    changeState(state){
      this.state = state;
    },
    //Play solo selected
    playSolo(){
      this.group = 'solo';
      this.changeState("chooseBadge");
    },
    //Play duo selected
    playDuo(){
      this.group = 'duo';
      this.changeState("chooseBadge");
    },
    //Reset playerInfo
    resetContent(){
      this.playerInfo = {
        'N': '',
        'FN': '',
        'EMAIL': '',
        'ORG':'',
        'PSEUDO':'',
        'PLAYING': false,
        'GROUP': '',
      };
    },
    //Submit form and register player (according to duo/solo)
    onSubmit(){
      this.playerInfo.GROUP = this.group;
      if(this.group === "duo"){
        if(this.duo !== ''){
          duoPlayers = [this.duo,this.playerInfo];
          this.players.push(duoPlayers);
          this.resetContent();
          this.duo = '';
          this.changeState("idle");
        }else{
          this.duo = this.playerInfo;
          this.resetContent();
          this.changeState("chooseBadge");
        }
      }else{
        this.players.push([this.playerInfo]);
        this.resetContent();
        this.changeState("idle");
      }
    },
    // Display name for one player
    playerTitle(player){
      if(player.PSEUDO !== ''){
        return player.PSEUDO;
      }else if(player.FN !== '' || player.N !== ''){
        return player.FN + ' ' + player.N;
      }
      return 'Unknown Player';
    },
    goPlay(group){
      group.forEach(player => player.PLAYING = true);
      this.playing = true;
    },
    cancelGroup(group){
      if(group){
        for (var i = 0; i < this.players.length; i++) {
          // This if statement depends on the format of your array
          if (this.players[i][0] == group[0]) {
              this.players.splice(i,1);
          }
        }
      }
    },
    cancelSubmit(){
      this.changeState('idle');
      this.duo = '';
    },
    finishPlaying(){
      playingGroup = null;
      this.players.forEach(function(group){
          group.forEach(function(player){
            if(player.PLAYING === true){
              playingGroup = group;
            }
          });
        });
      this.cancelGroup(playingGroup);
      this.playing = false;
    },
  },
  computed: {
  },
})
