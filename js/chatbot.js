 var accessToken = "47931cb3d35c4c48b97478f5bcc48bd1",
      baseUrl = "https://api.api.ai/v1/",
      $speechInput,
      $recBtn,
      recognition,
      messageRecording = "Recording...",
      messageCouldntHear = "I couldn't hear you, could you say that again?",
      messageInternalError = "Oh no, there has been an internal server error",
      messageSorry = "I'm sorry, I don't have the answer to that yet.";

    $(document).ready(function() {
      $speechInput = $("#speech");
      $recBtn = $("#rec");

      $speechInput.keypress(function(event) {
        if (event.which == 13) {
          event.preventDefault();
          send();
		  $(".spoken-response__text-input").remove();
		  $(".spoken-response__text").remove();
		  $("#spokenResponse").append("<div class='spoken-response__text-input col-11'>" + $speechInput.val() + "</div>");
		$("#spokenResponse").append("<div class='spoken-response__text-waiting col-11'>One moment...</div>");
        }
      });
      $recBtn.on("click", function(event) {
        //switchRecognition();
		send();
		$(".spoken-response__text-input").remove();
		  $(".spoken-response__text").remove();
		$("#spokenResponse").append("<div class='spoken-response__text-input col-11'>" + $speechInput.val() + "</div>");
		$("#spokenResponse").append("<div class='spoken-response__text-waiting col-11'>One moment...</div>");
      });
      $(".debug__btn").on("click", function() {
        $(this).next().toggleClass("is-active");
        return false;
      });
    });

    function startRecognition() {
		console.log($speechInput.val());
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
          recognition.interimResults = false;

      recognition.onstart = function(event) {
        respond(messageRecording);
        updateRec();
      };
      recognition.onresult = function(event) {
        recognition.onend = null;
        
        var text = "";
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
		 
			 
			 
		  
		  
        stopRecognition();
      };
      recognition.onend = function() {
        respond(messageCouldntHear);
        stopRecognition();
      };
      recognition.lang = "en-US";
      recognition.start();
	  send( $speechInput.val());
    }
  
    function stopRecognition() {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      updateRec();
    }

    function switchRecognition() {
      if (recognition) {
        stopRecognition();
      } else {
        startRecognition();
      }
    }

    function setInput(text) {
      $speechInput.val(text);
	  console.log(text);
      send();
    }

    function updateRec() {
      $recBtn.text(recognition ? "Stop" : "Speak");
    }

    function send(text) {
		console.log("send");
      var text = $speechInput.val();
      $.ajax({
        type: "POST",
        url: baseUrl + "query?=v20150910",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Bearer " + accessToken
        },
        data: JSON.stringify({query: text, lang: "en", sessionId: "0a404de0-64e5-4f0d-87b7-07a65198ab78"}),

        success: function(data) {
          prepareResponse(data);
        },
        error: function() {
          respond(messageInternalError);
        }
      });
    }

    function prepareResponse(val) {
      var debugJSON = JSON.stringify(val, undefined, 2),
        spokenResponse = val.result.speech;

      respond(spokenResponse);
      debugRespond(debugJSON);
    }

    function debugRespond(val) {
      $("#response").text(val);
    }

    function respond(val) {
      if (val == "") {
        val = messageSorry;
		
      }

      if (val !== messageRecording) {
        var msg = new SpeechSynthesisUtterance();
        msg.voiceURI = "native";
        msg.text = val;
        msg.lang = "en-US";
        window.speechSynthesis.speak(msg);
      }

      $("#spokenResponse").append("<div class='spoken-response__text col-11'>" + val + "</div>");
	  $(".spoken-response__text-waiting").remove();
	  $speechInput.val("");
    }