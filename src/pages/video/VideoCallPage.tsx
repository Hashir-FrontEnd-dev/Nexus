import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp, MonitorStop, Users, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/users';

type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const otherUsers = users.filter(u => u.id !== user?.id);

  useEffect(() => {
    return () => {
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startCall = async () => {
    if (!selectedUser) return;
    setCallStatus('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setTimeout(() => setCallStatus('connected'), 2000);
    } catch {
      setCallStatus('connected');
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      remoteVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setSelectedUser(null);
    }, 1500);
  };

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream).getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
    }
    setIsMicOn(prev => !prev);
  };

  const toggleCamera = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream).getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
    }
    setIsCameraOn(prev => !prev);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch { /* ignore */ }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
        setIsScreenSharing(true);
      } catch { /* ignore */ }
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
        <p className="text-gray-600">Start a video call with investors or entrepreneurs</p>
      </div>

      {callStatus === 'idle' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Select a Contact</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherUsers.map(contact => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedUser?.id === contact.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(contact)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <Badge variant={contact.role === 'investor' ? 'accent' : 'primary'} size="sm">
                        {contact.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  leftIcon={<Phone size={20} />}
                  onClick={startCall}
                >
                  Call {selectedUser.name}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {(callStatus === 'calling' || callStatus === 'connected') && selectedUser && (
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: 400 }}>
            {isCameraOn ? (
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                poster={selectedUser.avatarUrl}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                    <User size={48} className="text-gray-400" />
                  </div>
                  <p className="text-white text-lg font-medium">{selectedUser.name}</p>
                  <p className="text-gray-400 text-sm">{callStatus === 'calling' ? 'Calling...' : 'Camera off'}</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
              {isCameraOn ? (
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-1">
                      <User size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs">You</p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4">
              <Badge variant="error" size="lg">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-error-500 rounded-full animate-pulse" />
                  {callStatus === 'calling' ? 'Connecting...' : 'Live'}
                </span>
              </Badge>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4">
            <Button
              variant={isMicOn ? 'primary' : 'outline'}
              size="lg"
              onClick={toggleMic}
              className="rounded-full w-14 h-14"
            >
              {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </Button>

            <Button
              variant="error"
              size="lg"
              onClick={endCall}
              className="rounded-full w-16 h-16"
            >
              <PhoneOff size={24} />
            </Button>

            <Button
              variant={isCameraOn ? 'primary' : 'outline'}
              size="lg"
              onClick={toggleCamera}
              className="rounded-full w-14 h-14"
            >
              {isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
            </Button>

            <Button
              variant={isScreenSharing ? 'accent' : 'outline'}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14"
            >
              {isScreenSharing ? <MonitorStop size={22} /> : <MonitorUp size={22} />}
            </Button>
          </div>
        </div>
      )}

      {callStatus === 'ended' && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <PhoneOff size={28} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Call Ended</h3>
              <p className="text-gray-500 mb-4">
                {selectedUser ? `Call with ${selectedUser.name}` : ''}
              </p>
              <Button onClick={() => setCallStatus('idle')}>
                Back to Contacts
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};


