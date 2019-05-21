import React from "react";
import { Redirect } from "react-router-dom";
import chat from "../lib/chat";
import config from "../config";
class Groupchat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      receiverID: "",
      messageText: null,
      groupMessage: [],
      user: {},
      isAuthenticated: true
    };
    this.GUID = config.GUID;
  }
  sendMessage = () => {
    //This function handles sending a message to the group, passing the GUID and the text message that is stored is in the component’s state.
    // If the user is not part of the group we then make a request to join the group and then call the sendMessage function again.
    chat.sendGroupMessage(this.GUID, this.state.messageText).then(
      message => {
        console.log("Message sent successfully:", message);
        this.setState({ messageText: null });
      },
      error => {
        if (error.code === "ERR_NOT_A_MEMBER") {
          chat.joinGroup(this.GUID).then(response => {
            this.sendMessage();
          });
        }
      }
    );
  };
  scrollToBottom = () => {
    //This function will be used as a callback function for the message listener, it just makes sure that the latest messages are shown in the chat list.
    const chat = document.getElementById("chatList");
    chat.scrollTop = chat.scrollHeight;
  };
  handleSubmit = event => {
    //This calls the sendMessage function
    event.preventDefault();
    this.sendMessage();
    event.target.reset();
  };
  handleChange = event => {
    this.setState({ messageText: event.target.value });
  };
  getUser = () => {
    //This calls the chat.getLoggedInUser() method and stores the user object in the component’s state.
    chat
      .getLoggedinUser()
      .then(user => {
        console.log("user details:", { user });
        this.setState({ user });
      })
      .catch(({ code }) => {
        if (code === "USER_NOT_LOGED_IN") {
          this.setState({
            isAuthenticated: false
          });
        }
      });
  };
  messageListener = () => {
    //This calls the chat.addMessageListener() function and appends every new message received to the groupMessage array which is stored in the component’s state and rendered in the app.
    chat.addMessageListener((data, error) => {
      if (error) return console.log(`error: ${error}`);
      this.setState(
        prevState => ({
          groupMessage: [...prevState.groupMessage, data]
        }),
        () => {
          this.scrollToBottom();
        }
      );
    });
  };
  componentDidMount() {
    //This calls the getUser and messageListener functions.
    this.getUser();
    this.messageListener();
    // chat.joinGroup(this.GUID)
  }
  render() {
    const { isAuthenticated } = this.state;
    if (!isAuthenticated) {
      return <Redirect to="/" />;
    }
    return (
      <div className="chatWindow">
        <ul className="chat" id="chatList">
          {this.state.groupMessage.map(data => (
            <div key={data.id}>
              {this.state.user.uid === data.sender.uid ? (
                <li className="self">
                  <div className="msg">
                    <p>{data.sender.uid}</p>
                    <div className="message"> {data.data.text}</div>
                  </div>
                </li>
              ) : (
                <li className="other">
                  <div className="msg">
                    <p>{data.sender.uid}</p>
                    <div className="message"> {data.data.text} </div>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
        <div className="chatInputWrapper">
          <form onSubmit={this.handleSubmit}>
            <input
              className="textarea input"
              type="text"
              placeholder="Enter your message..."
              onChange={this.handleChange}
            />
          </form>
        </div>
      </div>
    );
  }
}
export default Groupchat;
