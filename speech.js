// Web Speech API Integration
class SpeechService {
    constructor(onResult, onStatusChange) {
        this.recognition = null;
        this.isRecording = false;
        this.onResult = onResult;
        this.onStatusChange = onStatusChange;
        
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            if (this.onStatusChange) this.onStatusChange("Speech Recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isRecording = true;
            if (this.onStatusChange) this.onStatusChange("Listening...");
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            if (this.onResult) {
                this.onResult(finalTranscript, interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            this.isRecording = false;
            if (this.onStatusChange) this.onStatusChange(`Error: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            // Provide feedback that recording stopped naturally
            if (this.onStatusChange && this.isRecording === false) this.onStatusChange("Stopped listening.");
        };
    }

    start() {
        if (this.recognition && !this.isRecording) {
            this.recognition.start();
        }
    }

    stop() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    toggle() {
        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
        return !this.isRecording;
    }

    // Text to Speech
    speak(text) {
        if (!window.speechSynthesis) {
            console.error("Speech Synthesis API not supported.");
            return;
        }

        // Cancel previous speech to prevent overlapping
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    }
}
