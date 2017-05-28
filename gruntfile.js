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
                    '<%= grunt.template.today("yyyy-mm-dd") %> . This templates contain also some other libraries, see package.json for more informations . */'
            },
            prebuild : {
                files:{
                    'build/temp/assets/js/min/libs.min.js' : ['./build/temp/assets/js/*.js', './build/temp/assets/js/addons/*.js']
                }
            }
        },
        copy:{
            prebuild: {
                files: [
                    //js
                    {
                        cwd : '.',
                        src: [
                            './node_modules/noty/lib/noty.js', 
                            './node_modules/async/dist/async.js', 
                            './node_modules/handlebars/dist/handlebars.js',
                            './node_modules/jquery/dist/jquery.js',
                            './node_modules/moment/min/moment-with-locales.js'
                        ],
                        flatten: true,
                        expand:true,
                        dest: './build/temp/assets/js/'
                    },
                    //js addons
                    {
                        cwd : '.',
                        src: [
                            './node_modules/moment-duration-format/lib/moment-duration-format.js', 
                        ],
                        flatten: true,
                        expand:true,
                        dest: './build/temp/assets/js/addons'
                    },
                    //css
                    {
                        cwd : '.',
                        src: [
                            './node_modules/noty/lib/noty.css'
                        ],
                        flatten: true,
                        expand:true,
                        dest: './build/temp/assets/css/'
                    },
                    // fonts
                    {
                        expand: true, 
                        cwd : './node_modules/mdi/',
                        src: [
                            'css/**', 
                            'fonts/**'
                        ],
                        dest: './build/temp/assets/fonts/material-design-iconic-font/'
                    },
                    //content from src
                    {
                        cwd : 'src',
                        src: ['**', '!__specific/**'],
                        expand: true,
                        dest: './build/temp/'
                    }
                ]
            },
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'build/temp/',
                    src: ['**'],
                    dest: './build/Chrome/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Chrome/',
                    src: ["**"],
                    dest: './build/Chrome/'
                }]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'build/temp/',
                    src: ['**'],
                    dest: './build/Firefox/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Firefox/',
                    src: ["**"],
                    dest: './build/Firefox/'
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
        filenamesToJson : {
            options : {
                // true if full path should be included, default is false
                fullPath : false,
                // true if file extension should be included, default is false 
                extensions : true
            },
            // any valid glob
            files : './build/temp/assets/templates/partials/*.tpl',

            // path to write json to
            destination : './build/temp/assets/templates/partials/partials.json'
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
                    message: 'Extension is ready', //required
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
        }
    });


    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-generator');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-filenames-to-json');
    
    grunt.registerTask('default',
        [
            "newer:copy:prebuild",
            "newer:uglify:prebuild",
            "newer:filenamesToJson",
            "copy:chrome",
            "copy:firefox",
            "json_generator:firefox",
            "json_generator:chrome",
            "notify:end"
        ]);    

    grunt.registerTask("prebuild",
        [
            "clean:prebuild",
            "copy:prebuild",
            "newer:uglify:prebuild"
        ])

    grunt.registerTask('release',
        [
            "clean:prebuild",
            "default",
            'compress:firefox',
            "compress:chrome"

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
            "newer:copy:prebuild",
            "newer:uglify:prebuild",
            "newer:filenamesToJson",
            "copy:chrome",
            "copy:firefox",
            "json_generator:firefox",
            "json_generator:chrome",
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