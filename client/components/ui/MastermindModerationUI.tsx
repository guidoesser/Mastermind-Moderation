import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Users, Settings, 
  Clock, PlayCircle, PauseCircle, MessageSquare, 
  Hand, Shield, Eye, EyeOff, Volume2, VolumeX,
  MoreVertical, UserCheck, UserX, Star, AlertTriangle,
  Calendar, FileText, Share2, Download, Upload
} from 'lucide-react';

const MastermindModerationUI = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isModerating, setIsModerating] = useState(true);
  const [activeTab, setActiveTab] = useState('agenda');
  const [currentAgendaItem, setCurrentAgendaItem] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [raisedHands, setRaisedHands] = useState([]);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John Doe', role: 'facilitator', isPresenting: false, isMuted: false, hasVideo: true, handRaised: false },
    { id: 2, name: 'Jane Smith', role: 'member', isPresenting: false, isMuted: true, hasVideo: true, handRaised: false },
    { id: 3, name: 'Mike Johnson', role: 'member', isPresenting: false, isMuted: false, hasVideo: false, handRaised: true },
    { id: 4, name: 'Sarah Wilson', role: 'observer', isPresenting: false, isMuted: true, hasVideo: true, handRaised: false },
  ]);

  const [agendaItems] = useState([
    { id: 1, title: 'Opening & Introductions', duration: 10, completed: true, type: 'intro' },
    { id: 2, title: 'Hot Seat: John\'s Business Challenge', duration: 15, completed: false, type: 'hotseat', presenter: 'John Doe' },
    { id: 3, title: 'Group Discussion: Marketing Strategies', duration: 20, completed: false, type: 'discussion' },
    { id: 4, title: 'Action Items & Commitments', duration: 10, completed: false, type: 'action' },
    { id: 5, title: 'Closing & Next Steps', duration: 5, completed: false, type: 'closing' }
  ]);

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: 'message'
      }]);
      setNewMessage('');
    }
  };

  const toggleParticipantMute = (participantId) => {
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, isMuted: !p.isMuted } : p)
    );
  };

  const toggleHandRaise = (participantId) => {
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, handRaised: !p.handRaised } : p)
    );
  };

  const moveToNextAgendaItem = () => {
    if (currentAgendaItem < agendaItems.length - 1) {
      setCurrentAgendaItem(prev => prev + 1);
    }
  };

  const VideoGrid = () => (
    <div className="grid grid-cols-2 gap-4 h-full">
      {participants.slice(0, 4).map((participant) => (
        <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden group">
          {participant.hasVideo ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-6xl text-white opacity-50">👤</div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <VideoOff size={32} />
                <p className="mt-2 text-sm">Camera Off</p>
              </div>
            </div>
          )}
          
          {/* Participant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium text-sm">{participant.name}</span>
                {participant.role === 'facilitator' && <Star size={12} className="text-yellow-400" />}
                {participant.handRaised && <Hand size={14} className="text-orange-400 animate-bounce" />}
              </div>
              <div className="flex items-center space-x-1">
                {participant.isMuted ? (
                  <MicOff size={14} className="text-red-400" />
                ) : (
                  <Mic size={14} className="text-green-400" />
                )}
                {!participant.hasVideo && <VideoOff size={14} className="text-gray-400" />}
              </div>
            </div>
          </div>
          
          {/* Moderation controls (visible only to moderators) */}
          {isModerating && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1">
                <button 
                  onClick={() => toggleParticipantMute(participant.id)}
                  className="p-1 bg-black/50 hover:bg-black/70 rounded text-white"
                  title={participant.isMuted ? "Unmute" : "Mute"}
                >
                  {participant.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button className="p-1 bg-black/50 hover:bg-black/70 rounded text-white" title="More options">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const AgendaPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Session Agenda</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>{formatTime(sessionTime)}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {agendaItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                index === currentAgendaItem
                  ? 'border-blue-500 bg-blue-50'
                  : item.completed
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setCurrentAgendaItem(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      item.completed
                        ? 'bg-green-500 text-white'
                        : index === currentAgendaItem
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <h4 className={`font-medium ${
                      index === currentAgendaItem ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  
                  {item.presenter && (
                    <p className="text-sm text-gray-600 mt-1 ml-8">
                      Presenter: {item.presenter}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 ml-8 text-sm text-gray-500">
                    <span>{item.duration} min</span>
                    <span className="capitalize">{item.type}</span>
                  </div>
                </div>
                
                {index === currentAgendaItem && (
                  <div className="flex space-x-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <PlayCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={moveToNextAgendaItem}
          disabled={currentAgendaItem >= agendaItems.length - 1}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
        >
          Next Agenda Item
        </button>
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Chat</h3>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-800">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
              <p className="text-gray-700 text-sm">{msg.message}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const ParticipantsPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">
          Participants ({participants.length})
        </h3>
        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
          <Settings size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{participant.name}</span>
                    {participant.role === 'facilitator' && (
                      <Star size={12} className="text-yellow-500" />
                    )}
                    {participant.handRaised && (
                      <Hand size={14} className="text-orange-500 animate-bounce" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{participant.role}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {participant.isMuted ? (
                    <MicOff size={16} className="text-red-500" />
                  ) : (
                    <Mic size={16} className="text-green-500" />
                  )}
                  {participant.hasVideo ? (
                    <Video size={16} className="text-green-500" />
                  ) : (
                    <VideoOff size={16} className="text-gray-400" />
                  )}
                </div>
                
                {isModerating && participant.role !== 'facilitator' && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleParticipantMute(participant.id)}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                      title={participant.isMuted ? "Unmute" : "Mute"}
                    >
                      {participant.isMuted ? <UserCheck size={14} /> : <UserX size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Mastermind Session</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>{formatTime(sessionTime)}</span>
              {isRecording && (
                <div className="flex items-center space-x-1 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>REC</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isRecording
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium">
              <Share2 size={14} className="inline mr-1" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-6">
          <div className="bg-black rounded-lg h-full p-4">
            <VideoGrid />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'participants', label: 'People', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'agenda' && <AgendaPanel />}
            {activeTab === 'chat' && <ChatPanel />}
            {activeTab === 'participants' && <ParticipantsPanel />}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3 rounded-full transition-colors ${
                isAudioOn
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition-colors ${
                isVideoOn
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-full transition-colors ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Share2 size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {isModerating && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                <Shield size={16} />
                <span>Moderating</span>
              </div>
            )}
            
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MastermindModerationUI;