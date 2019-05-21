import { CometChat } from "@cometchat-pro/chat";
import config from "../config";
export default class CCManager {
  static LISTENER_KEY_MESSAGE = "msglistener"; //This is required by the message listener.
  static appId = config.appId;
  static apiKey = config.apiKey;
  static LISTENER_KEY_GROUP = "grouplistener";
  static init() {
    return CometChat.init(CCManager.appId); //This is required to be called only once throughout the lifecycle of the application, it calls the CometChat init method with the appID
  }
  static getTextMessage(uid, text, msgType) {
    //it creates the message object based on CometChat.TextMessagemethod, it accepts the UID (GUID in our case) and the text message to send.
    if (msgType === "user") {
      return new CometChat.TextMessage(
        uid,
        text,
        CometChat.MESSAGE_TYPE.TEXT,
        CometChat.RECEIVER_TYPE.USER
      );
    } else {
      return new CometChat.TextMessage(
        uid,
        text,
        CometChat.MESSAGE_TYPE.TEXT,
        CometChat.RECEIVER_TYPE.GROUP
      );
    }
  }
  static getLoggedinUser() {
    //get the currently logged in user
    return CometChat.getLoggedinUser();
  }
  static login(UID) {
    //log in a user based on the CometChat.login method, it takes in the UID (GUID) and the apiKey
    return CometChat.login(UID, this.apiKey);
  }
  static getGroupMessages(GUID, callback, limit = 30) {
    //used to get the previous group messages from CometChat using the CometChat.MessagesRequestBuilder() method that takes in the GUID and limit as parameters.
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setGUID(GUID)
      .setLimit(limit)
      .build();
    callback();
    return messagesRequest.fetchPrevious();
  }
  static sendGroupMessage(UID, message) {
    //this is used to send messages using the CometChat.sendMessage() method and it accepts the GUID and message as parameters.
    const textMessage = this.getTextMessage(UID, message, "group");
    return CometChat.sendMessage(textMessage);
  }
  static joinGroup(GUID) {
    //It’s used to join a chosen group using a GUID
    return CometChat.joinGroup(GUID, CometChat.GROUP_TYPE.PUBLIC, "");
  }
  static addMessageListener(callback) {
    //Uses the CometChat.addMessageListener() to listen to messages (real-time), it requires the LISTENER_KEY_MESSAGE as a parameter and also a callback that is called when a message is received.
    CometChat.addMessageListener(
      this.LISTENER_KEY_MESSAGE,
      new CometChat.MessageListener({
        onTextMessageReceived: textMessage => {
          callback(textMessage);
        }
      })
    );
  }
}
