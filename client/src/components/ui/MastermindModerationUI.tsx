import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Users, Settings, 
  Clock, PlayCircle, PauseCircle, MessageSquare, 
  Hand, Shield, Eye, EyeOff, Volume2, VolumeX,
  MoreVertical, UserCheck, UserX, Star, AlertTriangle,
  Calendar, FileText, Share2, Download, Upload
} from 'lucide-react';

const MastermindModerationUI = () => {
  // Zustandsvariablen für die Benutzeroberfläche
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Timer für die Aktualisierung der Zeit
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Video-Steuerelemente
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);

  // Aufnahmesteuerung
  const toggleRecording = () => setIsRecording(!isRecording);

  // Chat-Funktionen
  const toggleChat = () => setShowChat(!showChat);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Mastermind Moderation
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {currentTime.toLocaleTimeString()}
              </span>
              <button
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {}}
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>
import React from 'react';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import './mastermind-ui.css';

const MastermindModerationUI: React.FC = () => {
  return (
    <div className="mastermind-container">
      <header className="mastermind-header">
        <div className="mastermind-header-content">
          <h1>Mastermind Moderation</h1>
          <nav>
            <ul className="mastermind-nav">
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">Einstellungen</a></li>
              <li><a href="#">Hilfe</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="mastermind-main">
        <div className="mastermind-content">
          <h2>Willkommen zum Mastermind Moderations-Tool</h2>

          <div className="card-grid">
            <Card>
              <CardHeader>
                <CardTitle>Moderation starten</CardTitle>
                <CardDescription>Beginnen Sie eine neue Moderationssitzung</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Starten Sie eine neue Moderationssitzung mit vorkonfigurierten Einstellungen.</p>
                <Button className="mt-4">Sitzung starten</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
                <CardDescription>Konfigurieren Sie Ihre Moderationseinstellungen</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Passen Sie Regeln und Präferenzen für Ihre Moderationssitzungen an.</p>
                <Button variant="outline" className="mt-4">Einstellungen öffnen</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Berichte</CardTitle>
                <CardDescription>Sehen Sie Moderationsstatistiken und Berichte</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analysieren Sie vergangene Moderationssitzungen und Ergebnisse.</p>
                <Button variant="outline" className="mt-4">Berichte anzeigen</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mastermind-footer">
        <div className="mastermind-footer-content">
          <p>© 2025 Mastermind Moderation. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default MastermindModerationUI;
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Video Conference Area */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Video-Konferenz</h2>
            <div className="flex space-x-2">
              <button
                className={`p-2 rounded-full ${isVideoOn ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
              <button
                className={`p-2 rounded-full ${isAudioOn ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}
                onClick={toggleAudio}
              >
                {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                className={`p-2 rounded-full ${isRecording ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                onClick={toggleRecording}
              >
                {isRecording ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
              </button>
              <button
                className={`p-2 rounded-full ${showChat ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                onClick={toggleChat}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="h-96 bg-gray-900 flex items-center justify-center relative">
            {/* Main Video Content Placeholder */}
            <div className="text-gray-500 dark:text-gray-400">
              Video-Stream wird geladen...
            </div>

            {/* Participant Videos (Small Thumbnails) */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 w-20 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" /> Teilnehmer
              </h2>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {/* Participant List */}
              {['Moderator', 'Teilnehmer 1', 'Teilnehmer 2', 'Teilnehmer 3'].map((name, index) => (
                <div key={index} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex justify-between items-center">
                  <span>{name}</span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls/Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Aktionen</h2>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <Hand className="h-4 w-4 mr-2" /> Hand heben
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <Share2 className="h-4 w-4 mr-2" /> Bildschirm teilen
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center">
                <Shield className="h-4 w-4 mr-2" /> Moderation
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center text-red-600 dark:text-red-400">
                <UserX className="h-4 w-4 mr-2" /> Sitzung verlassen
              </button>
            </div>
          </div>

          {/* Recording Info (when recording is active) */}
          {isRecording && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                <span className="text-red-800 dark:text-red-300 text-sm font-medium">Aufnahme läuft</span>
              </div>
              <div className="mt-2 text-xs text-red-700 dark:text-red-400">
                Dauer: 00:05:23
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mastermind Moderation © {new Date().getFullYear()}
            </div>
            <div className="flex space-x-4">
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Hilfe
              </button>
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Datenschutz
              </button>
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Impressum
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 flex flex-col z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleChat}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Noch keine Nachrichten
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat messages would go here */}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex">
              <input
                type="text"
                className="w-full rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nachricht schreiben..."
              />
              <button className="bg-blue-600 text-white rounded-r-md px-4 hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MastermindModerationUI;
