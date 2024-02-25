export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const midiMap = [
    ...['C ', 'C#', 'D ', 'Eb', 'E ', 'F ', 'F#', 'G ', 'Ab', 'A ', 'Bb', 'B '],
    ...['B#', 'Db', 'D ', 'D#', 'Fb', 'E#', 'Gb', 'G ', 'G#', 'A ', 'A#', 'Cb']
].map(e => e.trim());

export function midiToNoteName(midi: number) {
    const note = midiMap[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return note + octave;
}

export function noteNameToMidi(name: string) {
    try {
        const [, noteName, octaveName] = name.match(/^([A-G][#b]?)(-?\d)$/) ?? [];
        const note = midiMap.indexOf(noteName) % 12;
        if (note === -1) return -1;
        const octave = parseInt(octaveName) + 1;
        return octave * 12 + note;
    } catch (ex) {
        return -1;
    }
}

export function downloadData(data: Uint8Array, filename: string) {
    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);

    const linkElement = document.createElement('a');
    linkElement.style.display = 'none';
    linkElement.href = url;
    linkElement.download = filename;
    document.body.appendChild(linkElement);

    linkElement.click();

    setTimeout(() => {
        linkElement.remove();
        window.URL.revokeObjectURL(url);
    }, 1000);
}

export function readLocalFile(file: File): Promise<ArrayBuffer>;
export function readLocalFile(file: File, type: 'arraybuffer'): Promise<ArrayBuffer>;
export function readLocalFile(file: File, type: 'binarystring' | 'dataurl' | 'text'): Promise<string>;

export function readLocalFile(file: File, type?: 'arraybuffer' | 'binarystring' | 'dataurl' | 'text') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            resolve(e.target?.result);
        };
        reader.onabort = reader.onerror = e => reject(e);
        switch (type) {
            case 'binarystring':
                return reader.readAsBinaryString(file);
            case 'dataurl':
                return reader.readAsDataURL(file);
            case 'text':
                return reader.readAsText(file);
            default:
                return reader.readAsArrayBuffer(file);
        }
    });
}

export function uid(prefix = '', suffix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2) + suffix;
}
