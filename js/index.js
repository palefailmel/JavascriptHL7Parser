 /*
                add the trim function if it doesn't exist
            */
                if(typeof String.prototype.trim !== 'function') {
                    String.prototype.trim = function() {
                        return this.replace(/^\s+|\s+$/g, '');
                    }
                }
    
                function parseMessage() {
                    let msgAreaElem = document.getElementById('msgArea');
                    let resultsAreaElem = document.getElementById('resultsArea');
    
                    
    
                    let currMessage = HL7Parser.parseMessage(msgAreaElem.value);
                    
                    // check that parsing was successful
                    if (HL7Parser.resultStatus = HL7Parser.STATUSES.SUCCESS) {
                        // build header

                        let outputElem = HL7Parser.getHTMLOutput(currMessage);

                        resultsAreaElem.appendChild(outputElem);
    
                    }
                    
                }
    
                function parseSample() {
                    let msgAreaElem = document.getElementById('msgArea');
                    let preElem =  document.getElementById('samplemsg');
    
                    msgAreaElem.value = preElem.innerHTML;
    
                    parseMessage();
                }
    
                function clearResults() {
                    let resultsAreaElem = document.getElementById('resultsArea');
                    while (resultsAreaElem.firstChild) {
                        resultsAreaElem.removeChild(resultsAreaElem.firstChild);
                    }
                }