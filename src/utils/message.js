import {message as AMessage} from 'antdv-next';


const message = (msg, type) => {
    return AMessage[type || 'info']({
        content: msg,
    });
};

const errorMessage = (msg) => {
    return message(msg, 'error');

};

export default errorMessage;

export {message}
