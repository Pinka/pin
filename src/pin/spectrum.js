import React, { Component }
    from 'react';

import _ from 'lodash';

class Spectrum extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     isToggleOn: true
        // };

        // // This binding is necessary to make `this` work in the callback
        // this.onClick = this.onClick.bind(this);

        this.trimAudio = this.trimAudio.bind(this);

        this.spectrum = this.spectrum.bind(this);
        this.reload = this.reload.bind(this);
    }
    render() {
        return (
            <div id={this.props.name + "-spectrum"} className="spectrum" onClick={this.onClick}>
                <canvas className="spectrum-canvas" width="1" height="100"></canvas>
            </div>
        );
    }
    componentDidMount() {
        this.reload();
    }
    componentWillReceiveProps(nextProps) {
        this.props = nextProps;
        this.reload();
    }
    reload() {

        if (this.props.buffer) {

            //https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/oncomplete
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var analyser = audioCtx.createAnalyser();
            // var source = audioCtx.createBufferSource();

            var onFileDone = function (e) {

                var file = e.target.result;

                audioCtx.decodeAudioData(file, (buffer) => {

                    var bufferLength = analyser.frequencyBinCount;
                    console.log('bufferLength:', bufferLength);

                    var trimBuffer = this.trimAudio(buffer, audioCtx);

                    this.spectrum(trimBuffer);

                    //var offlineCtx = new OfflineAudioContext(1, 44100 * 40, 44100);


                    // myBuffer = buffer;
                    // source.buffer = buffer;

                    // source.connect(offlineCtx.destination);
                    // source.start();
                    // //source.loop = true;
                    // offlineCtx.startRendering().then(function (renderedBuffer) {
                    //     this.spectrum(renderedBuffer);
                    //     // this.spectrum(analyser);
                    // }).catch(function (err) {
                    //     console.log('Rendering failed: ' + err);
                    //     // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
                    // });
                });
            };

            onFileDone = onFileDone.bind(this);

            var reader = new FileReader();
            reader.onloadend = (function (theFile) {
                return onFileDone;
            })(this.props.buffer);

            reader.readAsArrayBuffer(this.props.buffer);
        }
    }
    trimAudio(buffer, audioCtx) {

        // var channelCount = buffer.numberOfChannels;
        // var sampleRate = buffer.SampleRate;
        // var samples = [];

        // for (var i = 0; i < channelCount; i++) {

        //     samples[i] = buffer.getChannelData(i)
        //         .filter(sample => {
        //             return sample !== 0;
        //         });
        // }

        // var newBufferLength = _.max(samples.map(s => s.length));
        // var newBuffer = samples
        //     .reduce((result, sample, i) => {
        //         result.copyToChannel(sample, i, 0);
        //         return result;
        //     }, audioCtx.createBuffer(channelCount, newBufferLength, buffer.sampleRate));

        // return newBuffer;
        return buffer;
    }
    spectrum(buffer) {

        var spectrumId = this.props.name + '-spectrum';

        var container = document.getElementById(spectrumId);
        var containerWidth = container.offsetWidth;

        var canvas = container.querySelector('.spectrum-canvas');

        
        if (canvas) {
            canvas.width = containerWidth;
            var canvasCtx = canvas.getContext("2d");
        }
        else {
            console.debug('oscilator container not found');
            return;
        }

        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        // background
        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        draw(buffer.getChannelData(0), 'green');
        //draw(buffer.getChannelData(1), 'yellow');

        function draw(data, color) {

            // requestAnimationFrame(draw);
            // var channels = analyser.numberOfChannels;
            // var frameCount = analyser.sampleRate * 2.0;
            // var data = buffer.getChannelData(0);
            var samplesInPixel = parseInt(data.length / WIDTH, 10);
            var pixelSamples = [];
            var x = 0;
            var barHeight;

            // data color
            canvasCtx.fillStyle = color;

            // var max = (max, current) => {
            //     return max > current ? max : current;
            // };

            // var min = (min, current) => {
            //     return min < current ? min : current;
            // };

            var j = 0;
            for (var i = 0; i < data.length; i++) {

                pixelSamples[j] = data[i];

                if (i % samplesInPixel === 1) {
                    j = 0;

                    var high = _.max(pixelSamples);

                    barHeight = high * 1000;
                    canvasCtx.fillRect(x, HEIGHT - barHeight / 2, 1, barHeight / 2);

                    x += 1;
                }
            }

            // for (var i = 0; i < bufferLength; i++) {
            //     barHeight = dataArray[i] + 20;
            //     canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
            //     x += barWidth + 1;
            // }

            // canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            // canvasCtx.lineWidth = 2;
            // canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            // canvasCtx.beginPath();

            // var sliceWidth = WIDTH * 1.0 / bufferLength;
            // var x = 0;

            // for (var i = 0; i < bufferLength; i++) {

            //     var v = dataArray[i] / 128.0;
            //     var y = v * HEIGHT / 2;

            //     if (i === 0) {
            //         canvasCtx.moveTo(x, y);
            //     }
            //     else {
            //         canvasCtx.lineTo(x, y);
            //     }

            //     x += sliceWidth;
            // }

            // canvasCtx.lineTo(canvas.width, canvas.height / 2);
            // canvasCtx.stroke();
        }
    }
}

export default Spectrum;
