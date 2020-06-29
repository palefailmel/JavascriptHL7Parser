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
    fieldSep    : '|',
    compSep     : '^',
    subCompSep  : '&',
    repeatSep   : '~',
    escapeChar  : '\\',
    outputType  : OUTPUT_TYPES.PAGE, // default to basic page output
    
    // replace separates with actual separats from message
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
    parseSegs : function(segFields) {
        for (let i = 0; i < this.segments.length; i++) {
            let currSeg         = this.segments[i];
            let currSegFields   = currSeg.split(this.fieldSep);

            //cleanup list and remove last item if empty
            // this will always happen if the segment ends with the field sep
            if (currSegFields[(currSegFields.length - 1)] == '') currSegFields.splice(-1,1);

            // If we're at the MSH, correct segment numbering and set the info header
            if (currSegFields[0] == 'MSH') {
                currSegFields[0] = this.fieldSep; //Replace the array's first value "MSH" with the Field Separator
                currSegFields.unshift("MSH"); // Add back "MSH" as the array's first value
                // set the info header
                this.addMSHHeader(currSegFields);
            }

            // add segment header for each segment
            this.addSegHeader(currSegFields);
            // add segment field information
            this.addSegFields(currSegFields);
        }
    },
    // output segment header
    // flex type of output based on outputType variable
    addSegHeader : function(segFields) {
        switch(this.outputType) {
            case OUTPUT_TYPES.PAGE:
                let headerObj       = document.createElement('h4');
                let headerString    = '';
                // display what type of segment it is
                headerString        += segFields[0] + " segment - ";
                // display how many fields are in the segment
                // (without counting the first item, which is just the segment name)
                headerString        += (segFields.length-1) + " fields";
                headerObj.innerHTML = headerString
                // add segment header to bottom of page
                this.resultsArea.appendChild(headerObj);

                // add segment to seg header
                let preObj = document.createElement('pre');
                preObj.innerHTML = segFields.join(this.fieldSep);
                this.resultsArea.appendChild(preObj);
                break;
        }
    },
    addMSHHeader : function(mshSegFields) {
        switch(this.outputType) {
            case OUTPUT_TYPES.PAGE:
            let headerObj       = document.createElement('h3');
            let headerString    = '';
            // add message type to header
            headerString        += "Message Type: " + mshSegFields[8];
            // add HL7 version to header
            headerString        += " - HL7 Version: " + mshSegFields[11];
            // add datetime in MSH segment to header
            headerString        += " - Date/Time of Msg: " + mshSegFields[6];
            headerObj.innerHTML = headerString
            // add to page
            this.resultsArea.appendChild(headerObj);
            
            // go ahead and add message as well
            let segs = this.originalMsg.split('\n');
            for (let i = 0, size = segs.length; i < size; i++) {
                let preObj = document.createElement('pre');
                preObj.innerHTML = segs[i];
                this.resultsArea.appendChild(preObj);
            }
            break;
        }
    }
}