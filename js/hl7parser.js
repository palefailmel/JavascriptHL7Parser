function HL7Message() {};


HL7Message.prototype.getSegmentByType = function(type) {
    let seg = {};

    for (let i in this.segments) {
        if (this.segments[i].segmentType === type) {
            seg = this.segments[i];
            return seg;
        }
    }

    return seg;
}

HL7Message.prototype.getSegmentsByType = function(type) {
    let segs = [];

    for (let i in this.msg.segments) {
        if (this.msg.segments[i].segmentType === type) {
            segs.push(this.msg.segments[i]);
        }
    }

    return segs;
};

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

            return null;
        } else {
            this.originalMsg = msg;
            this.setSeparators();
            this.separateSegs();
            this.parseSegs();

            return this.message//new HL7Message(this.message);
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
        let myMsg = new HL7Message();
        myMsg.segments = [];

        myMsg.originalMsg = this.originalMsg;

        for (let i = 0; i < this.segments.length; i++) {
            let currSeg         = this.segments[i];
            let currSegFields   = currSeg.split(this.fieldSep);

            console.log(currSeg);

            //cleanup list and remove last item if empty
            // this will always happen if the segment ends with the field sep
            if (currSegFields[(currSegFields.length - 1)] == '') currSegFields.splice(-1,1);


            // If we're at the MSH, correct segment numbering and add the field separator as the first value
            if (currSegFields[0] === 'MSH') {
                currSegFields[0] = this.fieldSep; //Replace the array's first value "MSH" with the Field Separator
                currSegFields.unshift("MSH"); // Add back "MSH" as the array's first value
            }

            let segObj = {};

            segObj.segmentType = currSegFields[0];
            segObj.fieldCount = (currSegFields.length-1);
            segObj.segmentText = currSeg;
            //segObj.segmentFullText = (currSeg);
            // segObj.fields = {};

            segObj.fields = [];

            for (let j = 0; j < currSegFields.length; j++) {
                let currField = currSegFields[j];

                segObj.fields[j] = {};
                segObj.fields[j].value = currField;

                segObj.fields[j].instances = [];

                let repSet = currField.split(this.repeatSep);
                for (let k = 0; k < repSet.length; k++) {
                    let repField = repSet[k];

                    segObj.fields[j].instances[k] = {};
                    segObj.fields[j].instances[k].value = repField;

                    segObj.fields[j].instances[k].components = [];

                    let compSet = repField.split(this.compSep);
                    for (let l = 0; l < compSet.length; l++) {
                        let compField = compSet[l];

                        segObj.fields[j].instances[k].components[l] = {};
                        segObj.fields[j].instances[k].components[l].value = compField;

                        segObj.fields[j].instances[k].components[l].subcomps = [];

                        let subCompSet = compField.split(this.subCompSep);
                        for (let y = 0; y < subCompSet.length; y++) {
                            let subComp = subCompSet[y];

                            segObj.fields[j].instances[k].components[l].subcomps[y] = {};
                            segObj.fields[j].instances[k].components[l].subcomps[y].value = subComp;
                        }
                    }
                }
            }
            
            

            //console.log(JSON.stringify(segObj));

            
            myMsg.segments.push(segObj);

            //myMsg.segments[i] = (segObj);

            //console.log(myMsg.segments);
        }

        // set MSH segment
        myMsg.MSH = myMsg.getSegmentByType('MSH');

        // add message type, control id, and hl7 version
        myMsg.messageType = myMsg.MSH.fields[9].value;
        myMsg.controlID = myMsg.MSH.fields[10].value;
        myMsg.version = myMsg.MSH.fields[12].value;

        this.message = myMsg;
        this.resultStatus = this.STATUSES.SUCCESS;

    },

    getHTMLOutput   : function(msgObject) {
        console.log('testing forever');
        console.log(msgObject);

        let outputDiv = document.createElement('div');

        // create header element
        let headerElem = document.createElement('h3');
        headerElem.append(document.createTextNode(
            msgObject.messageType +
            ' - Control ID: ' + msgObject.controlID +
            ' - Version: ' + msgObject.version
        ));
        outputDiv.appendChild(headerElem);

        for (let segment of msgObject.segments) {
            // create main detail section for segment
            let segDetElem = document.createElement('details');
            let segSumElem = document.createElement('summary');
            let fieldDivElem = document.createElement('div');
            segSumElem.append(document.createTextNode(segment.segmentText));
            segDetElem.appendChild(segSumElem);
            segDetElem.appendChild(fieldDivElem);

            for (let j = 1; j < segment.fields.length; j++) {
                let field = segment.fields[j];

                let fieldDetElem = document.createElement('details');
                let fieldSumElem = document.createElement('summary');
                fieldSumElem.append(document.createTextNode('['+j+'] '+field.value));
                fieldDetElem.appendChild(fieldSumElem);
                fieldDivElem.appendChild(fieldDetElem);

                let repDiv = document.createElement('div');
                fieldDetElem.appendChild(repDiv);

                for (let k = 0; k < field.instances.length; k++) {
                    let instance = field.instances[k];

                    let instanceDet = document.createElement('details');
                    repDiv.appendChild(instanceDet);

                    let instanceSum = document.createElement('summary');
                    instanceSum.append(document.createTextNode('('+(k+1)+') '+instance.value));
                    instanceDet.appendChild(instanceSum);

                    let compDiv = document.createElement('div');
                    instanceDet.appendChild(compDiv);

                    for (let l = 0; l < instance.components.length; l++) {
                        let component = instance.components[l];

                        let componentDet = document.createElement('details');
                        compDiv.appendChild(componentDet);

                        let compSum = document.createElement('summary');
                        compSum.append(document.createTextNode('['+(l+1)+'] '+component.value));
                        componentDet.appendChild(compSum);

                        let subCompDiv = document.createElement('div');
                        componentDet.appendChild(subCompDiv);

                        for (let y = 0; y < component.subcomps.length; y++) {
                            let subcomp = component.subcomps[y];

                            let subDet = document.createElement('details');
                            subCompDiv.appendChild(subDet);

                            let subSum = document.createElement('summary');
                            subSum.append(document.createTextNode('['+(y+1)+'] '+subcomp.value));
                            subDet.appendChild(subSum);
                        }
                    }
                }
            }

            outputDiv.appendChild(segDetElem);
        }
        

        return outputDiv;
    }
};