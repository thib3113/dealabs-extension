module.exports = function (grunt) {
    var versiony = require('versiony');
    var merge = require('deepmerge');

    grunt.initConfig({
        clean: ['./build/Chrome/**', './build/Firefox/**'],
        uglify: {
            options : {
                flatten: true,   // remove all unnecessary nesting
            }, 
            'src/third/handlebars.min.js' : ['./node_modules/handlebars/dist/handlebars.min.js', './src/third/handlebars-helper-x.js']
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
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', "!__specific/**"],
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
                    cwd: 'src/',
                    src: ['**', "!__specific/**"],
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
            "uglify",
            "chrome",
            "firefox",
        ]);    

    grunt.registerTask('release',
        [
            "clean",
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
            "notify:start",
            "uglify",
            "clean",
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
        .to("./src/manifest.json").get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
    grunt.registerTask('minor', 'update minor version', function() {
        version_after = versiony
        .from('./src/manifest.json')
        .minor()
        .to("./src/manifest.json").get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
    grunt.registerTask('major', 'update major version', function() {
        version_after = versiony
        .from('./src/manifest.json')
        .major()
        .to("./src/manifest.json").get();
      grunt.log.write("update version to "+version_after+"... ").ok();
    });
};