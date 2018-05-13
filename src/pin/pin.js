import React, { Component }
    from 'react';
import Waveform from './waveform';
// import Spectrum from './spectrum';
import './speechcapture';

import './pin.css';

class Pin extends Component {
    constructor(props) {
        super(props);

        var records = (this.props.records || []).map(r => this.createRecord(r.blob, r.name));

        this.state = {
            name: this.props.name ? (this.props.name + '') : 'pin',
            records: records,
            recording: false,
            save: this.props.save !== false,
            redraw: false
        };

        this.speechcapture = window.speechcapture;

        this.onClick = this.onClick.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onFile = this.onFile.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.createRecord = this.createRecord.bind(this);
        this.saveRecord = this.saveRecord.bind(this);
        this.createDataUrl = this.createDataUrl.bind(this);
        this.initAudio = this.initAudio.bind(this);

        this.onSpeechCaptured = this.onSpeechCaptured.bind(this);
        this.onSpeechStatus = this.onSpeechStatus.bind(this);
        this.onSpeechError = this.onSpeechError.bind(this);
        this.startCapture = this.startCapture.bind(this);
        this.stopCapture = this.stopCapture.bind(this);
        this.speechConfig = this.speechConfig.bind(this);

        this.initAudio();
    }
    componentWillUnmount() {
        this.state.records.map(record => {
            return window.URL.revokeObjectURL(record.blobUrl);
        });
    }
    componentWillReceiveProps() {
        this.setState({
            redraw: !this.state.redraw
        });
    }
    render() {
        return (
            <div className="pin">
                <div className="pin-button" id={this.state.name} onTouchTap={this.onClick}>
                    <span>{this.state.recording ? 'stop' : this.state.name}</span>
                    <input id={this.state.name + '-file'} type="file" name="audio" accept="audio/*" capture onChange={this.onFile} style={{ display: 'none' }} />
                </div>
                <div className="pin-records">
                    {this.state.records.map((record, recIndex) => (
                        <div className="pin-record" key={record.name + '-' + recIndex}>
                            <div className="record-remove" id={this.state.name + '-' + recIndex} onTouchTap={this.onRemove}>Remove</div>
                            <Waveform id={'wf-' + this.state.name + '-' + recIndex} audio={record.blobUrl} redraw={this.state.redraw} />
                            {/* <Spectrum name={this.props.name + '-' + recIndex} buffer={record.blob} /> */}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    onPlay(event) {

        var recordIndex = parseInt(event.currentTarget.id.split('-')[1], 10);
        var record = this.state.records[recordIndex];

        if (typeof record.play === 'function') {
            record.play();
            // this.showSpectrum(record);
        }
    }
    onFile(event) {

        var onFileDone = function (e) {

            var file = e.target.result;
            var blob = new Blob([file], { type: 'audio/wav' });

            var record = this.createRecord(blob, this.generateRecordName());
            this.saveRecord(record);

            this.setState({
                recording: !this.state.recording
            });
        };

        onFileDone = onFileDone.bind(this);

        var reader = new FileReader();
        reader.onloadend = (function (theFile) {
            return onFileDone;
        })(event.target.files[0]);

        reader.readAsArrayBuffer(event.target.files[0]);
    }
    onRemove(event) {

        // debugger
        var recordIndex = parseInt(event.target.id.split('-')[1], 10);
        var records = this.state.records.slice();
        var record = records[recordIndex];

        this.props.onRecordRemove &&
            this.props.onRecordRemove({ record: record.name });

        records.splice(recordIndex, 1);

        this.setState({
            records: records
        });
    }
    onClick(event) {

        if (!this.state.recording) {
            this.startCapture();
        }
        else {
            this.stopCapture();
        }

        this.setState({
            recording: !this.state.recording
        });
    }
    initAudio() {
        try {
            // Monkeypatch for AudioContext, getUserMedia and URL
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            window.URL = window.URL || window.webkitURL || window || {};

            // Store the instance of AudioContext globally
            console.log('Audio context is ready !');
            console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
            alert('No web audio support in this browser!');
        }
    }
    /////////////////////////////////
    onSpeechCaptured(audioData, type) {

        console.log('audioData captured: ', type, audioData);

        switch (type) {
            case this.speechcapture.AUDIO_RESULT_TYPE.WEBAUDIO_AUDIOBUFFER:
                // Do something with the captured Web Audio buffer ...
                break;

            case this.speechcapture.AUDIO_RESULT_TYPE.RAW_DATA:
                // Do something with the captured Float32Array ...
                break;

            case this.speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB:
                // Do something with the captured WAV audio Blob ...
                var record = this.createRecord(audioData, this.generateRecordName());
                this.saveRecord(record);

                break;

            case this.speechcapture.AUDIO_RESULT_TYPE.DETECTION_ONLY:
                // Do something based on the successful capture event, which in this case does not contain any audio data.
                break;

            default:
                // Unknown audio result
                break;
        }
    }

    onSpeechError(message) {
        // Do something with the error message.
        this.recordFromFile = true;

        var el = document.getElementById(this.state.name + '-file');
        el.click();
    }

    onSpeechStatus(code) {
        switch (code) {
            case this.speechcapture.STATUS.CAPTURE_STARTED:
                console.log("Capture Started!");
                break;
            case this.speechcapture.STATUS.CAPTURE_STOPPED:
                console.log("Capture Stopped!");
                break;
            case this.speechcapture.STATUS.SPEECH_STARTED:
                console.log("Speech Started!");
                break;
            case this.speechcapture.STATUS.ENCODING_ERROR:
                console.log("Encoding Error!");
                break;
            case this.speechcapture.STATUS.CAPTURE_ERROR:
                console.log("Capture Error!");
                break;
            case this.speechcapture.STATUS.SPEECH_ERROR:
                console.log("Speech Error!");
                break;
            case this.speechcapture.STATUS.SPEECH_MAX_LENGTH:
                console.log("Max Speech length!");
                break;
            case this.speechcapture.STATUS.SPEECH_MIN_LENGTH:
                console.log("Min Speech length!");
                break;
            case this.speechcapture.STATUS.SPEECH_STOPPED:
                console.log("Speech Stopped!");
                break;
            default:
                console.log("Unknown status occurred: " + code);
                break;
        }
    }

    speechConfig() {

        var audioContext = window.audioContext;
        var mode = this.speechcapture.AUDIO_RESULT_TYPE.WAV_BLOB;
        var audioSourceType = null;//this.speechcapture.audioinput.AUDIOSOURCE_TYPE.DEFAULT;

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
            speechDetectionThreshold: 15,  // dB

            // The minimum length of speech to capture.
            speechDetectionMinimum: 0,//default: 500, // mS

            // The maximum length of the captured speech.
            speechDetectionMaximum: 1000,//10000, // mS

            // The maximum allowed delay, before speech is considered to have ended.
            speechDetectionAllowedDelay: 400,//400, // mS

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
            debugConsole: false
        };
    }

    /**
     *
     */
    startCapture() {

        var captureCfg = this.speechConfig();
        var onSpeechCaptured = this.onSpeechCaptured;
        var onSpeechError = this.onSpeechError;
        var onSpeechStatus = this.onSpeechStatus;

        try {
            if (!this.speechcapture.isCapturing()) {
                this.speechcapture.start(captureCfg, onSpeechCaptured, onSpeechError, onSpeechStatus);
            }
        }
        catch (e) {
            alert("startCapture exception: " + e);
        }
    }

    stopCapture() {
        try {
            if (this.speechcapture.isCapturing()) {
                this.speechcapture.stop();
            }
        }
        catch (e) {
            alert("stopCapture exception: " + e);
        }
    }
    generateRecordName() {
        return new Date().toISOString();
    }
    createRecord(blob, name) {

        let records = this.state.records.slice();
        let blobUrl = (window.URL || window.webkitURL || window || {}).createObjectURL(blob);
        let record = {
            pin: this.state.name,
            name: name || new Date().toISOString() + '.wav',
            blobUrl: blobUrl,
            blob: blob,
            play: () => { }
        };

        records.push(record);

        this.setState({
            records: records
        });

        return record;
    }
    saveRecord(record) {
        if (this.state.save) {
            return this.createDataUrl(record.blob)
                .then(dataUrl => {

                    var name = 'pin-' + record.pin + '-' + record.name;
                    var data = {
                        name: name,
                        data: dataUrl
                    };

                    localStorage.setItem(name, data);

                    if(this.props.onRecordAdd) {
                        this.props.onRecordAdd(data);
                    }
                });
        }
    }
    createDataUrl(blob) {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = function () {
                resolve(fr.result);
            }
            if (blob instanceof Blob) {
                fr.readAsDataURL(blob);
            }
            else {
                console.log('Failed to convert blob: ', blob);
            }
        });
    }
}

export default Pin;
