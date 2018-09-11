# JavascriptHL7Parser

Simple page with a javascript parser that parses out fields in HL7 messages, and splits out components and repeating fields

## Information

### How to Use

Paste an HL7 message in the textarea on the page, with each segment being separated by a newline. Then click the button. The field information should be added to the bottom of the page.

### Description

The script takes the value of the textarea on the page and parses it out and attempts to extract field information.

The textarea depends on each segment being separated by a newline (\n), so message may require some manipulation before being parsed correctly. It doesn't do much checking, it assumes that whoever uses it knows to post a proper HL7 message with newline separated segments.

### Demo

Demo is hosted at <http://horridcode.com/javascripthl7parser>

## License

Licensed under the MIT license.
