




module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('../package.json'),
		concat: {
		  /*options: {
		    // define a string to put between each file in the concatenated output
		    separator: ';'
		  },*/
		  dist: {
		    // the files to concatenate
		    src: ['min-safe/*.js'],
		    // the location of the resulting JS file
		    dest: 'dist/<%= pkg.name %>.js'
		  }
		},
		uglify: {
		    files: {
		      //'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
		      'dist/<%= pkg.name %>.min.js': ['dist/*.js']
		    }
		},
		qunit: {
		  files: ['test/**/*.html']
		},
		jshint: {
		  // define the files to lint
		  files: ['Gruntfile.js', 'assets/javascripts/factory.js', 'modules/**/*.js', 'test/**/*.js'],
		  // configure JSHint (documented at http://www.jshint.com/docs/)
		  options: {
		    // more options here if you want to override JSHint defaults
		    globals: {
		      jQuery: true,
		      console: true,
		      module: true
		    }
		  }
		},
		ngAnnotate: {
		    options: {
		        singleQuotes: true
		    },
		    app: {
		        files: {
		        	'min-safe/01chat.js': ['modules/chat/chatModule.js'],
		        	'min-safe/02directives.js': ['modules/chat/js/directives.js'],
		        	'min-safe/03factory.js': ['modules/chat/js/factory.js'],
		        	'min-safe/04routes.js': ['modules/chat/js/routes.js'],
		        	'min-safe/05photoFactory.js': ['modules/chat/js/photoFactory.js'],
		            'min-safe/06controller.js': ['modules/chat/js/controller.js'],
		            'min-safe/07chatEndController.js': ['modules/chat/js/chatEndController.js'],
		            'min-safe/08reportUserController.js': ['modules/chat/js/reportUserController.js'],
		            'min-safe/09videoChatController.js': ['modules/chat/js/videoChatController.js'],
		            'min-safe/10reportUserVideoController.js': ['modules/chat/js/reportUserVideoController.js']
		        }
		    }
		},
		watch: {
		  files: ['<%= jshint.files %>'],
		  tasks: ['jshint', 'qunit']
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ng-annotate'); 

	// this would be run by typing "grunt test" on the command line
	grunt.registerTask('test', ['jshint']);

	// this would be run by typing "grunt annotate" on the command line
	grunt.registerTask('annotate', ['ngAnnotate','concat', 'uglify']);

	// this would be run by typing "grunt uglify" on the command line
	grunt.registerTask('uglify', ['uglify']);

	// the default task can be run just by typing "grunt" on the command line
	grunt.registerTask('default', ['jshint', 'ngAnnotate', 'concat', 'uglify']);
};