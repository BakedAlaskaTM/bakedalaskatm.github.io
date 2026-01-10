export function tracksToTable(tracksJson, worldRecords) {
  return Object.values(tracksJson).map(track => ({
    TrackId: track.TrackId,
    TrackName: track.TrackName,
    AuthorTime: formatTime(track.AuthorTime),
    WrTime: formatTime(worldRecords[track.TrackId]) ?? 'N/A',
    UploadedAt: track.UploadedAt
  }));
}

function formatTime(ms) {
    if (ms === null) return 'N/A';
    const seconds = (ms / 1000).toFixed(2);
    if (seconds < 60) {
        return `${seconds}`;
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2).padStart(5, '0');
        return `${mins}:${secs}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const mins = (Math.floor((seconds % 3600) / 60)).toString().padStart(2, '0');
        const secs = (seconds % 60).toFixed(2).padStart(5, '0');
        return `${hours}:${mins}:${secs}`;
    }
}