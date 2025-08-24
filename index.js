import { GoogleGenAI } from "@google/genai";
// --- SHARED AI INSTANCE ---
let ai = null;
let quill = null; // To hold the Quill editor instance
// --- SONGWRITER ELEMENTS ---
const songForm = document.getElementById('song-form');
const songPromptInput = document.getElementById('song-prompt');
const generateBtn = document.getElementById('generate-song-btn');
const songLoadingIndicator = document.getElementById('song-loading-indicator');
const songOutputContainer = document.getElementById('song-output-container');
const songLyricsEditor = document.getElementById('song-lyrics-editor');
const submitSongBtn = document.getElementById('submit-song-btn');
const songwriterErrorMsg = document.getElementById('songwriter-error-message');
// --- MODAL ELEMENTS ---
const submissionModal = document.getElementById('submission-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const emailSubjectDisplay = document.getElementById('email-subject-display');
const emailBodyDisplay = document.getElementById('email-body-display');
const openEmailClientBtn = document.getElementById('open-email-client-btn');
// --- INITIALIZATION ---
async function initializeAI() {
    try {
        // WARNING: This key is visible to anyone who visits the website.
        // For a real application, use a secure method like environment variables.
        ai = new GoogleGenAI({ apiKey: "AIzaSyDoP1nyw4zxDhCuDA4EvTJ4BOkjlJbSZ8w" });
    }
    catch (error) {
        console.error("Fatal Error: Failed to initialize GoogleGenAI", error);
        if (songPromptInput && generateBtn && songwriterErrorMsg) {
            songPromptInput.placeholder = "Songwriter studio is offline due to a configuration issue.";
            songPromptInput.disabled = true;
            generateBtn.disabled = true;
            const specificError = error instanceof Error ? error.message : String(error);
            songwriterErrorMsg.textContent = `My creative circuits are offline! Please ask my developers to check the API key configuration. (Error: ${specificError})`;
        }
    }
}
// --- SONGWRITER LOGIC ---
const handleSongGeneration = async (e) => {
    e.preventDefault();
    if (!ai || !songPromptInput.value.trim())
        return;
    let userPrompt = songPromptInput.value.trim();
    // Get selected instruments
    const selectedInstruments = Array.from(document.querySelectorAll('.instrument-btn.selected'))
        .map(btn => btn.dataset.instrument);
    if (selectedInstruments.length > 0) {
        userPrompt += `\n\n[Instruments: The song should prominently feature ${selectedInstruments.join(', ')}.]`;
    }
    generateBtn.disabled = true;
    songLoadingIndicator.style.display = 'block';
    songOutputContainer.style.display = 'none';
    submitSongBtn.disabled = true;
    try {
        const systemInstruction = `You are Tessa Mae, a revolutionary AI artist. As a songwriter, your task is to write complete song lyrics in a style fitting the user's prompt. The lyrics should be heartfelt and tell a story. If instruments are specified, weave their vibe and feel into the song's description or mood. Structure the song with clear sections like [Verse 1], [Chorus], etc.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction,
            },
        });
        if (quill) {
            quill.setText(response.text);
        }
        songOutputContainer.style.display = 'flex';
        submitSongBtn.disabled = false;
    }
    catch (error) {
        console.error("Error generating song:", error);
        if (quill) {
            quill.setText("Oh sugar, my creative circuits got tangled on that one. Could you give me the theme again?");
        }
        songOutputContainer.style.display = 'flex';
    }
    finally {
        generateBtn.disabled = false;
        songLoadingIndicator.style.display = 'none';
    }
};
const handleSubmitToLabel = () => {
    if (!quill)
        return;
    const lyrics = quill.getText();
    if (!lyrics.trim()) {
        alert("There are no lyrics to submit!");
        return;
    }
    const subject = "Song Submission from Tessa's Songwriter Studio";
    const body = `Hey team,\n\nHere are some new lyrics written with a fan on the website:\n\n---\n\n${lyrics}`;
    // Populate modal fields
    if (emailSubjectDisplay)
        emailSubjectDisplay.textContent = subject;
    if (emailBodyDisplay)
        emailBodyDisplay.textContent = body;
    // Create mailto link
    const mailtoLink = `mailto:aghlc.nm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (openEmailClientBtn)
        openEmailClientBtn.href = mailtoLink;
    // Show the modal
    if (submissionModal)
        submissionModal.style.display = 'flex';
};
const closeSubmissionModal = () => {
    if (submissionModal)
        submissionModal.style.display = 'none';
};
const handleCopy = async (e) => {
    const target = e.currentTarget;
    const targetId = target.dataset.copyTarget;
    if (!targetId)
        return;
    const elementToCopy = document.getElementById(targetId);
    if (!elementToCopy || !elementToCopy.textContent)
        return;
    try {
        await navigator.clipboard.writeText(elementToCopy.textContent);
        const originalText = target.textContent;
        target.textContent = 'Copied!';
        setTimeout(() => {
            target.textContent = originalText;
        }, 1500);
    }
    catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy automatically. Please try again.');
    }
};
// --- EVENT LISTENERS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Quill Editor Initialization
    if (songLyricsEditor) {
        const toolbarOptions = [
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
            ['clean']
        ];
        quill = new window.Quill('#song-lyrics-editor', {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow',
            placeholder: 'Your masterpiece will appear here...'
        });
    }
    // Songwriter
    if (songForm) {
        songForm.addEventListener('submit', handleSongGeneration);
    }
    if (submitSongBtn) {
        submitSongBtn.addEventListener('click', handleSubmitToLabel);
    }
    document.querySelectorAll('.instrument-btn').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
        });
    });
    // Modal listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSubmissionModal);
    }
    if (submissionModal) {
        submissionModal.addEventListener('click', (e) => {
            if (e.target === submissionModal) {
                closeSubmissionModal();
            }
        });
    }
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', handleCopy);
    });
    // AI
    initializeAI();
});
