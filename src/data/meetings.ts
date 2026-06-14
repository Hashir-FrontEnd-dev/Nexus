import { AvailabilitySlot, MeetingRequest, Meeting } from '../types';

export const availabilitySlots: AvailabilitySlot[] = [
  { id: 'as1', userId: 'e1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'as2', userId: 'e1', dayOfWeek: 3, startTime: '14:00', endTime: '17:00', isAvailable: true },
  { id: 'as3', userId: 'i1', dayOfWeek: 2, startTime: '10:00', endTime: '13:00', isAvailable: true },
  { id: 'as4', userId: 'i1', dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isAvailable: true },
];

export const meetingRequests: MeetingRequest[] = [
  {
    id: 'mr1',
    requesterId: 'i1',
    recipientId: 'e1',
    proposedDate: '2024-03-20',
    proposedTime: '10:00',
    durationMinutes: 30,
    message: 'Would love to discuss your startup and potential investment opportunities.',
    status: 'pending',
    createdAt: '2024-03-15T08:00:00Z',
  },
];

export const meetings: Meeting[] = [
  {
    id: 'm1',
    requestId: 'mr1',
    requesterId: 'i1',
    recipientId: 'e1',
    date: '2024-03-20',
    time: '10:00',
    durationMinutes: 30,
    status: 'confirmed',
    createdAt: '2024-03-16T10:00:00Z',
  },
];

export const getAvailabilityForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots.filter(slot => slot.userId === userId);
};

export const addAvailabilitySlot = (slot: Omit<AvailabilitySlot, 'id'>): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = { ...slot, id: `as${availabilitySlots.length + 1}` };
  availabilitySlots.push(newSlot);
  return newSlot;
};

export const updateAvailabilitySlot = (id: string, updates: Partial<AvailabilitySlot>): AvailabilitySlot | undefined => {
  const index = availabilitySlots.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  availabilitySlots[index] = { ...availabilitySlots[index], ...updates };
  return availabilitySlots[index];
};

export const deleteAvailabilitySlot = (id: string): boolean => {
  const index = availabilitySlots.findIndex(s => s.id === id);
  if (index === -1) return false;
  availabilitySlots.splice(index, 1);
  return true;
};

export const getMeetingRequestsForUser = (userId: string): MeetingRequest[] => {
  return meetingRequests.filter(r => r.recipientId === userId);
};

export const getSentMeetingRequests = (userId: string): MeetingRequest[] => {
  return meetingRequests.filter(r => r.requesterId === userId);
};

export const createMeetingRequest = (req: Omit<MeetingRequest, 'id' | 'status' | 'createdAt'>): MeetingRequest => {
  const newReq: MeetingRequest = {
    ...req,
    id: `mr${meetingRequests.length + 1}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  meetingRequests.push(newReq);
  return newReq;
};

export const acceptMeetingRequest = (requestId: string): Meeting | undefined => {
  const reqIndex = meetingRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) return undefined;
  meetingRequests[reqIndex] = { ...meetingRequests[reqIndex], status: 'accepted' };
  const req = meetingRequests[reqIndex];
  const newMeeting: Meeting = {
    id: `m${meetings.length + 1}`,
    requestId: req.id,
    requesterId: req.requesterId,
    recipientId: req.recipientId,
    date: req.proposedDate,
    time: req.proposedTime,
    durationMinutes: req.durationMinutes,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  meetings.push(newMeeting);
  return newMeeting;
};

export const declineMeetingRequest = (requestId: string): boolean => {
  const index = meetingRequests.findIndex(r => r.id === requestId);
  if (index === -1) return false;
  meetingRequests[index] = { ...meetingRequests[index], status: 'declined' };
  return true;
};

export const getConfirmedMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(m => (m.requesterId === userId || m.recipientId === userId) && m.status === 'confirmed');
};
