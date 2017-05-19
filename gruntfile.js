module.exports = function (grunt) {
    var versiony = require('versiony');
    var merge = require('deepmerge');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            prebuild : ['./build/Chrome/**', './build/Firefox/**'],
            temp : './build/temp/**'
        },
        uglify: {
            options : {
                flatten: true,   // remove all unnecessary nesting
                sourceMap: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            libs : {
                files:{
                    'build/temp/libs.minified/libs.min.js' : './build/temp/libs/*.js'
                }
            },
            helpers : {
                files:{
                    'build/temp/libs/zhandlebars-helpers.min.js' : ['./src/third/handlebars-helper-x.js'] //unless z is to add the file at the end
                }
            }

        },
        compress: {
            chrome: {
                options: {
                    archive: './build/zip/Chrome.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    cwd: './build/Chrome/',
                    src: ['**'],
                    dest: '/'
                }]
            },
            firefox: {
                options: {
                    archive: './build/zip/Firefox.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    cwd: './build/Firefox/',
                    src: ['**'],
                    dest: '/'
                }]
            }
        },
        copy:{
            libs: {
                files: [
                    {
                        cwd : '.',
                        src: [
                            './node_modules/noty/js/noty/packaged/jquery.noty.packaged.min.js', 
                            './node_modules/async/dist/async.min.js', 
                            './node_modules/handlebars/dist/handlebars.min.js',
                            './node_modules/jquery/dist/jquery.min.js'
                        ],
                        flatten: true,
                        expand:true,
                        dest: './build/temp/libs/'
                    },
                    {
                        expand: true, 
                        cwd : './node_modules/mdi/',
                        src: [
                            'css/**', 
                            'fonts/**'
                        ],
                        dest: './src/third/material-design-iconic-font/'
                    }
                ]
            },
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', "!__specific/**", "!third/handlebars-helper-x.js"],
                    dest: './build/Chrome/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Chrome/',
                    src: ["**"],
                    dest: './build/Chrome/'
                },
                {
                    expand: true,
                    cwd: './build/temp/libs.minified/',
                    src: ["**"],
                    dest: './build/Chrome/third'
                }]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', "!__specific/**", "!third/handlebars-helper-x.js"],
                    dest: './build/Firefox/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Firefox/',
                    src: ["**"],
                    dest: './build/Firefox/'
                },
                {
                    expand: true,
                    cwd: 'build/temp/libs.minified/',
                    src: ["**"],
                    dest: './build/Firefox/third'
                }]
            }
        },
        json_generator:{
            firefox: {
              dest: "./build/Firefox/manifest.json", // Destination file 
              options: merge(grunt.file.readJSON('./src/manifest.json'), grunt.file.readJSON('./src/__specific/Firefox/manifest.json'))
            },
            chrome: {
              dest: "./build/Chrome/manifest.json", // Destination file 
              options: merge(grunt.file.readJSON('./src/manifest.json'), grunt.file.readJSON('./src/__specific/Chrome/manifest.json'))
            }            
        },
        watch: {
            dev:{
                files: ['src/**/*'],
                tasks: ['dev'],
            }
        },
        notify: {
            start: {
                options: {
                    message: 'Extension start compilation', //required
                }
            },
            end: {
                options: {
                    message: 'Extension is compiled', //required
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-generator');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default',
        [
            "copy:libs",
            "uglify:helpers",
            "uglify:libs",
            "chrome",
            "firefox",
        ]);    

    grunt.registerTask('release',
        [
            "clean:prebuild",
            "default",
        ]);
    grunt.registerTask('firefox',
        [
            "copy:firefox",
            "json_generator:firefox",
            "compress:firefox"
        ]
    );
    grunt.registerTask('chrome',
        [
            'copy:chrome',
            "json_generator:chrome",
            'compress:chrome'
        ]
    );

    grunt.registerTask("dev", 
        [
            "copy:libs",
            "uglify:helpers",
            "uglify:libs",
            "clean:prebuild",
            "copy:chrome",
            "copy:firefox",
            "json_generator:firefox",
            "json_generator:chrome",
            "clean:temp",
            "notify:end"
        ]
    );
    
    grunt.registerTask("watch-dev", 
        [
            "watch:dev",
        ]
    );


    grunt.registerTask('patch', 'update patch version', function() {
        version_after = versiony
        .from('./src/manifest.json')
        .patch()
        .to("./src/manifest.json")
        .to("package.json")
        .get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
    grunt.registerTask('minor', 'update minor version', function() {
        version_after = versiony
        .from('./src/manifest.json')
        .patch(0)
        .minor()
        .to("./src/manifest.json")
        .to("package.json")
        .get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
    grunt.registerTask('major', 'update major version', function() {
        version_after = versiony
        .from('./src/manifest.json')
        .patch(0)
        .minor(0)
        .major()
        .to("./src/manifest.json")
        .to("package.json")
        .get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
};