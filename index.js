// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

//httpの利用を宣言する
const http = require('http');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
   function aisatu(agent) {
    agent.add(`はじめまして`);
  }
  
  function suuji(agent) {
    let num = agent.parameters[`number`];
    agent.add(`数字は`　+ num+ `ですね` );
  }
  
  function keisan(agent) {
   return new Promise((resolve,reject)=>{
   let num1 = parseInt(agent.parameters.number);
   let num2 = parseInt(agent.parameters.number1);
   let calc  = (agent.parameters.calc); 
   calculation(num1,num2,calc,(num3)=>{
     agent.add(`the result is ` + num3);
     resolve();
   } ) ;    
   });
  }
                      
  
  function calculation(num1,num2,calc,callback){
     if (calc == `加算`){
         callback( num1 + num2);   　   
        }else if (calc == `引算`){
         callback( num1 - num2);
        }else if (calc == `乗算`){
         callback(  num1 * num2);   　
        }else if (calc == `除算`){
         callback(  num1 / num2);
        }
  }
 
  
  function minus(agent) {
   let num1 = parseInt(agent.parameters.number);
   let num2 = parseInt(agent.parameters.number1);
   let num3 = num1 - num2;
   agent.add(`the result is` + num3);
  }
  
  function yuubin(agent) {
    return new Promise((resolve, reject) => {
        //httpのリクエストを送信
        let req = http.get('http://zipcloud.ibsnet.co.jp/api/search?zipcode=7330876', (res) => {
          let chunk = '';
          //読み込み中の処理
          res.on('data', (c) => {
            chunk += c;
          });
          
          //読み込み完了時の処理
          res.on('end', () => {
            let response = JSON.parse(chunk);
            console.log('response: ' + JSON.stringify(response));
            
            //パラメータの取得
            let address = (response.results);
            let address1 = (address.address1);
            let address2 =  (address.address2);
            let address3 =  (address.address3);
            
            //表示
            agent.add('住所:' + address1 + address2 + address3);
            
            //処理終了
            resolve();
          });
        });
        
        //エラー時の処理
        req.on('error', (e) => {
          console.error(`エラー： ${e.message}`);
        });
    });
  }
  
  
  
  

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('aisatu', aisatu);
  intentMap.set('suuji', suuji);
  intentMap.set('keisan', keisan);
  intentMap.set('minus', minus);
  intentMap.set('yuubin', yuubin);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
