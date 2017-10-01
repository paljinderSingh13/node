angular.module('chatModule')
  .factory('VideoStream',['$q', function ($q) {
    var stream;
    
    return{

      sendAll:function() {
        
        var d = $q.defer();
        var errorElement = document.querySelector('#errorMsg');
        var constraints = window.constraints = {
          audio:true,
          video:true
        };
        var onSuccess = function(stream) {
          var videoTracks = stream.getVideoTracks();
          console.log('Using video device: ' + videoTracks[0].label);
          stream.onended = function() {
          console.log('Stream ended');
          };
          window.stream = stream; // make variable available to browser console
          
          d.resolve(stream);

        };

        var onFailure = function(error) {
          if (error.name === 'ConstraintNotSatisfiedError') {
            errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
                constraints.video.width.exact + ' px is not supported by your device.');
          } else if (error.name === 'PermissionDeniedError') {
            errorMsg('Permissions have not been granted to use your camera and ' +
              'microphone, you need to allow the page access to your devices in ' +
              'order for the demo to work.');
          }
          errorMsg('getUserMedia error: ' + error.name, error);
          d.reject(error);
        };
        
          
          AdapterJS.webRTCReady(function(isUsingPlugin) {
            if(typeof Promise === 'undefined'){
              navigator.getUserMedia(constraints, onSuccess, onFailure);
            }
            else{
              navigator.mediaDevices.getUserMedia(constraints)
              .then(onSuccess).catch(onFailure);
            }
          });
          function errorMsg(msg, error) {
            errorElement.innerHTML += '<p>' + msg + '</p>';
            if (typeof error !== 'undefined') {
              console.error(error);
            }
          }
          return d.promise;
        
      }
    };

  }])
  // chat room factory
  .factory('Room', function ( $q, Socket, config,$rootScope) {

    var iceConfig = { 'iceServers': [{ 'url': 'stun:stun4.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,partnerId,
        stream;

    function getPeerConnection(id,currentId) {
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      peerListeners(id,currentId,pc);
      return pc;
    }
    function peerListeners(id,currentId,pc){
      pc.addStream(stream);
      //console.log(pc)
      //console.log('stream: '+stream);
      //console.log('#step1');
      pc.onicecandidate = function (evnt) {
        Socket.emit('msg', { by: currentId, to: id, ice: evnt.candidate, type: 'ice' });
        //console.log('#step2');
      };
      pc.onaddstream = function (evnt) {
        //console.log('Received new stream');
        //console.log('update stream')
        api.trigger('peer.stream', [{
          id: id,
          stream: evnt.stream
        }]);
        console.log('#step3');
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      };
    }



    function makeOffer(id,currentId) {
      var pc = getPeerConnection(id,currentId);
      
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        //console.log('Creating an offer for', id);
        Socket.emit('msg', { by: currentId, to: id, sdp: sdp, type: 'sdp-offer' });
      }, function (e) {
        //console.log(e);
      },
      {  OfferToReceiveVideo: true, OfferToReceiveAudio: true });
    }

    function handleMessage(data) {
      var pc = getPeerConnection(data.by,data.to);
      console.log(pc);
      //console.log('data type : '+data.type);
      switch (data.type) {
        case 'sdp-offer':
          //console.log('data sdp: '+data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            //console.log('Setting remote description by offer of: '+ data.by);
            pc.createAnswer(function (sdp) {
              //console.log('enter create answer');
              pc.setLocalDescription(sdp, function(){
                //console.log(' set local description');
                Socket.emit('msg', { by: data.to, to: data.by, sdp: sdp, type: 'sdp-answer' });
                //console.log('current id: '+data.by+' to: '+data.by+'type: '+data.type);                
              },function (e) {
                //console.log('error local description');
                console.error(e);
              });
            },function (e) {
              //console.log('error create answer');
                console.error(e);
              });
          }, function (e) {
              console.error(e);
            });
          break;
        case 'sdp-answer':
        //console.log('recieve answer sdp below :');
        //console.log(data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            //console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
        case 'ice':
          if (data.ice) {
            //console.log('Adding ice candidates');
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
            //console.log('added ice candidates');
          }
          break;
        case 'close':
            //console.log('Adding ice candidates');
            pc.close();
            //console.log('added ice candidates');
          break;
      }
    }

    Socket = Socket.connect(config.SIGNALIG_SERVER_URL);
    var connected = false;

    function addHandlers(Socket) {
      Socket.on('peer.connected', function (params) { 
        //console.log('peer connected ');
        currentId = params.id;
        partnerId = params.partner;
        makeOffer(params.partner,params.id);
      });
      Socket.on('peer.disconnected', function (data) {
        api.trigger('peer.disconnected', [data]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      });
      Socket.on('msg', function (data) {
        handleMessage(data);
      });
    }

    var api = {
      joinRoom: function (r) {
        if (!connected) {
          Socket.emit('init', { room: r }, function (roomid, id) {
            currentId = id;
            roomId = roomid;
          });
          connected = true;
        }
      },
      createRoom: function () {
        var d = $q.defer();
        Socket.emit('init', null, function (roomid, id) {
          d.resolve(roomid);
          roomId = roomid;
          currentId = id;
          connected = true;
        });
        return d.promise;
      },
      init: function (s) {
        stream = s;
      }
    };
    EventEmitter.call(api);
    Object.setPrototypeOf(api, EventEmitter.prototype);

    addHandlers(Socket);
    return api;
  })
.factory('quitButton',[function(){
  var quitButton,sureButton,newButton,connection;
  function hide(){
    quitButton = true;
    sureButton = false;
    newButton = true;
    connection = false;
  }
  function getConnection(){
    return connection;
  }
  function getQuitButtonValue(){
    return quitButton;
  }
  function getSureButtonValue(){
    return sureButton;
  }
  function getNewButtonValue(){
    return newButton;
  }
  return {
    hide:hide,
    getQuit:getQuitButtonValue,
    getSure:getSureButtonValue,
    getNew:getNewButtonValue,
    getConnection:getConnection
  };
}]);
