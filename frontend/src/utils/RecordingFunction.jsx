import React from "react";

let mediaRecorder;
let audioChunks = [];

const startRecording = async (setAudioBlob) => {
   
    try {
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' }); // Use the desired audio format
            audioChunks = []; // Reset chunks for the next recording

            // Upload the audioBlob
            setAudioBlob(audioBlob); // Set the audio blob in the parent component state
            // const audioUrl = await uploadAudio(audioBlob);
            // console.log('Uploaded Audio URL:', audioUrl);
        };

        mediaRecorder.start();
        console.log('Recording started...');
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
};

const stopRecording = () => {
    console.log('Stopping recording...');
    console.log('MediaRecorder:', mediaRecorder);
    console.log('Audio Chunks:', audioChunks);
    console.log('Audio Blob:', new Blob(audioChunks, { type: 'audio/mp3' })); // Use the desired audio format
    console.log('Audio URL:', URL.createObjectURL(new Blob(audioChunks, { type: 'audio/mp3' }))); // Use the desired audio format
    
    if (mediaRecorder) {
        mediaRecorder.stop();
        console.log('Recording stopped.');
    }
};

const uploadAudio = async ( audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3'); // Use the desired audio format

    try {   
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/filesharing/chat/upload-voice`, {
            method: "POST", // Fixed typo: 'mehod' -> 'method'
            body: formData,
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
       const audioUrl = data.fileUrl; // Assign fileUrl from the server response
        console.log('Audio uploaded successfully:', audioUrl);

        return audioUrl; // Return the uploaded URL for further use
    } catch (e) {
        console.error('Error uploading audio:', e);
        throw e; // Re-throw the error for better error handling
    }
};




export { startRecording, stopRecording, uploadAudio };
