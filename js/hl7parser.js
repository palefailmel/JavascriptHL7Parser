/*
    Author: Michael Stevenson

    2020-06-29: Separating out class into its own file and making changes to not rely on the specific HTML page
*/

var HL7Parser = {
    // adding in output types to flex how info is displayed/sent once parsed
    OUTPUT_TYPES : {
        PAGE: 'PAGE',
        JSON: 'JSON'
    },
    STATUSES     : {
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR'
    },
    message     : {},
    fieldSep    : '|',
    compSep     : '^',
    subCompSep  : '&',
    repeatSep   : '~',
    escapeChar  : '\\',

    // parse message into object
    parseMessage    : function(inboundMessage) {
        let msg = inboundMessage.trim();

        if (msg === '' || msg.substring(0,3) != 'MSH') {
            this.message.resultStatus = this.STATUSES.ERROR
            this.message.resultReason = 'Not a valid HL7 message';
        } else {
            this.originalMsg = msg;
            this.setSeparators();
            this.separateSegs();
            this.parseSegs();
        }
    },
    
    // replace separates with actual separators from message
    setSeparators : function() {
        this.fieldSep   = this.originalMsg.substring(3,4);
        this.compSep    = this.originalMsg.substring(4,5);
        this.repeatSep  = this.originalMsg.substring(5,6);
        this.subCompSep = this.originalMsg.substring(7,8);
        this.escapeChar = this.originalMsg.substring(6,7);        
    },
    // separate message segments into a list
    separateSegs : function() {
        this.segments = this.originalMsg.split("\n");
        // remove any whitespace around segments, just in case
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i] = this.segments[i].trim();
        }
    },
    // parse out segments
    // places results in message object
    parseSegs : function() {
        let myMsg = {};
        myMsg.segments = {};

        myMsg.originalMsg = this.originalMsg;

        for (let i = 0; i < this.segments.length; i++) {
            let currSeg         = this.segments[i];
            let currSegFields   = currSeg.split(this.fieldSep);

            console.log(currSeg);

            //cleanup list and remove last item if empty
            // this will always happen if the segment ends with the field sep
            if (currSegFields[(currSegFields.length - 1)] == '') currSegFields.splice(-1,1);


            // If we're at the MSH, correct segment numbering and set the info header
            if (currSegFields[0] == 'MSH') {
                currSegFields[0] = this.fieldSep; //Replace the array's first value "MSH" with the Field Separator
                currSegFields.unshift("MSH"); // Add back "MSH" as the array's first value
                // set the info header
                //this.addMSHHeader(currSegFields);
                myMsg.messageType = currSegFields[9];
            }

            let segObj = {};
            segObj.segmentType = currSegFields[0];
            segObj.fieldCount = (currSegFields.length-2);
            segObj.segmentText = currSeg;
            //segObj.segmentFullText = (currSeg);
            segObj.fields = {};
            
            // iterate through the fields in the message
            // skip the segment type
            currSegFields.shift();
            for (let j in currSegFields) {
                let currField = currSegFields[j];

                segObj.fields[j] = {};
                segObj.fields[j].value = currField;

                // now split up for repeating
                let fieldRepSet = currField.split(this.repeatSep);
                for (let k in fieldRepSet) {
                    let currRepField = fieldRepSet[k];

                    segObj.fields[j][k] = {};
                    segObj.fields[j][k].value = currRepField;

                    // split up for components
                    let fieldCompSet = currRepField.split(this.compSep);
                    for (let l in fieldCompSet) {
                        let currCompField = fieldCompSet[l];

                        segObj.fields[j][k][l] = {};
                        segObj.fields[j][k][l].value = currCompField;

                        // split up sub components
                        
                    }
                }
            }

            console.log(JSON.stringify(segObj));

            
            

            myMsg.segments[i] = (segObj);

            //console.log(myMsg.segments);
        }

        this.message = myMsg;
        this.resultStatus = this.STATUSES.SUCCESS;
    },

    outputToPage    : function(resultAreaId) {
        console.log(this.message.segments);

        for (let i in this.message.segments) {
            let currentSegment = this.message.segments[i];
            console.log(currentSegment.segmentType);

            // treat MSH a little differently
            if (currentSegment.segmentType === 'MSH') {
                // let headerObj       = document.createElement('h3');
                // let headerString    = '';
                // add message type to header
                console.log("Message Type: " + this.message.messageType);

                // just output segment and message
                console.log("Original Message: " + this.message.originalMsg);
                console.log("MSH Segment: " + currentSegment.segmentText);
            } else {
                

                for (let field in currentSegment.field) {
                    let currentField = currentSegment.field[field];

                    // console.log(JSON.stringify(currentField));
                    console.log('['+((field*1)+1)+'] - ' + currentField.fieldText);

                    for (let compSet in currentField) {
                        let currentCompSet = currentField[compSet];

                        console.log(currentCompSet);
                    }
                }
            }
        }

        console.log(JSON.stringify(this.message));
    }
};

let testMsg = 'TVNIfF5+XCZ8RVBJQ3xFUElDQURUfFNNU3xTTVNBRFR8MTk5OTEyMjcxNDA4fENIQVJSSVN8QURUXkEwNHwxODE3NDU3fER8ICAyLjV8ClBJRHx8MDQ5MzU3NV5eXjJeSUQgMXw0NTQ3MjF8fERPRV5KT0hOXl5eXnxET0VeSk9ITl5eXl58MTk0ODAyMDN8TXx8QnwyNSAgNCBNWVNUUkVFVCBBVkVeXk1ZVE9XTl5PSF40NDEyM15VU0F8fCgyMTYpMTIzLTQ1Njd8fHxNfE5PTnw0MDAwMDM0MDN+MTEyOTA4NnwKTksxfHxST0VeTUFSSUVeXl5efFNQT3x8KDIxNikxMjMtNDU2N3x8RUN8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHwKUFYxfHxPfDE2OCB+MjE5fkN+UE1BXl5eXl5eXl5efHx8fDI3N15BTExFTiBNWUxBU1ROQU1FXkJPTk5JRV5eXl58fHx8fHx8ICB8fHwgfHwyNjg4Njg0fHx8fHxvbmVedGVzdCZ0aHJlZSZmb3VyfHx8fHx8fHx8fHx8fHx8fHx8fHwxOTk5MTIyNzE0MDh8fHx8fHwwMDIzNzY4NTM=';

let myTest = 'MSH|^~\&|EPIC|EPICADT|SMS|SMSADT|199912271408|CHARRIS|ADT^A04|1817457|D|  2.5|\n'+
'PID||0493575^^^2^ID 1|454721||DOE^JOHN^^^^|DOE^JOHN^^^^|19480203|M||B|25  4 MYSTREET AVE^^MYTOWN^OH^44123^USA||(216)123-4567|||M|NON|400003403~1129086|\n'+
'NK1||ROE^MARIE^^^^|SPO||(216)123-4567||EC|||||||||||||||||||||||||||\n'+
'PV1||O|168 ~219~C~PMA^^^^^^^^^||||277^ALLEN MYLASTNAME^BONNIE^^^^|||||||  ||| ||2688684|||||one^test&three&four||||||||||||||||||||199912271408||||||002376853';

// HL7Parser.tryParse(myTest,HL7Parser.OUTPUT_TYPES.PAGE, '');

HL7Parser.parseMessage(myTest);

//console.log(JSON.stringify(HL7Parser.message));

//if (HL7Parser.resultStatus === HL7Parser.STATUSES.SUCCESS) {
//    HL7Parser.outputToPage('');
//}