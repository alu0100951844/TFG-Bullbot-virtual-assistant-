
const textInput = document.getElementById('textInput');
const chat = document.getElementById('chat');
let context = {};

const ChatTemplate = (message, from) => `
  <div class="${from}">
    <div class="message">
      <p>${message}</p>
    </div>
  </div>
  `;

const InsertTemplate = (template) => {
  const div = document.createElement('div');
  div.innerHTML = template;

  chat.appendChild(div);
  chat.scrollTop=chat.scrollHeight-30;
};

const SendMessage = async (text = '') => {

  var uri = 'http://localhost:3000/conversation/';

  var English=document.getElementById('English');

  if(English.checked) {
     uri=uri+'en';
  }
  else {
     uri=uri+'es';
  }

  const response = await (await fetch(uri, {
	method:'POST',
	headers: { 'Content-Type':'application/json'},
	body: JSON.stringify({
		text,
		context,
	}),
  })).json();

  context = response.context;

  const template = ChatTemplate(response.output.text, 'watson');

  InsertTemplate(template);
};

textInput.addEventListener('keydown', (event) => {
  if (event.keyCode === 13 && textInput.value) {

     const template = ChatTemplate(textInput.value, 'user');
     InsertTemplate(template);

     SendMessage(textInput.value);
    
     textInput.value = '';
  }
});

//----------------------------CRECORD AUDIO-------------------------------

navigator.mediaDevices.getUserMedia({audio:true})
   .then(stream => {handlerFunction(stream)})

function handlerFunction(stream) {

   rec = new MediaRecorder(stream);

   rec.ondataavailable = e => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
         let blob = new Blob(audioChunks,{type:'audio/ogg'});
         sendData(blob);
      }
   }
}

async function sendData(data) {

  var uri = 'http://localhost:3000/conversation/voice';

  var fd = new FormData();
  fd.append('upl', data, 'binario.ogg');
  
  const response = await (await fetch(uri, {
	method: 'POST',
	body: fd
  })).json();

  var template = ChatTemplate(response, 'user');
  InsertTemplate(template);

  SendMessage(response);
}

record.onclick = e => {

   if(record.style.backgroundColor == "green") {
      record.style.backgroundColor = "#57068C";
      rec.stop();
   }
   else {
      record.style.backgroundColor = "green";
      audioChunks = [];
      rec.start();
   }
}


SendMessage();









