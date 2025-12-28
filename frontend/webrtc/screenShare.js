document.getElementById("shareScreen").onclick = async () => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  const sender = pc.getSenders().find(s => s.track.kind === "video");
  sender.replaceTrack(screenStream.getVideoTracks()[0]);
};