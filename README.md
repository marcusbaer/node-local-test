# node-local-test

node-local-test is a tiny system for logging geolocation as a test based on Node.js. It has an emailer example as well.

## Usage

1. Download and install Node.js
2. Add file config.js in root directory (see below)
3. Start server in its directory: `> node local-server.js`
4. By default the server runs on port 80. So type in your browser: http://localhost
5. You will get a request to allow access to your location

## Add file config.js in root directory

Create file `config.js` in root directory and adjust dataset for you. Parameter `template` points to a html file in folder email/templates:

	module.exports = {
    	email: {
       		subject: "Subject for email",
        	template: "report",
        	from: "'Myapp.com'",
        	to: {
            	email: "recipient@foo.com",
            	name: "Burger",
            	surname: "Hans"
        	},
        	data: {
            	name: "Burger",
            	surname: "Hans",
            	id: "3434_report_id"
        	},
        	smtp: {
	            service: "Gmail",
    	        user: "yourusername@gmail.com",
        	    pass: "yourpassword"
        	},
        	attachments: [
            	{
                	fileName: "html5.png",
                	filePath: "./email/attachments/html5.png",
                	cid: "html5@myapp"
            	}
        	]
    	}
	};


## Command line parameters

**`port`** to use a different port

