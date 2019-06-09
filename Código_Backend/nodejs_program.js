
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
var ffmpeg = require('ffmpeg');
var multer = require('multer');
var SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
var fs = require('fs');

//----------------------------GLOBAL VARIABLES---------------------------------

var special_node=['node_12_1557869479309','node_6_1557866654590'];
var check="empty";


//-------------------------------FUNCTIONS-------------------------------------

function sendmessage(assistant,languageTranslator,text,context,res,language) {
   
   assistant.message({
      workspace_id: 'ae173244-8cbb-4030-99b8-e309883e6ec0',
      input: { text },
      context,
   },  function(err, response) {
          if (err) {
             console.error(err);
             res.status(500).json(err);
          }
          else {
             if(language=='en') {
                languageTranslator.translate( {text: response.output.text, source: 'es', target: 'en',} )
                   .then(body => {

                      //console.log(JSON.stringify(response.context.system.dialog_stack[0].dialog_node, null, 2));
                      for(var i=0;i<special_node.length;i++) {
                         if(response.context.system.dialog_stack[0].dialog_node==special_node[i]) {
                            check=special_node[i];
                         }
                      }
                      
                      response.output.text=(body.translations[0].translation).replace(/https: \/\//g,"https://");

                      //console.log(JSON.stringify(response, null, 2));
                      res.json(response);
                      //console.log(JSON.stringify(response.output.text, null, 2));
                      //console.log('\n');
                   })
                   .catch(err => {
                      console.log(err);
                   });
             }
             else {
                //console.log(JSON.stringify(response.context.system.dialog_stack[0].dialog_node, null, 2));
                for(var i=0;i<special_node.length;i++) {
                   if(response.context.system.dialog_stack[0].dialog_node==special_node[i]) {
                      check=special_node[i];
                   }
                }

                console.log(JSON.stringify(response.output.text, null, 2));
                res.json(response);
             }
          }
       }
   );

}

//----------------------------SERVER CONFIGURE---------------------------------

const app = express();

app.use(bodyParser.json());
app.use(express.static('./public'));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'binario.ogg')
    }
});

var upload = multer({ storage: storage });
var type = upload.single('upl');

const port = 3000;

// Configurar cabeceras y cors
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

//----------------------------SERVICE CONNECTION-------------------------------

//Conexión al servicio Watson Assistant.
var assistant = new AssistantV1({
  username: 'apikey',
  password: 'uFxQosNc9TM8SxbRV40dpG1ilaaKaKMtefgEnUcHKu1f',
  url: 'https://gateway.watsonplatform.net/assistant/api',
  version: '2019-02-01'
});

//Conexión al servicio Language Translator.
const languageTranslator = new LanguageTranslatorV3({
  username: 'apikey',
  password: 'PCLGZ2jL76r9fpU1MKRU3oRsPHgUTI4x17OxA_hJiOtZ',
  url: 'https://gateway.watsonplatform.net/language-translator/api',
  version: '2019-01-10'
});

//Conexión al servicio Speech to Text.
var speechToText = new SpeechToTextV1({
  username: 'apikey',
  password: 'GFZTpKIltk4v5ME6LMBENzAk6Vm_8R7vaf33jJlP1Nu1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

//---------------------------------OPERATION----------------------------------

//Recepción de la petición desde el cliente.
app.post('/conversation/:language*?', type, function (req, res) {

   const { language } = req.params;

   if(language!='voice') { 
      var { text, context={} } = req.body;
      console.log(language);

      console.log('/n AA');
      console.log(check);
      if((check=='node_12_1557869479309'&&(text=='si'||text=='yes'))||(check=='node_6_1557866654590'&&text=='no')) {
         text=context.save_message;
         check="empty";
      }

      if(language=='en') {
         languageTranslator.translate( {text: text, source: 'en', target: 'es',} )
            .then(body => {
               sendmessage(assistant,languageTranslator,body.translations[0].translation,context,res,language)
               console.log(JSON.stringify(body.translations[0].translation, null, 2));
               //console.log('\n');
            })
            .catch(err => {
               console.log(err);
            });
      }
      else {
         sendmessage(assistant,languageTranslator,text,context,res,language)
      }
   }
   else {

      console.log(req.file);

      var params = {
         content_type: 'audio/ogg',
         objectMode: true,
         model: 'es-ES_NarrowbandModel'
      };

      // create the stream
      var recognizeStream = speechToText.recognizeUsingWebSocket(params);
      
      // pipe in some audio
      fs.createReadStream(__dirname + '/public/uploads/binario.ogg').pipe(recognizeStream);

      recognizeStream.on('data', function(event) {
         res.json(event.results[0].alternatives[0].transcript);
      });
   }

});

app.listen(port, () => console.log(`Running on port ${port}`));
