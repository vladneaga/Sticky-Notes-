
class Chat {

  boot() {
    this.configure();
    this.fetchElements();
    this.setup();
    this.connect();
    //this.setupUpdateSocket();
    
  }


  // fetch configuration from URL search params
  // name=Alice
  // host=127.0.0.1
  configure() {
    const search = document.location.search;
    const params = new URLSearchParams(search);

    // setup user name
    if (params.has("name")) {
      this.name = params.get("name");
    } else {
      params.set("name", "Alice");
      document.location.search = "?" + params.toString();
    }

    // setup host
    if (params.has("host")) {
      this.host = params.get("host");
      this.server = `ws://${this.host}:8001`;
    } else {
      params.set("host", "127.0.0.1");
      document.location.search = "?" + params.toString();
    }
  }

  // fetch DOM elements to manipulate
  fetchElements() {
    this.status = document.querySelector(".chat-status");
    this.messages = document.querySelector(".chat-messages");
    this.inputName = document.querySelector(".chat-input-name");
    this.inputText = document.querySelector(".chat-input-text");
    this.xInput = document.querySelector(".chat-input-x");
    this.yInput = document.querySelector(".chat-input-y");

    this.inputSendButton = document.querySelector(".chat-input-send-button");
  }

  // setup interface
  setup() {
    // user name
    this.inputName.textContent = this.name;

    // text input
    this.inputText.addEventListener("keyup", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      if(this.xInput.value === null || this.xInput.value === "") {
        this.xInput.value = 0;
      }
      if(this.yInput.value === null || this.yInput.value === "") {
        this.yInput.value = 0;
      }
      this.sendMessage(this.inputText.textContent, this.xInput.value, this.yInput.value, false, null);
      console.log(this.xInput.value);
      this.inputText.textContent = "";
      this.xInput.value = 0;
      this.yInput.value = 0;
    });

    // button
    this.inputSendButton.addEventListener("mousedown", (e) => {
      e.stopImmediatePropagation();
      if(this.xInput.value === null || this.xInput.value === "") {
        this.xInput.value = 0;
      }
      if(this.yInput.value === null|| this.yInput.value === "") {
        this.yInput.value = 0;
      }
      this.sendMessage(this.inputText.textContent, this.xInput.value, this.yInput.value, false, null);     
       this.inputText.textContent = "";
      this.xInput.textContent = 0;
      this.yInput.textContent = 0;
      setTimeout(() => {
        this.inputText.focus();
      }, 0);
    });

    this.inputText.focus();
  }

  // connect websocket and setup handlers
  connect() {
    this.socket = new WebSocket(this.server);

    // handle error
    this.socket.addEventListener("error", (event) => {
      this.status.textContent = `Error connecting to ${this.server}`;
      this.status.classList.add("chat-status-error");
    });

    // handle connected
    this.socket.addEventListener("open", (event) => {
      this.status.textContent = `Connected to ${this.server}`;
      this.status.classList.add("chat-status-ok");
      //this.sendMessage("has connected");
      
    });

    // handle incoming messages
    this.socket.addEventListener("message", (event) => {
      this.receiveMessage(event.data);
    });
  }

  // send the text via websocket
  sendMessage(text, mx, my, updateValue, noteId) {
    
    let message = {
      from: this.name,
      time: Date.now(),
      text: text,
      x: mx,
      y: my,
      update: updateValue,
      id: noteId
    };
  
    let encoded = JSON.stringify(message);
    this.socket.send(encoded);
  }

  // append incoming message to messages list
  receiveMessage(data) {
    let message = JSON.parse(data);
    let messageContainerExistent = document.getElementById(message.id);
    console.log("Received message with ID:", message.id);
    console.log("Existing message container:", messageContainerExistent);

    // If the message with the same ID exists, update its text
    if (messageContainerExistent) {
        console.log("Updating existing message with ID:", message.id);
        let textElement = messageContainerExistent.querySelector('.chat-message-text');
        textElement.textContent = message.text;
        return; // Exit the function since the message has been updated
    }

    // create message container and add it
    let container = document.createElement("div");
    container.classList.add("chat-message");
    //console.log(message.x);
    container.style.left = message.x + "px"; // Set left position
    container.style.top = message.y + "px"; // Set top position
    container.id = message.id;
    this.messages.appendChild(container);


    let info = document.createElement("div");
    info.classList.add("chat-message-info");
    container.appendChild(info);

    let from = document.createElement("div");
    from.classList.add("chat-message-from");
    from.textContent = message.from;
    info.appendChild(from);

    let date = new Date(message.time);
    let time = document.createElement("div");
    time.classList.add("chat-message-time");
    time.textContent = date.toLocaleTimeString("de-DE");
    info.appendChild(time);

   
   
    


    let text = document.createElement("div");
    text.classList.add("chat-message-text");
    text.contentEditable = true;
    text.textContent = message.text;
    container.appendChild(text);
    this.setupUpdateSocket(message.x, message.y, message.id);

    // make message visible
    container.scrollIntoView();
  }
  setupUpdateSocket(x, y, noteId) {
    const textElements = document.querySelectorAll('.chat-message-text');
    textElements.forEach(textElement => {
        textElement.addEventListener('blur', (event) => {
          let container = textElement.parentElement.id;
          console.log(container);
            const newText = event.target.textContent;
            //console.log('Text changed:', newText);
            // You can add further logic here to handle the text change event
            this.sendMessage(newText, x, y, true, noteId); // Use `this` to refer to the Chat instance
        });
    });
}
}
