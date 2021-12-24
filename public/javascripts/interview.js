"use strict";

var video = document.querySelector("#videoElement1");

if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia({ video: true })
		.then(function (stream) {
			video.srcObject = stream;
		})
		.catch(function (err0r) {
			console.log("Something went wrong!");
		});
}

var constraints = { video: true, audio: true };

var shareBtn = document.querySelector("button#shareScreen");
var recBtn = document.querySelector("button#rec");
var stopBtn = document.querySelector("button#stop");

var videoElement = document.querySelector("#screensharing");
var dataElement = document.querySelector("#data");
var downloadLink = document.querySelector("a#downloadLink");
var r;
var k;
videoElement.controls = false;

var mediaRecorder;
var chunks = [];
var count = 0;
var localStream = null;
var soundMeter = null;
var micNumber = 0;

function onShareScreen() {
	if (!navigator.mediaDevices.getDisplayMedia) {
		alert(
			"navigator.mediaDevices.getDisplayMedia not supported on your browser, use the latest version of Chrome"
		);
	} else {
		if (window.MediaRecorder == undefined) {
			alert(
				"MediaRecorder not supported on your browser, use the latest version of Firefox or Chrome"
			);
		} else {
			navigator.mediaDevices.getDisplayMedia(constraints).then(function (screenStream) {
				//check for microphone
				navigator.mediaDevices.enumerateDevices().then(function (devices) {
					devices.forEach(function (device) {
						if (device.kind == "audioinput") {
							micNumber++;
						}
					});

					if (micNumber == 0) {
						getStreamSuccess(screenStream);
					} else {
						navigator.mediaDevices.getUserMedia({ audio: true }).then(function (micStream) {
							var composedStream = new MediaStream();

							//added the video stream from the screen
							screenStream.getVideoTracks().forEach(function (videoTrack) {
								composedStream.addTrack(videoTrack);
							});

							//if system audio has been shared
							if (screenStream.getAudioTracks().length > 0) {
								//merge the system audio with the mic audio
								var context = new AudioContext();
								var audioDestination = context.createMediaStreamDestination();

								const systemSource = context.createMediaStreamSource(screenStream);
								const systemGain = context.createGain();
								systemGain.gain.value = 1.0;
								systemSource.connect(systemGain).connect(audioDestination);
								console.log("added system audio");

								if (micStream && micStream.getAudioTracks().length > 0) {
									const micSource = context.createMediaStreamSource(micStream);
									const micGain = context.createGain();
									micGain.gain.value = 1.0;
									micSource.connect(micGain).connect(audioDestination);
									console.log("added mic audio");
								}

								audioDestination.stream.getAudioTracks().forEach(function (audioTrack) {
									composedStream.addTrack(audioTrack);
								});
							} else {
								//add just the mic audio
								micStream.getAudioTracks().forEach(function (micTrack) {
									composedStream.addTrack(micTrack);
								});
							}

							getStreamSuccess(composedStream);

						})
							.catch(function (err) {
								log("navigator.getUserMedia error: " + err);
							});
					}
				})
					.catch(function (err) {
						log(err.name + ": " + err.message);
					});
			})
				.catch(function (err) {
					log("navigator.getDisplayMedia error: " + err);
				});
		}
	}
}

function getStreamSuccess(stream) {
	localStream = stream;
	localStream.getTracks().forEach(function (track) {
		if (track.kind == "audio") {
			track.onended = function (event) {
				log("audio track.onended Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
			};
		}
		if (track.kind == "video") {
			track.onended = function (event) {
				log("video track.onended Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
			};
		}
	});

	videoElement.srcObject = localStream;
	videoElement.play();
	videoElement.muted = true;
	recBtn.disabled = false;
	shareBtn.disabled = true;

	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		window.audioContext = new AudioContext();
	} catch (e) {
		log("Web Audio API not supported.");
	}

	soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
	soundMeter.connectToSource(localStream, function (e) {
		if (e) {
			log(e);
			return;
		}
	});
}

function onBtnRecordClicked() {
	console.log("Rushabh1");
	if (localStream == null) {
		alert("Could not get local stream from mic/camera");
	} else {
		recBtn.disabled = true;
		stopBtn.disabled = false;

		/* use the stream */
		log("Start recording...");
		if (typeof MediaRecorder.isTypeSupported == "function") {
			if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
				var options = { mimeType: "video/webm;codecs=vp9" };
			} else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
				var options = { mimeType: "video/webm;codecs=h264" };
			} else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
				var options = { mimeType: "video/webm;codecs=vp8" };
			}
			log("Using " + options.mimeType);
			mediaRecorder = new MediaRecorder(localStream, options);
		} else {
			log("isTypeSupported is not supported, using default codecs for browser");
			mediaRecorder = new MediaRecorder(localStream);
		}

		mediaRecorder.ondataavailable = function (e) {
			chunks.push(e.data);
		};

		mediaRecorder.onerror = function (e) {
			log("mediaRecorder.onerror: " + e);
		};

		mediaRecorder.onstart = function () {
			log("mediaRecorder.onstart, mediaRecorder.state = " + mediaRecorder.state);

			localStream.getTracks().forEach(function (track) {
				if (track.kind == "audio") {
					log("onstart - Audio track.readyState=" + track.readyState + ", track.muted=" + track.muted);
				}
				if (track.kind == "video") {
					log("onstart - Video track.readyState=" + track.readyState + ", track.muted=" + track.muted);
				}
			});
		};

		mediaRecorder.onstop = function () {
			log("mediaRecorder.onstop, mediaRecorder.state = " + mediaRecorder.state);

			var blob = new Blob(chunks, { type: "video/webm" });
			let form = new FormData();
			let request = new XMLHttpRequest();
			form.append("video-blob", blob);
			form.append("question", document.getElementById('quest').innerHTML);
			request.open("POST", "/interviews/finish", true);
			request.send(form); // hits the route but doesn't send the file
			request.onload = function () {
				console.log(request.readyState);
				if (request.readyState === request.DONE) {
					console.log(request.status);
					if (request.status === 200) {
						console.log(request.response);
						window.location.href = '/interviews/submit';
					}
				}
			};
			document.getElementById('uupload').innerHTML = `<button type="button" class="btn btn-success" style="margin-left: 80px;"><b>Uploading...</b></button>`;
			chunks = [];
			//setTimeout(function() {
				
			//}, 10000)
			// var videoURL = window.URL.createObjectURL(blob);
			// r = blob;
			// downloadLink.href = videoURL;
			// videoElement.src = videoURL;
			// downloadLink.innerHTML = "Download video file";

			// var rand = Math.floor(Math.random() * 10000000);
			// var name = "video_" + rand + ".webm";
			// k = name;

			// downloadLink.setAttribute("download", name);
			// downloadLink.setAttribute("name", name);
		};

		mediaRecorder.onwarning = function (e) {
			log("mediaRecorder.onwarning: " + e);
		};

		mediaRecorder.start(10);

		localStream.getTracks().forEach(function (track) {
			log(track.kind + ":" + JSON.stringify(track.getSettings()));
			console.log(track.getSettings());
		});
	}
	console.log("Rushabh2");
}

function onBtnStopClicked() {
	//loadFile();
	mediaRecorder.stop();
	videoElement.controls = true;
	recBtn.disabled = false;
	stopBtn.disabled = true;
	// setTimeout(uploadFile(), 2000);
}

function onStateClicked() {
	if (mediaRecorder != null && localStream != null && soundMeter != null) {
		log("mediaRecorder.state=" + mediaRecorder.state);
		log("mediaRecorder.mimeType=" + mediaRecorder.mimeType);
		log("mediaRecorder.videoBitsPerSecond=" + mediaRecorder.videoBitsPerSecond);
		log("mediaRecorder.audioBitsPerSecond=" + mediaRecorder.audioBitsPerSecond);

		localStream.getTracks().forEach(function (track) {
			if (track.kind == "audio") {
				log("Audio: track.readyState=" + track.readyState + ", track.muted=" + track.muted);
			}
			if (track.kind == "video") {
				log("Video: track.readyState=" + track.readyState + ", track.muted=" + track.muted);
			}
		});

		log("Audio activity: " + Math.round(soundMeter.instant.toFixed(2) * 100));
	}
}

function log(message) {
	dataElement.innerHTML = dataElement.innerHTML + "<br>" + message;
	console.log(message);
}

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context) {
	this.context = context;
	this.instant = 0.0;
	this.slow = 0.0;
	this.clip = 0.0;
	this.script = context.createScriptProcessor(2048, 1, 1);
	var that = this;
	this.script.onaudioprocess = function (event) {
		var input = event.inputBuffer.getChannelData(0);
		var i;
		var sum = 0.0;
		var clipcount = 0;
		for (i = 0; i < input.length; ++i) {
			sum += input[i] * input[i];
			if (Math.abs(input[i]) > 0.99) {
				clipcount += 1;
			}
		}
		that.instant = Math.sqrt(sum / input.length);
		that.slow = 0.95 * that.slow + 0.05 * that.instant;
		that.clip = clipcount / input.length;
	};
}

SoundMeter.prototype.connectToSource = function (stream, callback) {
	console.log("SoundMeter connecting");
	try {
		this.mic = this.context.createMediaStreamSource(stream);
		this.mic.connect(this.script);
		// necessary to make sample run, but should not be.
		this.script.connect(this.context.destination);
		if (typeof callback !== "undefined") {
			callback(null);
		}
	} catch (e) {
		console.error(e);
		if (typeof callback !== "undefined") {
			callback(e);
		}
	}
};
SoundMeter.prototype.stop = function () {
	this.mic.disconnect();
	this.script.disconnect();
};



// var fileData = null;


// function uploadFile() {
// 	var fd = new FormData();
// 	var files = new File([r], k);

// 	fd.append('video-blob', files);

// 	let form = new FormData();
// 	let request = new XMLHttpRequest();
// 	form.append("video-blob", files);
// 	request.open("POST", "/interviews/finish", true);
// 	request.send(form); // hits the route but doesn't send the file
// 	request.onload = function () {
// 		if (request.readyState === request.DONE) {
// 			if (request.status === 200) {
// 				console.log(request.response);
// 			}
// 		}
// 	};
// }



onShareScreen();