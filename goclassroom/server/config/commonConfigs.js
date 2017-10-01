// accuring nodemailer and smtp
var nodemailer 		= require('nodemailer');
var hbs 			= require('nodemailer-express-handlebars');

var smtpDetails = {

  	host 	: process.env.SMTP_HOST,
  	port 	: process.env.SMTP_PORT,
  	auth 	: {
   		
   		user: process.env.SMTP_USER,
    	pass: process.env.SMTP_PASS
  	
  	}

}

// creating SMTP instance
var transporter = nodemailer.createTransport(smtpDetails);

// setting up templates
transporter.use('compile', hbs({
	viewPath 	: 'server/views/emails',
	extName 	: '.html'
}))

// fnction to trigger email
function mail(details, settings, callback){

	var details = {
	    from 		: process.env.SMTP_EMAIL,
	    to 			: details.email,
	    subject 	: settings.subject,
		template 	: settings.template,
		context 	: {

			details : details

		}
	};

	transporter.verify(function (error, success){

		if (error){
			console.log(error);

		} else {

			// triggering mail 
			transporter.sendMail(details, function callback(err, info){

				if(err){
					
					console.log(err);

				}
			})
		}
	})
}

// exporting function to express
module.exports = {

	mail : mail

}