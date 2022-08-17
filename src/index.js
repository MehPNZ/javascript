import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/application.css';
import gon from 'gon';
import faker from 'faker';
import cookies from 'js-cookie';
import io from 'socket.io-client';
import _ from 'lodash';
import init from './init.jsx';
import * as actions from './actions';

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}

const cookieName = cookies.get('username');
if (!cookieName) {
  cookies.set('username', faker.name.findName());
}
const userName = cookieName || cookies.get('username');

const { channels, messages, currentChannelId } = gon;
const allIds = channels.map(channel => channel.id);
const byId = _.zipObject(allIds, channels);
const initState = {
  channels: { byId, allIds },
  messages: messages.filter(message => message.channelId === currentChannelId),
  channelsUIstate: { currentChannelId },
};

const store = init(initState, userName);
const socket = io();

socket.on('newMessage', ({ data }) => {
  store.dispatch(actions.addMessageSuccess(data.attributes));
});

socket.on('newChannel', ({ data }) => {
  store.dispatch(actions.addChannelSuccess(data.attributes));
});

socket.on('removeChannel', ({ data }) => {
  store.dispatch(actions.removeChannelSuccess(data.id));
});

socket.on('renameChannel', ({ data }) => {
  store.dispatch(actions.updateChannelSuccess(data.attributes));
});
