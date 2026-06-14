import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Edit3, Check, X, Send, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { AvailabilitySlot, MeetingRequest, Meeting } from '../../types';
import {
  getAvailabilityForUser,
  addAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getMeetingRequestsForUser,
  getSentMeetingRequests,
  createMeetingRequest,
  acceptMeetingRequest,
  declineMeetingRequest,
  getConfirmedMeetingsForUser,
} from '../../data/meetings';
import { users } from '../../data/users';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AvailabilityManager: React.FC<{ userId: string }> = ({ userId }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setSlots(getAvailabilityForUser(userId));
  }, [userId]);

  const handleAdd = () => {
    const slot = addAvailabilitySlot({ userId, ...newSlot, isAvailable: true });
    setSlots(prev => [...prev, slot]);
    setShowAddForm(false);
    setNewSlot({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  };

  const handleUpdate = () => {
    if (!editingSlot) return;
    const updated = updateAvailabilitySlot(editingSlot.id, editingSlot);
    if (updated) {
      setSlots(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditingSlot(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteAvailabilitySlot(id);
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const toggleAvailability = (slot: AvailabilitySlot) => {
    const updated = updateAvailabilitySlot(slot.id, { isAvailable: !slot.isAvailable });
    if (updated) {
      setSlots(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Availability</h2>
        <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
          Add Slot
        </Button>
      </CardHeader>
      <CardBody>
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <select
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={newSlot.dayOfWeek}
                onChange={e => setNewSlot(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
              >
                {DAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
              <Input
                type="time"
                value={newSlot.startTime}
                onChange={e => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
              />
              <Input
                type="time"
                value={newSlot.endTime}
                onChange={e => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {slots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No availability slots set. Add your first one!</p>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {editingSlot?.id === slot.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={editingSlot.dayOfWeek}
                      onChange={e => setEditingSlot(prev => prev ? { ...prev, dayOfWeek: parseInt(e.target.value) } : null)}
                    >
                      {DAYS.map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                    <Input
                      type="time"
                      value={editingSlot.startTime}
                      onChange={e => setEditingSlot(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                      className="w-32"
                    />
                    <Input
                      type="time"
                      value={editingSlot.endTime}
                      onChange={e => setEditingSlot(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                      className="w-32"
                    />
                    <Button size="xs" variant="success" onClick={handleUpdate}><Check size={14} /></Button>
                    <Button size="xs" variant="outline" onClick={() => setEditingSlot(null)}><X size={14} /></Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Badge variant={slot.isAvailable ? 'success' : 'gray'}>{DAYS[slot.dayOfWeek]}</Badge>
                      <span className="text-sm text-gray-700">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Badge variant={slot.isAvailable ? 'success' : 'warning'} size="sm">
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="xs" variant="ghost" onClick={() => setEditingSlot(slot)}><Edit3 size={14} /></Button>
                      <Button size="xs" variant="ghost" onClick={() => toggleAvailability(slot)}>
                        {slot.isAvailable ? <X size={14} /> : <Check size={14} />}
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => handleDelete(slot.id)} className="text-error-500">
                        <X size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const MeetingRequests: React.FC<{ userId: string }> = ({ userId }) => {
  const [requests, setRequests] = useState<MeetingRequest[]>([]);

  useEffect(() => {
    setRequests(getMeetingRequestsForUser(userId));
  }, [userId]);

  const handleAccept = (requestId: string) => {
    acceptMeetingRequest(requestId);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
  };

  const handleDecline = (requestId: string) => {
    declineMeetingRequest(requestId);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r));
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Meeting Requests</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-500 text-center py-4">No meeting requests</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Meeting Requests</h2>
        <Badge variant="warning">{requests.filter(r => r.status === 'pending').length} pending</Badge>
      </CardHeader>
      <CardBody className="space-y-3">
        {requests.map(req => {
          const requester = users.find(u => u.id === req.requesterId);
          return (
            <div key={req.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{requester?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <CalendarIcon size={14} />
                    <span>{req.proposedDate}</span>
                    <Clock size={14} />
                    <span>{req.proposedTime} ({req.durationMinutes}min)</span>
                  </div>
                </div>
                <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'accepted' ? 'success' : 'error'}>
                  {req.status}
                </Badge>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="success" leftIcon={<Check size={14} />} onClick={() => handleAccept(req.id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<X size={14} />} onClick={() => handleDecline(req.id)}>
                    Decline
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};

const SendMeetingRequest: React.FC<{ userId: string }> = ({ userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [message, setMessage] = useState('');

  const otherUsers = users.filter(u => u.id !== userId);

  const handleSend = () => {
    if (!recipientId || !proposedDate || !proposedTime) return;
    createMeetingRequest({ requesterId: userId, recipientId, proposedDate, proposedTime, durationMinutes, message });
    setShowForm(false);
    setRecipientId('');
    setProposedDate('');
    setProposedTime('10:00');
    setDurationMinutes(30);
    setMessage('');
  };

  const [sentRequests, setSentRequests] = useState<MeetingRequest[]>([]);
  useEffect(() => {
    setSentRequests(getSentMeetingRequests(userId));
  }, [userId]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Send Meeting Request</h2>
        <Button size="sm" leftIcon={<Send size={16} />} onClick={() => setShowForm(true)}>
          New Request
        </Button>
      </CardHeader>
      <CardBody>
        {showForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={recipientId}
              onChange={e => setRecipientId(e.target.value)}
            >
              <option value="">Select recipient...</option>
              {otherUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-3">
              <Input type="date" value={proposedDate} onChange={e => setProposedDate(e.target.value)} />
              <Input type="time" value={proposedTime} onChange={e => setProposedTime(e.target.value)} />
              <Input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                label="Duration (min)"
              />
            </div>
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={3}
              placeholder="Write a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSend}>Send Request</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {sentRequests.length > 0 ? (
          <div className="space-y-2">
            {sentRequests.map(req => {
              const recipient = users.find(u => u.id === req.recipientId);
              return (
                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{recipient?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{req.proposedDate} at {req.proposedTime}</p>
                  </div>
                  <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'accepted' ? 'success' : 'error'}>
                    {req.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No meeting requests sent</p>
        )}
      </CardBody>
    </Card>
  );
};

const ConfirmedMeetings: React.FC<{ userId: string }> = ({ userId }) => {
  const [confirmedMeetings, setConfirmedMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setConfirmedMeetings(getConfirmedMeetingsForUser(userId));
  }, [userId]);

  if (confirmedMeetings.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Confirmed Meetings</h2>
        <Badge variant="success">{confirmedMeetings.length} upcoming</Badge>
      </CardHeader>
      <CardBody className="space-y-3">
        {confirmedMeetings.map(meeting => {
          const otherUser = users.find(u => u.id === (meeting.requesterId === userId ? meeting.recipientId : meeting.requesterId));
          return (
            <div key={meeting.id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-full">
                  <Users size={18} className="text-success-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{otherUser?.name || 'Unknown'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon size={12} />
                    <span>{meeting.date}</span>
                    <Clock size={12} />
                    <span>{meeting.time}</span>
                  </div>
                </div>
              </div>
              <Badge variant="success">Confirmed</Badge>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};

export const MeetingCalendarPage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meeting Calendar</h1>
        <p className="text-gray-600">Manage your availability and schedule meetings</p>
      </div>

      <ConfirmedMeetings userId={user.id} />
      <AvailabilityManager userId={user.id} />
      <MeetingRequests userId={user.id} />
      <SendMeetingRequest userId={user.id} />
    </div>
  );
};
