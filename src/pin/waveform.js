import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import SpectrogramPlugin from "wavesurfer.js/src/plugin/spectrogram";

const Waveform = (props) => {
  const containerRef = useRef();
  const spectrogramRef = useRef();
  const wavesurferRef = useRef();

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      height: 64,
      interact: false,
      responsive: true,
      hideScrollbar: true,
      plugins: [
        SpectrogramPlugin.create({
          wavesurfer: wavesurferRef.current,
          container: spectrogramRef.current,
          height: 64,
        }),
      ],
    });

    if (props.audio instanceof Blob) {
      wavesurfer.loadBlob(props.audio);
    } else {
      wavesurfer.load(props.audio);
    }

    wavesurfer.on("ready", () => {
      wavesurferRef.current = wavesurfer;
    });

    wavesurfer.on("finish", () => wavesurfer.seekTo(0));

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onClick={() => wavesurferRef.current.play(0)}
      ></div>
      <div ref={spectrogramRef}></div>
    </>
  );
};

export default Waveform;
