/*global module:false*/
module.exports = function(grunt) {
	// Load grunt helpers
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-clean');

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:qtip2.jquery.json>',
		meta: {
			banners: {
				full: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
					' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */',

				min:'/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.homepage %> | '+
					'Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
			}
		},
		dirs: {
			src: 'src',
			dist: 'dist'
		},
		plugins: {
			svg: { js: '<%=dirs.src%>/svg/svg.js' },
			ajax: { js: '<%=dirs.src%>/ajax/ajax.js' },
			tips: { js: '<%=dirs.src%>/tips/tips.js', css: '<%=dirs.src%>/tips/tips.css' },
			modal: { js: '<%=dirs.src%>/modal/modal.js', css: '<%=dirs.src%>/modal/modal.js' },
			viewport: { js: '<%=dirs.src%>/viewport.js' },
			imagemap: { js: '<%=dirs.src%>/imagemap/imagemap.js' },
			bgiframe: { js: '<%=dirs.src%>/bgiframe/bgiframe.js' }
		},
		clean: {
			dist: 'dist/'
		},
		concat: {
			basic: {
				src: [
					'<banner:meta.banners.full>', '<%=dirs.src%>/intro.js',
					'<%=dirs.src%>/core.js', '<%=dirs.src%>/outro.js'
				],
				dest: '<%=dirs.dist%>/basic/jquery.qtip.js'
			},
			basic_css: {
				src: [ '<banner:meta.banners.full>', 'core.css', 'styles.css' ],
				dest: '<%=dirs.dist%>/basic/jquery.qtip.css'
			},
			dist: {
				// See "set_plugins" task for src
				dest: '<%=dirs.dist%>/jquery.qtip.js'
			},
			dist_css: {
				// See "set_plugins" task for src
				dest: '<%=dirs.dist%>/jquery.qtip.css'
			}
		},
		min: {
			basic: {
				src: ['<banner:meta.banners.min>', '<file_strip_banner:<%=dirs.dist%>/basic/jquery.qtip.js:block>'],
				dest: '<%=dirs.dist%>/basic/jquery.qtip.min.js'
			},
			dist: {
				src: ['<banner:meta.banners.min>', '<file_strip_banner:dist/jquery.qtip.js:block>'],
				dest: '<%=dirs.dist%>/jquery.qtip.min.js'
			}
		},
		cssmin: {
			basic: {
				src: ['<banner:meta.banners.min>', '<file_strip_banner:<%=dirs.dist%>/basic/jquery.qtip.css:block>'],
				dest: '<%=dirs.dist%>/basic/jquery.qtip.min.css'
			},
			dist: {
				src: ['<banner:meta.banners.min>', '<file_strip_banner:<%=dirs.dist%>/jquery.qtip.css:block>'],
				dest: '<%=dirs.dist%>/jquery.qtip.min.css'
			}
		},
		lint: {
			beforeconcat: ['grunt.js', '<%=dirs.src%>/core.js', '<%=dirs.src%>/*/*.js']
		},
		csslint: {
			src: {
				src: ['*.css', '<%=dirs.src%>/**/*.css'],
				rules: {
					ids: false,
					important: false,
					'empty-rules': false,
					'star-property-hack': false,
					'universal-selector': false
				}
			}
		},
		watch: {
			files: '<config:lint.beforeconcat.files>',
			tasks: 'lint'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				boss: true,
				eqnull: true,
				browser: true,
				undef: false
			},
			globals: {
				jQuery: true,
				'$': true
			}
		},
		uglify: {}
	});

	// Set extras and extras_css "src" based on defined plugins
	grunt.registerTask('init', 'Default build', function() {
		if(grunt.config('concat.dist.src')) { return; } // Only do it once

		var plugins = (grunt.option('plugins') || 'ajax viewport tips modal imagemap svg bgiframe').split(' '),
			js = ['<banner:meta.banners.full>', '<%=dirs.src%>/intro.js', '<%=dirs.src%>/core.js'],
			css = ['<banner:meta.banners.full>', '<%=dirs.src%>/core.css', '<%=dirs.src%>/extra.css'];

		// Console out
		grunt.log.write("\nBuilding qTip2 with plugins: " + plugins.join(' ') + "\n");

		// Setup include strings
		plugins.forEach(function(plugin) {
			js.push('<%=dirs.src%>/'+plugin+'/'+plugin+'.js');
			css.push('<%=dirs.src%>/'+plugin+'/'+plugin+'.css');
		});

		// Update config
		grunt.config.set('concat.dist.src', js.concat(['<%=dirs.src%>/outro.js']));
		grunt.config.set('concat.dist_css.src', css);
	});

	// Grab latest git commit message and output to "comment" file
	grunt.registerTask('commitmsg', 'Output latest git commit message', function() {
		var dist = grunt.config('dirs.dist'),
			cmd = 'git log --pretty=format:\'%s\' -1 > ' + dist + '/comment';

		require('child_process').exec(cmd, function(err, stdout, stderr){
			grunt.file.write(dist+'/comment', gzipSrc.length);
		});
	});

	// Output gzip file size task
	grunt.registerTask('gzip', 'Calculate size of gzipped minified file', function() {
		var dist = grunt.config('dirs.dist'),
			src = grunt.file.read( grunt.file.expand( grunt.config('min.dist.dest') ) ),
			gzipSrc = grunt.helper('gzip', src);

		grunt.file.write(dist+'/gziplength', gzipSrc.length);
	});

	// Setup all other tasks
	grunt.registerTask('css', 'init clean csslint concat:dist_css cssmin:dist');
	grunt.registerTask('basic', 'init clean lint csslint concat:basic concat:basic_css min:basic cssmin:basic');
	grunt.registerTask('default', 'init clean lint csslint concat:dist concat:dist_css min:dist cssmin:dist');
	grunt.registerTask('dev', 'init clean lint csslint concat min cssmin gzip commitmsg');
};