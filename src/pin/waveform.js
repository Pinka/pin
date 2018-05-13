import React, { Component }
    from 'react';
import WaveSurfer from 'wavesurfer.js';

class Waveform extends Component {
    constructor(props) {
        super(props);

        this.play = this.play.bind(this);
        this.reset = this.reset.bind(this);
        this.redraw = this.redraw.bind(this);

        this.wavesurfer = null;

        this.id = this.props.id || '_' + new Date().getTime();
        this.height = this.props.height || 64;

    }
    componentDidMount() {

        this.wavesurfer = WaveSurfer.create({
            container: '#' + this.id,
            height: this.height,
            interact: false
        });

        if(this.props.audio instanceof Blob) {
            this.wavesurfer.loadBlob(this.props.audio);
        }
        else {
            this.wavesurfer.load(this.props.audio);
        }

        this.wavesurfer.on('finish', this.reset);
    }
    componentWillReceiveProps() {
        this.redraw();
    }

    render() {
        return (
            <div id={this.id} onTouchTap={this.play}></div>
        );
    }
    play() {
        this.wavesurfer.play(0);
    }
    reset() {
        this.wavesurfer.seekTo(0);
    }
    redraw() {
        this.wavesurfer.drawer.containerWidth = this.wavesurfer.drawer.container.clientWidth;
        this.wavesurfer.drawBuffer();
    }
}

export default Waveform;