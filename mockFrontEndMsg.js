function initChatMsg(){
	names = ['john', 'joe', 'eli', 'larry', 'bob', 'jessie', 'emily', 'greg', 'tupac', 'eli is a faggot', 'phlash', 'titays', 'charlie sheen', 'bob saggot'];
		console.log("mello");
	function mockMsg(){
		var numRuns = Math.floor(Math.random()*250);
		var msg = [];
		for(var i = 0; i < numRuns; i++){
			msg.push(String.fromCharCode(Math.floor(Math.random()*250)));
		}
		return msg.join("");
	};

	function mockSenderName(){
		return Math.floor(Math.random() * 1000) % names.length; 
	};

	function mockTimestamp(){
//		var dateOpts = 
		var date = new Date();
		return date.getUTCFullYear() + '-' +
		('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
		('00' + date.getUTCDate()).slice(-2) + ' ' +
	    ('00' + date.getUTCHours()).slice(-2) + ':' +
	    ('00' + date.getUTCMinutes()).slice(-2) + ':' +
		('00' + date.getUTCSeconds()).slice(-2);
	};

	function createMockObjs( mockInitFuncs, numOfMockObjs){
		if( ! mockInitFuncs || mockInitFuncs.length == 0)
			return null;
		if( !numOfMockObjs || numOfMockObjs <= 0 )
			numOfMockObjs = 1;

		var mockObjArray = [];
		for( var i = 0; i < numOfMockObjs; i++){
			var mockObj = {} // {id: msgId};

			for(var j = 0; j < mockInitFuncs.length; j++){
				var func = mockInitFuncs[j];
				var funcName = func.name.slice(4); // slices off 'mock' from func name
				funcName = funcName[0].toLowerCase() + funcName.slice(1);
				/*Each function name should be of form <mock><AttributeName> */
		
				mockObj[funcName] = func.call(mockObj);
			}
			mockObjArray.push(mockObj);
		}
		return mockObjArray;
	}

	var mockInitFuncs = [mockMsg, mockSenderName, mockTimestamp];

	function mockIncomingMsgs(fnMsgHandler){
		if( typeof fnMsgHandler != 'function'){
			console.log("Error: mockIncomingMsg expected function argument");
			return;
		}
		var numOfMsg = Math.floor(Math.random()*100) % 20
		var msgObjs = createMockObjs(mockInitFuncs, numOfMsg);
		return fnMsgHandler(msgObjs);
		/*
		TODO: msgObjs is an array of msgs we’ve received from server. 
		 each individual msgObj in the array  has {senderName, timestamp, msg)
		you want to use msgObj.senderName to print out who sent the msg, msgObj.timestamp to sort and add msgs in 		correct order. and then msgObj.msg to print the actual msg
		Later on we can worry about sending files/pictures/fonts/ etc
		*/
		
	}

	/*
	 need to infinitely recurse, rather than loop because setTimeout is weird involves the scheduling functions 
	*/
	function mockEndlessIncomingMsgs(fnMsgHandler, seconds){
		mockIncomingMsgs(fnMsgHandler);
		setTimeout( mockEndlessIncomingMsgs(fnMsgHandler, seconds), 1000 * seconds);
	}


////////////////////////////////////////////////// For sending out and displaying msgs from current user //////////////////////////////////////

	/*
	Note to self. Timestamp should be done by back end to prevent exploits.
 	and senderId is created through cookie/session lookup on backend. 
 	that’s y only the msg is sent 
 	*/
	function mockServerResponseToMsg(msg){
		// 10% chance of failure. 
		// Note: the !! is basically a hack to cast 0 to false and any other number to true
		return !! (msgStatus = Math.floor(Math.random()*100) % 10)
	}

	function initMockOutgoingMsg(fnMsgSuccess, fnMsgFail, fnGetMsgText){
		

		// Should be attached to onSubmit type event for msg input box 
		return function mockOutgoingMsg(msg){
			var msgToSend = "TEST MSG";
		// here you will get text something like <document.getElementById(“MsgInputBox”).InnerText();>
		// you’ll need to look it up depending on what html element you use. It might by .InnerHTML();
			if( fnGetMsgText)	
				msgToSend = fnGetMsgText();
			var status = mockServerResponseToMsg(msgToSend);
			if( status ){
				fnMsgSuccess(msgToSend)
		/*
		TODO:
		 print msg to user’s messageLog. Put symbol like > or something to show user sent it
		 look up how to do this. Something like <document.getElementById(“MsgInputBox”).InnerText > 
		*/
			}
			else{
				fnMsgFail(msgToSend);
		//TODO: print an error msg. King how apple does if msg doesn’t send. Might wanna change text color to light grey
			}
		}
	}

	return {
		mockEndlessIncomingMsgs: mockEndlessIncomingMsgs,
		initMockOutgoingMsg: initMockOutgoingMsg
	}
}
