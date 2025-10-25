import { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('gist');
  const [targetLang, setTargetLang] = useState('en'); // Added for target language
  const [warning, setWarning] = useState('');

  const BACKEND_URL = 'https://vedic-translator-backend.onrender.com';

  // Handle text translation
  const handleTranslate = async () => {
    setWarning('');
    try {
      const res = await axios.post(`${BACKEND_URL}/translate`, {
        text: inputText,
        mode,
        target_lang: targetLang,
      });
      setOutputText(res.data.translated_text); // Updated to match backend
    } catch (err) {
      console.error(err);
      alert('Error translating text.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setWarning('');

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInputText(res.data.extracted_text); // Updated to match backend
      if (res.data.warning) setWarning(res.data.warning);
    } catch (err) {
      console.error(err);
      alert('Error uploading file.');
    }
  };

  // Handle downloading output as Word
  const handleDownload = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/download`,
        { text: outputText },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], {
        type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      saveAs(blob, 'translated_output.docx');
    } catch (err) {
      console.error(err);
      alert('Error downloading file.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Vedic Translator</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Translation Mode: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="transliterate">Transliterate</option>
          <option value="literal">Literal</option>
          <option value="gist">Gist</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Target Language: </label>
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="sa">Sanskrit</option>
        </select>
      </div>

      <textarea
        placeholder="Type or paste text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={8}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <div style={{ marginBottom: 10 }}>
        <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} />
        {warning && <p style={{ color: 'red' }}>{warning}</p>}
      </div>

      <button onClick={handleTranslate} style={{ marginRight: 10 }}>
        Translate
      </button>

      <h2>Output</h2>
      <textarea
        value={outputText}
        onChange={(e) => setOutputText(e.target.value)}
        rows={8}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <div>
        <button
          onClick={() => navigator.clipboard.writeText(outputText)}
          style={{ marginRight: 10 }}
        >
          Copy All
        </button>
        <button onClick={handleDownload}>Download as Word</button>
      </div>
    </div>
  );
}
