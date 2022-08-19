import React, { Component, useState } from "react";
import Waveform from "./Waveform";
import { useLiveQuery } from "dexie-react-hooks";
// import Spectrum from './spectrum';
import "./speechcapture";
import { db } from "./../db";

import "./pin.css";

const speechcapture = window.speechcapture;

const Pin = ({ name }) => {
  const records =
    useLiveQuery(() => db.records.where({ pinName: name }).toArray()) ?? [];

  const [isRecording, setIsRecording] = useState(false);

  const onRecord = () => {
    if (isRecording) {
      stopCapture();
    } else {
      startCapture();
    }

    setIsRecording((prev) => !prev);
  };

  const startCapture = () => {
    try {
      if (!speechcapture.isCapturing()) {
        speechcapture.start(
          getSpeechConfig(),
          onSpeechCaptured(name),
          onSpeechError,
          onSpeechStatus
        );
      }
    } catch (e) {
      alert("startCapture exception: " + e);
    }
  };

  const stopCapture = () => {
    try {
      if (speechcapture.isCapturing()) {
        speechcapture.stop();
      }
    } catch (e) {
      alert("stopCapture exception: " + e);
    }
  };

  return (
    <div className="pin">
      <div className="pin-button" onClick={onRecord}>
        <span>{isRecording ? "Stop" : "Record"}</span>
      </div>
      <div className="pin-records">
        {records?.map((record, index) => (
          <Waveform key={index} audio={record.dataUrl} />
        ))}
      </div>
    </div>
  );
};

const getSpeechConfig = () => {
  const audioContext = window.audioContext;
  const mode = speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB;
  const audioSourceType = null; //this.speechcapture.audioinput.AUDIOSOURCE_TYPE.DEFAULT;

  return {
    // The sample rate for captured audio results.
    // Since the sample rate of the input device not always can be changed, the library will resample the audio if needed,
    // but this requires web audio support since OfflineAudioContext is used for the resampling.
    sampleRate: 16000, // Hz

    // The preferred sample rate that the input device should use when capturing audio.
    // Since the sample rate cannot be changed or have additional limits on some platforms, this parameter may be ignored,
    // so use the sampleRate parameter above to ensure that audio is resampled to the required sampleRate in your specific
    // scenario.
    inputSampleRate: 22050, // Hz

    // Threshold for capturing speech.
    // The audio level must rise to at least the threshold for speech capturing to start.
    speechDetectionThreshold: 15, // dB

    // The minimum length of speech to capture.
    speechDetectionMinimum: 0, //default: 500, // mS

    // The maximum length of the captured speech.
    speechDetectionMaximum: 1000, //10000, // mS

    // The maximum allowed delay, before speech is considered to have ended.
    speechDetectionAllowedDelay: 400, //400, // mS

    // The length of the audio chunks that are analyzed.
    // Shorter gives better results, while longer gives better performance.
    analysisChunkLength: 100, // mS

    // Removes pauses/silence from the captured output. Will not concatenate all words aggressively,
    // so individual words should still be identifiable in the result.
    compressPauses: false,

    // Do not capture any data, just speech detection events.
    // The result audio result type is automatically set to speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY.
    detectOnly: false,

    // Specifies the type of result produce when speech is captured.
    // For convenience, use the speechcapture.AUDIO_RESULT_TYPE constants to set this parameter:
    // -WAV_BLOB (1) - WAV encoded Audio blobs
    // -WEBAUDIO_AUDIOBUFFER (2) - Web Audio API AudioBuffers
    // -RAW_DATA (3) - Float32Arrays with the raw audio data, doesn't support resampling
    // -DETECTION_ONLY (4) - Used automatically when detectOnly is true
    audioResultType: mode,

    // Specify an existing audioContext if your application uses the Web Audio API. If no audioContext is specified,
    // the library will try to create one. The audioContext is only used if the audioResultType is set to
    // WEBAUDIO_AUDIOBUFFER or if resampling is required (sampleRate != inputSampleRate).
    //
    audioContext: audioContext,

    // Only applicable if cordova-plugin-audioinput is used as the audio source.
    // Specifies the type of the type of source audio your app requires.
    //
    // For convenience, use the audioinput.AUDIOSOURCE_TYPE constants of the audioinput plugin to set this parameter:
    // -DEFAULT (0) - The default audio source of the device.
    // -CAMCORDER (5) - Microphone audio source with same orientation as camera if available.
    // -UNPROCESSED (9) - Unprocessed sound if available.
    // -VOICE_COMMUNICATION (7) - Tuned for voice communications such as VoIP.
    // -MIC (1) - Microphone audio source. (Android only)
    // -VOICE_RECOGNITION (6) - Tuned for voice recognition if available (Android only)
    //
    // For speech detection either VOICE_COMMUNICATION (7) or VOICE_RECOGNITION (6) is preferred.
    //
    audioSourceType: audioSourceType,

    // Prefer audio input using getUserMedia and use cordova-plugin-audioinput only as a fallback. Only useful if both are supported by the current platform.
    preferGUM: false,

    // Enable or disable the usage of the cordova-plugin-audioinput plugin even if it is available.
    audioinputPluginActive: false,

    // Enable or disable the usage of the getUserMedia as audio input even if it is available.
    getUserMediaActive: true,

    // Use window.alert and/or window.console to show errors
    debugAlerts: false,
    debugConsole: false,
  };
};

const onSpeechCaptured = (pinName) => (audioData, type) => {
  console.log("audioData captured: ", type, audioData);

  switch (type) {
    case speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER:
      // Do something with the captured Web Audio buffer ...
      break;

    case speechcapture.AUDIO_RESULT_TYPE.RAW_DATA:
      // Do something with the captured Float32Array ...
      break;

    case speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB:
      // Do something with the captured WAV audio Blob ...
      //   var record = createRecord(audioData, generateRecordName());
      saveRecord(pinName, audioData);
      break;

    case speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY:
      // Do something based on the successful capture event, which in this case does not contain any audio data.
      break;

    default:
      // Unknown audio result
      break;
  }
};

const onSpeechError = (message) => {
  console.log(message);
};

const onSpeechStatus = (code) => {
  switch (code) {
    case speechcapture.STATUS.CAPTURE_STARTED:
      console.log("Capture Started!");
      break;
    case speechcapture.STATUS.CAPTURE_STOPPED:
      console.log("Capture Stopped!");
      break;
    case speechcapture.STATUS.SPEECH_STARTED:
      console.log("Speech Started!");
      break;
    case speechcapture.STATUS.ENCODING_ERROR:
      console.log("Encoding Error!");
      break;
    case speechcapture.STATUS.CAPTURE_ERROR:
      console.log("Capture Error!");
      break;
    case speechcapture.STATUS.SPEECH_ERROR:
      console.log("Speech Error!");
      break;
    case speechcapture.STATUS.SPEECH_MAX_LENGTH:
      console.log("Max Speech length!");
      break;
    case speechcapture.STATUS.SPEECH_MIN_LENGTH:
      console.log("Min Speech length!");
      break;
    case speechcapture.STATUS.SPEECH_STOPPED:
      console.log("Speech Stopped!");
      break;
    default:
      console.log("Unknown status occurred: " + code);
      break;
  }
};

const saveRecord = async (pinName, blob) => {
  const dataUrl = await createDataUrl(blob);
  await db.records.add({ pinName, dataUrl });
};

const createDataUrl = async (blob) => {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onload = function () {
      resolve(fr.result);
    };
    if (blob instanceof Blob) {
      fr.readAsDataURL(blob);
    } else {
      console.log("Failed to convert blob: ", blob);
    }
  });
};

export default Pin;
