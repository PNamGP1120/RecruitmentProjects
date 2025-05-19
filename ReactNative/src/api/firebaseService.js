import { database } from '../firebaseConfig';
import { ref, push, onValue } from 'firebase/database';

export function listenMessages(conversationId, callback) {
  const messagesRef = ref(database, `conversations/${conversationId}/messages`);
  onValue(messagesRef, snapshot => {
    const data = snapshot.val() || {};
    const messages = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
    messages.sort((a,b) => a.timestamp - b.timestamp);
    callback(messages);
  });
}

export function sendMessage(conversationId, message) {
  const messagesRef = ref(database, `conversations/${conversationId}/messages`);
  push(messagesRef, message);
}
